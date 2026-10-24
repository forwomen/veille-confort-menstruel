CREATE TYPE "public"."type_jeton" AS ENUM('invitation', 'reinitialisation');--> statement-breakpoint
CREATE TABLE "jetons" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "type_jeton" NOT NULL,
	"empreinte" varchar(64) NOT NULL,
	"email" varchar(255) NOT NULL,
	"nom" varchar(120),
	"role" "role_utilisateur",
	"utilisateur_id" integer,
	"cree_par" integer,
	"expire_le" timestamp with time zone NOT NULL,
	"utilise_le" timestamp with time zone,
	"annule_le" timestamp with time zone,
	"cree_le" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "jetons_empreinte_unique" UNIQUE("empreinte")
);
--> statement-breakpoint
ALTER TABLE "jetons" ADD CONSTRAINT "jetons_utilisateur_id_utilisateurs_id_fk" FOREIGN KEY ("utilisateur_id") REFERENCES "public"."utilisateurs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jetons" ADD CONSTRAINT "jetons_cree_par_utilisateurs_id_fk" FOREIGN KEY ("cree_par") REFERENCES "public"."utilisateurs"("id") ON DELETE set null ON UPDATE no action;