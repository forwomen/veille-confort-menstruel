import type { Metadata } from "next";
import { Suspense } from "react";
import { Chargement } from "@/components/chargement";
import { FormulaireMotDePasse } from "@/components/formulaire-mot-de-passe";
import { LienRefuse } from "@/components/lien-refuse";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { lireJeton } from "@/lib/comptes";
import { accepterInvitation } from "./actions";

// Le lien contient un secret : il ne doit partir vers aucun autre site, ni être indexé.
export const metadata: Metadata = { referrer: "no-referrer", robots: { index: false } };

export default function PageInvitation({ params }: PageProps<"/invitation/[jeton]">) {
  return (
    <Suspense fallback={<Chargement texte="Vérification du lien…" />}>
      <Invitation params={params} />
    </Suspense>
  );
}

async function Invitation({ params }: Pick<PageProps<"/invitation/[jeton]">, "params">) {
  const { jeton } = await params;
  const lu = await lireJeton(jeton, "invitation");
  if (!lu.ok) return <LienRefuse message={lu.message} />;

  const { ligne } = lu;
  return (
    <div className="mx-auto w-full max-w-sm pt-8">
      <Card>
        <CardHeader>
          <CardTitle>Bienvenue, {ligne.nom}</CardTitle>
          <CardDescription>
            Choisissez le mot de passe de votre compte {ligne.role === "admin" ? "administrateur" : "lecteur"} (
            {ligne.email}).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormulaireMotDePasse
            action={accepterInvitation.bind(null, jeton)}
            email={ligne.email}
            libelleBouton="Créer mon compte"
          />
        </CardContent>
      </Card>
    </div>
  );
}
