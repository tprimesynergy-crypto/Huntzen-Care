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
import { MapPin, Calendar, Clock, GraduationCap, CheckCircle, Mail, Pencil, X, Plus, Trash2 } from 'lucide-react';
import { api } from '@/app/services/api';

const SPECIALTY_OPTIONS = [
  { value: 'PSYCHOLOGUE_CLINICIEN', label: 'Psychologue clinicien' },
  { value: 'PSYCHOLOGUE_TRAVAIL', label: 'Psychologue du travail' },
  { value: 'PSYCHIATRE', label: 'Psychiatre' },
  { value: 'PSYCHOTHERAPEUTE', label: 'Psychothérapeute' },
  { value: 'NEUROPSYCHOLOGUE', label: 'Neuropsychologue' },
  { value: 'COACH_MENTAL', label: 'Coach mental' },
  { value: 'SEXOLOGUE', label: 'Sexologue' },
  { value: 'PSYCHANALYSTE', label: 'Psychanalyste' },
  { value: 'OTHER', label: 'Autre (préciser)' },
];

const DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

function getSpecialtyLabel(specialty: string, customSpecialty?: string | null) {
  if (specialty === 'OTHER' && customSpecialty) return customSpecialty;
  return SPECIALTY_OPTIONS.find((s) => s.value === specialty)?.label ?? specialty;
}

