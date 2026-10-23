"use server";

import { randomUUID } from "node:crypto";
import { put } from "@vercel/blob";
import { and, eq, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { ingredients, piecesJointes, produitIngredients, produits } from "@/db/schema";
import { exigerRole } from "@/lib/autorisation";
import { notifierNouveauProduit } from "@/lib/courriel";
import { conditionNonRemplie, verifierTransition } from "@/lib/cycle-de-vie";
import { faitsComposition, lireProduit } from "@/lib/donnees";
import { journal } from "@/lib/journal";
import { INDICATIONS, STATUTS } from "@/lib/libelles";

export type EtatFormulaire = {
  erreurs?: Partial<Record<string, string>>;
  message?: string;
  valeurs?: Record<string, string>;
};

const schemaProduit = z
  .object({
    nom: z.string().trim().min(2, "Au moins 2 caractères").max(200),
    marque: z.string().trim().min(1, "La marque est obligatoire").max(120),
    pays: z.string().trim().min(2, "Le pays est obligatoire").max(80),
    indication: z.enum(Object.keys(INDICATIONS) as [keyof typeof INDICATIONS], {
      error: "Choisir une indication",
    }),
    prix: z
      .string()
      .trim()
      .transform((v) => v.replace(",", "."))
      .refine((v) => v === "" || (/^\d+(\.\d{1,2})?$/.test(v) && Number(v) < 100000), {
        error: "Prix invalide (ex. 24,90)",
      }),
    devise: z
      .string()
      .trim()
      .toUpperCase()
      .refine((v) => v === "" || /^[A-Z]{3}$/.test(v), { error: "Code à 3 lettres (EUR, USD…)" }),
    ingredients: z.string().max(2000),
  })
  .refine((p) => (p.prix === "") === (p.devise === ""), {
    error: "Indiquer le prix et la devise ensemble",
    path: ["devise"],
  });

function lireFormulaire(formData: FormData) {
  return schemaProduit.safeParse(Object.fromEntries(formData));
}

function valeursDe(formData: FormData) {
  const valeurs: Record<string, string> = {};
  formData.forEach((valeur, cle) => {
    if (typeof valeur === "string") valeurs[cle] = valeur;
  });
  return valeurs;
}

function erreursDe(
  resultat: z.ZodSafeParseError<unknown>,
  formData: FormData,
): EtatFormulaire {
  const erreurs: Record<string, string> = {};
  for (const probleme of resultat.error.issues) {
    const champ = String(probleme.path[0] ?? "formulaire");
    erreurs[champ] ??= probleme.message;
  }
  return { erreurs, valeurs: valeursDe(formData), message: "Le formulaire contient des erreurs." };
}

// Les ingrédients sont saisis séparés par des virgules.
function nomsDeComposition(saisie: string) {
  return [
    ...new Set(
      saisie
        .split(",")
        .map((n) => n.trim())
        .filter(Boolean)
        .map((n) => n.charAt(0).toUpperCase() + n.slice(1)),
    ),
  ];
}

// Ceux qui n'existent pas encore sont créés.
async function enregistrerComposition(produitId: number, noms: string[]) {
  await db.delete(produitIngredients).where(eq(produitIngredients.produitId, produitId));
  if (noms.length === 0) return;

  await db
    .insert(ingredients)
    .values(noms.map((nom) => ({ nom })))
    .onConflictDoNothing();
  const lignes = await db
    .select({ id: ingredients.id })
    .from(ingredients)
    .where(inArray(ingredients.nom, noms));
  await db
    .insert(produitIngredients)
    .values(lignes.map((l) => ({ produitId, ingredientId: l.id })));
}

export async function creerProduit(
  _etat: EtatFormulaire,
  formData: FormData,
): Promise<EtatFormulaire> {
  const utilisateur = await exigerRole("admin", "creer_produit");
  const lu = lireFormulaire(formData);
  if (!lu.success) return erreursDe(lu, formData);

  const { ingredients: composition, prix, devise, ...champs } = lu.data;
  // Tout produit entre dans le cycle de vie par « repéré » ; la suite passe par changerStatut.
  const [produit] = await db
    .insert(produits)
    .values({ ...champs, statut: "repere", prix: prix || null, devise: devise || null })
    .returning({ id: produits.id, nom: produits.nom, marque: produits.marque });
  await enregistrerComposition(produit.id, nomsDeComposition(composition));

  journal("produit_cree", { produitId: produit.id, utilisateurId: utilisateur.id });
  await notifierNouveauProduit(produit);
  redirect(`/produits/${produit.id}?message=cree`);
}

export async function modifierProduit(
  id: number,
  _etat: EtatFormulaire,
  formData: FormData,
): Promise<EtatFormulaire> {
  const utilisateur = await exigerRole("admin", "modifier_produit");
  const lu = lireFormulaire(formData);
  if (!lu.success) return erreursDe(lu, formData);

  const { ingredients: composition, prix, devise, ...champs } = lu.data;
  const [actuel] = await db
    .select({ statut: produits.statut })
    .from(produits)
    .where(eq(produits.id, id));
  if (!actuel) return { message: "Ce produit n'existe plus." };

  // Une modification ne doit pas faire sortir le produit des conditions de son statut actuel.
  const noms = nomsDeComposition(composition);
  const raison = conditionNonRemplie(actuel.statut, await faitsComposition(noms));
  if (raison) {
    return {
      erreurs: { ingredients: `${raison} Changez d'abord le statut du produit.` },
      valeurs: valeursDe(formData),
      message: "Le formulaire contient des erreurs.",
    };
  }

  await db
    .update(produits)
    .set({ ...champs, prix: prix || null, devise: devise || null, modifieLe: new Date() })
    .where(eq(produits.id, id));
  await enregistrerComposition(id, noms);

  journal("produit_modifie", { produitId: id, utilisateurId: utilisateur.id });
  redirect(`/produits/${id}?message=modifie`);
}

export async function changerStatut(
  id: number,
  _etat: EtatFormulaire,
  formData: FormData,
): Promise<EtatFormulaire> {
  const utilisateur = await exigerRole("admin", "changer_statut");
  const fiche = await lireProduit(id);
  if (!fiche) return { message: "Ce produit n'existe plus." };

  const de = fiche.produit.statut;
  const vers = formData.get("vers");
  const verdict = verifierTransition(de, vers, fiche.faits);
  if (!verdict.ok) {
    journal("statut_refuse", { produitId: id, de, vers: String(vers), raison: verdict.raison });
    return { message: verdict.raison };
  }

  // La condition « statut = de » évite d'écraser un changement fait entre-temps par un autre admin.
  const changes = await db
    .update(produits)
    .set({ statut: vers as keyof typeof STATUTS, modifieLe: new Date() })
    .where(and(eq(produits.id, id), eq(produits.statut, de)))
    .returning({ id: produits.id });
  if (changes.length === 0) {
    return { message: "Le statut a changé entre-temps. Rechargez la page." };
  }

  journal("statut_change", { produitId: id, de, vers, utilisateurId: utilisateur.id });
  redirect(`/produits/${id}?message=statut`);
}

const TYPES_ACCEPTES = ["application/pdf", "image/png", "image/jpeg", "image/webp"];
// Vercel limite le corps d'une requête à 4,5 Mo.
const TAILLE_MAX = 4 * 1024 * 1024;

export async function ajouterPieceJointe(
  produitId: number,
  _etat: EtatFormulaire,
  formData: FormData,
): Promise<EtatFormulaire> {
  const utilisateur = await exigerRole("admin", "ajouter_piece_jointe");
  const fichier = formData.get("fichier");

  if (!(fichier instanceof File) || fichier.size === 0) {
    return { erreurs: { fichier: "Choisir un fichier." } };
  }
  if (!TYPES_ACCEPTES.includes(fichier.type)) {
    return { erreurs: { fichier: "Formats acceptés : PDF, PNG, JPEG, WebP." } };
  }
  if (fichier.size > TAILLE_MAX) {
    return { erreurs: { fichier: "Fichier trop lourd (4 Mo maximum)." } };
  }

  const [produit] = await db
    .select({ id: produits.id })
    .from(produits)
    .where(eq(produits.id, produitId));
  if (!produit) return { message: "Ce produit n'existe plus." };

  const nomPropre = fichier.name.replace(/[^\w.\-]+/g, "_").slice(-100);
  try {
    const blob = await put(`produits/${produitId}/${randomUUID()}-${nomPropre}`, fichier, {
      access: "private",
      contentType: fichier.type,
    });
    await db.insert(piecesJointes).values({
      produitId,
      cheminBlob: blob.pathname,
      nomFichier: fichier.name.slice(0, 255),
      typeMime: fichier.type,
      taille: fichier.size,
    });
  } catch (erreur) {
    journal("piece_jointe_echouee", { produitId, erreur: String(erreur) });
    return { message: "L'envoi du fichier a échoué. Réessayer dans un instant." };
  }

  journal("piece_jointe_ajoutee", { produitId, utilisateurId: utilisateur.id });
  redirect(`/produits/${produitId}?message=fichier`);
}
