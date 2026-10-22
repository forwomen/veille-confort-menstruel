import { Suspense } from "react";
import { Chargement } from "@/components/chargement";
import { FormulaireProduit } from "@/components/formulaire-produit";
import { exigerRole } from "@/lib/autorisation";
import { creerProduit } from "../actions";

export default function PageNouveauProduit() {
  return (
    <Suspense fallback={<Chargement />}>
      <NouveauProduit />
    </Suspense>
  );
}

async function NouveauProduit() {
  await exigerRole("admin", "page_nouveau_produit");
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Ajouter un produit</h1>
      <FormulaireProduit
        action={creerProduit}
        libelleBouton="Créer le produit"
        lienAnnuler="/produits"
      />
    </>
  );
}
