import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { db } from "@/db";
import { utilisateurs } from "@/db/schema";
import { journal } from "@/lib/journal";

export type Role = "admin" | "lecteur";

declare module "next-auth" {
  interface User {
    role: Role;
  }
  interface Session {
    user: { id: string; name: string; email: string; role: Role };
  }
}

const identifiants = z.object({
  email: z.email().max(255),
  motDePasse: z.string().min(1).max(200),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/connexion" },
  providers: [
    Credentials({
      credentials: { email: {}, motDePasse: {} },
      async authorize(saisie) {
        const lu = identifiants.safeParse(saisie);
        if (!lu.success) throw new CredentialsSignin();

        const email = lu.data.email.toLowerCase();
        const [utilisateur] = await db
          .select()
          .from(utilisateurs)
          .where(eq(utilisateurs.email, email))
          .limit(1);

        const valide =
          utilisateur &&
          (await bcrypt.compare(lu.data.motDePasse, utilisateur.motDePasseHash));
        if (!valide) {
          journal("connexion_refusee", { email });
          throw new CredentialsSignin();
        }

        journal("connexion", { utilisateurId: utilisateur.id, role: utilisateur.role });
        return {
          id: String(utilisateur.id),
          name: utilisateur.nom,
          email: utilisateur.email,
          role: utilisateur.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    session({ session, token }) {
      session.user.id = token.sub ?? "";
      session.user.role = token.role as Role;
      return session;
    },
  },
});
