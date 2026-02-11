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
import { KeyRound } from 'lucide-react';
import { api } from '@/app/services/api';

const SPECIALTIES = [
  { value: 'PSYCHOLOGUE_CLINICIEN', label: 'Psychologue clinicien' },
  { value: 'PSYCHOLOGUE_TRAVAIL', label: 'Psychologue du travail' },
  { value: 'PSYCHIATRE', label: 'Psychiatre' },
  { value: 'PSYCHOTHERAPEUTE', label: 'Psychothérapeute' },
  { value: 'NEUROPSYCHOLOGUE', label: 'Neuropsychologue' },
  { value: 'COACH_MENTAL', label: 'Coach mental' },
  { value: 'SEXOLOGUE', label: 'Sexologue' },
  { value: 'PSYCHANALYSTE', label: 'Psychanalyste' },
  { value: 'OTHER', label: 'Autre (préciser ci-dessous)' },
] as const;

type PractitionerRow = {
  id: string;
  userId: string;
  email: string | null;
  firstName: string;
  lastName: string;
  title: string;
  professionalId: string | null;
  specialty: string;
  customSpecialty?: string | null;
  bio: string;
  experience?: number | null;
  education?: string | null;
  isActive: boolean;
  companyId: string | null;
  companyName: string | null;
  userIsActive: boolean;
  createdAt: string;
};

type CompanySummary = { id: string; name: string };

interface AdminPractitionersProps {
  onViewProfile?: (practitionerId: string) => void;
}

