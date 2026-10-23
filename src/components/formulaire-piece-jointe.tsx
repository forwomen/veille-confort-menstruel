"use client";

import { useActionState } from "react";
import type { EtatFormulaire } from "@/app/produits/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function FormulairePieceJointe({
  action,
}: {
  action: (etat: EtatFormulaire, formData: FormData) => Promise<EtatFormulaire>;
}) {
  const [etat, envoyer, enCours] = useActionState(action, {});
  const erreur = etat.erreurs?.fichier ?? etat.message;

  return (
    <form action={envoyer} className="flex flex-col gap-2 border-t pt-4">
      <Label htmlFor="fichier">Ajouter un fichier (PDF ou image, 4 Mo maximum)</Label>
      <div className="flex flex-wrap gap-2">
        <Input
          id="fichier"
          name="fichier"
          type="file"
          accept="application/pdf,image/png,image/jpeg,image/webp"
          className="max-w-sm"
          aria-invalid={!!erreur}
          required
        />
        <Button type="submit" disabled={enCours}>
          {enCours ? "Envoi…" : "Envoyer"}
        </Button>
      </div>
      {erreur && (
        <p role="alert" className="text-sm text-destructive">
          {erreur}
        </p>
      )}
    </form>
  );
}
