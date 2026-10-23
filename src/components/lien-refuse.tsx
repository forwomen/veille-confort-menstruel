import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// État « erreur » des pages ouvertes par un lien : expiré, déjà utilisé, annulé ou mal copié.
export function LienRefuse({ message }: { message: string }) {
  return (
    <div className="mx-auto w-full max-w-sm pt-8">
      <Card>
        <CardHeader>
          <CardTitle>Lien inutilisable</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <Link href="/connexion" className="underline underline-offset-4">
            Aller à la connexion
          </Link>
          <Link href="/mot-de-passe-oublie" className="underline underline-offset-4">
            Demander un nouveau lien de mot de passe
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
