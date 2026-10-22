import "server-only";
import { redirect } from "next/navigation";
import { auth, type Role } from "@/auth";
import { journal } from "@/lib/journal";

// Toutes les vérifications de rôle passent par ici, côté serveur.
// Masquer un bouton à l'écran ne suffit pas : chaque page et chaque action appelle l'une de ces fonctions.

export async function exigerConnexion() {
  const session = await auth();
  if (!session?.user) redirect("/connexion");
  return session.user;
}

export async function exigerRole(role: Role, action: string) {
  const utilisateur = await exigerConnexion();
  if (utilisateur.role !== role) {
    journal("acces_refuse", {
      utilisateurId: utilisateur.id,
      role: utilisateur.role,
      roleRequis: role,
      action,
    });
    redirect("/acces-refuse");
  }
  return utilisateur;
}
