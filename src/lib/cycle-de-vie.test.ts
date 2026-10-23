import { describe, expect, it } from "vitest";
import { estVisible, verifierTransition } from "./cycle-de-vie";

const complet = { ingredients: 3, ingredientsSources: 2 };
const sansSource = { ingredients: 2, ingredientsSources: 0 };
const vide = { ingredients: 0, ingredientsSources: 0 };

describe("verifierTransition", () => {
  it("cas normal : le produit avance d'une étape quand sa composition le permet", () => {
    expect(verifierTransition("repere", "qualifie", complet)).toEqual({ ok: true });
    expect(verifierTransition("qualifie", "publie", complet)).toEqual({ ok: true });
    expect(verifierTransition("publie", "retire", complet)).toEqual({ ok: true });
    expect(verifierTransition("retire", "repere", vide)).toEqual({ ok: true });
  });

  it("cas vide : sans ingrédient on ne qualifie pas, sans source on ne publie pas", () => {
    expect(verifierTransition("repere", "qualifie", vide).ok).toBe(false);
    expect(verifierTransition("qualifie", "publie", sansSource).ok).toBe(false);
    // Retirer ou revenir en arrière ne demande rien.
    expect(verifierTransition("repere", "retire", vide)).toEqual({ ok: true });
    expect(verifierTransition("qualifie", "repere", vide)).toEqual({ ok: true });
  });

  it("cas piégé : sauter une étape, rester sur place ou inventer un statut est refusé", () => {
    expect(verifierTransition("repere", "publie", complet).ok).toBe(false);
    expect(verifierTransition("retire", "publie", complet).ok).toBe(false);
    expect(verifierTransition("publie", "publie", complet).ok).toBe(false);
    expect(verifierTransition("publie", "supprime", complet)).toEqual({
      ok: false,
      raison: "Statut inconnu.",
    });
    expect(verifierTransition("toString", "repere", complet).ok).toBe(false);
  });
});

describe("estVisible", () => {
  it("le lecteur ne voit que les produits publiés, l'admin voit tout", () => {
    expect(estVisible("publie", "lecteur")).toBe(true);
    expect(estVisible("qualifie", "lecteur")).toBe(false);
    expect(estVisible("retire", "lecteur")).toBe(false);
    expect(estVisible("retire", "admin")).toBe(true);
  });
});
