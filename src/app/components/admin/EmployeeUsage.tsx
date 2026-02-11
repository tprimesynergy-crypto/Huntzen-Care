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
import { Users, KeyRound, UserPlus, Trash2 } from 'lucide-react';
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
  const [passwordEmployee, setPasswordEmployee] = useState<any | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [addForm, setAddForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    department: '',
    position: '',
    phoneNumber: '',
    temporaryPassword: '',
    temporaryPasswordConfirm: '',
  });
  const [savingAdd, setSavingAdd] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [deletingEmployeeId, setDeletingEmployeeId] = useState<string | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<any | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      api.getCompany().catch(() => null),
      api.getHRStats().catch(() => null),
      api.getHREmployees().catch(() => []),
    ])
      .then(([c, s, emps]) => {
        setCompany(c);
        setStats(s);
        setEmployees(Array.isArray(emps) ? emps : []);
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
            <Button onClick={() => setShowAddEmployee(true)} className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Ajouter un employé
            </Button>
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
                        <button
                          className="text-xs font-medium text-muted-foreground hover:underline inline-flex items-center gap-1"
                          onClick={() => {
                            setPasswordEmployee(e);
                            setNewPassword('');
                            setNewPasswordConfirm('');
                            setPasswordError(null);
                          }}
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          Modifier mot de passe
                        </button>
                        <button
                          className="text-xs font-medium text-destructive hover:underline inline-flex items-center gap-1 disabled:opacity-50"
                          disabled={deletingEmployeeId === e.id}
                          onClick={() => setEmployeeToDelete(e)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Supprimer
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
        open={showAddEmployee}
        onOpenChange={(open) => {
          if (!open && !savingAdd) {
            setShowAddEmployee(false);
            setAddError(null);
            setAddForm({
              email: '',
              firstName: '',
              lastName: '',
              department: '',
              position: '',
              phoneNumber: '',
              temporaryPassword: '',
              temporaryPasswordConfirm: '',
            });
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ajouter un employé</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setAddError(null);
              if (addForm.temporaryPassword !== addForm.temporaryPasswordConfirm) {
                setAddError('Les deux mots de passe ne correspondent pas.');
                return;
              }
              if (addForm.temporaryPassword.length < 8) {
                setAddError('Le mot de passe doit contenir au moins 8 caractères.');
                return;
              }
              setSavingAdd(true);
              try {
                await api.createHREmployee({
                  email: addForm.email.trim(),
                  firstName: addForm.firstName.trim() || 'À compléter',
                  lastName: addForm.lastName.trim() || 'À compléter',
                  department: addForm.department.trim() || undefined,
                  position: addForm.position.trim() || undefined,
                  phoneNumber: addForm.phoneNumber.trim() || undefined,
                  temporaryPassword: addForm.temporaryPassword,
                });
                const refreshed = await api.getHREmployees().catch(() => employees);
                if (Array.isArray(refreshed)) setEmployees(refreshed);
                setShowAddEmployee(false);
                setAddForm({
                  email: '',
                  firstName: '',
                  lastName: '',
                  department: '',
                  position: '',
                  phoneNumber: '',
                  temporaryPassword: '',
                  temporaryPasswordConfirm: '',
                });
              } catch (err: unknown) {
                setAddError(err instanceof Error ? err.message : 'Erreur lors de la création.');
              } finally {
                setSavingAdd(false);
              }
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-email">Email *</Label>
                <Input
                  id="add-email"
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="prenom.nom@entreprise.com"
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-1" />
              <div className="space-y-2">
                <Label htmlFor="add-firstName">Prénom *</Label>
                <Input
                  id="add-firstName"
                  value={addForm.firstName}
                  onChange={(e) => setAddForm((f) => ({ ...f, firstName: e.target.value }))}
                  placeholder="Prénom"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-lastName">Nom *</Label>
                <Input
                  id="add-lastName"
                  value={addForm.lastName}
                  onChange={(e) => setAddForm((f) => ({ ...f, lastName: e.target.value }))}
                  placeholder="Nom"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-department">Département</Label>
                <Input
                  id="add-department"
                  value={addForm.department}
                  onChange={(e) => setAddForm((f) => ({ ...f, department: e.target.value }))}
                  placeholder="Département"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-position">Poste</Label>
                <Input
                  id="add-position"
                  value={addForm.position}
                  onChange={(e) => setAddForm((f) => ({ ...f, position: e.target.value }))}
                  placeholder="Poste"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="add-phone">Téléphone</Label>
                <Input
                  id="add-phone"
                  value={addForm.phoneNumber}
                  onChange={(e) => setAddForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                  placeholder="+33 6 00 00 00 00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-password">Mot de passe temporaire *</Label>
                <Input
                  id="add-password"
                  type="password"
                  value={addForm.temporaryPassword}
                  onChange={(e) => setAddForm((f) => ({ ...f, temporaryPassword: e.target.value }))}
                  placeholder="••••••••"
                  minLength={8}
                  required
                />
                <p className="text-xs text-muted-foreground">Minimum 8 caractères. L&apos;employé pourra se connecter immédiatement.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-password-confirm">Confirmer le mot de passe *</Label>
                <Input
                  id="add-password-confirm"
                  type="password"
                  value={addForm.temporaryPasswordConfirm}
                  onChange={(e) => setAddForm((f) => ({ ...f, temporaryPasswordConfirm: e.target.value }))}
                  placeholder="••••••••"
                  minLength={8}
                  required
                />
              </div>
            </div>
            {addError && (
              <p className="text-sm text-destructive">{addError}</p>
            )}
            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (!savingAdd) setShowAddEmployee(false);
                }}
                disabled={savingAdd}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={savingAdd}>
                {savingAdd ? 'Création…' : 'Créer l\'employé'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!employeeToDelete}
        onOpenChange={(open) => {
          if (!open && !deletingEmployeeId) setEmployeeToDelete(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Supprimer l&apos;employé</DialogTitle>
          </DialogHeader>
          {employeeToDelete && (
            <>
              <p className="text-sm text-muted-foreground">
                Êtes-vous sûr de vouloir supprimer{' '}
                <strong>
                  {[employeeToDelete.firstName, employeeToDelete.lastName].filter(Boolean).join(' ')}
                </strong>
                {employeeToDelete.email && (
                  <span> ({employeeToDelete.email})</span>
                )}
                ? Cette action est irréversible.
              </p>
              <DialogFooter className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (!deletingEmployeeId) setEmployeeToDelete(null);
                  }}
                  disabled={deletingEmployeeId}
                >
                  Annuler
                </Button>
                <Button
                  variant="destructive"
                  disabled={deletingEmployeeId}
                  onClick={async () => {
                    if (!employeeToDelete) return;
                    setDeletingEmployeeId(employeeToDelete.id);
                    try {
                      await api.deleteHREmployee(employeeToDelete.id);
                      const refreshed = await api.getHREmployees().catch(() => employees);
                      if (Array.isArray(refreshed)) setEmployees(refreshed);
                      setEmployeeToDelete(null);
                    } catch (err) {
                      // Error could be shown via a toast - for now we just close
                      setEmployeeToDelete(null);
                    } finally {
                      setDeletingEmployeeId(null);
                    }
                  }}
                >
                  {deletingEmployeeId ? 'Suppression…' : 'Supprimer'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

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

      <Dialog
        open={!!passwordEmployee}
        onOpenChange={(open) => {
          if (!open && !savingPassword) {
            setPasswordEmployee(null);
            setPasswordError(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier le mot de passe</DialogTitle>
          </DialogHeader>
          {passwordEmployee && (
            <>
              <p className="text-sm text-muted-foreground">
                Définir un nouveau mot de passe pour{' '}
                <span className="font-medium text-foreground">
                  {[passwordEmployee.firstName, passwordEmployee.lastName].filter(Boolean).join(' ')}
                </span>
                {passwordEmployee.email && (
                  <span className="text-muted-foreground"> ({passwordEmployee.email})</span>
                )}
                . L&apos;employé pourra se connecter avec ce mot de passe (en cas d&apos;oubli).
              </p>
              <form
                className="space-y-4 mt-2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setPasswordError(null);
                  if (newPassword.length < 8) {
                    setPasswordError('Le mot de passe doit contenir au moins 8 caractères.');
                    return;
                  }
                  if (newPassword !== newPasswordConfirm) {
                    setPasswordError('Les deux mots de passe ne correspondent pas.');
                    return;
                  }
                  setSavingPassword(true);
                  try {
                    await api.setHREmployeePassword(passwordEmployee.id, newPassword);
                    setPasswordEmployee(null);
                    setNewPassword('');
                    setNewPasswordConfirm('');
                  } catch (err: unknown) {
                    setPasswordError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour.');
                  } finally {
                    setSavingPassword(false);
                  }
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nouveau mot de passe</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    minLength={8}
                    autoComplete="new-password"
                    disabled={savingPassword}
                  />
                  <p className="text-xs text-muted-foreground">Minimum 8 caractères</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password-confirm">Confirmer le mot de passe</Label>
                  <Input
                    id="new-password-confirm"
                    type="password"
                    value={newPasswordConfirm}
                    onChange={(e) => setNewPasswordConfirm(e.target.value)}
                    placeholder="••••••••"
                    disabled={savingPassword}
                  />
                </div>
                {passwordError && (
                  <p className="text-sm text-destructive">{passwordError}</p>
                )}
                <DialogFooter className="mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (!savingPassword) setPasswordEmployee(null);
                    }}
                    disabled={savingPassword}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={savingPassword}>
                    {savingPassword ? 'Enregistrement…' : 'Enregistrer le mot de passe'}
                  </Button>
                </DialogFooter>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
