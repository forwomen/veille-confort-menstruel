"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Le lien n'est montré qu'une fois : il n'est gardé nulle part en clair.
export function LienACopier({ lien, envoye }: { lien: string; envoye?: boolean }) {
  const [copie, setCopie] = useState(false);

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm" role="status">
      <p>
        {envoye
          ? "Le courriel est parti. Vous pouvez aussi transmettre ce lien vous-même :"
          : "Le courriel n'a pas pu partir (sans nom de domaine, Resend n'écrit qu'à votre propre adresse). Transmettez ce lien à la personne :"}
      </p>
      <div className="flex gap-2">
        <Input value={lien} readOnly onFocus={(e) => e.currentTarget.select()} aria-label="Lien à transmettre" />
        <Button
          type="button"
          variant="outline"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(lien);
              setCopie(true);
            } catch {
              setCopie(false);
            }
          }}
        >
          {copie ? "Copié" : "Copier"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">Ce lien ne sera plus affiché après avoir quitté la page.</p>
    </div>
  );
}
