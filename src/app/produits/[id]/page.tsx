import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Chargement } from "@/components/chargement";
import { FormulairePieceJointe } from "@/components/formulaire-piece-jointe";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { exigerConnexion } from "@/lib/autorisation";
import { lireProduit } from "@/lib/donnees";
import { INDICATIONS, STATUTS, TYPES_SOURCE } from "@/lib/libelles";
import { LIBELLES_NIVEAU, type NiveauPreuve } from "@/lib/niveau-preuve";
import { convertirEnEuros } from "@/lib/taux-change";
import { ajouterPieceJointe } from "../actions";

const MESSAGES: Record<string, string> = {
  cree: "Produit créé. Une notification a été envoyée par courriel.",
  modifie: "Modifications enregistrées.",
  fichier: "Fichier ajouté.",
};

const VARIANTE_NIVEAU: Record<NiveauPreuve, "default" | "secondary" | "outline"> = {
  etaye: "default",
  exploratoire: "secondary",
  non_etaye: "outline",
};

const euros = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

export default function PageProduit({ params, searchParams }: PageProps<"/produits/[id]">) {
  return (
    <Suspense fallback={<Chargement texte="Chargement de la fiche…" />}>
      <FicheProduit params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function FicheProduit({
  params,
  searchParams,
}: Pick<PageProps<"/produits/[id]">, "params" | "searchParams">) {
  const utilisateur = await exigerConnexion();
  const fiche = await lireProduit(Number((await params).id));
  if (!fiche) notFound();
  const { message } = await searchParams;

  const { produit, ingredients, fichiers } = fiche;
  const estAdmin = utilisateur.role === "admin";

  return (
    <>
      {typeof message === "string" && MESSAGES[message] && (
        <p role="status" className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
          {MESSAGES[message]}
        </p>
      )}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Link href="/produits" className="text-sm text-muted-foreground hover:underline">
            ← Produits
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">{produit.nom}</h1>
          <p className="text-muted-foreground">
            {produit.marque} · {produit.pays}
          </p>
        </div>
        {estAdmin && (
          <Link href={`/produits/${produit.id}/modifier`} className={buttonVariants({ variant: "outline" })}>
            Modifier
          </Link>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">{INDICATIONS[produit.indication]}</Badge>
        <Badge variant={produit.statut === "publie" ? "default" : "outline"}>
          {STATUTS[produit.statut]}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prix</CardTitle>
        </CardHeader>
        <CardContent>
          {produit.prix && produit.devise ? (
            <Suspense fallback={<p className="text-sm text-muted-foreground">Conversion en cours…</p>}>
              <Prix montant={Number(produit.prix)} devise={produit.devise} />
            </Suspense>
          ) : (
            <p className="text-sm text-muted-foreground">Prix non renseigné.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Composition et niveau de preuve</CardTitle>
        </CardHeader>
        <CardContent>
          {ingredients.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun ingrédient renseigné.</p>
          ) : (
            <ul className="flex flex-col divide-y">
              {ingredients.map((ingredient) => (
                <li key={ingredient.id} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">{ingredient.nom}</span>
                    <Badge variant={VARIANTE_NIVEAU[ingredient.niveau]}>
                      {LIBELLES_NIVEAU[ingredient.niveau]} · {ingredient.sources.length} source
                      {ingredient.sources.length > 1 ? "s" : ""}
                    </Badge>
                  </div>
                  {ingredient.sources.length > 0 && (
                    <ul className="flex flex-col gap-1 pl-4 text-sm">
                      {ingredient.sources.map((source) => (
                        <li key={source.id} className="list-disc">
                          <a
                            href={source.lien}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline-offset-4 hover:underline"
                          >
                            {source.titre}
                          </a>{" "}
                          <span className="text-muted-foreground">({TYPES_SOURCE[source.type]})</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pièces jointes</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {fichiers.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun fichier.</p>
          ) : (
            <ul className="flex flex-col gap-1 text-sm">
              {fichiers.map((fichier) => (
                <li key={fichier.id}>
                  <a
                    href={`/api/pieces-jointes/${fichier.id}`}
                    className="underline-offset-4 hover:underline"
                  >
                    {fichier.nomFichier}
                  </a>{" "}
                  <span className="text-muted-foreground">
                    ({Math.max(1, Math.round(fichier.taille / 1024))} Ko)
                  </span>
                </li>
              ))}
            </ul>
          )}
          {estAdmin && <FormulairePieceJointe action={ajouterPieceJointe.bind(null, produit.id)} />}
        </CardContent>
      </Card>
    </>
  );
}

async function Prix({ montant, devise }: { montant: number; devise: string }) {
  const original = new Intl.NumberFormat("fr-FR", { style: "currency", currency: devise }).format(montant);
  if (devise === "EUR") return <p className="text-lg font-medium">{original}</p>;

  const conversion = await convertirEnEuros(montant, devise);
  return (
    <div className="flex flex-col gap-1">
      <p className="text-lg font-medium">{original}</p>
      {conversion.ok ? (
        <p className="text-sm text-muted-foreground">
          ≈ {euros.format(conversion.montantEuros)} (taux {conversion.taux.toFixed(4)}, source
          ExchangeRate-API)
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">{conversion.raison}</p>
      )}
    </div>
  );
}
