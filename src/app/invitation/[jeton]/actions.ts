"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { db } from "@/db";
import { utilisateurs } from "@/db/schema";
import { consommerJeton, lireJeton, trouverCompte } from "@/lib/comptes";
import { MESSAGES_JETON, problemeMotDePasse } from "@/lib/jetons";
import { journal } from "@/lib/journal";

export async function accepterInvitation(
  jeton: string,
  _etat: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  const motDePasse = formData.get("motDePasse");
  const probleme = problemeMotDePasse(motDePasse, formData.get("confirmation"));
  if (probleme) return probleme;

  const lu = await lireJeton(jeton, "invitation");
  if (!lu.ok) {
    journal("lien_refuse", { type: "invitation", etat: lu.etat });
    return lu.message;
  }
  const { ligne } = lu;
  if (await trouverCompte(ligne.email)) return "Un compte existe déjà avec cette adresse. Connectez-vous.";
  if (!(await consommerJeton(ligne.id))) return MESSAGES_JETON.utilise;

  const [compte] = await db
    .insert(utilisateurs)
    .values({
      email: ligne.email,
      nom: ligne.nom ?? ligne.email,
      role: ligne.role ?? "lecteur",
      motDePasseHash: await bcrypt.hash(motDePasse as string, 12),
    })
    .onConflictDoNothing()
    .returning({ id: utilisateurs.id });
  if (!compte) return "Un compte existe déjà avec cette adresse. Connectez-vous.";
  journal("invitation_acceptee", { invitationId: ligne.id, utilisateurId: compte.id, role: ligne.role });

  try {
    await signIn("credentials", { email: ligne.email, motDePasse, redirectTo: "/produits" });
  } catch (erreur) {
    if (erreur instanceof AuthError) return "Compte créé. Connectez-vous avec votre nouveau mot de passe.";
    // La redirection après succès passe par une exception qu'il faut laisser remonter.
    throw erreur;
  }
}
