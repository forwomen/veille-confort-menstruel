"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { utilisateurs } from "@/db/schema";
import {
  consommerJeton,
  creerReinitialisation,
  lireJeton,
  trouverCompte,
} from "@/lib/comptes";
import { envoyerReinitialisation } from "@/lib/courriel";
import { MESSAGES_JETON, problemeMotDePasse } from "@/lib/jetons";
import { journal } from "@/lib/journal";

export type EtatDemande = { message?: string; erreur?: string };

const DELAI_ENTRE_DEMANDES_MS = 2 * 60 * 1000;

// Même réponse, et même temps de réponse, que l'adresse ait un compte ou non :
// le travail (base, courriel) se fait après l'envoi de la réponse, avec after().
export async function demanderReinitialisation(
  _etat: EtatDemande,
  formData: FormData,
): Promise<EtatDemande> {
  const lu = z.email().max(255).safeParse(String(formData.get("email") ?? "").trim());
  if (!lu.success) return { erreur: "Adresse e-mail invalide." };
  const email = lu.data;

  after(async () => {
    const compte = await trouverCompte(email);
    if (!compte) {
      journal("reinitialisation_demandee", { connu: false });
      return;
    }
    const cree = await creerReinitialisation(compte, null, DELAI_ENTRE_DEMANDES_MS);
    if (!cree) {
      journal("reinitialisation_ignoree", { pour: compte.id, raison: "demande_recente" });
      return;
    }
    const { id, lien } = cree;
    const envoye = await envoyerReinitialisation({ email: compte.email, lien });
    journal("reinitialisation_demandee", { connu: true, jetonId: id, pour: compte.id, envoye });
  });

  return {
    message:
      "Si un compte existe avec cette adresse, un lien vient de partir par courriel. Il est valable 1 heure.",
  };
}

export async function reinitialiser(
  jeton: string,
  _etat: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  const motDePasse = formData.get("motDePasse");
  const probleme = problemeMotDePasse(motDePasse, formData.get("confirmation"));
  if (probleme) return probleme;

  const lu = await lireJeton(jeton, "reinitialisation");
  if (!lu.ok) {
    journal("lien_refuse", { type: "reinitialisation", etat: lu.etat });
    return lu.message;
  }
  const { ligne } = lu;
  if (!ligne.utilisateurId) return MESSAGES_JETON.introuvable;
  if (!(await consommerJeton(ligne.id))) return MESSAGES_JETON.utilise;

  await db
    .update(utilisateurs)
    .set({ motDePasseHash: await bcrypt.hash(motDePasse as string, 12) })
    .where(eq(utilisateurs.id, ligne.utilisateurId));
  journal("mot_de_passe_change", { jetonId: ligne.id, utilisateurId: ligne.utilisateurId });
  redirect("/connexion?message=mot-de-passe");
}
