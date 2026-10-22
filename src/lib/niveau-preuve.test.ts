import { describe, expect, it } from "vitest";
import { niveauDePreuve } from "./niveau-preuve";

describe("niveauDePreuve", () => {
  it("cas normal : 1 ou 2 sources donnent « exploratoire », 3 et plus « étayé »", () => {
    expect(niveauDePreuve(1)).toBe("exploratoire");
    expect(niveauDePreuve(2)).toBe("exploratoire");
    expect(niveauDePreuve(3)).toBe("etaye");
    expect(niveauDePreuve(12)).toBe("etaye");
  });

  it("cas vide : aucune source donne « non étayé »", () => {
    expect(niveauDePreuve(0)).toBe("non_etaye");
  });

  it("cas piégé : un nombre négatif, décimal ou absent est refusé", () => {
    expect(() => niveauDePreuve(-1)).toThrow(RangeError);
    expect(() => niveauDePreuve(2.5)).toThrow(RangeError);
    expect(() => niveauDePreuve(Number.NaN)).toThrow(RangeError);
  });
});
