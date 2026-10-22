// Règle métier : le nombre de sources liées à un ingrédient détermine son niveau de preuve.
//   0 source      → non étayé
//   1 ou 2        → exploratoire
//   3 ou plus     → étayé

export type NiveauPreuve = "non_etaye" | "exploratoire" | "etaye";

export const LIBELLES_NIVEAU: Record<NiveauPreuve, string> = {
  non_etaye: "Non étayé",
  exploratoire: "Exploratoire",
  etaye: "Étayé",
};

export function niveauDePreuve(nombreDeSources: number): NiveauPreuve {
  if (!Number.isInteger(nombreDeSources) || nombreDeSources < 0) {
    throw new RangeError(
      `Nombre de sources invalide : ${nombreDeSources} (entier positif ou nul attendu)`,
    );
  }
  if (nombreDeSources === 0) return "non_etaye";
  if (nombreDeSources <= 2) return "exploratoire";
  return "etaye";
}
