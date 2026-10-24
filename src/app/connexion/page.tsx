import Link from "next/link";
import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormulaireConnexion } from "./formulaire-connexion";

const MESSAGES: Record<string, string> = {
  "mot-de-passe": "Mot de passe enregistré. Connectez-vous avec le nouveau.",
};

export default function Connexion({ searchParams }: PageProps<"/connexion">) {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-4 pt-8">
      <Suspense>
        <Retour searchParams={searchParams} />
      </Suspense>
      <Card>
        <CardHeader>
          <CardTitle>Connexion</CardTitle>
          <CardDescription>
            Veille marché des produits alimentaires pour le confort menstruel.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <FormulaireConnexion />
          <Link href="/mot-de-passe-oublie" className="text-sm underline underline-offset-4">
            Mot de passe oublié ?
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

async function Retour({ searchParams }: Pick<PageProps<"/connexion">, "searchParams">) {
  const { message } = await searchParams;
  if (typeof message !== "string" || !MESSAGES[message]) return null;
  return (
    <p role="status" className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
      {MESSAGES[message]}
    </p>
  );
}