export function AdminPractitioners({ onViewProfile }: AdminPractitionersProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [practitioners, setPractitioners] = useState<PractitionerRow[]>([]);
  const [companies, setCompanies] = useState<CompanySummary[]>([]);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createFirstName, setCreateFirstName] = useState('');
  const [createLastName, setCreateLastName] = useState('');
  const [createTitle, setCreateTitle] = useState('Dr.');
  const [createProfessionalId, setCreateProfessionalId] = useState('');
  const [createSpecialty, setCreateSpecialty] = useState<string>(SPECIALTIES[0].value);
  const [createCustomSpecialty, setCreateCustomSpecialty] = useState('');
  const [createBio, setCreateBio] = useState('');
  const [createExperience, setCreateExperience] = useState('');
  const [createEducation, setCreateEducation] = useState('');
  const [createCompanyId, setCreateCompanyId] = useState<string | ''>('');
  const [createIsActive, setCreateIsActive] = useState(true);
  const [creating, setCreating] = useState(false);

  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editTitle, setEditTitle] = useState('Dr.');
  const [editProfessionalId, setEditProfessionalId] = useState('');
  const [editSpecialty, setEditSpecialty] = useState<string>(SPECIALTIES[0].value);
  const [editCustomSpecialty, setEditCustomSpecialty] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editExperience, setEditExperience] = useState('');
  const [editEducation, setEditEducation] = useState('');
  const [editCompanyId, setEditCompanyId] = useState<string | ''>('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [savingEdit, setSavingEdit] = useState(false);

  const [deleteConfirmPractitioner, setDeleteConfirmPractitioner] = useState<PractitionerRow | null>(null);
  const [deletingPractitioner, setDeletingPractitioner] = useState(false);

  const [passwordPractitioner, setPasswordPractitioner] = useState<PractitionerRow | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const loadPractitioners = () => {
    setLoading(true);
    setError(null);
    api
      .getAdminPractitioners()
      .then((data) => setPractitioners(data || []))
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Impossible de charger les praticiens.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPractitioners();
  }, []);

  const handleCreate = async () => {
    if (!createEmail.trim() || !createFirstName.trim() || !createLastName.trim() || !createBio.trim()) {
      setError('Email, prénom, nom et bio sont requis.');
      return;
    }
    setCreating(true);
    setError(null);
    try {
      await api.createAdminPractitioner({
        email: createEmail.trim(),
        password: createPassword.trim() || undefined,
        firstName: createFirstName.trim(),
        lastName: createLastName.trim(),
        title: createTitle,
        professionalId: createProfessionalId.trim() || null,
        specialty: createSpecialty as any,
        customSpecialty: createSpecialty === 'OTHER' ? (createCustomSpecialty.trim() || null) : null,
        subSpecialties: [],
        languages: [],
        bio: createBio.trim(),
        experience: createExperience.trim() ? parseInt(createExperience, 10) : null,
        education: createEducation.trim() || null,
        offersVideo: true,
        offersPhone: true,
        isValidated: createIsActive,
        isActive: createIsActive,
        isAcceptingNewClients: true,
        companyId: createCompanyId || null,
      });
      setCreateOpen(false);
      resetCreateForm();
      loadPractitioners();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de créer le praticien.');
    } finally {
      setCreating(false);
    }
  };

  const resetCreateForm = () => {
    setCreateEmail('');
    setCreatePassword('');
    setCreateFirstName('');
    setCreateLastName('');
    setCreateTitle('Dr.');
    setCreateProfessionalId('');
    setCreateSpecialty(SPECIALTIES[0].value);
    setCreateCustomSpecialty('');
    setCreateBio('');
    setCreateExperience('');
    setCreateEducation('');
    setCreateCompanyId('');
    setCreateIsActive(true);
  };

  const openEdit = (p: PractitionerRow) => {
    setEditingId(p.id);
    setEditFirstName(p.firstName);
    setEditLastName(p.lastName);
    setEditTitle(p.title);
    setEditProfessionalId(p.professionalId ?? '');
    setEditSpecialty(p.specialty);
    setEditCustomSpecialty(p.customSpecialty ?? '');
    setEditBio(p.bio ?? '');
    setEditExperience(p.experience != null ? String(p.experience) : '');
    setEditEducation(p.education ?? '');
    setEditCompanyId(p.companyId ?? '');
    setEditIsActive(p.isActive);
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    setSavingEdit(true);
    setError(null);
    try {
      await api.updateAdminPractitioner(editingId, {
        firstName: editFirstName.trim(),
        lastName: editLastName.trim(),
        title: editTitle,
        professionalId: editProfessionalId.trim() || null,
        specialty: editSpecialty as any,
        customSpecialty: editSpecialty === 'OTHER' ? (editCustomSpecialty.trim() || null) : null,
        bio: editBio.trim(),
        experience: editExperience.trim() ? parseInt(editExperience, 10) : null,
        education: editEducation.trim() || null,
        isValidated: editIsActive,
        isActive: editIsActive,
        companyId: editCompanyId || null,
      });
      setEditOpen(false);
      setEditingId(null);
      loadPractitioners();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de modifier le praticien.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleToggleActive = async (p: PractitionerRow) => {
    const next = !p.isActive;
    setError(null);
    try {
      await api.setAdminPractitionerActive(p.id, next);
      loadPractitioners();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de modifier le statut.');
    }
  };

  const handleDeletePractitioner = async () => {
    if (!deleteConfirmPractitioner) return;
    setDeletingPractitioner(true);
    setError(null);
    try {
      await api.deleteAdminPractitioner(deleteConfirmPractitioner.id);
      setDeleteConfirmPractitioner(null);
      loadPractitioners();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de supprimer le praticien.');
    } finally {
      setDeletingPractitioner(false);
    }
  };

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground">
        Chargement des praticiens…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Praticiens</h1>
          <p className="text-sm text-muted-foreground">
            Créer, modifier et gérer les comptes praticiens (activation / désactivation).
          </p>
        </div>
        <Button onClick={() => { setCreateOpen(true); setError(null); }}>
          Créer un praticien
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card className="p-4 space-y-4">
        <div className="border rounded-lg overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Email</th>
                <th className="px-3 py-2 text-left font-medium">Nom</th>
                <th className="px-3 py-2 text-left font-medium">Spécialité</th>
                <th className="px-3 py-2 text-left font-medium">Entreprise</th>
                <th className="px-3 py-2 text-left font-medium">Statut</th>
                <th className="px-3 py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {practitioners.map((p) => (
                <tr
                  key={p.id}
                  className={`border-t ${onViewProfile ? 'cursor-pointer hover:bg-muted/50' : ''}`}
                  onClick={onViewProfile ? () => onViewProfile(p.id) : undefined}
                >
                  <td className="px-3 py-2 font-medium">{p.email ?? '—'}</td>
                  <td className="px-3 py-2">
                    {p.title} {p.firstName} {p.lastName}
                  </td>
                  <td className="px-3 py-2">
                    {p.specialty === 'OTHER' && p.customSpecialty
                      ? p.customSpecialty
                      : SPECIALTIES.find((s) => s.value === p.specialty)?.label ?? p.specialty}
                  </td>
                  <td className="px-3 py-2">
                    {p.companyName ?? <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        p.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {p.isActive ? 'Actif' : 'Désactivé'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        className="text-xs font-medium text-primary hover:underline disabled:opacity-50"
                        onClick={() => handleToggleActive(p)}
                      >
                        {p.isActive ? 'Désactiver' : 'Réactiver'}
                      </button>
                      <button
                        type="button"
                        className="text-xs font-medium text-muted-foreground hover:underline"
                        onClick={() => openEdit(p)}
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        className="text-xs font-medium text-muted-foreground hover:underline inline-flex items-center gap-1"
                        onClick={() => {
                          setPasswordPractitioner(p);
                          setNewPassword('');
                          setNewPasswordConfirm('');
                          setPasswordError(null);
                        }}
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        Modifier mot de passe
                      </button>
                      <button
                        type="button"
                        className="text-xs font-medium text-destructive hover:underline"
                        onClick={() => setDeleteConfirmPractitioner(p)}
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {practitioners.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-4 text-center text-muted-foreground">
                    Aucun praticien.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer un praticien</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="create-email">Email</Label>
              <Input
                id="create-email"
                type="email"
                value={createEmail}
                onChange={(e) => setCreateEmail(e.target.value)}
                placeholder="praticien@exemple.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="create-password">Mot de passe (optionnel, défaut: Password123)</Label>
              <Input
                id="create-password"
                type="password"
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
                placeholder="Laisser vide pour Password123"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="create-first">Prénom</Label>
                <Input
                  id="create-first"
                  value={createFirstName}
                  onChange={(e) => setCreateFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="create-last">Nom</Label>
                <Input
                  id="create-last"
                  value={createLastName}
                  onChange={(e) => setCreateLastName(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="create-title">Titre</Label>
                <select
                  id="create-title"
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  className="w-full border border-input bg-background rounded-md px-2 py-1.5 text-sm"
                >
                  <option value="Dr.">Dr.</option>
                  <option value="Mme.">Mme.</option>
                  <option value="M.">M.</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="create-pro">N° professionnel (optionnel)</Label>
                <Input
                  id="create-pro"
                  value={createProfessionalId}
                  onChange={(e) => setCreateProfessionalId(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="create-specialty">Spécialité</Label>
              <select
                id="create-specialty"
                value={createSpecialty}
                onChange={(e) => setCreateSpecialty(e.target.value)}
                className="w-full border border-input bg-background rounded-md px-2 py-1.5 text-sm"
              >
                {SPECIALTIES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              {createSpecialty === 'OTHER' && (
                <Input
                  placeholder="Précisez la spécialité"
                  value={createCustomSpecialty}
                  onChange={(e) => setCreateCustomSpecialty(e.target.value)}
                  className="mt-1"
                />
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="create-company">Entreprise (optionnel)</Label>
              <select
                id="create-company"
                value={createCompanyId}
                onChange={(e) => setCreateCompanyId(e.target.value)}
                className="w-full border border-input bg-background rounded-md px-2 py-1.5 text-sm"
              >
                <option value="">Aucune</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="create-bio">Bio</Label>
              <textarea
                id="create-bio"
                value={createBio}
                onChange={(e) => setCreateBio(e.target.value)}
                rows={3}
                className="w-full border border-input bg-background rounded-md px-2 py-1.5 text-sm min-h-[80px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="create-exp">Années d&apos;expérience (optionnel)</Label>
                <Input
                  id="create-exp"
                  type="number"
                  min={0}
                  value={createExperience}
                  onChange={(e) => setCreateExperience(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="create-edu">Formation (optionnel)</Label>
                <Input
                  id="create-edu"
                  value={createEducation}
                  onChange={(e) => setCreateEducation(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Statut</Label>
              <select
                value={createIsActive ? 'active' : 'inactive'}
                onChange={(e) => setCreateIsActive(e.target.value === 'active')}
                className="w-full border border-input bg-background rounded-md px-2 py-1.5 text-sm"
              >
                <option value="active">Actif</option>
                <option value="inactive">Désactivé</option>
              </select>
              <p className="text-[11px] text-muted-foreground">
                Un praticien actif est visible et peut recevoir des consultations.
              </p>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>
              Annuler
            </Button>
            <Button onClick={handleCreate} disabled={creating || !createEmail || !createFirstName || !createLastName || !createBio}>
              {creating ? 'Création…' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le praticien</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Prénom</Label>
                <Input value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Nom</Label>
                <Input value={editLastName} onChange={(e) => setEditLastName(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Titre</Label>
                <select
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full border border-input bg-background rounded-md px-2 py-1.5 text-sm"
                >
                  <option value="Dr.">Dr.</option>
                  <option value="Mme.">Mme.</option>
                  <option value="M.">M.</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>N° professionnel</Label>
                <Input value={editProfessionalId} onChange={(e) => setEditProfessionalId(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Spécialité</Label>
              <select
                value={editSpecialty}
                onChange={(e) => setEditSpecialty(e.target.value)}
                className="w-full border border-input bg-background rounded-md px-2 py-1.5 text-sm"
              >
                {SPECIALTIES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              {editSpecialty === 'OTHER' && (
                <Input
                  placeholder="Précisez la spécialité"
                  value={editCustomSpecialty}
                  onChange={(e) => setEditCustomSpecialty(e.target.value)}
                  className="mt-1"
                />
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Entreprise (optionnel)</Label>
              <select
                value={editCompanyId}
                onChange={(e) => setEditCompanyId(e.target.value)}
                className="w-full border border-input bg-background rounded-md px-2 py-1.5 text-sm"
              >
                <option value="">Aucune</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Bio</Label>
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                rows={3}
                className="w-full border border-input bg-background rounded-md px-2 py-1.5 text-sm min-h-[80px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Années d&apos;expérience</Label>
                <Input
                  type="number"
                  min={0}
                  value={editExperience}
                  onChange={(e) => setEditExperience(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Formation</Label>
                <Input value={editEducation} onChange={(e) => setEditEducation(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Statut</Label>
              <select
                value={editIsActive ? 'active' : 'inactive'}
                onChange={(e) => setEditIsActive(e.target.value === 'active')}
                className="w-full border border-input bg-background rounded-md px-2 py-1.5 text-sm"
              >
                <option value="active">Actif</option>
                <option value="inactive">Désactivé</option>
              </select>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={savingEdit}>
              Annuler
            </Button>
            <Button onClick={handleSaveEdit} disabled={savingEdit}>
              {savingEdit ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete practitioner confirmation */}
      <Dialog open={!!deleteConfirmPractitioner} onOpenChange={(open) => !open && setDeleteConfirmPractitioner(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Supprimer le praticien</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Êtes-vous sûr de vouloir supprimer définitivement{' '}
            <strong>
              {deleteConfirmPractitioner?.title} {deleteConfirmPractitioner?.firstName} {deleteConfirmPractitioner?.lastName}
            </strong>{' '}
            ({deleteConfirmPractitioner?.email}) ? Cette action est irréversible.
          </p>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirmPractitioner(null)} disabled={deletingPractitioner}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeletePractitioner} disabled={deletingPractitioner}>
              {deletingPractitioner ? 'Suppression…' : 'Supprimer définitivement'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change practitioner password */}
      <Dialog
        open={!!passwordPractitioner}
        onOpenChange={(open) => {
          if (!open && !savingPassword) {
            setPasswordPractitioner(null);
            setPasswordError(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier le mot de passe</DialogTitle>
          </DialogHeader>
          {passwordPractitioner && (
            <>
              <p className="text-sm text-muted-foreground">
                Définir un nouveau mot de passe pour{' '}
                <span className="font-medium text-foreground">
                  {passwordPractitioner.title} {passwordPractitioner.firstName} {passwordPractitioner.lastName}
                </span>
                {passwordPractitioner.email && (
                  <span className="text-muted-foreground"> ({passwordPractitioner.email})</span>
                )}
                . Le praticien pourra se connecter avec ce mot de passe.
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
                    await api.setAdminPractitionerPassword(passwordPractitioner.id, newPassword);
                    setPasswordPractitioner(null);
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
                  <Label htmlFor="admin-new-password">Nouveau mot de passe</Label>
                  <Input
                    id="admin-new-password"
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
                  <Label htmlFor="admin-new-password-confirm">Confirmer le mot de passe</Label>
                  <Input
                    id="admin-new-password-confirm"
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
                      if (!savingPassword) setPasswordPractitioner(null);
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
