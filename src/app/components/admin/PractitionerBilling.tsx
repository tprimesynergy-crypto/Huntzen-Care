import { useState, useEffect } from 'react';
import { Card } from '@/app/components/ui/card';
import { Users, Calendar } from 'lucide-react';
import { api } from '@/app/services/api';

const SPECIALTY_LABELS: Record<string, string> = {
  PSYCHOLOGUE_CLINICIEN: 'Psychologue clinicien',
  PSYCHOLOGUE_TRAVAIL: 'Psychologue du travail',
  PSYCHIATRE: 'Psychiatre',
  PSYCHOTHERAPEUTE: 'Psychothérapeute',
  NEUROPSYCHOLOGUE: 'Neuropsychologue',
  COACH_MENTAL: 'Coach mental',
  SEXOLOGUE: 'Sexologue',
  PSYCHANALYSTE: 'Psychanalyste',
};

export function PractitionerBilling() {
  const [practitioners, setPractitioners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPractitioners()
      .then((list) => setPractitioners(Array.isArray(list) ? list : []))
      .catch(() => setPractitioners([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-2">Suivi Praticiens</h1>
        <p className="text-muted-foreground">
          Liste des praticiens et activité (données depuis l&apos;API).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center text-white">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Praticiens</p>
              <p className="text-2xl font-bold">{loading ? '…' : practitioners.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center text-white">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Consultations / heures</p>
              <p className="text-2xl font-bold">—</p>
              <p className="text-xs text-muted-foreground">Endpoint dédié à venir</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Praticiens</h2>
        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Chargement…</div>
        ) : practitioners.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">Aucun praticien.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium">Nom</th>
                  <th className="text-left py-3 px-4 font-medium">Spécialité</th>
                  <th className="text-left py-3 px-4 font-medium">Expérience</th>
                </tr>
              </thead>
              <tbody>
                {practitioners.map((p) => (
                  <tr key={p.id} className="border-b border-border">
                    <td className="py-3 px-4">
                      {p.title} {p.firstName} {p.lastName}
                    </td>
                    <td className="py-3 px-4">{SPECIALTY_LABELS[p.specialty] ?? p.specialty}</td>
                    <td className="py-3 px-4">{p.experience != null ? `${p.experience} ans` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
