import {
  integer,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const roleUtilisateur = pgEnum("role_utilisateur", ["admin", "lecteur"]);

export const indication = pgEnum("indication", [
  "spm",
  "endometriose",
  "post_partum",
  "menopause",
]);

export const statutProduit = pgEnum("statut_produit", [
  "repere",
  "qualifie",
  "publie",
  "retire",
]);

export const typeSource = pgEnum("type_source", [
  "essai_clinique",
  "meta_analyse",
  "revue",
  "etude_observationnelle",
  "autre",
]);

export const utilisateurs = pgTable("utilisateurs", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  nom: varchar("nom", { length: 120 }).notNull(),
  motDePasseHash: text("mot_de_passe_hash").notNull(),
  role: roleUtilisateur("role").notNull().default("lecteur"),
  creeLe: timestamp("cree_le", { withTimezone: true }).notNull().defaultNow(),
});

export const produits = pgTable("produits", {
  id: serial("id").primaryKey(),
  nom: varchar("nom", { length: 200 }).notNull(),
  marque: varchar("marque", { length: 120 }).notNull(),
  pays: varchar("pays", { length: 80 }).notNull(),
  indication: indication("indication").notNull(),
  statut: statutProduit("statut").notNull().default("repere"),
  // Prix dans la devise d'origine ; la conversion en euros se fait à l'affichage.
  prix: numeric("prix", { precision: 10, scale: 2 }),
  devise: varchar("devise", { length: 3 }),
  creeLe: timestamp("cree_le", { withTimezone: true }).notNull().defaultNow(),
  modifieLe: timestamp("modifie_le", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const ingredients = pgTable("ingredients", {
  id: serial("id").primaryKey(),
  nom: varchar("nom", { length: 120 }).notNull().unique(),
});

export const sources = pgTable("sources", {
  id: serial("id").primaryKey(),
  titre: text("titre").notNull(),
  lien: text("lien").notNull(),
  type: typeSource("type").notNull(),
});

export const produitIngredients = pgTable(
  "produit_ingredients",
  {
    produitId: integer("produit_id")
      .notNull()
      .references(() => produits.id, { onDelete: "cascade" }),
    ingredientId: integer("ingredient_id")
      .notNull()
      .references(() => ingredients.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.produitId, t.ingredientId] })],
);

export const ingredientSources = pgTable(
  "ingredient_sources",
  {
    ingredientId: integer("ingredient_id")
      .notNull()
      .references(() => ingredients.id, { onDelete: "cascade" }),
    sourceId: integer("source_id")
      .notNull()
      .references(() => sources.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.ingredientId, t.sourceId] })],
);

export const piecesJointes = pgTable("pieces_jointes", {
  id: serial("id").primaryKey(),
  produitId: integer("produit_id")
    .notNull()
    .references(() => produits.id, { onDelete: "cascade" }),
  // Chemin dans le magasin Vercel Blob privé : jamais servi directement au navigateur.
  cheminBlob: text("chemin_blob").notNull(),
  nomFichier: varchar("nom_fichier", { length: 255 }).notNull(),
  typeMime: varchar("type_mime", { length: 120 }).notNull(),
  taille: integer("taille").notNull(),
  creeLe: timestamp("cree_le", { withTimezone: true }).notNull().defaultNow(),
});

export const typeJeton = pgEnum("type_jeton", ["invitation", "reinitialisation"]);

// Liens à usage unique (invitation, mot de passe oublié). Seule l'empreinte SHA-256 du lien est
// gardée : quelqu'un qui lit la base ne peut pas s'en servir.
export const jetons = pgTable("jetons", {
  id: serial("id").primaryKey(),
  type: typeJeton("type").notNull(),
  empreinte: varchar("empreinte", { length: 64 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull(),
  // Invitation : le compte à créer.
  nom: varchar("nom", { length: 120 }),
  role: roleUtilisateur("role"),
  // Réinitialisation : le compte concerné.
  utilisateurId: integer("utilisateur_id").references(() => utilisateurs.id, {
    onDelete: "cascade",
  }),
  creePar: integer("cree_par").references(() => utilisateurs.id, { onDelete: "set null" }),
  expireLe: timestamp("expire_le", { withTimezone: true }).notNull(),
  utiliseLe: timestamp("utilise_le", { withTimezone: true }),
  annuleLe: timestamp("annule_le", { withTimezone: true }),
  creeLe: timestamp("cree_le", { withTimezone: true }).notNull().defaultNow(),
});
