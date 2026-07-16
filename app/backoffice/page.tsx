import { Header } from "@/components/backoffice/Header";
import { StatCard } from "@/components/backoffice/StatCard";
import { Card } from "@/components/backoffice/Card";
import { StatusBadge } from "@/components/backoffice/StatusBadge";
import { Table, TableHead, Th, Tr, Td } from "@/components/backoffice/Table";

// Données statiques pour valider la DA (étape 2). Câblage réel aux tables
// admin_* et Estime (lecture seule) prévu à l'étape 3.
const FACTURES = [
  { client: "Studio Lumen", montant: "1 200 €", statut: "payee" as const },
  { client: "Atelier Rive", montant: "480 €", statut: "envoyee" as const },
  { client: "Kaïros SCI", montant: "2 350 €", statut: "en_retard" as const },
];

const ABONNES = [
  { nom: "J. Meyer", metier: "Peintre", ville: "Lyon" },
  { nom: "S. Roubaud", metier: "Plombier", ville: "Nantes" },
  { nom: "T. Delacroix", metier: "Électricien", ville: "Toulouse" },
];

const STATUT_LABEL = {
  payee: { tone: "success" as const, label: "Payée" },
  envoyee: { tone: "warning" as const, label: "Envoyée" },
  en_retard: { tone: "error" as const, label: "En retard" },
};

export default function BackofficePage() {
  return (
    <>
      <Header title="Vue d'ensemble" subtitle="ALCALSPARK & Estime" />

      <div className="p-4 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="CA du mois" value="3 830 €" sublabel="Saisi manuellement" />
          <StatCard label="MRR Estime" value="—" sublabel="Câblage étape 3" accent />
          <StatCard label="En attente de paiement" value="2 830 €" sublabel="1 facture" />
          <StatCard label="Churn Estime" value="—" sublabel="Câblage étape 3" />
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <Card title="Dernières factures">
            <Table>
              <TableHead>
                <Th>Client</Th>
                <Th align="right">Montant</Th>
                <Th align="right">Statut</Th>
              </TableHead>
              <tbody>
                {FACTURES.map((f) => (
                  <Tr key={f.client}>
                    <Td>{f.client}</Td>
                    <Td align="right">{f.montant}</Td>
                    <Td align="right">
                      <StatusBadge tone={STATUT_LABEL[f.statut].tone} label={STATUT_LABEL[f.statut].label} />
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </Card>

          <Card title="Nouveaux abonnés Estime">
            <ul className="divide-y divide-[#232326]">
              {ABONNES.map((a) => (
                <li key={a.nom} className="px-5 py-3 flex items-center justify-between">
                  <span className="text-sm text-[#EDEDED]">{a.nom}</span>
                  <span className="text-xs text-[#8B8B8D]">
                    {a.metier} · {a.ville}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
