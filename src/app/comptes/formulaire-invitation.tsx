"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { inviter } from "./actions";
import { LienACopier } from "./lien-a-copier";

const classeSelect =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive md:text-sm dark:bg-input/30";

export function FormulaireInvitation() {
  const [etat, envoyer, enCours] = useActionState(inviter, {});
  const erreurs = etat.erreurs ?? {};
  const v = etat.valeurs ?? {};

  return (
    <div className="flex flex-col gap-4">
      {/* key : après une invitation réussie, le formulaire repart vide. */}
      <form key={etat.lien ?? "saisie"} action={envoyer} className="grid gap-4 sm:grid-cols-[1fr_1fr_10rem_auto] sm:items-start">
        <div className="flex flex-col gap-2">
          <Label htmlFor="nom">Nom</Label>
          <Input id="nom" name="nom" defaultValue={v.nom} aria-invalid={!!erreurs.nom} required />
          {erreurs.nom && <p className="text-sm text-destructive">{erreurs.nom}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Adresse e-mail</Label>
          <Input id="email" name="email" type="email" defaultValue={v.email} aria-invalid={!!erreurs.email} required />
          {erreurs.email && <p className="text-sm text-destructive">{erreurs.email}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="role">Rôle</Label>
          <select id="role" name="role" defaultValue={v.role ?? "lecteur"} className={classeSelect}>
            <option value="lecteur">Lecteur</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <Button type="submit" disabled={enCours} className="sm:mt-6">
          {enCours ? "Invitation…" : "Inviter"}
        </Button>
      </form>
      {etat.message && !etat.lien && (
        <p role="alert" className="text-sm text-destructive">
          {etat.message}
        </p>
      )}
      {etat.lien && <LienACopier lien={etat.lien} envoye={etat.envoye} />}
    </div>
  );
}
