CREATE TYPE "public"."indication" AS ENUM('spm', 'endometriose', 'post_partum', 'menopause');--> statement-breakpoint
CREATE TYPE "public"."role_utilisateur" AS ENUM('admin', 'lecteur');--> statement-breakpoint
CREATE TYPE "public"."statut_produit" AS ENUM('repere', 'qualifie', 'publie');--> statement-breakpoint
CREATE TYPE "public"."type_source" AS ENUM('essai_clinique', 'meta_analyse', 'revue', 'etude_observationnelle', 'autre');--> statement-breakpoint
CREATE TABLE "ingredient_sources" (
	"ingredient_id" integer NOT NULL,
	"source_id" integer NOT NULL,
	CONSTRAINT "ingredient_sources_ingredient_id_source_id_pk" PRIMARY KEY("ingredient_id","source_id")
);
--> statement-breakpoint
CREATE TABLE "ingredients" (
	"id" serial PRIMARY KEY NOT NULL,
	"nom" varchar(120) NOT NULL,
	CONSTRAINT "ingredients_nom_unique" UNIQUE("nom")
);
--> statement-breakpoint
CREATE TABLE "pieces_jointes" (
	"id" serial PRIMARY KEY NOT NULL,
	"produit_id" integer NOT NULL,
	"chemin_blob" text NOT NULL,
	"nom_fichier" varchar(255) NOT NULL,
	"type_mime" varchar(120) NOT NULL,
	"taille" integer NOT NULL,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "produit_ingredients" (
	"produit_id" integer NOT NULL,
	"ingredient_id" integer NOT NULL,
	CONSTRAINT "produit_ingredients_produit_id_ingredient_id_pk" PRIMARY KEY("produit_id","ingredient_id")
);
--> statement-breakpoint
CREATE TABLE "produits" (
	"id" serial PRIMARY KEY NOT NULL,
	"nom" varchar(200) NOT NULL,
	"marque" varchar(120) NOT NULL,
	"pays" varchar(80) NOT NULL,
	"indication" "indication" NOT NULL,
	"statut" "statut_produit" DEFAULT 'repere' NOT NULL,
	"prix" numeric(10, 2),
	"devise" varchar(3),
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL,
	"modifie_le" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"titre" text NOT NULL,
	"lien" text NOT NULL,
	"type" "type_source" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "utilisateurs" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"nom" varchar(120) NOT NULL,
	"mot_de_passe_hash" text NOT NULL,
	"role" "role_utilisateur" DEFAULT 'lecteur' NOT NULL,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "utilisateurs_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "ingredient_sources" ADD CONSTRAINT "ingredient_sources_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingredient_sources" ADD CONSTRAINT "ingredient_sources_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pieces_jointes" ADD CONSTRAINT "pieces_jointes_produit_id_produits_id_fk" FOREIGN KEY ("produit_id") REFERENCES "public"."produits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "produit_ingredients" ADD CONSTRAINT "produit_ingredients_produit_id_produits_id_fk" FOREIGN KEY ("produit_id") REFERENCES "public"."produits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "produit_ingredients" ADD CONSTRAINT "produit_ingredients_ingredient_id_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE cascade ON UPDATE no action;