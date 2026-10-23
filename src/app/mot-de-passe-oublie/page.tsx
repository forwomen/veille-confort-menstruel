import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormulaireDemande } from "./formulaire-demande";

export default function MotDePasseOublie() {
  return (
    <div className="mx-auto w-full max-w-sm pt-8">
      <Card>
        <CardHeader>
          <CardTitle>Mot de passe oublié</CardTitle>
          <CardDescription>
            Vous recevrez un lien pour en choisir un nouveau. S&apos;il n&apos;arrive pas, demandez à un
            administrateur de vous en créer un.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <FormulaireDemande />
          <Link href="/connexion" className="text-sm underline underline-offset-4">
            Retour à la connexion
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
