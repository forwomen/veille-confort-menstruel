// Jeu de données fictif, rejouable : `npm run db:seed` vide les tables puis les remplit.
// Marques, produits et références sont inventés ; les liens ouvrent une vraie recherche PubMed
// sur le sujet, pour qu'aucune fausse citation ne puisse passer pour une vraie.
import bcrypt from "bcryptjs";
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { inArray, sql } from "drizzle-orm";
import * as schema from "../src/db/schema";

config({ path: [".env.local", ".env.seed.local"], quiet: true });

const url = process.env.DATABASE_URL;
const mdpAdmin = process.env.SEED_MOT_DE_PASSE_ADMIN;
const mdpLecteur = process.env.SEED_MOT_DE_PASSE_LECTEUR;
if (!url || !mdpAdmin || !mdpLecteur) {
  throw new Error(
    "DATABASE_URL, SEED_MOT_DE_PASSE_ADMIN et SEED_MOT_DE_PASSE_LECTEUR sont nécessaires (.env.local / .env.seed.local).",
  );
}

const db = drizzle(neon(url), { schema });

type TypeSource = (typeof schema.typeSource.enumValues)[number];

// Ingrédient → nombre de sources fictives et mots-clés PubMed.
// Les nombres varient exprès pour couvrir les trois niveaux de preuve (0, 1-2, 3+).
const INGREDIENTS: Record<string, { sources: number; recherche: string }> = {
  "Magnésium": { sources: 4, recherche: "magnesium premenstrual syndrome" },
  "Vitamine B6": { sources: 3, recherche: "vitamin B6 premenstrual syndrome" },
  "Gattilier": { sources: 3, recherche: "vitex agnus-castus premenstrual" },
  "Oméga-3": { sources: 3, recherche: "omega-3 dysmenorrhea endometriosis" },
  "Isoflavones de soja": { sources: 3, recherche: "soy isoflavones hot flashes menopause" },
  "Gingembre": { sources: 2, recherche: "ginger dysmenorrhea" },
  "Vitamine D": { sources: 2, recherche: "vitamin D endometriosis pain" },
  "Fer": { sources: 2, recherche: "iron supplementation postpartum anemia" },
  "Onagre": { sources: 2, recherche: "evening primrose oil mastalgia" },
  "Calcium": { sources: 2, recherche: "calcium premenstrual syndrome" },
  "Curcuma": { sources: 1, recherche: "curcumin endometriosis" },
  "Sauge": { sources: 1, recherche: "salvia officinalis hot flushes" },
  "Houblon": { sources: 1, recherche: "hop extract menopause" },
  "Fenouil": { sources: 1, recherche: "fennel dysmenorrhea" },
  "Zinc": { sources: 1, recherche: "zinc premenstrual syndrome" },
  "Trèfle rouge": { sources: 1, recherche: "red clover menopause" },
  "Fenugrec": { sources: 1, recherche: "fenugreek breast milk" },
  "Camomille": { sources: 1, recherche: "chamomile premenstrual" },
  "Avoine": { sources: 0, recherche: "" },
  "Cacao cru": { sources: 0, recherche: "" },
  "Ortie": { sources: 0, recherche: "" },
  "Mélisse": { sources: 0, recherche: "" },
  "Vitamine B12": { sources: 0, recherche: "" },
};

const MODELES_SOURCE: { type: TypeSource; titre: (nom: string) => string }[] = [
  { type: "essai_clinique", titre: (n) => `${n} : essai randomisé contre placebo` },
  { type: "meta_analyse", titre: (n) => `${n} : méta-analyse des essais disponibles` },
  { type: "revue", titre: (n) => `${n} : revue de la littérature` },
  { type: "etude_observationnelle", titre: (n) => `${n} : étude de cohorte` },
];

