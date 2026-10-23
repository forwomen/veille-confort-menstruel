import "server-only";
import { Resend } from "resend";
import { journal } from "@/lib/journal";

// Sans domaine vérifié, Resend n'envoie qu'à l'adresse du compte Resend (NOTIFICATION_EMAIL).
// Un envoi vers une autre adresse échoue : l'échec est journalisé, et l'écran montre alors le lien
// pour qu'il soit transmis à la main.

// Adresse publique du site, prise dans les variables de Vercel et jamais dans la requête :
// un en-tête Host falsifié ne doit pas pouvoir détourner un lien de réinitialisation.
export function urlDuSite() {
  if (process.env.VERCEL_ENV === "production" && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  const branche = process.env.VERCEL_BRANCH_URL ?? process.env.VERCEL_URL;
  return branche ? `https://${branche}` : "http://localhost:3000";
}

async function envoyer(
  message: { to: string; subject: string; text: string },
  evenement: string,
  details: Record<string, unknown>,
): Promise<boolean> {
  const cle = process.env.RESEND_API_KEY;
  if (!cle) {
    journal("courriel_non_configure", { evenement, ...details });
    return false;
  }
  try {
    const { error } = await new Resend(cle).emails.send({
      from: "Veille confort menstruel <onboarding@resend.dev>",
      ...message,
    });
    if (error) throw new Error(error.message);
    journal("courriel_envoye", { evenement, ...details });
    return true;
  } catch (erreur) {
    // Un échec d'envoi ne doit jamais annuler l'action qui l'a déclenché.
    journal("courriel_echoue", { evenement, ...details, erreur: String(erreur) });
    return false;
  }
}

export async function notifierNouveauProduit(produit: { id: number; nom: string; marque: string }) {
  const destinataire = process.env.NOTIFICATION_EMAIL;
  if (!destinataire) {
    journal("courriel_non_configure", { evenement: "produit_cree", produitId: produit.id });
    return;
  }
  await envoyer(
    {
      to: destinataire,
      subject: `Nouveau produit : ${produit.nom}`,
      text: `Le produit « ${produit.nom} » (${produit.marque}) vient d'être ajouté.\n\nFiche : ${urlDuSite()}/produits/${produit.id}`,
    },
    "produit_cree",
    { produitId: produit.id },
  );
}

export function envoyerInvitation(invitation: { email: string; nom: string; lien: string }) {
  return envoyer(
    {
      to: invitation.email,
      subject: "Votre invitation à la veille confort menstruel",
      text: `Bonjour ${invitation.nom},\n\nUne invitation vous attend pour rejoindre l'outil de veille confort menstruel. Choisissez votre mot de passe en ouvrant ce lien, valable 7 jours et une seule fois :\n\n${invitation.lien}\n\nSi vous ne vous attendiez pas à ce message, ignorez-le.`,
    },
    "invitation",
    {},
  );
}

export function envoyerReinitialisation(demande: { email: string; lien: string }) {
  return envoyer(
    {
      to: demande.email,
      subject: "Choisir un nouveau mot de passe",
      text: `Bonjour,\n\nPour choisir un nouveau mot de passe, ouvrez ce lien, valable 1 heure et une seule fois :\n\n${demande.lien}\n\nSi vous n'avez rien demandé, ignorez ce message : votre mot de passe actuel reste valable.`,
    },
    "reinitialisation",
    {},
  );
}
