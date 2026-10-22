import "server-only";
import { cacheLife } from "next/cache";
import { journal } from "@/lib/journal";

// ExchangeRate-API (https://www.exchangerate-api.com), appelée uniquement côté serveur.
// La clé vit dans la variable d'environnement EXCHANGERATE_API_KEY.

async function tauxVersEuro(devise: string): Promise<number> {
  "use cache";
  // Un taux par devise et par heure suffit : on reste très loin du quota gratuit.
  cacheLife("hours");

  const cle = process.env.EXCHANGERATE_API_KEY;
  if (!cle) throw new Error("EXCHANGERATE_API_KEY absente");

  const reponse = await fetch(
    `https://v6.exchangerate-api.com/v6/${cle}/pair/${devise}/EUR`,
    { signal: AbortSignal.timeout(5000) },
  );
  const corps = await reponse.json();
  if (!reponse.ok || corps.result !== "success") {
    throw new Error(`ExchangeRate-API : ${corps["error-type"] ?? reponse.status}`);
  }
  return corps.conversion_rate as number;
}

export type Conversion =
  | { ok: true; montantEuros: number; taux: number }
  | { ok: false; raison: string };

export async function convertirEnEuros(
  montant: number,
  devise: string,
): Promise<Conversion> {
  if (devise === "EUR") return { ok: true, montantEuros: montant, taux: 1 };
  try {
    const taux = await tauxVersEuro(devise);
    return { ok: true, montantEuros: montant * taux, taux };
  } catch (erreur) {
    // L'API ne répond pas ou la clé est invalide : la fiche s'affiche quand même.
    journal("conversion_echouee", { devise, erreur: String(erreur) });
    return { ok: false, raison: "Conversion en euros indisponible pour le moment." };
  }
}
