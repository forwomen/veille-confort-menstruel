import { Badge } from "@/components/ui/badge";
import { STATUTS, type Statut } from "@/lib/libelles";

const VARIANTE: Record<Statut, "default" | "secondary" | "outline" | "destructive"> = {
  repere: "outline",
  qualifie: "secondary",
  publie: "default",
  retire: "destructive",
};

export function BadgeStatut({ statut }: { statut: Statut }) {
  return <Badge variant={VARIANTE[statut]}>{STATUTS[statut]}</Badge>;
}
