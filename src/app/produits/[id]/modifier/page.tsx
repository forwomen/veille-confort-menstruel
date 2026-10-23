import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Chargement } from "@/components/chargement";
import { FormulaireProduit } from "@/components/formulaire-produit";
import { exigerRole } from "@/lib/autorisation";
import { lireProduit } from "@/lib/donnees";
import { modifierProduit } from "../../actions";

export default function PageModifierProduit({ params }: PageProps<"/produits/[id]/modifier">) {
  return (
    <Suspense fallback={<Chargement />}>
      <ModifierProduit params={params} />
    </Suspense>
  );
}

async function ModifierProduit({
  params,
}: {
  params: PageProps<"/produits/[id]/modifier">["params"];
}) {
  await exigerRole("admin", "page_modifier_produit");
  const fiche = await lireProduit(Number((await params).id));
  if (!fiche) notFound();

  const { produit, ingredients } = fiche;
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Modifier « {produit.nom} »</h1>
      <FormulaireProduit
        action={modifierProduit.bind(null, produit.id)}
        valeurs={{
          nom: produit.nom,
          marque: produit.marque,
          pays: produit.pays,
          indication: produit.indication,
          statut: produit.statut,
          prix: produit.prix?.replace(".", ",") ?? "",
          devise: produit.devise ?? "",
          ingredients: ingredients.map((i) => i.nom).join(", "),
        }}
        libelleBouton="Enregistrer"
        lienAnnuler={`/produits/${produit.id}`}
      />
    </>
  );
}
