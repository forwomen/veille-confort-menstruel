"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { EtatLien } from "./actions";
import { LienACopier } from "./lien-a-copier";

export function BoutonReinitialisation({ action }: { action: (etat: EtatLien) => Promise<EtatLien> }) {
  const [etat, envoyer, enCours] = useActionState(action, {});

  return (
    <div className="flex flex-col items-start gap-2">
      <form action={envoyer}>
        <Button type="submit" variant="outline" size="sm" disabled={enCours}>
          {enCours ? "Création…" : etat.lien ? "Nouveau lien" : "Lien de mot de passe"}
        </Button>
      </form>
      {etat.message && <p className="text-sm text-destructive">{etat.message}</p>}
      {etat.lien && <LienACopier lien={etat.lien} envoye={etat.envoye} />}
    </div>
  );
}
