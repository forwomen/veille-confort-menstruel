import Link from "next/link";
import { Suspense } from "react";
import { Chargement } from "@/components/chargement";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { exigerConnexion } from "@/lib/autorisation";
import { listerProduits } from "@/lib/donnees";
import { INDICATIONS, STATUTS, estIndication } from "@/lib/libelles";

export default function PageProduits({ searchParams }: PageProps<"/produits">) {
  return (
    <Suspense fallback={<Chargement texte="Chargement des produits…" />}>
      <ListeProduits searchParams={searchParams} />
    </Suspense>
  );
}

async function ListeProduits({
  searchParams,
}: {
  searchParams: PageProps<"/produits">["searchParams"];
}) {
  const utilisateur = await exigerConnexion();
  const { indication } = await searchParams;
  const filtre = estIndication(indication) ? indication : undefined;
  const liste = await listerProduits({ indication: filtre });

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Produits</h1>
        {utilisateur.role === "admin" && (
          <Link href="/produits/nouveau" className={buttonVariants()}>
            Ajouter un produit
          </Link>
        )}
      </div>

      <nav aria-label="Filtrer par indication" className="flex flex-wrap gap-2">
        <Link href="/produits">
          <Badge variant={filtre ? "outline" : "default"}>Toutes</Badge>
        </Link>
        {Object.entries(INDICATIONS).map(([valeur, libelle]) => (
          <Link key={valeur} href={`/produits?indication=${valeur}`}>
            <Badge variant={filtre === valeur ? "default" : "outline"}>{libelle}</Badge>
          </Link>
        ))}
      </nav>

      {liste.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          {filtre
            ? `Aucun produit pour l'indication « ${INDICATIONS[filtre]} ».`
            : "Aucun produit pour l'instant."}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead>Marque</TableHead>
                <TableHead>Pays</TableHead>
                <TableHead>Indication</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {liste.map((produit) => (
                <TableRow key={produit.id}>
                  <TableCell>
                    <Link
                      href={`/produits/${produit.id}`}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {produit.nom}
                    </Link>
                  </TableCell>
                  <TableCell>{produit.marque}</TableCell>
                  <TableCell>{produit.pays}</TableCell>
                  <TableCell>{INDICATIONS[produit.indication]}</TableCell>
                  <TableCell>
                    <Badge variant={produit.statut === "publie" ? "default" : "secondary"}>
                      {STATUTS[produit.statut]}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
