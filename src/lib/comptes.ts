import "server-only";
import { and, asc, desc, eq, gt, isNull, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { jetons, utilisateurs } from "@/db/schema";
import { urlDuSite } from "@/lib/courriel";
import {
  DUREE_INVITATION_MS,
  DUREE_REINITIALISATION_MS,
  MESSAGES_JETON,
  empreinteDe,
  etatJeton,
  nouveauJeton,
} from "@/lib/jetons";

type TypeJeton = (typeof jetons.$inferSelect)["type"];

export function normaliserEmail(email: string) {
  return email.trim().toLowerCase();
}

const CHEMINS: Record<TypeJeton, string> = {
  invitation: "/invitation",
  reinitialisation: "/reinitialiser",
};

// Un jeton encore utilisable : ni utilisé, ni annulé, ni expiré.
const estValide = () =>
  and(isNull(jetons.utiliseLe), isNull(jetons.annuleLe), gt(jetons.expireLe, sql`now()`));

export async function trouverCompte(email: string) {
  const [compte] = await db
    .select()
    .from(utilisateurs)
    .where(eq(utilisateurs.email, normaliserEmail(email)))
    .limit(1);
  return compte ?? null;
}

// Crée un lien d'invitation ; une invitation encore valide pour la même adresse est annulée.
export async function creerInvitation(invitation: {
  email: string;
  nom: string;
  role: "admin" | "lecteur";
  creePar: number;
}) {
  const email = normaliserEmail(invitation.email);
  await db
    .update(jetons)
    .set({ annuleLe: new Date() })
    .where(and(eq(jetons.type, "invitation"), eq(jetons.email, email), estValide()));

  const { jeton, empreinte } = nouveauJeton();
  const [ligne] = await db
    .insert(jetons)
    .values({
      type: "invitation",
      empreinte,
      email,
      nom: invitation.nom,
      role: invitation.role,
      creePar: invitation.creePar,
      expireLe: new Date(Date.now() + DUREE_INVITATION_MS),
    })
    .returning({ id: jetons.id });
  return { id: ligne.id, lien: `${urlDuSite()}${CHEMINS.invitation}/${jeton}` };
}

// Crée un lien de réinitialisation, puis annule les liens précédents encore valides.
// Avec `delaiMinMs`, rien n'est créé si un lien valide date de moins que ce délai : la vérification
// et l'ajout tiennent en une seule requête, pour que deux clics rapprochés ne passent pas tous les deux.
export async function creerReinitialisation(
  compte: { id: number; email: string },
  creePar: number | null,
  delaiMinMs = 0,
) {
  const { jeton, empreinte } = nouveauJeton();
  const expireLe = new Date(Date.now() + DUREE_REINITIALISATION_MS);
  const { rows } = await db.execute<{ id: number }>(sql`
    INSERT INTO ${jetons} (type, empreinte, email, utilisateur_id, cree_par, expire_le)
    SELECT 'reinitialisation', ${empreinte}, ${compte.email}, ${compte.id}, ${creePar}, ${expireLe}
    WHERE NOT EXISTS (
      SELECT 1 FROM ${jetons}
      WHERE type = 'reinitialisation' AND utilisateur_id = ${compte.id}
        AND utilise_le IS NULL AND annule_le IS NULL AND expire_le > now()
        AND cree_le > now() - make_interval(secs => ${delaiMinMs / 1000})
    )
    RETURNING id`);
  const id = rows[0]?.id;
  if (!id) return null;

  await db
    .update(jetons)
    .set({ annuleLe: new Date() })
    .where(
      and(eq(jetons.type, "reinitialisation"), eq(jetons.utilisateurId, compte.id), estValide(), ne(jetons.id, id)),
    );
  return { id, lien: `${urlDuSite()}${CHEMINS.reinitialisation}/${jeton}` };
}

export async function lireJeton(jeton: string, type: TypeJeton) {
  // Un lien tapé à la main peut contenir n'importe quoi : on ne cherche que ce qui a la bonne forme.
  if (!/^[A-Za-z0-9_-]{43}$/.test(jeton)) {
    return { ok: false as const, etat: "introuvable" as const, message: MESSAGES_JETON.introuvable };
  }
  const [ligne] = await db
    .select()
    .from(jetons)
    .where(and(eq(jetons.empreinte, empreinteDe(jeton)), eq(jetons.type, type)))
    .limit(1);
  if (!ligne) return { ok: false as const, etat: "introuvable" as const, message: MESSAGES_JETON.introuvable };
  const etat = etatJeton(ligne, new Date());
  if (etat !== "valide") return { ok: false as const, etat, message: MESSAGES_JETON[etat] };
  return { ok: true as const, ligne };
}

// Marque le jeton comme utilisé, en une seule requête : si deux onglets envoient le même lien
// en même temps, un seul réussit.
export async function consommerJeton(id: number) {
  const lignes = await db
    .update(jetons)
    .set({ utiliseLe: new Date() })
    .where(and(eq(jetons.id, id), estValide()))
    .returning({ id: jetons.id });
  return lignes.length === 1;
}

export async function annulerInvitation(id: number) {
  const lignes = await db
    .update(jetons)
    .set({ annuleLe: new Date() })
    .where(and(eq(jetons.id, id), eq(jetons.type, "invitation"), estValide()))
    .returning({ id: jetons.id });
  return lignes.length === 1;
}

export async function listerComptes() {
  return db
    .select({
      id: utilisateurs.id,
      nom: utilisateurs.nom,
      email: utilisateurs.email,
      role: utilisateurs.role,
      creeLe: utilisateurs.creeLe,
    })
    .from(utilisateurs)
    .orderBy(asc(utilisateurs.nom));
}

export async function listerInvitations() {
  const lignes = await db
    .select()
    .from(jetons)
    .where(eq(jetons.type, "invitation"))
    .orderBy(desc(jetons.creeLe))
    .limit(50);
  const maintenant = new Date();
  return lignes.map((l) => ({ ...l, etat: etatJeton(l, maintenant) }));
}
