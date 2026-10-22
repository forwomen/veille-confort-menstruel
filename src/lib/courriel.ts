import "server-only";
import { Resend } from "resend";
import { journal } from "@/lib/journal";

// Sans domaine vérifié, Resend n'envoie qu'à l'adresse du compte Resend :
// NOTIFICATION_EMAIL doit donc être cette adresse.

export async function notifierNouveauProduit(produit: {
  id: number;
  nom: string;
  marque: string;
}) {
  const cle = process.env.RESEND_API_KEY;
  const destinataire = process.env.NOTIFICATION_EMAIL;
  if (!cle || !destinataire) {
    journal("courriel_non_configure", { produitId: produit.id });
    return;
  }

  const base = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000";

  try {
    const { error } = await new Resend(cle).emails.send({
      from: "Veille confort menstruel <onboarding@resend.dev>",
      to: destinataire,
      subject: `Nouveau produit : ${produit.nom}`,
      text: `Le produit « ${produit.nom} » (${produit.marque}) vient d'être ajouté.\n\nFiche : ${base}/produits/${produit.id}`,
    });
    if (error) throw new Error(error.message);
    journal("courriel_envoye", { produitId: produit.id });
  } catch (erreur) {
    // Un échec d'envoi ne doit pas annuler la création du produit.
    journal("courriel_echoue", { produitId: produit.id, erreur: String(erreur) });
  }
}