export function MyPractitionerProfile() {
  const [practitioner, setPractitioner] = useState<any | null>(null);
  const [availability, setAvailability] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Créneau dialog: add or edit a recurring slot
  const [creneauDialogOpen, setCreneauDialogOpen] = useState(false);
  const [creneauDialogMode, setCreneauDialogMode] = useState<'add' | 'edit'>('add');
  const [creneauDialogId, setCreneauDialogId] = useState<string | null>(null);
  const [creneauForm, setCreneauForm] = useState({
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '17:00',
    slotDuration: 50,
  });

  // Form state (all practitioner fields)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    title: 'Dr.',
    professionalId: '',
    specialty: 'PSYCHOLOGUE_CLINICIEN',
    customSpecialty: '',
    subSpecialties: '' as string,
    languages: '' as string,
    bio: '',
    experience: '' as string,
    education: '',
    avatarUrl: '',
    coverUrl: '',
    offersVideo: true,
    offersPhone: true,
    defaultDuration: 50,
    timezone: 'Europe/Paris',
    isActive: true,
    isAcceptingNewClients: true,
  });

  const loadData = () => {
    setLoading(true);
    setError(null);
    api
      .getPractitionerMe()
      .then(async (me) => {
        if (!me) {
          setPractitioner(null);
          setAvailability([]);
          return;
        }
        setPractitioner(me);
        setForm({
          firstName: me.firstName ?? '',
          lastName: me.lastName ?? '',
          title: me.title ?? 'Dr.',
          professionalId: me.professionalId ?? '',
          specialty: me.specialty ?? 'PSYCHOLOGUE_CLINICIEN',
          customSpecialty: me.customSpecialty ?? '',
          subSpecialties: Array.isArray(me.subSpecialties) ? me.subSpecialties.join(', ') : '',
          languages: Array.isArray(me.languages) ? me.languages.join(', ') : '',
          bio: me.bio ?? '',
          experience: me.experience != null ? String(me.experience) : '',
          education: me.education ?? '',
          avatarUrl: me.avatarUrl ?? '',
          coverUrl: me.coverUrl ?? '',
          offersVideo: me.offersVideo !== false,
          offersPhone: me.offersPhone !== false,
          defaultDuration: me.defaultDuration ?? 50,
          timezone: me.timezone ?? 'Europe/Paris',
          isActive: me.isActive !== false,
          isAcceptingNewClients: me.isAcceptingNewClients !== false,
        });
        const slots = await api.getPractitionerMeAvailability().catch(() => []);
        setAvailability(Array.isArray(slots) ? slots : []);
      })
      .catch(() => {
        setError('Impossible de charger votre profil praticien.');
        setPractitioner(null);
        setAvailability([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveProfile = async () => {
    if (!practitioner) return;
    setSaving(true);
    setError(null);
    try {
      await api.updatePractitionerMe({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        title: form.title,
        professionalId: form.professionalId.trim() || null,
        specialty: form.specialty as any,
        customSpecialty: form.specialty === 'OTHER' ? (form.customSpecialty.trim() || null) : null,
        subSpecialties: form.subSpecialties.trim() ? form.subSpecialties.split(',').map((s) => s.trim()).filter(Boolean) : [],
        languages: form.languages.trim() ? form.languages.split(',').map((s) => s.trim()).filter(Boolean) : [],
        bio: form.bio.trim(),
        experience: form.experience.trim() ? parseInt(form.experience, 10) : null,
        education: form.education.trim() || null,
        avatarUrl: form.avatarUrl.trim() || null,
        coverUrl: form.coverUrl.trim() || null,
        offersVideo: form.offersVideo,
        offersPhone: form.offersPhone,
        defaultDuration: form.defaultDuration,
        timezone: form.timezone,
        isActive: form.isActive,
        isAcceptingNewClients: form.isAcceptingNewClients,
      });
      setEditing(false);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l’enregistrement.');
    } finally {
      setSaving(false);
    }
  };

  const openAddCreneauDialog = () => {
    setCreneauDialogMode('add');
    setCreneauDialogId(null);
    setCreneauForm({
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '17:00',
      slotDuration: practitioner?.defaultDuration ?? 50,
    });
    setCreneauDialogOpen(true);
  };

  const openEditCreneauDialog = (slot: { id: string; dayOfWeek?: number; startTime?: string; endTime?: string; slotDuration?: number }) => {
    setCreneauDialogMode('edit');
    setCreneauDialogId(slot.id);
    setCreneauForm({
      dayOfWeek: slot.dayOfWeek ?? 1,
      startTime: slot.startTime ?? '09:00',
      endTime: slot.endTime ?? '17:00',
      slotDuration: slot.slotDuration ?? practitioner?.defaultDuration ?? 50,
    });
    setCreneauDialogOpen(true);
  };

  const handleSubmitCreneauDialog = async () => {
    setSaving(true);
    setError(null);
    try {
      if (creneauDialogMode === 'add') {
        await api.createPractitionerMeAvailability({
          type: 'RECURRING',
          dayOfWeek: creneauForm.dayOfWeek,
          startTime: creneauForm.startTime,
          endTime: creneauForm.endTime,
          slotDuration: creneauForm.slotDuration,
        });
      } else if (creneauDialogId) {
        await api.updatePractitionerMeAvailability(creneauDialogId, {
          dayOfWeek: creneauForm.dayOfWeek,
          startTime: creneauForm.startTime,
          endTime: creneauForm.endTime,
          slotDuration: creneauForm.slotDuration,
        });
      }
      setCreneauDialogOpen(false);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l’enregistrement.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAvailability = async (id: string) => {
    setSaving(true);
    setError(null);
    try {
      await api.deletePractitionerMeAvailability(id);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  if (!practitioner) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">
          {error ?? 'Profil praticien introuvable. Vérifiez que votre compte est bien configuré.'}
        </p>
      </Card>
    );
  }

  const name = `${practitioner.title || ''} ${practitioner.firstName} ${practitioner.lastName}`.trim();
  const specialtyDisplay = getSpecialtyLabel(practitioner.specialty, practitioner.customSpecialty);
  const avatar = `${practitioner.firstName?.[0] ?? ''}${practitioner.lastName?.[0] ?? ''}`.toUpperCase();
  const types: string[] = [];
  if (practitioner.offersVideo) types.push('Visioconférence');
  if (practitioner.offersPhone) types.push('Téléphone');
  types.push('Présentiel');
  const recurring = availability.filter((a: any) => a.type === 'RECURRING' && a.dayOfWeek != null);

  if (editing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Modifier mon profil</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditing(false)} disabled={saving}>
              <X className="w-4 h-4 mr-2" />
              Annuler
            </Button>
            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </div>
        </div>
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <Card className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Prénom</Label>
              <Input value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Nom</Label>
              <Input value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Titre</Label>
              <select
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full border border-input bg-background rounded-md px-2 py-1.5 text-sm"
              >
                <option value="Dr.">Dr.</option>
                <option value="Mme.">Mme.</option>
                <option value="M.">M.</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>N° professionnel</Label>
              <Input
                value={form.professionalId}
                onChange={(e) => setForm((f) => ({ ...f, professionalId: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Spécialité</Label>
            <select
              value={form.specialty}
              onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))}
              className="w-full border border-input bg-background rounded-md px-2 py-1.5 text-sm"
            >
              {SPECIALTY_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            {form.specialty === 'OTHER' && (
              <Input
                placeholder="Précisez la spécialité"
                value={form.customSpecialty}
                onChange={(e) => setForm((f) => ({ ...f, customSpecialty: e.target.value }))}
                className="mt-1"
              />
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Sous-spécialités (séparées par des virgules)</Label>
            <Input
              value={form.subSpecialties}
              onChange={(e) => setForm((f) => ({ ...f, subSpecialties: e.target.value }))}
              placeholder="TCC, Pleine conscience, …"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Langues (séparées par des virgules)</Label>
            <Input
              value={form.languages}
              onChange={(e) => setForm((f) => ({ ...f, languages: e.target.value }))}
              placeholder="Français, Anglais"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Bio</Label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              rows={4}
              className="w-full border border-input bg-background rounded-md px-2 py-1.5 text-sm min-h-[100px]"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Années d&apos;expérience</Label>
              <Input
                type="number"
                min={0}
                value={form.experience}
                onChange={(e) => setForm((f) => ({ ...f, experience: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Formation</Label>
              <Input value={form.education} onChange={(e) => setForm((f) => ({ ...f, education: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>URL avatar</Label>
              <Input value={form.avatarUrl} onChange={(e) => setForm((f) => ({ ...f, avatarUrl: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>URL couverture</Label>
              <Input value={form.coverUrl} onChange={(e) => setForm((f) => ({ ...f, coverUrl: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Durée par défaut (min)</Label>
              <Input
                type="number"
                min={15}
                max={120}
                value={form.defaultDuration}
                onChange={(e) => setForm((f) => ({ ...f, defaultDuration: parseInt(e.target.value, 10) || 50 }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Fuseau horaire</Label>
              <Input value={form.timezone} onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))} />
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.offersVideo}
                onChange={(e) => setForm((f) => ({ ...f, offersVideo: e.target.checked }))}
              />
              <span className="text-sm">Visioconférence</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.offersPhone}
                onChange={(e) => setForm((f) => ({ ...f, offersPhone: e.target.checked }))}
              />
              <span className="text-sm">Téléphone</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              />
              <span className="text-sm">Profil actif</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isAcceptingNewClients}
                onChange={(e) => setForm((f) => ({ ...f, isAcceptingNewClients: e.target.checked }))}
              />
              <span className="text-sm">Accepte de nouveaux patients</span>
            </label>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Disponibilités récurrentes
          </h2>
          <div className="space-y-3">
            {availability.filter((a: any) => a.type === 'RECURRING').map((a: any) => (
              <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-2 border-b border-border last:border-0">
                <span className="text-sm">
                  {DAYS[a.dayOfWeek] ?? `Jour ${a.dayOfWeek}`} — {a.startTime} – {a.endTime}
                  <span className="text-muted-foreground ml-1">({a.slotDuration} min)</span>
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditCreneauDialog(a)}
                    disabled={saving}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => handleDeleteAvailability(a.id)}
                    disabled={saving}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={openAddCreneauDialog} disabled={saving}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un créneau récurrent
            </Button>
          </div>
        </Card>

        <Dialog open={creneauDialogOpen} onOpenChange={setCreneauDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {creneauDialogMode === 'add' ? 'Ajouter un créneau' : 'Modifier le créneau'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Jour</Label>
                <select
                  value={creneauForm.dayOfWeek}
                  onChange={(e) => setCreneauForm((f) => ({ ...f, dayOfWeek: parseInt(e.target.value, 10) }))}
                  className="w-full border border-input bg-background rounded-md px-2 py-1.5 text-sm"
                >
                  {DAYS.map((d, i) => (
                    <option key={i} value={i}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Heure de début</Label>
                  <Input
                    type="time"
                    value={creneauForm.startTime}
                    onChange={(e) => setCreneauForm((f) => ({ ...f, startTime: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Heure de fin</Label>
                  <Input
                    type="time"
                    value={creneauForm.endTime}
                    onChange={(e) => setCreneauForm((f) => ({ ...f, endTime: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Durée des créneaux (minutes)</Label>
                <Input
                  type="number"
                  min={15}
                  max={120}
                  value={creneauForm.slotDuration}
                  onChange={(e) => setCreneauForm((f) => ({ ...f, slotDuration: parseInt(e.target.value, 10) || 50 }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreneauDialogOpen(false)} disabled={saving}>
                Annuler
              </Button>
              <Button onClick={handleSubmitCreneauDialog} disabled={saving}>
                {saving ? 'Enregistrement…' : creneauDialogMode === 'add' ? 'Ajouter' : 'Enregistrer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-foreground mb-2">Mon profil praticien</h1>
        <Button variant="outline" onClick={() => setEditing(true)}>
          <Pencil className="w-4 h-4 mr-2" />
          Modifier mon profil
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="relative h-32 bg-gradient-to-r from-primary/20 to-secondary/20" />
        <div className="px-6 pb-6 -mt-12 relative">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
            <div className="w-24 h-24 rounded-full border-4 border-background bg-primary flex items-center justify-center text-2xl font-semibold text-white shrink-0">
              {avatar}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-foreground">{name}</h2>
                {practitioner.isValidated && (
                  <span className="flex items-center gap-1 text-sm text-[#5CB85C]">
                    <CheckCircle className="w-4 h-4" />
                    Certifié HuntZen
                  </span>
                )}
              </div>
              <p className="text-primary font-medium mt-1">{specialtyDisplay}</p>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                {practitioner.experience != null && (
                  <span>{practitioner.experience} ans d&apos;expérience</span>
                )}
                {practitioner.timezone && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {practitioner.timezone}
                  </span>
                )}
              </div>
            </div>
          </div>
          {practitioner.bio && (
            <p className="text-muted-foreground mt-6">{practitioner.bio}</p>
          )}
          <div className="flex flex-wrap gap-2 mt-4">
            {types.map((t) => (
              <span key={t} className="px-3 py-1 bg-muted rounded-full text-sm">
                {t}
              </span>
            ))}
          </div>
          {(practitioner.languages?.length > 0) && (
            <p className="text-sm text-muted-foreground mt-2">
              Langues : {practitioner.languages.join(', ')}
            </p>
          )}
          {practitioner.user?.email && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
              <Mail className="w-4 h-4" />
              <span>{practitioner.user.email}</span>
            </div>
          )}
        </div>
      </Card>

      {practitioner.education && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Formation
          </h2>
          <p className="text-muted-foreground whitespace-pre-wrap">{practitioner.education}</p>
        </Card>
      )}

      {recurring.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Disponibilités
          </h2>
          <div className="space-y-2">
            {recurring.map((a: any) => (
              <div
                key={a.id}
                className="flex justify-between py-2 border-b border-border last:border-0"
              >
                <span>{DAYS[a.dayOfWeek] ?? `Jour ${a.dayOfWeek}`}</span>
                <span className="text-muted-foreground">
                  {a.startTime} – {a.endTime}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
