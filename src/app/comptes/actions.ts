"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { utilisateurs } from "@/db/schema";
import { exigerRole } from "@/lib/autorisation";
import {
  annulerInvitation as annulerEnBase,
  creerInvitation,
  creerReinitialisation,
  trouverCompte,
} from "@/lib/comptes";
import { envoyerInvitation, envoyerReinitialisation } from "@/lib/courriel";
import { journal } from "@/lib/journal";

// Le lien en clair n'existe qu'ici, une seule fois : il n'est stocké nulle part.
export type EtatLien = {
  erreurs?: Partial<Record<string, string>>;
  message?: string;
  valeurs?: Record<string, string>;
  lien?: string;
  envoye?: boolean;
};

const schemaInvitation = z.object({
  nom: z.string().trim().min(2, "Au moins 2 caractères").max(120),
  email: z.email("Adresse e-mail invalide").max(255),
  role: z.enum(["admin", "lecteur"], { error: "Choisir un rôle" }),
});

export async function inviter(_etat: EtatLien, formData: FormData): Promise<EtatLien> {
  const admin = await exigerRole("admin", "inviter");
  const valeurs = {
    nom: String(formData.get("nom") ?? ""),
    email: String(formData.get("email") ?? "").trim(),
    role: String(formData.get("role") ?? ""),
  };
  const lu = schemaInvitation.safeParse(valeurs);
  if (!lu.success) {
    const erreurs: Record<string, string> = {};
    for (const probleme of lu.error.issues) erreurs[String(probleme.path[0])] ??= probleme.message;
    return { erreurs, valeurs, message: "Le formulaire contient des erreurs." };
  }

  if (await trouverCompte(lu.data.email)) {
    return {
      erreurs: { email: "Un compte existe déjà avec cette adresse." },
      valeurs,
      message: "Le formulaire contient des erreurs.",
    };
  }

  const { id, lien } = await creerInvitation({ ...lu.data, creePar: Number(admin.id) });
  const envoye = await envoyerInvitation({ email: lu.data.email, nom: lu.data.nom, lien });
  journal("invitation_creee", { invitationId: id, role: lu.data.role, envoye, utilisateurId: admin.id });
  revalidatePath("/comptes");
  return { lien, envoye };
}

export async function annulerInvitation(id: number) {
  const admin = await exigerRole("admin", "annuler_invitation");
  const annulee = await annulerEnBase(id);
  journal(annulee ? "invitation_annulee" : "invitation_annulation_inutile", {
    invitationId: id,
    utilisateurId: admin.id,
  });
  revalidatePath("/comptes");
}

export async function creerLienReinitialisation(utilisateurId: number): Promise<EtatLien> {
  const admin = await exigerRole("admin", "creer_lien_reinitialisation");
  const [compte] = await db
    .select({ id: utilisateurs.id, email: utilisateurs.email })
    .from(utilisateurs)
    .where(eq(utilisateurs.id, utilisateurId))
    .limit(1);
  if (!compte) return { message: "Ce compte n'existe plus." };

  // Sans délai minimum : l'admin obtient toujours un lien neuf, qui remplace les précédents.
  const cree = await creerReinitialisation(compte, Number(admin.id));
  if (!cree) return { message: "Le lien n'a pas pu être créé. Réessayer." };
  const { id, lien } = cree;
  const envoye = await envoyerReinitialisation({ email: compte.email, lien });
  journal("reinitialisation_creee", { jetonId: id, pour: compte.id, envoye, utilisateurId: admin.id });
  return { lien, envoye };
}
