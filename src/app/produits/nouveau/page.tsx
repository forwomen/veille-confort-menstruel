import { Suspense } from "react";
import { SqueletteFormulaire } from "@/components/chargement";
import { FormulaireProduit } from "@/components/formulaire-produit";
import { exigerRole } from "@/lib/autorisation";
import { creerProduit } from "../actions";

export default function PageNouveauProduit() {
  return (
    <Suspense fallback={<SqueletteFormulaire />}>
      <NouveauProduit />
    </Suspense>
  );
}

async function NouveauProduit() {
  await exigerRole("admin", "page_nouveau_produit");
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Ajouter un produit</h1>
      <p className="text-sm text-muted-foreground">
        Le produit entre au statut « Repéré ». Vous le ferez avancer depuis sa fiche.
      </p>
      <FormulaireProduit
        action={creerProduit}
        libelleBouton="Créer le produit"
        lienAnnuler="/produits"
      />
    </>
  );
}
