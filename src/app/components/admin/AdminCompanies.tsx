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
import { api } from '@/app/services/api';

type CompanySummary = {
  id: string;
  name: string;
  slug: string;
  legalName?: string | null;
  siret?: string | null;
  sector?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  logoUrl?: string | null;
  coverUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  employeesCount: number;
  adminsCount: number;
};

export function AdminCompanies() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [companies, setCompanies] = useState<CompanySummary[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(
    null,
  );
  const [companyEmployees, setCompanyEmployees] = useState<any[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const [createCompanyOpen, setCreateCompanyOpen] = useState(false);
  const [createCompanyName, setCreateCompanyName] = useState('');
  const [createCompanySlug, setCreateCompanySlug] = useState('');
  const [createCompanyLegalName, setCreateCompanyLegalName] = useState('');
  const [createCompanySiret, setCreateCompanySiret] = useState('');
  const [createCompanySector, setCreateCompanySector] = useState('');
  const [createCompanyAddress, setCreateCompanyAddress] = useState('');
  const [createCompanyCity, setCreateCompanyCity] = useState('');
  const [createCompanyCountry, setCreateCompanyCountry] = useState('France');
  const [createCompanyLogoUrl, setCreateCompanyLogoUrl] = useState('');
  const [createCompanyCoverUrl, setCreateCompanyCoverUrl] = useState('');
  const [createCompanyIsActive, setCreateCompanyIsActive] = useState(false);
  const [creatingCompany, setCreatingCompany] = useState(false);

  const [editCompanyOpen, setEditCompanyOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanySummary | null>(
    null,
  );
  const [editCompanyName, setEditCompanyName] = useState('');
  const [editCompanySlug, setEditCompanySlug] = useState('');
  const [editCompanyLegalName, setEditCompanyLegalName] = useState('');
  const [editCompanySiret, setEditCompanySiret] = useState('');
  const [editCompanySector, setEditCompanySector] = useState('');
  const [editCompanyAddress, setEditCompanyAddress] = useState('');
  const [editCompanyCity, setEditCompanyCity] = useState('');
  const [editCompanyCountry, setEditCompanyCountry] = useState('France');
  const [editCompanyLogoUrl, setEditCompanyLogoUrl] = useState('');
  const [editCompanyCoverUrl, setEditCompanyCoverUrl] = useState('');
  const [editCompanyIsActive, setEditCompanyIsActive] = useState(false);
  const [savingEditCompany, setSavingEditCompany] = useState(false);

  const [deleteConfirmCompany, setDeleteConfirmCompany] = useState<CompanySummary | null>(null);
  const [deletingCompany, setDeletingCompany] = useState(false);

  const [editEmployeeOpen, setEditEmployeeOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any | null>(null);
  const [editEmployeeFirstName, setEditEmployeeFirstName] = useState('');
  const [editEmployeeLastName, setEditEmployeeLastName] = useState('');
  const [editEmployeeDepartment, setEditEmployeeDepartment] = useState('');
  const [editEmployeePosition, setEditEmployeePosition] = useState('');
  const [editEmployeePhoneNumber, setEditEmployeePhoneNumber] = useState('');
  const [savingEditEmployee, setSavingEditEmployee] = useState(false);

  const [deleteConfirmEmployee, setDeleteConfirmEmployee] = useState<any | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState(false);

  const selectedCompany = useMemo(
    () => companies.find((c) => c.id === selectedCompanyId) ?? null,
    [companies, selectedCompanyId],
  );

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .getAdminCompanies()
      .then((data) => {
        setCompanies(data || []);
        if (!selectedCompanyId && data && data.length > 0) {
          setSelectedCompanyId(data[0].id);
        }
      })
      .catch((err) => {
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger les entreprises.",
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

  const handleDeleteCompany = async () => {
    if (!deleteConfirmCompany) return;
    const idToDelete = deleteConfirmCompany.id;
    setDeletingCompany(true);
    setError(null);
    try {
      await api.deleteAdminCompany(idToDelete);
      setDeleteConfirmCompany(null);
      const refreshed = await api.getAdminCompanies();
      setCompanies(refreshed || []);
      if (selectedCompanyId === idToDelete) setSelectedCompanyId(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Impossible de supprimer l'entreprise.",
      );
    } finally {
      setDeletingCompany(false);
    }
  };

  const openEditEmployee = (e: any) => {
    setEditingEmployee(e);
    setEditEmployeeFirstName(e.firstName ?? '');
    setEditEmployeeLastName(e.lastName ?? '');
    setEditEmployeeDepartment(e.department ?? '');
    setEditEmployeePosition(e.position ?? '');
    setEditEmployeePhoneNumber(e.phoneNumber ?? '');
    setEditEmployeeOpen(true);
  };

  const handleSaveEditEmployee = async () => {
    if (!editingEmployee || !selectedCompanyId) return;
    setSavingEditEmployee(true);
    setError(null);
    try {
      await api.updateHREmployee(editingEmployee.id, {
        firstName: editEmployeeFirstName.trim() || undefined,
        lastName: editEmployeeLastName.trim() || undefined,
        department: editEmployeeDepartment.trim() || undefined,
        position: editEmployeePosition.trim() || undefined,
        phoneNumber: editEmployeePhoneNumber.trim() || undefined,
      });
      const refreshed = await api.getAdminCompanyEmployees(selectedCompanyId);
      setCompanyEmployees(refreshed || []);
      setEditEmployeeOpen(false);
      setEditingEmployee(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Impossible de mettre à jour l\'employé.',
      );
    } finally {
      setSavingEditEmployee(false);
    }
  };

  const handleDeleteEmployee = async () => {
    if (!deleteConfirmEmployee || !selectedCompanyId) return;
    setDeletingEmployee(true);
    setError(null);
    try {
      await api.deleteHREmployee(deleteConfirmEmployee.id);
      setDeleteConfirmEmployee(null);
      const refreshed = await api.getAdminCompanyEmployees(selectedCompanyId);
      setCompanyEmployees(refreshed || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Impossible de supprimer l\'employé.',
      );
    } finally {
      setDeletingEmployee(false);
    }
  };

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground">
        Chargement des entreprises…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Entreprises</h1>
          <p className="text-sm text-muted-foreground">
            Gérez les entreprises clientes et les employés rattachés.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCreateCompanyOpen(true)}
        >
          Créer une entreprise
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Liste des entreprises</h2>
            <p className="text-xs text-muted-foreground">
              Sélectionnez une entreprise pour voir ses employés.
            </p>
          </div>
          <div className="min-w-[220px]">
            <Label htmlFor="company-select" className="mb-1 block text-xs">
              Entreprise
            </Label>
            <select
              id="company-select"
              value={selectedCompanyId ?? ''}
              onChange={(e) => setSelectedCompanyId(e.target.value || null)}
              className="w-full border border-input bg-background rounded-md px-2 py-1 text-sm"
            >
              <option value="">Toutes</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.employeesCount} employés)
                </option>
              ))}
            </select>
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
                <th className="px-3 py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c) => (
                <tr
                  key={c.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedCompanyId(c.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedCompanyId(c.id);
                    }
                  }}
                  className={`border-t ${
                    selectedCompanyId === c.id
                      ? 'bg-primary/5'
                      : 'hover:bg-muted/30 cursor-pointer'
                  }`}
                >
                  <td className="px-3 py-2 text-sm">
                    {c.name}
                  </td>
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
                  <td
                    className="px-3 py-2 text-right space-x-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="outline"
                      size="xs"
                      className="h-7 text-[11px]"
                      onClick={() => {
                        setEditingCompany(c);
                        setEditCompanyName(c.name);
                        setEditCompanySlug(c.slug);
                        setEditCompanyLegalName(c.legalName ?? '');
                        setEditCompanySiret(c.siret ?? '');
                        setEditCompanySector(c.sector ?? '');
                        setEditCompanyAddress(c.address ?? '');
                        setEditCompanyCity(c.city ?? '');
                        setEditCompanyCountry(c.country ?? 'France');
                        setEditCompanyLogoUrl(c.logoUrl ?? '');
                        setEditCompanyCoverUrl(c.coverUrl ?? '');
                        setEditCompanyIsActive(c.isActive);
                        setEditCompanyOpen(true);
                      }}
                    >
                      Modifier
                    </Button>
                    <Button
                      variant="outline"
                      size="xs"
                      className="h-7 text-[11px]"
                      onClick={async () => {
                        const ok = window.confirm(
                          c.isActive
                            ? 'Désactiver cette entreprise (elle ne sera plus visible) ?'
                            : 'Réactiver cette entreprise ?',
                        );
                        if (!ok) return;
                        try {
                          await api.updateAdminCompany(c.id, {
                            isActive: !c.isActive,
                          });
                          const refreshed = await api.getAdminCompanies();
                          setCompanies(refreshed || []);
                          if (selectedCompanyId === c.id) setSelectedCompanyId(null);
                        } catch (err) {
                          console.error('Failed to toggle company active', err);
                        }
                      }}
                    >
                      {c.isActive ? 'Désactiver' : 'Réactiver'}
                    </Button>
                    <Button
                      variant="outline"
                      size="xs"
                      className="h-7 text-[11px] border-destructive/40 text-destructive"
                      onClick={() => setDeleteConfirmCompany(c)}
                    >
                      Supprimer
                    </Button>
                  </td>
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
                  <th className="px-3 py-2 text-left font-medium">
                    Département
                  </th>
                  <th className="px-3 py-2 text-left font-medium">Poste</th>
                  <th className="px-3 py-2 text-left font-medium">Statut</th>
                  <th className="px-3 py-2 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {companyEmployees.map((e) => (
                  <tr key={e.id} className="border-t">
                    <td className="px-3 py-1.5">
                      {e.firstName || e.lastName ? (
                        <span>
                          {(e.firstName ?? '') + ' ' + (e.lastName ?? '')}
                        </span>
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
                      <div className="flex items-center justify-end gap-1 flex-wrap">
                        <Button
                          variant="outline"
                          size="xs"
                          className="h-7 text-[11px]"
                          disabled={loadingEmployees}
                          onClick={() => openEditEmployee(e)}
                        >
                          Modifier
                        </Button>
                        <Button
                          variant="outline"
                          size="xs"
                          className="h-7 text-[11px] border-destructive/40 text-destructive"
                          disabled={loadingEmployees}
                          onClick={() => setDeleteConfirmEmployee(e)}
                        >
                          Supprimer
                        </Button>
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
                              console.error(
                                'Failed to toggle employee active state',
                                err,
                              );
                            }
                          }}
                        >
                          {e.isActive ? 'Bloquer' : 'Réactiver'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {companyEmployees.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
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
                <Label htmlFor="company-legal-name">
                  Raison sociale (optionnel)
                </Label>
                <Input
                  id="company-legal-name"
                  value={createCompanyLegalName}
                  onChange={(e) => setCreateCompanyLegalName(e.target.value)}
                  placeholder="Nom légal complet"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="company-siret">SIRET (optionnel)</Label>
                <Input
                  id="company-siret"
                  value={createCompanySiret}
                  onChange={(e) => setCreateCompanySiret(e.target.value)}
                  placeholder="123 456 789 00012"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company-address">Adresse (optionnel)</Label>
              <Input
                id="company-address"
                value={createCompanyAddress}
                onChange={(e) => setCreateCompanyAddress(e.target.value)}
                placeholder="Adresse postale complète"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="company-city">Ville (optionnel)</Label>
                <Input
                  id="company-city"
                  value={createCompanyCity}
                  onChange={(e) => setCreateCompanyCity(e.target.value)}
                  placeholder="Paris"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="company-country">Pays (optionnel)</Label>
                <Input
                  id="company-country"
                  value={createCompanyCountry}
                  onChange={(e) => setCreateCompanyCountry(e.target.value)}
                  placeholder="France"
                />
              </div>
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
                <Label htmlFor="company-logo">Logo URL (optionnel)</Label>
                <Input
                  id="company-logo"
                  value={createCompanyLogoUrl}
                  onChange={(e) => setCreateCompanyLogoUrl(e.target.value)}
                  placeholder="https://…"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company-cover">Cover URL (optionnel)</Label>
              <Input
                id="company-cover"
                value={createCompanyCoverUrl}
                onChange={(e) => setCreateCompanyCoverUrl(e.target.value)}
                placeholder="https://…"
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input
                id="company-active"
                type="checkbox"
                className="h-4 w-4"
                checked={createCompanyIsActive}
                onChange={(e) => setCreateCompanyIsActive(e.target.checked)}
              />
              <Label
                htmlFor="company-active"
                className="text-xs text-muted-foreground"
              >
                Activer l&apos;entreprise (visible pour les utilisateurs)
              </Label>
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
              disabled={
                creatingCompany || !createCompanyName || !createCompanySlug
              }
              onClick={async () => {
                if (!createCompanyName || !createCompanySlug) return;
                setCreatingCompany(true);
                setError(null);
                try {
                  const created = await api.createAdminCompany({
                    name: createCompanyName,
                    slug: createCompanySlug,
                    legalName: createCompanyLegalName || null,
                    siret: createCompanySiret || null,
                    sector: createCompanySector || null,
                    address: createCompanyAddress || null,
                    city: createCompanyCity || null,
                    country: createCompanyCountry || null,
                    logoUrl: createCompanyLogoUrl || null,
                    coverUrl: createCompanyCoverUrl || null,
                    isActive: createCompanyIsActive,
                  });
                  const refreshed = await api.getAdminCompanies();
                  setCompanies(refreshed || []);
                  setSelectedCompanyId(created?.id ?? null);
                  setCreateCompanyOpen(false);
                  setCreateCompanyName('');
                  setCreateCompanySlug('');
                  setCreateCompanySector('');
                  setCreateCompanyLegalName('');
                  setCreateCompanySiret('');
                  setCreateCompanyAddress('');
                  setCreateCompanyCity('');
                  setCreateCompanyCountry('France');
                  setCreateCompanyLogoUrl('');
                  setCreateCompanyCoverUrl('');
                  setCreateCompanyIsActive(false);
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

      {/* Dialog modification entreprise */}
      <Dialog open={editCompanyOpen} onOpenChange={setEditCompanyOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifier l&apos;entreprise</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-company-name">Nom</Label>
              <Input
                id="edit-company-name"
                value={editCompanyName}
                onChange={(e) => setEditCompanyName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-company-slug">Slug</Label>
              <Input
                id="edit-company-slug"
                value={editCompanySlug}
                onChange={(e) => setEditCompanySlug(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-company-legal-name">
                  Raison sociale (optionnel)
                </Label>
                <Input
                  id="edit-company-legal-name"
                  value={editCompanyLegalName}
                  onChange={(e) => setEditCompanyLegalName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-company-siret">SIRET (optionnel)</Label>
                <Input
                  id="edit-company-siret"
                  value={editCompanySiret}
                  onChange={(e) => setEditCompanySiret(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-company-address">Adresse (optionnel)</Label>
              <Input
                id="edit-company-address"
                value={editCompanyAddress}
                onChange={(e) => setEditCompanyAddress(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-company-city">Ville (optionnel)</Label>
                <Input
                  id="edit-company-city"
                  value={editCompanyCity}
                  onChange={(e) => setEditCompanyCity(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-company-country">Pays (optionnel)</Label>
                <Input
                  id="edit-company-country"
                  value={editCompanyCountry}
                  onChange={(e) => setEditCompanyCountry(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-company-sector">
                  Secteur (optionnel)
                </Label>
                <Input
                  id="edit-company-sector"
                  value={editCompanySector}
                  onChange={(e) => setEditCompanySector(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-company-logo">
                  Logo URL (optionnel)
                </Label>
                <Input
                  id="edit-company-logo"
                  value={editCompanyLogoUrl}
                  onChange={(e) => setEditCompanyLogoUrl(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-company-cover">
                Cover URL (optionnel)
              </Label>
              <Input
                id="edit-company-cover"
                value={editCompanyCoverUrl}
                onChange={(e) => setEditCompanyCoverUrl(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input
                id="edit-company-active"
                type="checkbox"
                className="h-4 w-4"
                checked={editCompanyIsActive}
                onChange={(e) => setEditCompanyIsActive(e.target.checked)}
              />
              <Label
                htmlFor="edit-company-active"
                className="text-xs text-muted-foreground"
              >
                Entreprise active
              </Label>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => {
                if (!savingEditCompany) setEditCompanyOpen(false);
              }}
              disabled={savingEditCompany}
            >
              Annuler
            </Button>
            <Button
              disabled={savingEditCompany || !editingCompany}
              onClick={async () => {
                if (!editingCompany) return;
                setSavingEditCompany(true);
                setError(null);
                try {
                  await api.updateAdminCompany(editingCompany.id, {
                    name: editCompanyName || undefined,
                    slug: editCompanySlug || undefined,
                    legalName: editCompanyLegalName || null,
                    siret: editCompanySiret || null,
                    sector: editCompanySector || null,
                    address: editCompanyAddress || null,
                    city: editCompanyCity || null,
                    country: editCompanyCountry || null,
                    logoUrl: editCompanyLogoUrl || null,
                    coverUrl: editCompanyCoverUrl || null,
                    isActive: editCompanyIsActive,
                  });
                  const refreshed = await api.getAdminCompanies();
                  setCompanies(refreshed || []);
                  setEditCompanyOpen(false);
                } catch (err) {
                  setError(
                    err instanceof Error
                      ? err.message
                      : "Impossible de mettre à jour l'entreprise.",
                  );
                } finally {
                  setSavingEditCompany(false);
                }
              }}
            >
              {savingEditCompany ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete company confirmation */}
      <Dialog open={!!deleteConfirmCompany} onOpenChange={(open) => !open && setDeleteConfirmCompany(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Supprimer l&apos;entreprise</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Êtes-vous sûr de vouloir supprimer définitivement l&apos;entreprise{' '}
            <strong>{deleteConfirmCompany?.name}</strong> ? Cette action est irréversible (employés, consultations et données liées seront impactés).
          </p>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirmCompany(null)} disabled={deletingCompany}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteCompany} disabled={deletingCompany}>
              {deletingCompany ? 'Suppression…' : 'Supprimer définitivement'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit employee dialog */}
      <Dialog open={editEmployeeOpen} onOpenChange={setEditEmployeeOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier l&apos;employé</DialogTitle>
          </DialogHeader>
          {editingEmployee && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-emp-firstname">Prénom</Label>
                  <Input
                    id="edit-emp-firstname"
                    value={editEmployeeFirstName}
                    onChange={(e) => setEditEmployeeFirstName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-emp-lastname">Nom</Label>
                  <Input
                    id="edit-emp-lastname"
                    value={editEmployeeLastName}
                    onChange={(e) => setEditEmployeeLastName(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-emp-department">Département</Label>
                <Input
                  id="edit-emp-department"
                  value={editEmployeeDepartment}
                  onChange={(e) => setEditEmployeeDepartment(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-emp-position">Poste</Label>
                <Input
                  id="edit-emp-position"
                  value={editEmployeePosition}
                  onChange={(e) => setEditEmployeePosition(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-emp-phone">Téléphone</Label>
                <Input
                  id="edit-emp-phone"
                  value={editEmployeePhoneNumber}
                  onChange={(e) => setEditEmployeePhoneNumber(e.target.value)}
                  placeholder="Optionnel"
                />
              </div>
            </div>
          )}
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => !savingEditEmployee && setEditEmployeeOpen(false)} disabled={savingEditEmployee}>
              Annuler
            </Button>
            <Button onClick={handleSaveEditEmployee} disabled={savingEditEmployee}>
              {savingEditEmployee ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete employee confirmation */}
      <Dialog open={!!deleteConfirmEmployee} onOpenChange={(open) => !open && setDeleteConfirmEmployee(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Supprimer l&apos;employé</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Êtes-vous sûr de vouloir supprimer l&apos;employé{' '}
            <strong>
              {deleteConfirmEmployee
                ? `${deleteConfirmEmployee.firstName ?? ''} ${deleteConfirmEmployee.lastName ?? ''}`.trim() || deleteConfirmEmployee.email || 'cet employé'
                : ''}
            </strong>{' '}
            ? Cette action est irréversible.
          </p>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirmEmployee(null)} disabled={deletingEmployee}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteEmployee} disabled={deletingEmployee}>
              {deletingEmployee ? 'Suppression…' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

