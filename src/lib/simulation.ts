// Pour montrer les quatre états d'un écran sans casser la base : ajouter ?etat=chargement,
// ?etat=erreur ou ?etat=vide à l'adresse. Désactivé en production, où le paramètre est ignoré.
export type EtatSimule = "chargement" | "erreur" | "vide";

const ETATS: readonly EtatSimule[] = ["chargement", "erreur", "vide"];

export const DUREE_CHARGEMENT_SIMULE_MS = 3000;

export function lireEtatSimule(valeur: unknown, environnement = process.env.VERCEL_ENV): EtatSimule | null {
  if (environnement === "production") return null;
  return ETATS.find((etat) => etat === valeur) ?? null;
}

// À appeler là où les données sont lues : retarde (chargement) ou fait échouer (erreur) la lecture.
export async function simuler(etat: EtatSimule | null) {
  if (etat === "chargement") await new Promise((fin) => setTimeout(fin, DUREE_CHARGEMENT_SIMULE_MS));
  if (etat === "erreur") throw new Error("Panne simulée (?etat=erreur)");
}
