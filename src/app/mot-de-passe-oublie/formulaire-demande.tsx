"use client";

import { useActionState } from "react";
import { demanderReinitialisation } from "@/app/reinitialiser/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function FormulaireDemande() {
  const [etat, envoyer, enCours] = useActionState(demanderReinitialisation, {});

  if (etat.message) {
    return (
      <p role="status" className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
        {etat.message}
      </p>
    );
  }

  return (
    <form action={envoyer} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Adresse e-mail du compte</Label>
        <Input id="email" name="email" type="email" autoComplete="email" aria-invalid={!!etat.erreur} required />
      </div>
      {etat.erreur && (
        <p role="alert" className="text-sm text-destructive">
          {etat.erreur}
        </p>
      )}
      <Button type="submit" disabled={enCours}>
        {enCours ? "Envoi…" : "Recevoir un lien"}
      </Button>
    </form>
  );
}
