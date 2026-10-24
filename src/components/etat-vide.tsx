import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

type Action = { libelle: string; href: string };

// État « vide » : dire pourquoi il n'y a rien, et proposer le geste qui permet d'en sortir.
export function EtatVide({
  titre,
  texte,
  action,
  autreAction,
}: {
  titre: string;
  texte?: string;
  action?: Action;
  autreAction?: Action;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-8 text-center">
      <p className="font-medium">{titre}</p>
      {texte && <p className="max-w-md text-sm text-muted-foreground">{texte}</p>}
      {(action || autreAction) && (
        <div className="flex flex-wrap justify-center gap-2">
          {action && (
            <Link href={action.href} className={buttonVariants({ size: "sm" })}>
              {action.libelle}
            </Link>
          )}
          {autreAction && (
            <Link href={autreAction.href} className={buttonVariants({ variant: "outline", size: "sm" })}>
              {autreAction.libelle}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
