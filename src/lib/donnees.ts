import "server-only";
import { and, asc, countDistinct, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  ingredientSources,
  ingredients,
  piecesJointes,
  produitIngredients,
  produits,
  sources,
} from "@/db/schema";
import type { Faits } from "@/lib/cycle-de-vie";
import type { Indication, Statut } from "@/lib/libelles";
import { niveauDePreuve } from "@/lib/niveau-preuve";

// `visibles` vient du rôle de la personne connectée : c'est la base qui écarte le reste, pas l'écran.
export async function listerProduits(filtre: {
  visibles: readonly Statut[];
  indication?: Indication;
  statut?: Statut;
}) {
  return db
    .select()
    .from(produits)
    .where(
      and(
        inArray(produits.statut, [...filtre.visibles]),
        filtre.indication ? eq(produits.indication, filtre.indication) : undefined,
        filtre.statut ? eq(produits.statut, filtre.statut) : undefined,
      ),
    )
    .orderBy(desc(produits.modifieLe));
}

// Pour une composition saisie (noms d'ingrédients), combien d'ingrédients et combien ont au moins une source.
export async function faitsComposition(noms: string[]): Promise<Faits> {
  if (noms.length === 0) return { ingredients: 0, ingredientsSources: 0 };
  const [ligne] = await db
    .select({ n: countDistinct(ingredientSources.ingredientId) })
    .from(ingredientSources)
    .innerJoin(ingredients, eq(ingredients.id, ingredientSources.ingredientId))
    .where(inArray(ingredients.nom, noms));
  return { ingredients: noms.length, ingredientsSources: ligne?.n ?? 0 };
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

  const avecSources = composition.map((ingredient) => {
    const sourcesIngredient = liens.filter((l) => l.ingredientId === ingredient.id);
    return {
      ...ingredient,
      sources: sourcesIngredient,
      niveau: niveauDePreuve(sourcesIngredient.length),
    };
  });

  return {
    produit,
    ingredients: avecSources,
    faits: {
      ingredients: avecSources.length,
      ingredientsSources: avecSources.filter((i) => i.sources.length > 0).length,
    } satisfies Faits,
    fichiers,
  };
}

