import { useEffect, useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { api } from '@/app/services/api';

const ACTION_LABELS: Record<string, string> = {
  LOGIN: 'Connexion',
  REGISTER: 'Inscription',
  ADMIN_USER_CREATE: 'Création compte admin',
  ADMIN_USER_UPDATE: 'Modification compte admin',
  ADMIN_USER_DELETE: 'Suppression compte admin',
  COMPANY_CREATE: 'Création entreprise',
  COMPANY_UPDATE: 'Modification entreprise',
  COMPANY_DELETE: 'Suppression entreprise',
  EMPLOYEE_CREATE: 'Création employé',
  EMPLOYEE_UPDATE: 'Modification employé',
  EMPLOYEE_DELETE: 'Suppression employé',
  EMPLOYEE_ACTIVATE: 'Activation employé',
  EMPLOYEE_DEACTIVATE: 'Désactivation employé',
  EMPLOYEE_PROFILE_UPDATE: 'Modification profil employé',
  PRACTITIONER_CREATE: 'Création praticien',
  PRACTITIONER_UPDATE: 'Modification praticien',
  PRACTITIONER_DELETE: 'Suppression praticien',
  PRACTITIONER_ACTIVATE: 'Activation praticien',
  PRACTITIONER_DEACTIVATE: 'Désactivation praticien',
  PRACTITIONER_PROFILE_UPDATE: 'Modification profil praticien',
  AVAILABILITY_CREATE: 'Ajout créneau dispo',
  AVAILABILITY_UPDATE: 'Modification créneau dispo',
  AVAILABILITY_DELETE: 'Suppression créneau dispo',
  CONSULTATION_CREATE: 'Demande de consultation',
  CONSULTATION_CANCEL: 'Annulation consultation',
  CONSULTATION_CONFIRM: 'Confirmation consultation',
  CONSULTATION_COMPLETE: 'Consultation terminée',
  CONSULTATION_RESCHEDULE: 'Reprogrammation consultation',
};

function formatAction(action: string): string {
  return ACTION_LABELS[action] ?? action;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'medium',
  });
}

export function AdminActivityLog() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(30);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const load = (pageOverride?: number) => {
    const p = pageOverride ?? page;
    setLoading(true);
    setError(null);
    api
      .getAdminActivityLogs({
        from: from || undefined,
        to: to || undefined,
        action: actionFilter || undefined,
        page: p,
        limit,
      })
      .then((res) => {
        setItems(res?.items ?? []);
        setTotal(res?.total ?? 0);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Impossible de charger le journal d\'activité.');
        setItems([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [page]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Journal d&apos;activité</h1>
        <p className="text-sm text-muted-foreground">
          Consultez qui a fait quoi dans l&apos;application (connexions, créations, modifications, suppressions).
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card className="p-4 space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label htmlFor="activity-from" className="text-xs">Du</Label>
            <Input
              id="activity-from"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-40"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="activity-to" className="text-xs">Au</Label>
            <Input
              id="activity-to"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-40"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="activity-action" className="text-xs">Action</Label>
            <select
              id="activity-action"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-48 border border-input bg-background rounded-md px-2 py-1.5 text-sm"
            >
              <option value="">Toutes</option>
              {Object.entries(ACTION_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <Button
            onClick={() => {
              setPage(1);
              load(1);
            }}
            disabled={loading}
          >
            {loading ? 'Chargement…' : 'Filtrer'}
          </Button>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Date</th>
                  <th className="px-3 py-2 text-left font-medium">Qui</th>
                  <th className="px-3 py-2 text-left font-medium">Rôle</th>
                  <th className="px-3 py-2 text-left font-medium">Action</th>
                  <th className="px-3 py-2 text-left font-medium">Détails</th>
                </tr>
              </thead>
              <tbody>
                {loading && items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">
                      Chargement…
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">
                      Aucune activité enregistrée.
                    </td>
                  </tr>
                ) : (
                  items.map((row) => (
                    <tr key={row.id} className="border-t">
                      <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                        {formatDate(row.createdAt)}
                      </td>
                      <td className="px-3 py-2 font-medium">{row.actorEmail}</td>
                      <td className="px-3 py-2 text-muted-foreground">{row.actorRole}</td>
                      <td className="px-3 py-2">{formatAction(row.action)}</td>
                      <td className="px-3 py-2 text-muted-foreground max-w-xs truncate" title={row.details ?? undefined}>
                        {row.details ?? row.entityId ?? '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {total > limit && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-muted-foreground">
              {total} résultat{total !== 1 ? 's' : ''} au total
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page * limit >= total || loading}
                onClick={() => setPage((p) => p + 1)}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
