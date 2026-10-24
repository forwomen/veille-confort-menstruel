import Link from "next/link";
import { Suspense } from "react";
import { signOut } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { lireSession } from "@/lib/autorisation";

export function EnTete() {
  return (
    <header className="border-b">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/produits" className="font-semibold tracking-tight">
          Veille confort menstruel
        </Link>
        <Suspense fallback={<span className="text-sm text-muted-foreground">…</span>}>
          <ZoneUtilisateur />
        </Suspense>
      </div>
    </header>
  );
}

async function ZoneUtilisateur() {
  const session = await lireSession();
  if (!session?.user) {
    return (
      <Link href="/connexion" className="text-sm underline-offset-4 hover:underline">
        Se connecter
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      {session.user.role === "admin" && (
        <Link href="/comptes" className="underline-offset-4 hover:underline">
          Comptes
        </Link>
      )}
      <span>{session.user.name}</span>
      <Badge variant={session.user.role === "admin" ? "default" : "secondary"}>
        {session.user.role === "admin" ? "Admin" : "Lecteur"}
      </Badge>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/connexion" });
        }}
      >
        <Button type="submit" variant="ghost" size="sm">
          Se déconnecter
        </Button>
      </form>
    </div>
  );
}
