import Link from "next/link";
import { Suspense } from "react";
import { BadgeStatut } from "@/components/badge-statut";
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
import { statutsVisibles } from "@/lib/cycle-de-vie";
import { listerProduits } from "@/lib/donnees";
import {
  INDICATIONS,
  STATUTS,
  estIndication,
  estStatut,
  type Indication,
  type Statut,
} from "@/lib/libelles";

function lienFiltre(filtre: { indication?: Indication; statut?: Statut }) {
  const parametres = new URLSearchParams();
  if (filtre.indication) parametres.set("indication", filtre.indication);
  if (filtre.statut) parametres.set("statut", filtre.statut);
  const chaine = parametres.toString();
  return chaine ? `/produits?${chaine}` : "/produits";
}

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
  const estAdmin = utilisateur.role === "admin";
  const visibles = statutsVisibles(utilisateur.role);
  const parametres = await searchParams;
  const filtre = estIndication(parametres.indication) ? parametres.indication : undefined;
  // Un lecteur qui tape ?statut=repere dans l'adresse n'obtient rien de plus : le filtre est ignoré.
  const statut =
    estStatut(parametres.statut) && visibles.includes(parametres.statut) ? parametres.statut : undefined;
  const liste = await listerProduits({ visibles, indication: filtre, statut });

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Produits</h1>
        {estAdmin && (
          <Link href="/produits/nouveau" className={buttonVariants()}>
            Ajouter un produit
          </Link>
        )}
      </div>

      <nav aria-label="Filtrer par indication" className="flex flex-wrap gap-2">
        <Link href={lienFiltre({ statut })}>
          <Badge variant={filtre ? "outline" : "default"}>Toutes</Badge>
        </Link>
        {(Object.keys(INDICATIONS) as Indication[]).map((valeur) => (
          <Link key={valeur} href={lienFiltre({ indication: valeur, statut })}>
            <Badge variant={filtre === valeur ? "default" : "outline"}>{INDICATIONS[valeur]}</Badge>
          </Link>
        ))}
      </nav>

      {estAdmin && (
        <nav aria-label="Filtrer par statut" className="flex flex-wrap gap-2">
          <Link href={lienFiltre({ indication: filtre })}>
            <Badge variant={statut ? "outline" : "default"}>Tous les statuts</Badge>
          </Link>
          {visibles.map((valeur) => (
            <Link key={valeur} href={lienFiltre({ indication: filtre, statut: valeur })}>
              <Badge variant={statut === valeur ? "default" : "outline"}>{STATUTS[valeur]}</Badge>
            </Link>
          ))}
        </nav>
      )}

      {liste.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          {filtre || statut
            ? "Aucun produit ne correspond à ces filtres."
            : estAdmin
              ? "Aucun produit pour l'instant."
              : "Aucun produit publié pour l'instant."}
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
                    <BadgeStatut statut={produit.statut} />
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
