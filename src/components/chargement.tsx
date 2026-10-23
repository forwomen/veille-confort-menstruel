export function Chargement({ texte = "Chargement…" }: { texte?: string }) {
  return (
    <div className="flex flex-col gap-3" aria-busy="true">
      <p className="text-sm text-muted-foreground">{texte}</p>
      <div className="h-24 animate-pulse rounded-lg bg-muted" />
    </div>
  );
}
