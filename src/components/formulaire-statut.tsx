"use client";

import { useActionState } from "react";
import type { EtatFormulaire } from "@/app/produits/actions";
import { Button } from "@/components/ui/button";

export type ChoixStatut = { vers: string; libelle: string; bloque: string | null };

// Un bouton par transition permise depuis le statut actuel ; une transition dont la condition
// n'est pas remplie reste visible, désactivée, avec sa raison. Le serveur revérifie de toute façon.
export function FormulaireStatut({
  action,
  choix,
}: {
  action: (etat: EtatFormulaire, formData: FormData) => Promise<EtatFormulaire>;
  choix: ChoixStatut[];
}) {
  const [etat, envoyer, enCours] = useActionState(action, {});

  return (
    <form action={envoyer} className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {choix.map((c) => (
          <Button
            key={c.vers}
            type="submit"
            name="vers"
            value={c.vers}
            variant={c.vers === "retire" ? "destructive" : "outline"}
            disabled={enCours || c.bloque !== null}
            title={c.bloque ?? undefined}
          >
            {c.libelle}
          </Button>
        ))}
      </div>
      {choix
        .filter((c) => c.bloque)
        .map((c) => (
          <p key={c.vers} className="text-sm text-muted-foreground">
            {c.libelle} : {c.bloque}
          </p>
        ))}
      {enCours && <p className="text-sm text-muted-foreground">Changement en cours…</p>}
      {etat.message && (
        <p role="alert" className="text-sm text-destructive">
          {etat.message}
        </p>
      )}
    </form>
  );
}
