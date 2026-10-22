import "server-only";
import { asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  ingredientSources,
  ingredients,
  piecesJointes,
  produitIngredients,
  produits,
  sources,
} from "@/db/schema";
import type { Indication } from "@/lib/libelles";
import { niveauDePreuve } from "@/lib/niveau-preuve";

export async function listerProduits(filtre: { indication?: Indication }) {
  return db
    .select()
    .from(produits)
    .where(filtre.indication ? eq(produits.indication, filtre.indication) : undefined)
    .orderBy(desc(produits.modifieLe));
}

export async function lireProduit(id: number) {
  // Un identifiant tapé à la main dans l'adresse peut être n'importe quoi.
  if (!Number.isInteger(id) || id < 1 || id > 2_147_483_647) return null;
  const [produit] = await db.select().from(produits).where(eq(produits.id, id)).limit(1);
  if (!produit) return null;

  const composition = await db
    .select({ id: ingredients.id, nom: ingredients.nom })
    .from(produitIngredients)
    .innerJoin(ingredients, eq(ingredients.id, produitIngredients.ingredientId))
    .where(eq(produitIngredients.produitId, id))
    .orderBy(asc(ingredients.nom));

  const ids = composition.map((i) => i.id);
  const liens = ids.length
    ? await db
        .select({
          ingredientId: ingredientSources.ingredientId,
          id: sources.id,
          titre: sources.titre,
          lien: sources.lien,
          type: sources.type,
        })
        .from(ingredientSources)
        .innerJoin(sources, eq(sources.id, ingredientSources.sourceId))
        .where(inArray(ingredientSources.ingredientId, ids))
    : [];

  const fichiers = await db
    .select()
    .from(piecesJointes)
    .where(eq(piecesJointes.produitId, id))
    .orderBy(desc(piecesJointes.creeLe));

  return {
    produit,
    ingredients: composition.map((ingredient) => {
      const sourcesIngredient = liens.filter((l) => l.ingredientId === ingredient.id);
      return {
        ...ingredient,
        sources: sourcesIngredient,
        niveau: niveauDePreuve(sourcesIngredient.length),
      };
    }),
    fichiers,
  };
}

