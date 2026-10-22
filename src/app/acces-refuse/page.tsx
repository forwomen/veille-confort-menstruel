import Link from "next/link";

export default function AccesRefuse() {
  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-2xl font-semibold">Accès refusé</h1>
      <p className="text-muted-foreground">
        Votre rôle ne permet pas cette action. La tentative a été enregistrée dans les
        journaux.
      </p>
      <Link href="/produits" className="text-sm underline underline-offset-4">
        Retour à la liste des produits
      </Link>
    </div>
  );
}
