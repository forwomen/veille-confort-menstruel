// Crée le premier administrateur, quand la base n'en a aucun : `npm run admin:creer`.
// Pas de page publique pour ça : personne ne peut se déclarer administrateur depuis le site.
// Les comptes suivants arrivent par invitation, depuis la page Comptes.
import { createInterface } from "node:readline";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { z } from "zod";
import * as schema from "../src/db/schema";
import { problemeMotDePasse } from "../src/lib/jetons";

config({ path: ".env.local", quiet: true });
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL manque (.env.local).");
const db = drizzle(neon(process.env.DATABASE_URL), { schema });

function demander(question: string, masque = false): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  if (masque) {
    // Ce qui est tapé ne s'affiche pas : on n'écrit à l'écran que la question.
    const ecrire = process.stdout.write.bind(process.stdout);
    (rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput = (s) => {
      if (s.includes(question)) ecrire(question);
    };
  }
  return new Promise((resoudre) =>
    rl.question(question, (reponse) => {
      rl.close();
      if (masque) process.stdout.write("\n");
      resoudre(reponse);
    }),
  );
}

async function main() {
  const [admin] = await db
    .select({ id: schema.utilisateurs.id })
    .from(schema.utilisateurs)
    .where(eq(schema.utilisateurs.role, "admin"))
    .limit(1);
  if (admin) {
    console.log("Un administrateur existe déjà : invitez les autres depuis la page Comptes.");
    return;
  }

  const email = (await demander("Adresse e-mail : ")).trim().toLowerCase();
  if (!z.email().safeParse(email).success) throw new Error("Adresse e-mail invalide.");
  const nom = (await demander("Nom affiché : ")).trim();
  if (nom.length < 2) throw new Error("Le nom doit faire au moins 2 caractères.");
  const motDePasse = await demander("Mot de passe (rien ne s'affiche) : ", true);
  const confirmation = await demander("Le même, une seconde fois : ", true);
  const probleme = problemeMotDePasse(motDePasse, confirmation);
  if (probleme) throw new Error(probleme);

  await db.insert(schema.utilisateurs).values({
    email,
    nom,
    role: "admin",
    motDePasseHash: await bcrypt.hash(motDePasse, 12),
  });
  console.log(`Administrateur créé : ${email}. Connectez-vous sur le site.`);
}

main().catch((erreur) => {
  console.error(erreur instanceof Error ? erreur.message : erreur);
  process.exit(1);
});
