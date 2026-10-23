"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export async function seConnecter(_etat: string | undefined, formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      motDePasse: formData.get("motDePasse"),
      redirectTo: "/produits",
    });
  } catch (erreur) {
    if (erreur instanceof AuthError) return "Adresse ou mot de passe incorrect.";
    // La redirection après succès passe par une exception qu'il faut laisser remonter.
    throw erreur;
  }
}
