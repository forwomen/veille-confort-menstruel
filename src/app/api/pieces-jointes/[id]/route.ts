import { get } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { piecesJointes, produits } from "@/db/schema";
import { estVisible } from "@/lib/cycle-de-vie";
import { journal } from "@/lib/journal";

// Lien privé : le fichier n'est jamais public, il est relu depuis Vercel Blob
// seulement après vérification de la session et du droit de voir le produit auquel il est attaché.
export async function GET(_requete: Request, { params }: RouteContext<"/api/pieces-jointes/[id]">) {
  const session = await auth();
  if (!session?.user) {
    journal("acces_refuse", { action: "telecharger_piece_jointe", raison: "non_connecte" });
    return new Response("Connexion requise.", { status: 401 });
  }

  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1 || id > 2_147_483_647) {
    return new Response("Introuvable.", { status: 404 });
  }

  const [ligne] = await db
    .select({ fichier: piecesJointes, statut: produits.statut })
    .from(piecesJointes)
    .innerJoin(produits, eq(produits.id, piecesJointes.produitId))
    .where(eq(piecesJointes.id, id))
    .limit(1);
  if (!ligne) return new Response("Introuvable.", { status: 404 });
  const { fichier, statut } = ligne;

  if (!estVisible(statut, session.user.role)) {
    journal("acces_refuse", {
      action: "telecharger_piece_jointe",
      pieceJointeId: id,
      utilisateurId: session.user.id,
      role: session.user.role,
      statut,
    });
    return new Response("Accès refusé.", { status: 403 });
  }

  const blob = await get(fichier.cheminBlob, { access: "private" });
  if (!blob || blob.statusCode !== 200) return new Response("Introuvable.", { status: 404 });

  journal("piece_jointe_telechargee", { pieceJointeId: id, utilisateurId: session.user.id });
  return new Response(blob.stream, {
    headers: {
      "Content-Type": fichier.typeMime,
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(fichier.nomFichier)}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
