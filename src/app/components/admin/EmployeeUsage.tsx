import { useState, useEffect } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/app/components/ui/dialog';
import { Users } from 'lucide-react';
import { api } from '@/app/services/api';

export function EmployeeUsage() {
  const [company, setCompany] = useState<any>(null);
  const [stats, setStats] = useState<{
    totalEmployees: number;
    activeUsers: number;
    totalConsultations: number;
    consultationsThisMonth: number;
    completedConsultations: number;
    upcomingConsultations: number;
    departments: string[];
    employeesByDepartment: Record<string, number>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [updatingEmployeeId, setUpdatingEmployeeId] = useState<string | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    department: '',
    position: '',
    phoneNumber: '',
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [employeeDeptFilter, setEmployeeDeptFilter] = useState<string>('all');
  const [consultSearch, setConsultSearch] = useState('');
  const [consultStartDate, setConsultStartDate] = useState('');
  const [consultEndDate, setConsultEndDate] = useState('');
  const [consultPage, setConsultPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      api.getCompany().catch(() => null),
      api.getHRStats().catch(() => null),
      api.getHREmployees().catch(() => []),
      api.getHRConsultations().catch(() => []),
    ])
      .then(([c, s, emps, cons]) => {
        setCompany(c);
        setStats(s);
        setEmployees(Array.isArray(emps) ? emps : []);
        setConsultations(Array.isArray(cons) ? cons : []);
      })
      .catch(() => setError('Impossible de charger les données de suivi des employés.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-32 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  const departmentOptions = Array.from(
    new Set(employees.map((e) => e.department).filter((d): d is string => !!d)),
  );
  const positionOptions = Array.from(
    new Set(employees.map((e) => e.position).filter((p): p is string => !!p)),
  );

  const normalizedEmpSearch = employeeSearch.trim().toLowerCase();
  const filteredEmployees = employees.filter((e) => {
    if (employeeDeptFilter !== 'all' && e.department !== employeeDeptFilter) return false;
    if (!normalizedEmpSearch) return true;
    const name = `${e.firstName || ''} ${e.lastName || ''}`.toLowerCase();
    const email = (e.email || '').toLowerCase();
    return name.includes(normalizedEmpSearch) || email.includes(normalizedEmpSearch);
  });

  const normalizedConsultSearch = consultSearch.trim().toLowerCase();
  const filteredConsultations = consultations.filter((c) => {
    // Date filter: if a start date is selected, keep only consultations on that calendar day
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

  const handleToggleEmployeeActive = async (empId: string, currentActive: boolean) => {
    setUpdatingEmployeeId(empId);
    try {
      if (currentActive) {
        await api.deactivateEmployee(empId);
      } else {
        await api.activateEmployee(empId);
      }
      const refreshed = await api.getHREmployees().catch(() => employees);
      if (Array.isArray(refreshed)) {
        setEmployees(refreshed);
      }
    } finally {
      setUpdatingEmployeeId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-2">Suivi Employés</h1>
        <p className="text-muted-foreground">
          {company?.name ? `Usage HuntZen pour ${company.name}` : 'Usage par département et employé'}
        </p>
      </div>

      {error && (
        <Card className="p-4 text-sm text-destructive bg-destructive/10 border border-destructive/30">
          {error}
        </Card>
      )}

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Synthèse des employés</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Employés inscrits</p>
              <p className="text-2xl font-bold">{stats?.totalEmployees ?? 0}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#5CB85C] flex items-center justify-center text-white">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Utilisateurs actifs (30 jours)</p>
              <p className="text-2xl font-bold">{stats?.activeUsers ?? 0}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-white">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Consultations totales</p>
              <p className="text-2xl font-bold">{stats?.totalConsultations ?? 0}</p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Répartition par département</h2>
        {stats && stats.departments.length > 0 ? (
          <div className="space-y-2">
            {stats.departments.map((dept) => (
              <div key={dept} className="flex items-center justify-between">
                <span className="text-sm font-medium">{dept}</span>
                <span className="text-sm text-muted-foreground">
                  {stats.employeesByDepartment[dept] ?? 0} employé
                  {stats.employeesByDepartment[dept] !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Aucune donnée de département disponible pour le moment.
          </p>
        )}
      </Card>

      <Card className="p-6">
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Liste des employés</h2>
          </div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="w-full md:max-w-md">
              <Label
                htmlFor="emp-search"
                className="text-xs text-muted-foreground"
              >
                Rechercher par nom ou email
              </Label>
              <Input
                id="emp-search"
                placeholder="Rechercher un employé..."
                value={employeeSearch}
                onChange={(e) => setEmployeeSearch(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex flex-col md:flex-row md:items-end gap-2 md:gap-3">
              <Label
                htmlFor="emp-dept-filter"
                className="text-xs text-muted-foreground"
              >
                Département
              </Label>
              <select
                id="emp-dept-filter"
                className="border border-input bg-background rounded-md px-2 py-1 text-sm md:min-w-[160px]"
                value={employeeDeptFilter}
                onChange={(e) => setEmployeeDeptFilter(e.target.value)}
              >
                <option value="all">Tous</option>
                {departmentOptions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {filteredEmployees.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun employé trouvé pour cette entreprise.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 font-medium">Nom</th>
                  <th className="text-left py-2 px-3 font-medium">Email</th>
                  <th className="text-left py-2 px-3 font-medium">Département</th>
                  <th className="text-left py-2 px-3 font-medium">Poste</th>
                  <th className="text-left py-2 px-3 font-medium">Statut</th>
                  <th className="text-left py-2 px-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((e) => (
                  <tr key={e.id} className="border-b border-border">
                    <td className="py-2 px-3">
                      {(e.firstName || e.lastName)
                        ? `${e.firstName ?? ''} ${e.lastName ?? ''}`.trim()
                        : '—'}
                    </td>
                    <td className="py-2 px-3">{e.email ?? '—'}</td>
                    <td className="py-2 px-3">{e.department ?? '—'}</td>
                    <td className="py-2 px-3">{e.position ?? '—'}</td>
                    <td className="py-2 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          e.isActive
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {e.isActive ? 'Actif' : 'Désactivé'}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-3">
                        <button
                          className="text-xs font-medium text-primary hover:underline disabled:opacity-50"
                          disabled={updatingEmployeeId === e.id}
                          onClick={() => handleToggleEmployeeActive(e.id, e.isActive)}
                        >
                          {e.isActive ? 'Désactiver' : 'Réactiver'}
                        </button>
                        <button
                          className="text-xs font-medium text-muted-foreground hover:underline"
                          onClick={() => {
                            setEditingEmployee(e);
                            setEditForm({
                              firstName: e.firstName ?? '',
                              lastName: e.lastName ?? '',
                              department: e.department ?? '',
                              position: e.position ?? '',
                              phoneNumber: e.phoneNumber ?? '',
                            });
                          }}
                        >
                          Modifier
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Dialog
        open={!!editingEmployee}
        onOpenChange={(open) => {
          if (!open && !savingEdit) {
            setEditingEmployee(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier l&apos;employé</DialogTitle>
          </DialogHeader>
          {editingEmployee && (
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!editingEmployee) return;
                setSavingEdit(true);
                try {
                  await api.updateHREmployee(editingEmployee.id, {
                    firstName: editForm.firstName || undefined,
                    lastName: editForm.lastName || undefined,
                    department: editForm.department || undefined,
                    position: editForm.position || undefined,
                    phoneNumber: editForm.phoneNumber || undefined,
                  });
                  const refreshed = await api.getHREmployees().catch(() => employees);
                  if (Array.isArray(refreshed)) {
                    setEmployees(refreshed);
                  }
                  setEditingEmployee(null);
                } finally {
                  setSavingEdit(false);
                }
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-firstName">Prénom</Label>
                  <Input
                    id="edit-firstName"
                    value={editForm.firstName}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, firstName: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-lastName">Nom</Label>
                  <Input
                    id="edit-lastName"
                    value={editForm.lastName}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, lastName: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-department">Département</Label>
                  <Input
                    id="edit-department"
                    value={editForm.department}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, department: e.target.value }))
                    }
                  />
                  {departmentOptions.length > 0 && (
                    <div className="mt-1 space-y-1">
                      <p className="text-xs text-muted-foreground">Suggestions :</p>
                      <div className="flex flex-wrap gap-1">
                        {departmentOptions
                          .filter((d) =>
                            d.toLowerCase().includes(editForm.department.toLowerCase()),
                          )
                          .slice(0, 6)
                          .map((d) => (
                            <button
                              type="button"
                              key={d}
                              className="px-2 py-0.5 rounded-full border text-xs text-muted-foreground hover:bg-muted"
                              onClick={() =>
                                setEditForm((f) => ({ ...f, department: d }))
                              }
                            >
                              {d}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                  {editForm.department &&
                    !departmentOptions
                      .map((d) => d.toLowerCase())
                      .includes(editForm.department.toLowerCase()) && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-1 h-7 text-xs"
                        onClick={() =>
                          setEditForm((f) => ({ ...f, department: f.department }))
                        }
                      >
                        Ajouter « {editForm.department} » comme nouveau département
                      </Button>
                    )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-position">Poste</Label>
                  <Input
                    id="edit-position"
                    value={editForm.position}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, position: e.target.value }))
                    }
                  />
                  {positionOptions.length > 0 && (
                    <div className="mt-1 space-y-1">
                      <p className="text-xs text-muted-foreground">Suggestions :</p>
                      <div className="flex flex-wrap gap-1">
                        {positionOptions
                          .filter((p) =>
                            p.toLowerCase().includes(editForm.position.toLowerCase()),
                          )
                          .slice(0, 6)
                          .map((p) => (
                            <button
                              type="button"
                              key={p}
                              className="px-2 py-0.5 rounded-full border text-xs text-muted-foreground hover:bg-muted"
                              onClick={() =>
                                setEditForm((f) => ({ ...f, position: p }))
                              }
                            >
                              {p}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                  {editForm.position &&
                    !positionOptions
                      .map((p) => p.toLowerCase())
                      .includes(editForm.position.toLowerCase()) && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-1 h-7 text-xs"
                        onClick={() =>
                          setEditForm((f) => ({ ...f, position: f.position }))
                        }
                      >
                        Ajouter « {editForm.position} » comme nouveau poste
                      </Button>
                    )}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="edit-phone">Téléphone</Label>
                  <Input
                    id="edit-phone"
                    value={editForm.phoneNumber}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, phoneNumber: e.target.value }))
                    }
                  />
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (!savingEdit) setEditingEmployee(null);
                  }}
                  disabled={savingEdit}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={savingEdit}>
                  {savingEdit ? 'Enregistrement…' : 'Enregistrer'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Card className="p-6">
        <div className="flex flex-col gap-3 mb-4">
          <div>
            <h2 className="text-xl font-semibold">Consultations récentes</h2>
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
