import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormulaireConnexion } from "./formulaire-connexion";

export default function Connexion() {
  return (
    <div className="mx-auto w-full max-w-sm pt-8">
      <Card>
        <CardHeader>
          <CardTitle>Connexion</CardTitle>
          <CardDescription>
            Veille marché des produits alimentaires pour le confort menstruel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormulaireConnexion />
        </CardContent>
      </Card>
    </div>
  );
}
