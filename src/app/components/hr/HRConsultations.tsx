import { useState, useEffect } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { api } from '@/app/services/api';

export function HRConsultations() {
  const [company, setCompany] = useState<any>(null);
  const [stats, setStats] = useState<{
    totalConsultations: number;
    consultationsThisMonth: number;
    completedConsultations: number;
    upcomingConsultations: number;
  } | null>(null);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [consultSearch, setConsultSearch] = useState('');
  const [consultStartDate, setConsultStartDate] = useState('');
  const [consultPage, setConsultPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      api.getCompany().catch(() => null),
      api.getHRStats().catch(() => null),
      api.getHRConsultations().catch(() => []),
    ])
      .then(([c, s, cons]) => {
        setCompany(c);
        setStats(s);
        setConsultations(Array.isArray(cons) ? cons : []);
      })
      .catch(() => setError('Impossible de charger les consultations.'))
      .finally(() => setLoading(false));
  }, []);

  const normalizedConsultSearch = consultSearch.trim().toLowerCase();
  const filteredConsultations = consultations.filter((c) => {
    if (consultStartDate) {
      if (!c.scheduledAt) return false;
      const d = new Date(c.scheduledAt);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const isoDate = `${year}-${month}-${day}`;
      if (isoDate !== consultStartDate) return false;
    }
    if (!normalizedConsultSearch) return true;
    const employeeName = (c.employee || '').toLowerCase();
    const practitionerName = (c.practitioner || '').toLowerCase();
    const email = (c.employeeEmail || '').toLowerCase();
    return (
      employeeName.includes(normalizedConsultSearch) ||
      practitionerName.includes(normalizedConsultSearch) ||
      email.includes(normalizedConsultSearch)
    );
  });

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filteredConsultations.length / pageSize));
  const currentPage = Math.min(consultPage, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedConsultations = filteredConsultations.slice(
    startIndex,
    startIndex + pageSize,
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-32 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-2">Suivi Consultations</h1>
        <p className="text-muted-foreground">
          {company?.name ? `Consultations HuntZen pour ${company.name}` : 'Liste des consultations par employé et praticien'}
        </p>
      </div>

      {error && (
        <Card className="p-4 text-sm text-destructive bg-destructive/10 border border-destructive/30">
          {error}
        </Card>
      )}

      {stats && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Synthèse des consultations</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Consultations totales</p>
              <p className="text-2xl font-bold">{stats.totalConsultations ?? 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ce mois</p>
              <p className="text-2xl font-bold">{stats.consultationsThisMonth ?? 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Réalisées</p>
              <p className="text-2xl font-bold">{stats.completedConsultations ?? 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">À venir</p>
              <p className="text-2xl font-bold">{stats.upcomingConsultations ?? 0}</p>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <div className="flex flex-col gap-3 mb-4">
          <div>
            <h2 className="text-xl font-semibold">Liste des consultations</h2>
            <p className="text-sm text-muted-foreground">
              Filtrez par période et par nom d&apos;employé ou de praticien.
            </p>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div className="w-full lg:max-w-md">
              <Label htmlFor="consult-search" className="text-xs text-muted-foreground">
                Nom / email
              </Label>
              <Input
                id="consult-search"
                placeholder="Rechercher un employé ou un praticien..."
                value={consultSearch}
                onChange={(e) => {
                  setConsultSearch(e.target.value);
                  setConsultPage(1);
                }}
                className="mt-1"
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-end gap-3">
              <div className="flex flex-col">
                <Label htmlFor="consult-start" className="text-xs text-muted-foreground">
                  Du
                </Label>
                <Input
                  id="consult-start"
                  type="date"
                  value={consultStartDate}
                  onChange={(e) => {
                    setConsultStartDate(e.target.value);
                    setConsultPage(1);
                  }}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </div>
        {filteredConsultations.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucune consultation trouvée pour cette entreprise.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 font-medium">Date</th>
                  <th className="text-left py-2 px-3 font-medium">Employé</th>
                  <th className="text-left py-2 px-3 font-medium">Praticien</th>
                  <th className="text-left py-2 px-3 font-medium">Statut</th>
                  <th className="text-left py-2 px-3 font-medium">Format</th>
                </tr>
              </thead>
              <tbody>
                {paginatedConsultations.map((c) => (
                  <tr key={c.id} className="border-b border-border">
                    <td className="py-2 px-3">
                      {c.scheduledAt
                        ? new Date(c.scheduledAt).toLocaleString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '—'}
                    </td>
                    <td className="py-2 px-3">
                      {c.employee ?? '—'}
                      {c.employeeEmail ? (
                        <span className="block text-xs text-muted-foreground">{c.employeeEmail}</span>
                      ) : null}
                    </td>
                    <td className="py-2 px-3">{c.practitioner ?? '—'}</td>
                    <td className="py-2 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          c.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-700'
                            : c.status === 'CANCELLED'
                            ? 'bg-red-100 text-red-700'
                            : c.status === 'CONFIRMED'
                            ? 'bg-blue-100 text-blue-700'
                            : c.status === 'SCHEDULED'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-2 px-3">{c.format}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
              <span>
                Affichage {filteredConsultations.length === 0 ? 0 : startIndex + 1}–
                {Math.min(startIndex + pageSize, filteredConsultations.length)} sur{' '}
                {filteredConsultations.length} consultations
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setConsultPage((p) => Math.max(1, p - 1))}
                >
                  Précédent
                </Button>
                <span>Page {currentPage} / {totalPages}</span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setConsultPage((p) => Math.min(totalPages, p + 1))}
                >
                  Suivant
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
