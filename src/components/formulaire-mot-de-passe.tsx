"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LONGUEUR_MIN_MOT_DE_PASSE } from "@/lib/jetons";

export function FormulaireMotDePasse({
  action,
  email,
  libelleBouton,
}: {
  action: (etat: string | undefined, formData: FormData) => Promise<string | undefined>;
  email: string;
  libelleBouton: string;
}) {
  const [erreur, envoyer, enCours] = useActionState(action, undefined);

  return (
    <form action={envoyer} className="flex flex-col gap-4">
      {/* Champ caché pour que le gestionnaire de mots de passe associe le bon compte. */}
      <input type="email" name="email" value={email} autoComplete="username" readOnly hidden />
      <div className="flex flex-col gap-2">
        <Label htmlFor="motDePasse">Mot de passe</Label>
        <Input
          id="motDePasse"
          name="motDePasse"
          type="password"
          autoComplete="new-password"
          minLength={LONGUEUR_MIN_MOT_DE_PASSE}
          aria-invalid={!!erreur}
          required
        />
        <p className="text-xs text-muted-foreground">
          Au moins {LONGUEUR_MIN_MOT_DE_PASSE} caractères. Une phrase de quelques mots convient très bien.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="confirmation">Le même, une seconde fois</Label>
        <Input
          id="confirmation"
          name="confirmation"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!erreur}
          required
        />
      </div>
      {erreur && (
        <p role="alert" className="text-sm text-destructive">
          {erreur}
        </p>
      )}
      <Button type="submit" disabled={enCours}>
        {enCours ? "Enregistrement…" : libelleBouton}
      </Button>
    </form>
  );
}
