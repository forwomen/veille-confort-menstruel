// Règles des liens à usage unique (invitation, mot de passe oublié) et du choix d'un mot de passe.
// Fonctions pures, sans base de données : elles sont testées dans jetons.test.ts.
import { createHash, randomBytes } from "node:crypto";

export const DUREE_INVITATION_MS = 7 * 24 * 60 * 60 * 1000;
export const DUREE_REINITIALISATION_MS = 60 * 60 * 1000;

// 32 octets aléatoires : impossible à deviner. Le lien en clair n'est montré qu'une fois.
export function nouveauJeton() {
  const jeton = randomBytes(32).toString("base64url");
  return { jeton, empreinte: empreinteDe(jeton) };
}

export function empreinteDe(jeton: string) {
  return createHash("sha256").update(jeton).digest("hex");
}

export type EtatJeton = "valide" | "expire" | "utilise" | "annule";

export function etatJeton(
  jeton: { expireLe: Date; utiliseLe: Date | null; annuleLe: Date | null },
  maintenant: Date,
): EtatJeton {
  if (jeton.utiliseLe) return "utilise";
  if (jeton.annuleLe) return "annule";
  if (jeton.expireLe.getTime() <= maintenant.getTime()) return "expire";
  return "valide";
}

export const MESSAGES_JETON: Record<Exclude<EtatJeton, "valide"> | "introuvable", string> = {
  introuvable: "Ce lien n'est pas valide. Vérifiez qu'il a été copié en entier.",
  expire: "Ce lien a expiré. Demandez-en un nouveau.",
  utilise: "Ce lien a déjà servi. Connectez-vous, ou demandez-en un nouveau.",
  annule: "Ce lien a été annulé. Demandez-en un nouveau.",
};

export const LONGUEUR_MIN_MOT_DE_PASSE = 12;
// bcrypt ignore tout ce qui dépasse 72 octets : un mot de passe plus long serait tronqué sans le dire.
const OCTETS_MAX_MOT_DE_PASSE = 72;

// Raison du refus, ou null si le mot de passe convient.
export function problemeMotDePasse(motDePasse: unknown, confirmation: unknown): string | null {
  if (typeof motDePasse !== "string" || motDePasse.length === 0) return "Choisir un mot de passe.";
  if (motDePasse.trim() !== motDePasse) return "Pas d'espace au début ni à la fin.";
  if ([...motDePasse].length < LONGUEUR_MIN_MOT_DE_PASSE) {
    return `Au moins ${LONGUEUR_MIN_MOT_DE_PASSE} caractères.`;
  }
  if (new TextEncoder().encode(motDePasse).length > OCTETS_MAX_MOT_DE_PASSE) {
    return "Trop long (72 octets au plus, soit environ 70 caractères sans accents).";
  }
  if (motDePasse !== confirmation) return "Les deux mots de passe ne sont pas identiques.";
  return null;
}
