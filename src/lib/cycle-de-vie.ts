// Cycle de vie d'un produit : quels statuts existent, lesquels se suivent, et à quelles conditions.
// Le schéma dessiné est dans docs/cycle-de-vie.md ; ce fichier en est la version que le serveur applique.
import type { Role } from "@/auth";
import { STATUTS, estStatut, type Statut } from "@/lib/libelles";

// Ce que l'on sait de la composition du produit au moment de la décision.
export type Faits = {
  ingredients: number;
  ingredientsSources: number;
};

export const TRANSITIONS: Record<Statut, readonly Statut[]> = {
  repere: ["qualifie", "retire"],
  qualifie: ["publie", "repere", "retire"],
  publie: ["qualifie", "retire"],
  retire: ["repere"],
};

// Raison pour laquelle un produit ne peut pas être (ou rester) dans ce statut, ou null s'il le peut.
export function conditionNonRemplie(statut: Statut, faits: Faits): string | null {
  if (statut === "qualifie" && faits.ingredients === 0) {
    return "Un produit qualifié doit avoir au moins un ingrédient.";
  }
  if (statut === "publie" && faits.ingredientsSources === 0) {
    return "Un produit publié doit avoir au moins un ingrédient appuyé par une source.";
  }
  return null;
}

export function verifierTransition(
  de: unknown,
  vers: unknown,
  faits: Faits,
): { ok: true } | { ok: false; raison: string } {
  if (!estStatut(de) || !estStatut(vers)) return { ok: false, raison: "Statut inconnu." };
  if (!TRANSITIONS[de].includes(vers)) {
    return { ok: false, raison: "Ce changement de statut n'est pas permis." };
  }
  const raison = conditionNonRemplie(vers, faits);
  return raison ? { ok: false, raison } : { ok: true };
}

// Le lecteur ne voit que ce qui est publié ; l'admin voit tout, y compris les produits retirés.
export function statutsVisibles(role: Role): readonly Statut[] {
  return role === "admin" ? (Object.keys(STATUTS) as Statut[]) : ["publie"];
}

export function estVisible(statut: Statut, role: Role): boolean {
  return statutsVisibles(role).includes(statut);
}