const PRODUITS: {
  nom: string;
  marque: string;
  pays: string;
  indication: (typeof schema.indication.enumValues)[number];
  statut: (typeof schema.statutProduit.enumValues)[number];
  prix: string | null;
  devise: string | null;
  ingredients: string[];
}[] = [
  { nom: "Cycle Doux, infusion", marque: "Herboréa", pays: "France", indication: "spm", statut: "publie", prix: "12.90", devise: "EUR", ingredients: ["Gattilier", "Mélisse", "Camomille", "Fenouil"] },
  { nom: "Magné-Lune, gommes", marque: "Lunaria Labs", pays: "Allemagne", indication: "spm", statut: "qualifie", prix: "19.90", devise: "EUR", ingredients: ["Magnésium", "Vitamine B6", "Zinc"] },
  { nom: "Carré Clara, chocolat noir", marque: "Cacao Clara", pays: "Suisse", indication: "spm", statut: "repere", prix: "9.50", devise: "CHF", ingredients: ["Cacao cru", "Magnésium"] },
  { nom: "Huile d'onagre, capsules", marque: "Botanika Nord", pays: "Pologne", indication: "spm", statut: "repere", prix: "59.00", devise: "PLN", ingredients: ["Onagre", "Vitamine B12"] },
  { nom: "Golden Calm, latte au curcuma", marque: "Saffi Wellness", pays: "Royaume-Uni", indication: "endometriose", statut: "repere", prix: "24.00", devise: "GBP", ingredients: ["Curcuma", "Gingembre", "Avoine"] },
  { nom: "Oméga Flow, capsules", marque: "NordAlgae", pays: "Norvège", indication: "endometriose", statut: "qualifie", prix: "349.00", devise: "NOK", ingredients: ["Oméga-3", "Vitamine D"] },
  { nom: "Maman Ressource, barres", marque: "Petit Nid", pays: "Belgique", indication: "post_partum", statut: "publie", prix: "15.50", devise: "EUR", ingredients: ["Avoine", "Fer", "Fenugrec", "Cacao cru"] },
  { nom: "Lait d'or, tisane d'allaitement", marque: "Mamaterra", pays: "Espagne", indication: "post_partum", statut: "repere", prix: "18.00", devise: "EUR", ingredients: ["Fenugrec", "Fenouil", "Ortie"] },
  { nom: "Sérénité 45+, comprimés", marque: "Ménoverte", pays: "France", indication: "menopause", statut: "publie", prix: "22.90", devise: "EUR", ingredients: ["Isoflavones de soja", "Sauge", "Houblon", "Calcium", "Vitamine D"] },
  { nom: "Hot Flash Tea", marque: "Verdant Leaf Co.", pays: "États-Unis", indication: "menopause", statut: "qualifie", prix: "14.99", devise: "USD", ingredients: ["Trèfle rouge", "Sauge", "Houblon"] },
  // Cas limite : produit tout juste repéré, sans prix ni composition connue.
  { nom: "Pausa Femina, sirop", marque: "Vitalba", pays: "Italie", indication: "menopause", statut: "repere", prix: null, devise: null, ingredients: [] },
];

async function main() {
  console.log("Remise à zéro des tables…");
  await db.execute(sql`
    TRUNCATE produit_ingredients, ingredient_sources, pieces_jointes, produits,
             ingredients, sources, utilisateurs RESTART IDENTITY CASCADE
  `);

  console.log("Comptes : admin@veille.test (admin), lecteur@veille.test (lecteur)");
  await db.insert(schema.utilisateurs).values([
    { email: "admin@veille.test", nom: "Admin Démo", role: "admin", motDePasseHash: await bcrypt.hash(mdpAdmin!, 12) },
    { email: "lecteur@veille.test", nom: "Lecteur Démo", role: "lecteur", motDePasseHash: await bcrypt.hash(mdpLecteur!, 12) },
  ]);

  const lignesIngredients = await db
    .insert(schema.ingredients)
    .values(Object.keys(INGREDIENTS).map((nom) => ({ nom })))
    .returning();
  const idIngredient = new Map(lignesIngredients.map((i) => [i.nom, i.id]));

  let totalSources = 0;
  for (const [nom, { sources, recherche }] of Object.entries(INGREDIENTS)) {
    if (sources === 0) continue;
    const lignes = await db
      .insert(schema.sources)
      .values(
        Array.from({ length: sources }, (_, i) => {
          const modele = MODELES_SOURCE[i % MODELES_SOURCE.length];
          return {
            titre: `${modele.titre(nom)} (référence fictive)`,
            lien: `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(recherche)}`,
            type: modele.type,
          };
        }),
      )
      .returning({ id: schema.sources.id });
    await db
      .insert(schema.ingredientSources)
      .values(lignes.map((s) => ({ ingredientId: idIngredient.get(nom)!, sourceId: s.id })));
    totalSources += lignes.length;
  }

  for (const { ingredients, ...produit } of PRODUITS) {
    const [ligne] = await db.insert(schema.produits).values(produit).returning({ id: schema.produits.id });
    if (ingredients.length) {
      await db
        .insert(schema.produitIngredients)
        .values(ingredients.map((nom) => ({ produitId: ligne.id, ingredientId: idIngredient.get(nom)! })));
    }
  }

  const verif = await db
    .select()
    .from(schema.ingredients)
    .where(inArray(schema.ingredients.nom, Object.keys(INGREDIENTS)));
  console.log(
    `Terminé : ${PRODUITS.length} produits, ${verif.length} ingrédients, ${totalSources} sources.`,
  );
}

main().catch((erreur) => {
  console.error(erreur);
  process.exit(1);
});
