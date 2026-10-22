import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const services = [
  { nom: "Next.js sur Vercel", etat: "en ligne" },
  { nom: "Interface shadcn/ui", etat: "en ligne" },
  { nom: "Postgres (Neon)", etat: "à brancher" },
  { nom: "Authentification (Auth.js)", etat: "à brancher" },
  { nom: "Courriels (Resend)", etat: "à brancher" },
  { nom: "Fichiers (Vercel Blob)", etat: "à brancher" },
];

const themes = ["SPM", "Endométriose", "Post-partum", "Ménopause"];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">
          Veille confort menstruel
        </h1>
        <p className="text-muted-foreground">
          Outil de veille marché sur les produits alimentaires pour le confort
          menstruel : produits existants, composition, pays d&apos;origine, et
          ingrédients étudiés dans la littérature scientifique, avec leurs
          sources.
        </p>
        <div className="flex flex-wrap gap-2">
          {themes.map((theme) => (
            <Badge key={theme} variant="secondary">
              {theme}
            </Badge>
          ))}
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>État du squelette</CardTitle>
          <CardDescription>
            Les services tiers seront branchés à l&apos;étape suivante.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-2">
            {services.map((service) => (
              <li
                key={service.nom}
                className="flex items-center justify-between gap-4"
              >
                <span>{service.nom}</span>
                <Badge
                  variant={service.etat === "en ligne" ? "default" : "outline"}
                >
                  {service.etat}
                </Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </main>
  );
}
