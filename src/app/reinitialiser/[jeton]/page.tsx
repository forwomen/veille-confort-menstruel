import type { Metadata } from "next";
import { Suspense } from "react";
import { Chargement } from "@/components/chargement";
import { FormulaireMotDePasse } from "@/components/formulaire-mot-de-passe";
import { LienRefuse } from "@/components/lien-refuse";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { lireJeton } from "@/lib/comptes";
import { reinitialiser } from "../actions";

// Le lien contient un secret : il ne doit partir vers aucun autre site, ni être indexé.
export const metadata: Metadata = { referrer: "no-referrer", robots: { index: false } };

export default function PageReinitialiser({ params }: PageProps<"/reinitialiser/[jeton]">) {
  return (
    <Suspense fallback={<Chargement texte="Vérification du lien…" />}>
      <Reinitialiser params={params} />
    </Suspense>
  );
}

async function Reinitialiser({ params }: Pick<PageProps<"/reinitialiser/[jeton]">, "params">) {
  const { jeton } = await params;
  const lu = await lireJeton(jeton, "reinitialisation");
  if (!lu.ok) return <LienRefuse message={lu.message} />;

  return (
    <div className="mx-auto w-full max-w-sm pt-8">
      <Card>
        <CardHeader>
          <CardTitle>Nouveau mot de passe</CardTitle>
          <CardDescription>Pour le compte {lu.ligne.email}. L&apos;ancien cessera de fonctionner.</CardDescription>
        </CardHeader>
        <CardContent>
          <FormulaireMotDePasse
            action={reinitialiser.bind(null, jeton)}
            email={lu.ligne.email}
            libelleBouton="Enregistrer le mot de passe"
          />
        </CardContent>
      </Card>
    </div>
  );
}
