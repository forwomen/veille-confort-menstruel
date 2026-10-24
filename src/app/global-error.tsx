"use client";

import "./globals.css";

// Dernier filet : remplace toute la page quand même l'en-tête n'a pas pu s'afficher.
export default function ErreurGlobale({ error, retry }: { error: unknown; retry: () => void }) {
  const reference = error instanceof Error && "digest" in error ? String(error.digest) : null;
  return (
    <html lang="fr">
      <body className="flex min-h-screen items-center justify-center bg-background p-6">
        <title>Erreur · Veille confort menstruel</title>
        <div role="alert" className="flex max-w-md flex-col items-start gap-3 rounded-lg border border-destructive/40 p-6">
          <h1 className="text-lg font-semibold">Le site ne répond pas</h1>
          <p className="text-sm text-muted-foreground">
            Une erreur empêche l&apos;affichage. Réessayez dans un instant ; elle est notée dans les journaux.
          </p>
          {reference && (
            <p className="text-xs text-muted-foreground">
              Référence : <code>{reference}</code>
            </p>
          )}
          <button
            type="button"
            onClick={() => retry()}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Réessayer
          </button>
        </div>
      </body>
    </html>
  );
}
