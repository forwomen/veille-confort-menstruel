import { EtatVide } from "@/components/etat-vide";

export default function Introuvable() {
  return (
    <EtatVide
      titre="Page introuvable"
      texte="Ce produit ou cette page n'existe pas, ou plus. Le lien a peut-être été mal copié."
      action={{ libelle: "Retour aux produits", href: "/produits" }}
    />
  );
}
