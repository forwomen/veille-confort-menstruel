"use client";

import { Button } from "@/components/ui/button";

export default function Erreur({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-lg border border-destructive/40 p-6">
      <h1 className="text-lg font-semibold">Une erreur est survenue</h1>
      <p className="text-sm text-muted-foreground">
        La page n&apos;a pas pu se charger. Réessayer ; si le problème persiste, il est noté
        dans les journaux.
      </p>
      <Button onClick={reset}>Réessayer</Button>
    </div>
  );
}
