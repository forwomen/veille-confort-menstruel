import { describe, expect, it } from "vitest";
import { lireEtatSimule, simuler } from "./simulation";

describe("lireEtatSimule", () => {
  it("cas normal : sur une prévisualisation, ?etat=erreur est pris en compte", () => {
    expect(lireEtatSimule("erreur", "preview")).toBe("erreur");
    expect(lireEtatSimule("vide", undefined)).toBe("vide");
  });

  it("cas vide : sans paramètre, rien n'est simulé", () => {
    expect(lireEtatSimule(undefined, "preview")).toBeNull();
    expect(lireEtatSimule("", "preview")).toBeNull();
  });

  it("cas piégé : ignoré en production, et une valeur inventée ou répétée ne passe pas", () => {
    expect(lireEtatSimule("erreur", "production")).toBeNull();
    expect(lireEtatSimule("toString", "preview")).toBeNull();
    expect(lireEtatSimule(["erreur", "vide"], "preview")).toBeNull();
  });
});

describe("simuler", () => {
  it("fait échouer la lecture pour l'état erreur, et ne fait rien sans état", async () => {
    await expect(simuler("erreur")).rejects.toThrow(/simulée/);
    await expect(simuler(null)).resolves.toBeUndefined();
  });
});
