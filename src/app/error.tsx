"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

// État « erreur » de toutes les pages. Le message technique n'est jamais montré : seule la
// référence (digest) l'est, et c'est elle qui permet de retrouver l'erreur dans les journaux Vercel.
export default function Erreur({ error, retry }: { error: unknown; retry: () => void }) {
  const reference = error instanceof Error && "digest" in error ? String(error.digest) : null;
  return (
    <div role="alert" className="flex flex-col items-start gap-3 rounded-lg border border-destructive/40 p-6">
      <h1 className="text-lg font-semibold">La page n&apos;a pas pu se charger</h1>
      <p className="text-sm text-muted-foreground">
        Le serveur ou la base de données n&apos;a pas répondu. Vos données ne sont pas perdues :
        réessayez dans un instant. L&apos;erreur est notée dans les journaux.
      </p>
      {reference && (
        <p className="text-xs text-muted-foreground">
          Référence à donner si le problème persiste : <code>{reference}</code>
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {/* retry() recharge les données depuis le serveur ; reset() ne ferait que réafficher la page. */}
        <Button onClick={() => retry()}>Réessayer</Button>
        <Link href="/produits" className="inline-flex items-center px-3 text-sm underline-offset-4 hover:underline">
          Retour aux produits
        </Link>
      </div>
    </div>
  );
}
