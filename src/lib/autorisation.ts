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

type Utilisateur = Awaited<ReturnType<typeof exigerConnexion>>;

// Refuse, garde la trace de la tentative, puis renvoie vers la page d'accès refusé.
export function refuser(utilisateur: Utilisateur, action: string, details: Record<string, unknown> = {}): never {
  journal("acces_refuse", {
    utilisateurId: utilisateur.id,
    role: utilisateur.role,
    action,
    ...details,
  });
  redirect("/acces-refuse");
}

export async function exigerRole(role: Role, action: string) {
  const utilisateur = await exigerConnexion();
  if (utilisateur.role !== role) refuser(utilisateur, action, { roleRequis: role });
  return utilisateur;
}
