// Libellés affichés à l'écran pour les valeurs stockées en base.

export const INDICATIONS = {
  spm: "SPM",
  endometriose: "Endométriose",
  post_partum: "Post-partum",
  menopause: "Ménopause",
} as const;

export const STATUTS = {
  repere: "Repéré",
  qualifie: "Qualifié",
  publie: "Publié",
} as const;

export const TYPES_SOURCE = {
  essai_clinique: "Essai clinique",
  meta_analyse: "Méta-analyse",
  revue: "Revue",
  etude_observationnelle: "Étude observationnelle",
  autre: "Autre",
} as const;

export type Indication = keyof typeof INDICATIONS;
export type Statut = keyof typeof STATUTS;

export function estIndication(valeur: unknown): valeur is Indication {
  return typeof valeur === "string" && valeur in INDICATIONS;
}
