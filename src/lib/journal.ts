// Journal de production : une ligne JSON par événement, lisible dans les logs Vercel.
export function journal(evenement: string, details: Record<string, unknown> = {}) {
  console.log(
    JSON.stringify({ date: new Date().toISOString(), evenement, ...details }),
  );
}
