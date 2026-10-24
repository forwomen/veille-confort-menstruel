// État « chargement » : un squelette qui a la forme de ce qui va arriver, pour que la page ne saute pas.

function Barre({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

function Annonce({ texte }: { texte: string }) {
  return <p className="text-sm text-muted-foreground">{texte}</p>;
}

export function Chargement({ texte = "Chargement…" }: { texte?: string }) {
  return (
    <div className="flex flex-col gap-3" aria-busy="true">
      <Annonce texte={texte} />
      <Barre className="h-24" />
    </div>
  );
}

export function SqueletteListe({ texte = "Chargement…", lignes = 5 }: { texte?: string; lignes?: number }) {
  return (
    <div className="flex flex-col gap-4" aria-busy="true">
      <Annonce texte={texte} />
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 5 }, (_, i) => (
          <Barre key={i} className="h-5 w-20" />
        ))}
      </div>
      <div className="flex flex-col divide-y rounded-lg border">
        {Array.from({ length: lignes }, (_, i) => (
          <div key={i} className="flex items-center gap-4 px-3 py-3">
            <Barre className="h-4 w-1/3" />
            <Barre className="h-4 w-1/6" />
            <Barre className="h-4 w-1/6" />
            <Barre className="ml-auto h-5 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SqueletteFiche({ texte = "Chargement de la fiche…" }: { texte?: string }) {
  return (
    <div className="flex flex-col gap-4" aria-busy="true">
      <Annonce texte={texte} />
      <Barre className="h-8 w-1/2" />
      <Barre className="h-4 w-1/4" />
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="flex flex-col gap-3 rounded-lg border p-4">
          <Barre className="h-5 w-1/4" />
          <Barre className="h-4 w-3/4" />
          <Barre className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  );
}

export function SqueletteFormulaire({ texte = "Chargement du formulaire…", champs = 5 }: { texte?: string; champs?: number }) {
  return (
    <div className="flex max-w-xl flex-col gap-4" aria-busy="true">
      <Annonce texte={texte} />
      {Array.from({ length: champs }, (_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Barre className="h-4 w-24" />
          <Barre className="h-9 w-full" />
        </div>
      ))}
      <Barre className="h-9 w-32" />
    </div>
  );
}
