import { describe, expect, it } from "vitest";
import { empreinteDe, etatJeton, nouveauJeton, problemeMotDePasse } from "./jetons";

const maintenant = new Date("2026-10-23T12:00:00Z");
const demain = new Date("2026-10-24T12:00:00Z");

describe("etatJeton", () => {
  it("cas normal : un lien non utilisé et non expiré est valide", () => {
    expect(etatJeton({ expireLe: demain, utiliseLe: null, annuleLe: null }, maintenant)).toBe("valide");
  });

  it("cas vide : un lien qui expire à l'instant même n'est plus valide", () => {
    expect(etatJeton({ expireLe: maintenant, utiliseLe: null, annuleLe: null }, maintenant)).toBe("expire");
  });

  it("cas piégé : un lien déjà utilisé reste refusé, même s'il n'est pas expiré", () => {
    expect(etatJeton({ expireLe: demain, utiliseLe: maintenant, annuleLe: null }, maintenant)).toBe("utilise");
    expect(etatJeton({ expireLe: demain, utiliseLe: null, annuleLe: maintenant }, maintenant)).toBe("annule");
  });
});

describe("nouveauJeton", () => {
  it("garde seulement une empreinte, différente du lien, et deux liens ne se ressemblent pas", () => {
    const a = nouveauJeton();
    const b = nouveauJeton();
    expect(a.empreinte).toBe(empreinteDe(a.jeton));
    expect(a.empreinte).not.toContain(a.jeton);
    expect(a.jeton).not.toBe(b.jeton);
    expect(a.jeton.length).toBeGreaterThanOrEqual(43);
  });
});

describe("problemeMotDePasse", () => {
  it("cas normal : 12 caractères identiques aux deux saisies", () => {
    expect(problemeMotDePasse("cycle-lune-42", "cycle-lune-42")).toBeNull();
  });

  it("cas vide : rien saisi, ou trop court", () => {
    expect(problemeMotDePasse("", "")).not.toBeNull();
    expect(problemeMotDePasse(null, null)).not.toBeNull();
    expect(problemeMotDePasse("court", "court")).toMatch(/12 caractères/);
  });

  it("cas piégé : confirmation différente, espace caché, ou trop long pour bcrypt", () => {
    expect(problemeMotDePasse("cycle-lune-42", "cycle-lune-43")).toMatch(/identiques/);
    expect(problemeMotDePasse("cycle-lune-42 ", "cycle-lune-42 ")).toMatch(/espace/);
    // 40 « é » font 80 octets : bcrypt n'en garderait que 72.
    const long = "é".repeat(40);
    expect(problemeMotDePasse(long, long)).toMatch(/72 octets/);
  });
});
