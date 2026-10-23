"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { EtatFormulaire } from "@/app/produits/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { INDICATIONS } from "@/lib/libelles";

export type ValeursProduit = {
  nom: string;
  marque: string;
  pays: string;
  indication: string;
  prix: string;
  devise: string;
  ingredients: string;
};

const VIDE: ValeursProduit = {
  nom: "",
  marque: "",
  pays: "",
  indication: "",
  prix: "",
  devise: "EUR",
  ingredients: "",
};

const classeSelect =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive md:text-sm dark:bg-input/30";

export function FormulaireProduit({
  action,
  valeurs = VIDE,
  libelleBouton,
  lienAnnuler,
}: {
  action: (etat: EtatFormulaire, formData: FormData) => Promise<EtatFormulaire>;
  valeurs?: ValeursProduit;
  libelleBouton: string;
  lienAnnuler: string;
}) {
  const [etat, envoyer, enCours] = useActionState(action, {});
  const erreurs = etat.erreurs ?? {};
  // React vide le formulaire après l'envoi : on réaffiche la saisie renvoyée en cas d'erreur.
  const v = { ...valeurs, ...etat.valeurs };

  return (
    <form action={envoyer} className="grid gap-5 sm:grid-cols-2">
      <Champ nom="nom" erreur={erreurs.nom} libelle="Nom du produit">
        <Input id="nom" name="nom" defaultValue={v.nom} aria-invalid={!!erreurs.nom} required />
      </Champ>
      <Champ nom="marque" erreur={erreurs.marque} libelle="Marque">
        <Input id="marque" name="marque" defaultValue={v.marque} aria-invalid={!!erreurs.marque} required />
      </Champ>
      <Champ nom="pays" erreur={erreurs.pays} libelle="Pays d'origine">
        <Input id="pays" name="pays" defaultValue={v.pays} aria-invalid={!!erreurs.pays} required />
      </Champ>
      <Champ nom="indication" erreur={erreurs.indication} libelle="Indication">
        <select
          id="indication"
          name="indication"
          defaultValue={v.indication}
          aria-invalid={!!erreurs.indication}
          className={classeSelect}
          required
        >
          <option value="" disabled>
            Choisir…
          </option>
          {Object.entries(INDICATIONS).map(([valeur, libelle]) => (
            <option key={valeur} value={valeur}>
              {libelle}
            </option>
          ))}
        </select>
      </Champ>
      <div className="grid grid-cols-[2fr_1fr] gap-3 sm:col-span-2 sm:max-w-sm">
        <Champ nom="prix" erreur={erreurs.prix} libelle="Prix" aide="Facultatif, ex. 24,90">
          <Input id="prix" name="prix" inputMode="decimal" defaultValue={v.prix} aria-invalid={!!erreurs.prix} />
        </Champ>
        <Champ nom="devise" erreur={erreurs.devise} libelle="Devise">
          <Input id="devise" name="devise" maxLength={3} defaultValue={v.devise} aria-invalid={!!erreurs.devise} />
        </Champ>
      </div>
      <div className="sm:col-span-2">
        <Champ
          nom="ingredients"
          erreur={erreurs.ingredients}
          libelle="Ingrédients"
          aide="Séparés par des virgules, ex. Magnésium, Vitamine B6, Gingembre"
        >
          <Textarea
            id="ingredients"
            name="ingredients"
            rows={3}
            defaultValue={v.ingredients}
            aria-invalid={!!erreurs.ingredients}
          />
        </Champ>
      </div>

      {etat.message && (
        <p role="alert" className="text-sm text-destructive sm:col-span-2">
          {etat.message}
        </p>
      )}

      <div className="flex gap-3 sm:col-span-2">
        <Button type="submit" disabled={enCours}>
          {enCours ? "Enregistrement…" : libelleBouton}
        </Button>
        <Link href={lienAnnuler} className={buttonVariants({ variant: "outline" })}>
          Annuler
        </Link>
      </div>
    </form>
  );
}

function Champ({
  nom,
  libelle,
  aide,
  erreur,
  children,
}: {
  nom: keyof ValeursProduit;
  libelle: string;
  aide?: string;
  erreur?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={nom}>{libelle}</Label>
      {children}
      {aide && !erreur && <p className="text-xs text-muted-foreground">{aide}</p>}
      {erreur && <p className="text-sm text-destructive">{erreur}</p>}
    </div>
  );
}
