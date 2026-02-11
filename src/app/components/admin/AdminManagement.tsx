import { useEffect, useMemo, useState } from 'react';
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
import { Select } from '@/app/components/ui/select';
import { api } from '@/app/services/api';

type AdminUser = {
  id: string;
  email: string;
  role: 'ADMIN_RH' | 'ADMIN_HUNTZEN';
  isActive: boolean;
  companyId: string | null;
  companyName: string | null;
  firstName: string | null;
  lastName: string | null;
  phoneNumber?: string | null;
  position?: string | null;
};

type CompanySummary = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  employeesCount: number;
  adminsCount: number;
};

export function AdminManagement({ initialTab = 'admins' }: { initialTab?: 'admins' | 'companies' }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [companies, setCompanies] = useState<CompanySummary[]>([]);

  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [companyEmployees, setCompanyEmployees] = useState<any[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);

  const [createEmail, setCreateEmail] = useState('');
  const [createRole, setCreateRole] = useState<'ADMIN_RH' | 'ADMIN_HUNTZEN'>('ADMIN_RH');
  const [createCompanyId, setCreateCompanyId] = useState<string | ''>('');
  const [createFirstName, setCreateFirstName] = useState('');
  const [createLastName, setCreateLastName] = useState('');
  const [createPhone, setCreatePhone] = useState('');
  const [createPosition, setCreatePosition] = useState('');
  const [creating, setCreating] = useState(false);

  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<'ADMIN_RH' | 'ADMIN_HUNTZEN'>('ADMIN_RH');
  const [editCompanyId, setEditCompanyId] = useState<string | ''>('');
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [editPhone, setEditPhone] = useState('');
  const [editPosition, setEditPosition] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const [activeTab, setActiveTab] = useState<'admins' | 'companies'>(initialTab);
  const [createCompanyOpen, setCreateCompanyOpen] = useState(false);
  const [createCompanyName, setCreateCompanyName] = useState('');
  const [createCompanySlug, setCreateCompanySlug] = useState('');
  const [createCompanySector, setCreateCompanySector] = useState('');
  const [createCompanyCity, setCreateCompanyCity] = useState('');
  const [creatingCompany, setCreatingCompany] = useState(false);

  const selectedCompany = useMemo(
    () => companies.find((c) => c.id === selectedCompanyId) ?? null,
    [companies, selectedCompanyId],
  );

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      api.getAdminUsers().catch((err) => {
        console.error('Failed to load admin users', err);
        throw err;
      }),
      api.getAdminCompanies().catch((err) => {
        console.error('Failed to load companies', err);
        throw err;
      }),
    ])
      .then(([adminsData, companiesData]) => {
        setAdmins(adminsData || []);
        setCompanies(companiesData || []);
        if (!selectedCompanyId && companiesData && companiesData.length > 0) {
          setSelectedCompanyId(companiesData[0].id);
        }
      })
      .catch((err) => {
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger les données d'administration.",
        );
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedCompanyId) {
      setCompanyEmployees([]);
      return;
    }
    setLoadingEmployees(true);
    api
      .getAdminCompanyEmployees(selectedCompanyId)
      .then((res) => setCompanyEmployees(res || []))
      .catch((err) => {
        console.error('Failed to load employees for company', err);
        setCompanyEmployees([]);
      })
      .finally(() => setLoadingEmployees(false));
  }, [selectedCompanyId]);

  const handleOpenCreate = () => {
    setCreateEmail('');
    setCreateRole('ADMIN_RH');
    setCreateCompanyId(selectedCompanyId ?? '');
    setCreateFirstName('');
    setCreateLastName('');
    setCreatePhone('');
    setCreatePosition('');
    setCreateOpen(true);
  };

  const handleCreate = async () => {
    if (!createEmail) return;
    if (createRole === 'ADMIN_RH' && !createCompanyId) {
      setError("Un compte RH / DRH doit être rattaché à une entreprise.");
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const payload = {
        email: createEmail,
        role: createRole,
        companyId: createCompanyId || null,
        firstName: createFirstName || null,
        lastName: createLastName || null,
        phoneNumber: createPhone || null,
        position: createPosition || null,
      };
      const created = await api.createAdminUser(payload);
      // Recharger la liste des admins
      const updated = await api.getAdminUsers();
      setAdmins(updated || []);
      setCreateOpen(false);
      // Optionnel: afficher le mot de passe temporaire créé. On l'ignore côté UI pour éviter de le logguer.
      console.info('Admin créé, mot de passe temporaire:', created?.temporaryPassword);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de créer le compte administrateur.",
      );
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setEditEmail(admin.email);
    setEditRole(admin.role);
    setEditCompanyId(admin.companyId ?? '');
    setEditFirstName(admin.firstName ?? '');
    setEditLastName(admin.lastName ?? '');
    setEditIsActive(admin.isActive);
    setEditPhone((admin as any)?.phoneNumber ?? '');
    setEditPosition((admin as any)?.position ?? '');
    setEditPassword('');
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingAdmin) return;
    if (editRole === 'ADMIN_RH' && !editCompanyId) {
      setError("Un compte RH / DRH doit être rattaché à une entreprise.");
      return;
    }
    setSavingEdit(true);
    setError(null);
    try {
      await api.updateAdminUser(editingAdmin.id, {
        email: editEmail,
        role: editRole,
        companyId: editCompanyId || null,
        isActive: editIsActive,
        firstName: editFirstName || null,
        lastName: editLastName || null,
        phoneNumber: editPhone || null,
        position: editPosition || null,
      });

      if (editPassword.trim()) {
        await api.updateAdminUserPassword(editingAdmin.id, editPassword.trim());
      }

      const updated = await api.getAdminUsers();
      setAdmins(updated || []);
      setEditOpen(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de mettre à jour le compte administrateur.',
      );
    } finally {
      setSavingEdit(false);
    }
  };

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground">
        Chargement de la vue administrateur HuntZen…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Administration HuntZen</h1>
          <p className="text-sm text-muted-foreground">
            Gérez les comptes RH / DRH et les entreprises rattachées.
          </p>
        </div>
        <Button onClick={handleOpenCreate}>Créer un compte RH / DRH</Button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-1">
        <button
          type="button"
          className={`px-3 py-1.5 text-sm rounded-md border-b-2 ${
            activeTab === 'admins'
              ? 'border-primary text-primary font-medium'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('admins')}
        >
          Admins RH / DRH
        </button>
        <button
          type="button"
          className={`px-3 py-1.5 text-sm rounded-md border-b-2 ${
            activeTab === 'companies'
              ? 'border-primary text-primary font-medium'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('companies')}
        >
          Entreprises
        </button>
      </div>

      {activeTab === 'admins' && (
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Comptes RH / DRH</h2>
            <span className="text-xs text-muted-foreground">
              {admins.length} compte(s)
            </span>
          </div>
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Email</th>
                  <th className="px-3 py-2 text-left font-medium">Rôle</th>
                  <th className="px-3 py-2 text-left font-medium">Entreprise</th>
                  <th className="px-3 py-2 text-left font-medium">Statut</th>
                  <th className="px-3 py-2 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.id} className="border-t">
                    <td className="px-3 py-2">
                      <div className="font-medium">{admin.email}</div>
                      {(admin.firstName || admin.lastName) && (
                        <div className="text-xs text-muted-foreground">
                          {(admin.firstName ?? '') + ' ' + (admin.lastName ?? '')}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {admin.role === 'ADMIN_RH' ? 'ADMIN_RH (RH / DRH)' : 'ADMIN_HUNTZEN'}
                    </td>
                    <td className="px-3 py-2">
                      {admin.companyName ?? (
                        <span className="text-xs text-muted-foreground">Aucune</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          admin.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {admin.isActive ? 'Actif' : 'Désactivé'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(admin)}
                      >
                        Modifier
                      </Button>
                    </td>
                  </tr>
                ))}
                {admins.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-4 text-center text-sm text-muted-foreground"
                    >
                      Aucun compte administrateur pour le moment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground">
            Chaque compte ADMIN_RH est rattaché à une entreprise et peut gérer ses
            propres employés et paramètres d&apos;entreprise.
          </p>
        </Card>
      )}

      {activeTab === 'companies' && (
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Entreprises</h2>
              <p className="text-xs text-muted-foreground">
                Sélectionnez une entreprise pour voir ses employés.
              </p>
            </div>
            <div className="flex items-end gap-3">
              <div className="min-w-[200px]">
                <Label htmlFor="company-select" className="mb-1 block text-xs">
                  Entreprise
                </Label>
                <Select
                  id="company-select"
                  value={selectedCompanyId ?? ''}
                  onChange={(e) =>
                    setSelectedCompanyId(e.target.value || null)
                  }
                  className="w-full"
                >
                  <option value="">Toutes</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.employeesCount} employés)
                    </option>
                  ))}
                </Select>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCreateCompanyOpen(true)}
              >
                Créer une entreprise
              </Button>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden mb-4">
            <table className="min-w-full text-xs">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Entreprise</th>
                  <th className="px-3 py-2 text-left font-medium">Slug</th>
                  <th className="px-3 py-2 text-left font-medium">Statut</th>
                  <th className="px-3 py-2 text-left font-medium">Employés</th>
                  <th className="px-3 py-2 text-left font-medium">Admins</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((c) => (
                  <tr
                    key={c.id}
                    className={`border-t ${
                      selectedCompanyId === c.id
                        ? 'bg-primary/5'
                        : 'hover:bg-muted/30 cursor-pointer'
                    }`}
                    onClick={() => setSelectedCompanyId(c.id)}
                  >
                    <td className="px-3 py-2 text-sm">{c.name}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {c.slug}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                          c.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-50 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {c.isActive ? 'Active' : 'Brouillon'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs">{c.employeesCount}</td>
                    <td className="px-3 py-2 text-xs">{c.adminsCount}</td>
                  </tr>
                ))}
                {companies.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-4 text-center text-sm text-muted-foreground"
                    >
                      Aucune entreprise enregistrée pour le moment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">
                Employés de l&apos;entreprise sélectionnée
                {selectedCompany ? ` : ${selectedCompany.name}` : ''}
              </h3>
              {loadingEmployees && (
                <span className="text-xs text-muted-foreground">
                  Chargement des employés…
                </span>
              )}
            </div>
            <div className="border rounded-lg max-h-64 overflow-auto">
              <table className="min-w-full text-xs">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Nom</th>
                    <th className="px-3 py-2 text-left font-medium">Email</th>
                    <th className="px-3 py-2 text-left font-medium">Département</th>
                    <th className="px-3 py-2 text-left font-medium">Poste</th>
                    <th className="px-3 py-2 text-left font-medium">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {companyEmployees.map((e) => (
                    <tr key={e.id} className="border-t">
                      <td className="px-3 py-1.5">
                        {(e.firstName || e.lastName) ? (
                          <span>{(e.firstName ?? '') + ' ' + (e.lastName ?? '')}</span>
                        ) : (
                          <span className="text-muted-foreground">Sans nom</span>
                        )}
                      </td>
                      <td className="px-3 py-1.5">{e.email ?? '-'}</td>
                      <td className="px-3 py-1.5">{e.department ?? '-'}</td>
                      <td className="px-3 py-1.5">{e.position ?? '-'}</td>
                      <td className="px-3 py-1.5">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            e.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {e.isActive ? 'Actif' : 'Désactivé'}
                        </span>
                      </td>
                      <td className="px-3 py-1.5 text-right">
                        <Button
                          variant="outline"
                          size="xs"
                          className="h-7 text-[11px]"
                          disabled={loadingEmployees}
                          onClick={async () => {
                            try {
                              if (e.isActive) {
                                await api.deactivateEmployee(e.id);
                              } else {
                                await api.activateEmployee(e.id);
                              }
                              const refreshed = await api
                                .getAdminCompanyEmployees(selectedCompanyId || '')
                                .catch(() => companyEmployees);
                              if (Array.isArray(refreshed)) {
                                setCompanyEmployees(refreshed);
                              }
                            } catch (err) {
                              console.error('Failed to toggle employee active state', err);
                            }
                          }}
                        >
                          {e.isActive ? 'Bloquer' : 'Réactiver'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {companyEmployees.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-3 py-4 text-center text-xs text-muted-foreground"
                      >
                        Aucun employé pour l&apos;entreprise sélectionnée.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {/* Dialog création entreprise */}
      <Dialog open={createCompanyOpen} onOpenChange={setCreateCompanyOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Créer une entreprise</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="company-name">Nom</Label>
              <Input
                id="company-name"
                value={createCompanyName}
                onChange={(e) => {
                  const value = e.target.value;
                  setCreateCompanyName(value);
                  if (!createCompanySlug) {
                    setCreateCompanySlug(
                      value
                        .toLowerCase()
                        .trim()
                        .replace(/\s+/g, '-')
                        .replace(/[^a-z0-9\-]/g, ''),
                    );
                  }
                }}
                placeholder="Nom de l'entreprise"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company-slug">Slug</Label>
              <Input
                id="company-slug"
                value={createCompanySlug}
                onChange={(e) => setCreateCompanySlug(e.target.value)}
                placeholder="identifiant-unique-entreprise"
              />
              <p className="text-[11px] text-muted-foreground">
                Utilisé dans l&apos;URL et comme identifiant unique.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="company-sector">Secteur (optionnel)</Label>
                <Input
                  id="company-sector"
                  value={createCompanySector}
                  onChange={(e) => setCreateCompanySector(e.target.value)}
                  placeholder="Banque, Tech, Santé..."
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="company-city">Ville (optionnel)</Label>
                <Input
                  id="company-city"
                  value={createCompanyCity}
                  onChange={(e) => setCreateCompanyCity(e.target.value)}
                  placeholder="Paris"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => {
                if (!creatingCompany) setCreateCompanyOpen(false);
              }}
              disabled={creatingCompany}
            >
              Annuler
            </Button>
            <Button
              disabled={creatingCompany || !createCompanyName || !createCompanySlug}
              onClick={async () => {
                if (!createCompanyName || !createCompanySlug) return;
                setCreatingCompany(true);
                setError(null);
                try {
                  const created = await api.createAdminCompany({
                    name: createCompanyName,
                    slug: createCompanySlug,
                    sector: createCompanySector || null,
                    city: createCompanyCity || null,
                  });
                  const refreshed = await api.getAdminCompanies();
                  setCompanies(refreshed || []);
                  setSelectedCompanyId(created?.id ?? null);
                  setCreateCompanyOpen(false);
                  setCreateCompanyName('');
                  setCreateCompanySlug('');
                  setCreateCompanySector('');
                  setCreateCompanyCity('');
                } catch (err) {
                  setError(
                    err instanceof Error
                      ? err.message
                      : "Impossible de créer l'entreprise.",
                  );
                } finally {
                  setCreatingCompany(false);
                }
              }}
            >
              {creatingCompany ? 'Création…' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog création */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Créer un compte RH / DRH</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="create-email">Email</Label>
              <Input
                id="create-email"
                type="email"
                value={createEmail}
                onChange={(e) => setCreateEmail(e.target.value)}
                placeholder="rh@entreprise.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="create-role">Rôle</Label>
              <Select
                id="create-role"
                value={createRole}
                onChange={(e) =>
                  setCreateRole(e.target.value as 'ADMIN_RH' | 'ADMIN_HUNTZEN')
                }
              >
                <option value="ADMIN_RH">RH / DRH (ADMIN_RH)</option>
                <option value="ADMIN_HUNTZEN">Admin Huntzen (ADMIN_HUNTZEN)</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="create-company">Entreprise</Label>
              <Select
                id="create-company"
                value={createCompanyId}
                onChange={(e) => setCreateCompanyId(e.target.value)}
              >
                <option value="">Aucune</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
              <p className="text-[11px] text-muted-foreground">
                Chaque RH doit être rattaché à une entreprise pour pouvoir modifier ses
                informations et gérer ses employés.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="create-first-name">Prénom (optionnel)</Label>
                <Input
                  id="create-first-name"
                  value={createFirstName}
                  onChange={(e) => setCreateFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="create-last-name">Nom (optionnel)</Label>
                <Input
                  id="create-last-name"
                  value={createLastName}
                  onChange={(e) => setCreateLastName(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="create-phone">Téléphone (optionnel)</Label>
                <Input
                  id="create-phone"
                  value={createPhone}
                  onChange={(e) => setCreatePhone(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="create-position">Poste (optionnel)</Label>
                <Input
                  id="create-position"
                  value={createPosition}
                  onChange={(e) => setCreatePosition(e.target.value)}
                />
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Un mot de passe temporaire sera généré automatiquement
              (par défaut&nbsp;: Password123). Vous pourrez le communiquer au RH / DRH.
            </p>
          </div>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setCreateOpen(false)}
              disabled={creating}
            >
              Annuler
            </Button>
            <Button onClick={handleCreate} disabled={creating || !createEmail}>
              {creating ? 'Création…' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog édition */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifier le compte administrateur</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-role">Rôle</Label>
              <Select
                id="edit-role"
                value={editRole}
                onChange={(e) =>
                  setEditRole(e.target.value as 'ADMIN_RH' | 'ADMIN_HUNTZEN')
                }
              >
                <option value="ADMIN_RH">RH / DRH (ADMIN_RH)</option>
                <option value="ADMIN_HUNTZEN">Admin Huntzen (ADMIN_HUNTZEN)</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-company">Entreprise</Label>
              <Select
                id="edit-company"
                value={editCompanyId}
                onChange={(e) => setEditCompanyId(e.target.value)}
              >
                <option value="">Aucune</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-first-name">Prénom</Label>
                <Input
                  id="edit-first-name"
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-last-name">Nom</Label>
                <Input
                  id="edit-last-name"
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-phone">Téléphone</Label>
                <Input
                  id="edit-phone"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-position">Poste</Label>
                <Input
                  id="edit-position"
                  value={editPosition}
                  onChange={(e) => setEditPosition(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-status">Statut</Label>
              <Select
                id="edit-status"
                value={editIsActive ? 'active' : 'inactive'}
                onChange={(e) => setEditIsActive(e.target.value === 'active')}
              >
                <option value="active">Actif</option>
                <option value="inactive">Désactivé</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-password">
                Nouveau mot de passe (optionnel)
              </Label>
              <Input
                id="edit-password"
                type="password"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                placeholder="Laisser vide pour ne pas changer"
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setEditOpen(false)}
              disabled={savingEdit}
            >
              Annuler
            </Button>
            <Button onClick={handleSaveEdit} disabled={savingEdit}>
              {savingEdit ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

