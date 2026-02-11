import { useEffect, useState } from 'react';
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
};

export function AdminAdmins() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [companies, setCompanies] = useState<CompanySummary[]>([]);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);

  const [createEmail, setCreateEmail] = useState('');
  const [createRole, setCreateRole] =
    useState<'ADMIN_RH' | 'ADMIN_HUNTZEN'>('ADMIN_RH');
  const [createCompanyId, setCreateCompanyId] = useState<string | ''>('');
  const [createFirstName, setCreateFirstName] = useState('');
  const [createLastName, setCreateLastName] = useState('');
  const [createPhone, setCreatePhone] = useState('');
  const [createPosition, setCreatePosition] = useState('');
  const [creating, setCreating] = useState(false);

  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] =
    useState<'ADMIN_RH' | 'ADMIN_HUNTZEN'>('ADMIN_RH');
  const [editCompanyId, setEditCompanyId] = useState<string | ''>('');
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [editPhone, setEditPhone] = useState('');
  const [editPosition, setEditPosition] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [changePasswordUserId, setChangePasswordUserId] = useState<string | null>(null);
  const [changePasswordValue, setChangePasswordValue] = useState('');
  const [changePasswordSaving, setChangePasswordSaving] = useState(false);

  const [deleteConfirmAdmin, setDeleteConfirmAdmin] = useState<AdminUser | null>(null);
  const [deletingAdmin, setDeletingAdmin] = useState(false);

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
        setCompanies(
          (companiesData || []).map((c: any) => ({
            id: c.id,
            name: c.name,
          })),
        );
      })
      .catch((err) => {
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger les comptes administrateurs.",
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const handleOpenCreate = () => {
    setCreateEmail('');
    setCreateRole('ADMIN_RH');
    setCreateCompanyId('');
    setCreateFirstName('');
    setCreateLastName('');
    setCreatePhone('');
    setCreatePosition('');
    setCreateOpen(true);
  };

  const handleCreate = async () => {
    if (!createEmail) return;
    if (createRole === 'ADMIN_RH' && !createCompanyId) {
      setError('Un compte RH / DRH doit être rattaché à une entreprise.');
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
      const updated = await api.getAdminUsers();
      setAdmins(updated || []);
      setCreateOpen(false);
      console.info(
        'Admin créé, mot de passe temporaire:',
        created?.temporaryPassword,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Impossible de créer le compte administrateur.',
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
    setEditOpen(true);
  };

  const openChangePassword = (userId: string) => {
    setChangePasswordUserId(userId);
    setChangePasswordValue('');
    setChangePasswordOpen(true);
  };

  const handleChangePassword = async () => {
    if (!changePasswordUserId || !changePasswordValue.trim()) return;
    setChangePasswordSaving(true);
    setError(null);
    try {
      await api.updateAdminUserPassword(changePasswordUserId, changePasswordValue.trim());
      setChangePasswordOpen(false);
      setChangePasswordUserId(null);
      setChangePasswordValue('');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Impossible de modifier le mot de passe.',
      );
    } finally {
      setChangePasswordSaving(false);
    }
  };

  const handleToggleAdminActive = async (admin: AdminUser) => {
    setError(null);
    try {
      await api.updateAdminUser(admin.id, { isActive: !admin.isActive });
      const updated = await api.getAdminUsers();
      setAdmins(updated || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de modifier le statut.');
    }
  };

  const handleDeleteAdmin = async () => {
    if (!deleteConfirmAdmin) return;
    setDeletingAdmin(true);
    setError(null);
    try {
      await api.deleteAdminUser(deleteConfirmAdmin.id);
      setDeleteConfirmAdmin(null);
      const updated = await api.getAdminUsers();
      setAdmins(updated || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de supprimer le compte.');
    } finally {
      setDeletingAdmin(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingAdmin) return;
    if (editRole === 'ADMIN_RH' && !editCompanyId) {
      setError('Un compte RH / DRH doit être rattaché à une entreprise.');
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
        Chargement des comptes administrateurs…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Admins RH / DRH</h1>
          <p className="text-sm text-muted-foreground">
            Gérez les comptes administrateurs rattachés aux entreprises clientes.
          </p>
        </div>
        <Button onClick={handleOpenCreate}>Créer un compte RH / DRH</Button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

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
                    {admin.role === 'ADMIN_RH'
                      ? 'RH / DRH (ADMIN_RH)'
                      : 'Admin Huntzen (ADMIN_HUNTZEN)'}
                  </td>
                  <td className="px-3 py-2">
                    {admin.companyName ?? (
                      <span className="text-xs text-muted-foreground">
                        Aucune
                      </span>
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
                  <td className="px-3 py-2 text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(admin)}>
                      Modifier
                    </Button>
                    <Button
                      variant={admin.isActive ? 'outline' : 'default'}
                      size="sm"
                      onClick={() => handleToggleAdminActive(admin)}
                    >
                      {admin.isActive ? 'Désactiver' : 'Réactiver'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-destructive/50 text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteConfirmAdmin(admin)}
                    >
                      Supprimer
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
              <select
                id="create-role"
                value={createRole}
                onChange={(e) =>
                  setCreateRole(e.target.value as 'ADMIN_RH' | 'ADMIN_HUNTZEN')
                }
                className="w-full border border-input bg-background rounded-md px-2 py-1 text-sm"
              >
                <option value="ADMIN_RH">RH / DRH (ADMIN_RH)</option>
                <option value="ADMIN_HUNTZEN">
                  Admin Huntzen (ADMIN_HUNTZEN)
                </option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="create-company">Entreprise</Label>
              <select
                id="create-company"
                value={createCompanyId}
                onChange={(e) => setCreateCompanyId(e.target.value)}
                className="w-full border border-input bg-background rounded-md px-2 py-1 text-sm"
              >
                <option value="">Aucune</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-muted-foreground">
                Chaque RH doit être rattaché à une entreprise pour pouvoir
                modifier ses informations et gérer ses employés.
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
              (par défaut&nbsp;: Password123). Vous pourrez le communiquer au RH
              / DRH.
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
              <select
                id="edit-role"
                value={editRole}
                onChange={(e) =>
                  setEditRole(e.target.value as 'ADMIN_RH' | 'ADMIN_HUNTZEN')
                }
                className="w-full border border-input bg-background rounded-md px-2 py-1 text-sm"
              >
                <option value="ADMIN_RH">RH / DRH (ADMIN_RH)</option>
                <option value="ADMIN_HUNTZEN">
                  Admin Huntzen (ADMIN_HUNTZEN)
                </option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-company">Entreprise</Label>
              <select
                id="edit-company"
                value={editCompanyId}
                onChange={(e) => setEditCompanyId(e.target.value)}
                className="w-full border border-input bg-background rounded-md px-2 py-1 text-sm"
              >
                <option value="">Aucune</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
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
              <select
                id="edit-status"
                value={editIsActive ? 'active' : 'inactive'}
                onChange={(e) => setEditIsActive(e.target.value === 'active')}
                className="w-full border border-input bg-background rounded-md px-2 py-1 text-sm"
              >
                <option value="active">Actif</option>
                <option value="inactive">Désactivé</option>
              </select>
            </div>
          </div>
          <DialogFooter className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => editingAdmin && openChangePassword(editingAdmin.id)}
              disabled={savingEdit}
            >
              Changer le mot de passe
            </Button>
            <div className="flex-1" />
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

      {/* Dialog changer le mot de passe */}
      <Dialog
        open={changePasswordOpen}
        onOpenChange={(open) => {
          setChangePasswordOpen(open);
          if (!open) {
            setChangePasswordUserId(null);
            setChangePasswordValue('');
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Changer le mot de passe</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="change-password">Nouveau mot de passe</Label>
              <Input
                id="change-password"
                type="password"
                value={changePasswordValue}
                onChange={(e) => setChangePasswordValue(e.target.value)}
                placeholder="Saisir le nouveau mot de passe"
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setChangePasswordOpen(false)}
              disabled={changePasswordSaving}
            >
              Annuler
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={changePasswordSaving || !changePasswordValue.trim()}
            >
              {changePasswordSaving ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete admin confirmation */}
      <Dialog open={!!deleteConfirmAdmin} onOpenChange={(open) => !open && setDeleteConfirmAdmin(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Supprimer le compte</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Êtes-vous sûr de vouloir supprimer définitivement le compte{' '}
            <strong>{deleteConfirmAdmin?.email}</strong>{' '}
            ({deleteConfirmAdmin?.role === 'ADMIN_RH' ? 'RH / DRH' : 'Admin HuntZen'}) ? Cette action est irréversible.
          </p>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirmAdmin(null)} disabled={deletingAdmin}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteAdmin} disabled={deletingAdmin}>
              {deletingAdmin ? 'Suppression…' : 'Supprimer définitivement'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

