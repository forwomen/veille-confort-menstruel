import { Suspense } from "react";
import { SqueletteFormulaire, SqueletteListe } from "@/components/chargement";
import { EtatVide } from "@/components/etat-vide";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { exigerRole } from "@/lib/autorisation";
import { listerComptes, listerInvitations } from "@/lib/comptes";
import type { EtatJeton } from "@/lib/jetons";
import { lireEtatSimule, simuler } from "@/lib/simulation";
import { annulerInvitation, creerLienReinitialisation } from "./actions";
import { BoutonReinitialisation } from "./bouton-reinitialisation";
import { FormulaireInvitation } from "./formulaire-invitation";

const date = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeZone: "Europe/Paris" });

const ETATS: Record<EtatJeton, { libelle: string; variante: "default" | "secondary" | "outline" | "destructive" }> = {
  valide: { libelle: "En attente", variante: "default" },
  utilise: { libelle: "Acceptée", variante: "secondary" },
  expire: { libelle: "Expirée", variante: "outline" },
  annule: { libelle: "Annulée", variante: "destructive" },
};

export default function PageComptes({ searchParams }: PageProps<"/comptes">) {
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Comptes</h1>
      <Card>
        <CardHeader>
          <CardTitle>Inviter une personne</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<SqueletteFormulaire texte="Chargement…" champs={3} />}>
            <Invitation />
          </Suspense>
        </CardContent>
      </Card>
      <Suspense fallback={<SqueletteListe texte="Chargement des comptes…" lignes={3} />}>
        <Listes searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Invitation() {
  await exigerRole("admin", "page_comptes");
  return <FormulaireInvitation />;
}

async function Listes({ searchParams }: Pick<PageProps<"/comptes">, "searchParams">) {
  await exigerRole("admin", "page_comptes");
  const simulation = lireEtatSimule((await searchParams).etat);
  await simuler(simulation);
  const [comptes, lues] = await Promise.all([listerComptes(), listerInvitations()]);
  // La liste des comptes n'est jamais vide (l'admin qui regarde en fait partie) ; celle des invitations peut l'être.
  const invitations = simulation === "vide" ? [] : lues;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Comptes ({comptes.length})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Adresse</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Créé le</TableHead>
                <TableHead>Mot de passe oublié</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comptes.map((compte) => (
                <TableRow key={compte.id}>
                  <TableCell className="font-medium">{compte.nom}</TableCell>
                  <TableCell>{compte.email}</TableCell>
                  <TableCell>
                    <Badge variant={compte.role === "admin" ? "default" : "secondary"}>
                      {compte.role === "admin" ? "Admin" : "Lecteur"}
                    </Badge>
                  </TableCell>
                  <TableCell>{date.format(compte.creeLe)}</TableCell>
                  <TableCell>
                    <BoutonReinitialisation action={creerLienReinitialisation.bind(null, compte.id)} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invitations</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {invitations.length === 0 ? (
            <EtatVide
              titre="Aucune invitation pour l'instant."
              texte="Invitez une personne avec le formulaire ci-dessus : son invitation apparaîtra ici, avec son état."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Adresse</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>État</TableHead>
                  <TableHead>Expire le</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell className="font-medium">{invitation.nom}</TableCell>
                    <TableCell>{invitation.email}</TableCell>
                    <TableCell>{invitation.role === "admin" ? "Admin" : "Lecteur"}</TableCell>
                    <TableCell>
                      <Badge variant={ETATS[invitation.etat].variante}>{ETATS[invitation.etat].libelle}</Badge>
                    </TableCell>
                    <TableCell>{date.format(invitation.expireLe)}</TableCell>
                    <TableCell>
                      {invitation.etat === "valide" && (
                        <form action={annulerInvitation.bind(null, invitation.id)}>
                          <Button type="submit" variant="ghost" size="sm">
                            Annuler
                          </Button>
                        </form>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
