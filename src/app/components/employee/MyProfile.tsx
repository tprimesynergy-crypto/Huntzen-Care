import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Phone, Mail, Briefcase, Calendar, BookOpen, Heart, Pencil, X, Check } from 'lucide-react';
import { api } from '@/app/services/api';

interface MyProfileProps {
  onProfileUpdated?: () => void;
}

export function MyProfile({ onProfileUpdated }: MyProfileProps) {
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<{ consultations: number; journal: number; streak: number }>({
    consultations: 0,
    journal: 0,
    streak: 0,
  });
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    department: '',
    position: '',
    phoneNumber: '',
    bio: '',
  });

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [emp, cons, j] = await Promise.all([
        api.getEmployeeMe().catch(() => null),
        api.getConsultations().catch(() => []),
        api.getJournalStats().catch(() => ({ total: 0, streak: 0 })),
      ]);
      setProfile(emp ?? null);
      if (emp) {
        setForm({
          firstName: emp.firstName ?? '',
          lastName: emp.lastName ?? '',
          department: emp.department ?? '',
          position: emp.position ?? '',
          phoneNumber: emp.phoneNumber ?? '',
          bio: emp.bio ?? '',
        });
      }
      const list = Array.isArray(cons) ? cons : [];
      setStats({
        consultations: list.filter((c: any) => c.status === 'COMPLETED').length,
        journal: (j && typeof j === 'object' && 'total' in j) ? (j as { total: number }).total : 0,
        streak: (j && typeof j === 'object' && 'streak' in j) ? (j as { streak: number }).streak : 0,
      });
      const recent = list
        .sort((a: any, b: any) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
        .slice(0, 5)
        .map((c: any) => ({
          id: c.id,
          type: 'appointment',
          title: `Séance avec ${[c.practitioner?.title, c.practitioner?.firstName, c.practitioner?.lastName].filter(Boolean).join(' ')}`.trim(),
          date: new Date(c.scheduledAt).toLocaleDateString('fr-FR'),
          icon: Heart,
          color: 'text-primary',
        }));
      setActivity(recent);
    } catch (e) {
      setError('Erreur lors du chargement du profil.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      await api.updateEmployeeMe({
        firstName: form.firstName.trim() || undefined,
        lastName: form.lastName.trim() || undefined,
        department: form.department.trim() || undefined,
        position: form.position.trim() || undefined,
        phoneNumber: form.phoneNumber.trim() || undefined,
        bio: form.bio.trim() || undefined,
      });
      await loadProfile();
      setEditing(false);
      onProfileUpdated?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la mise à jour.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setForm({
        firstName: profile.firstName ?? '',
        lastName: profile.lastName ?? '',
        department: profile.department ?? '',
        position: profile.position ?? '',
        phoneNumber: profile.phoneNumber ?? '',
        bio: profile.bio ?? '',
      });
    }
    setError(null);
    setEditing(false);
  };

  if (loading && !profile) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  if (!profile) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">Profil introuvable.</p>
      </Card>
    );
  }

  const name = `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim();
  const companyName = profile.company?.name ?? '—';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Mon profil</h1>
        {!editing ? (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="gap-2">
            <Pencil className="w-4 h-4" />
            Modifier mon profil
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleCancel} disabled={saving} className="gap-2">
              <X className="w-4 h-4" />
              Annuler
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving} className="gap-2">
              <Check className="w-4 h-4" />
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 text-destructive px-4 py-3 text-sm" role="alert">
          {error}
        </div>
      )}

      {editing ? (
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                value={form.firstName}
                onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                placeholder="Prénom"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                value={form.lastName}
                onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                placeholder="Nom"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={profile.user?.email ?? ''}
                disabled
                className="bg-muted cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">L&apos;email ne peut pas être modifié ici.</p>
            </div>
            <div className="space-y-2">
              <Label>Entreprise</Label>
              <Input
                value={profile.company?.name ?? '—'}
                disabled
                className="bg-muted cursor-not-allowed"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Téléphone</Label>
              <Input
                id="phoneNumber"
                value={form.phoneNumber}
                onChange={(e) => setForm((p) => ({ ...p, phoneNumber: e.target.value }))}
                placeholder="+33 6 12 34 56 78"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="position">Poste</Label>
              <Input
                id="position"
                value={form.position}
                onChange={(e) => setForm((p) => ({ ...p, position: e.target.value }))}
                placeholder="Ex. Chargé de projet"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="department">Département / Service</Label>
              <Input
                id="department"
                value={form.department}
                onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
                placeholder="Ex. Ressources humaines"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="bio">À propos de moi</Label>
              <Textarea
                id="bio"
                value={form.bio}
                onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                placeholder="Quelques mots sur vous…"
                rows={4}
              />
            </div>
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div
            className="relative h-48 bg-gradient-to-r from-primary to-secondary"
            style={profile.coverUrl ? { backgroundImage: `url(${profile.coverUrl})`, backgroundSize: 'cover' } : undefined}
          />
          <div className="px-6 pb-6 -mt-16 relative">
            <div
              className="w-24 h-24 rounded-full border-4 border-background bg-muted flex items-center justify-center text-2xl font-semibold text-foreground shrink-0 overflow-hidden"
              style={profile.avatarUrl ? { backgroundImage: `url(${profile.avatarUrl})`, backgroundSize: 'cover' } : undefined}
            >
              {!profile.avatarUrl && `${profile.firstName?.[0] ?? ''}${profile.lastName?.[0] ?? ''}`}
            </div>
            <h2 className="text-2xl font-bold text-foreground mt-4">{name || '—'}</h2>
            <div className="flex flex-wrap gap-3 mt-2 text-muted-foreground text-sm">
              <span className="flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                {profile.position ?? '—'}
                {companyName !== '—' && ` chez ${companyName}`}
              </span>
              {profile.department && (
                <span className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  {profile.department}
                </span>
              )}
            </div>
            {profile.bio && <p className="text-muted-foreground mt-4 whitespace-pre-wrap">{profile.bio}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              {profile.user?.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-medium">{profile.user.email}</span>
                </div>
              )}
              {profile.phoneNumber && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-medium">{profile.phoneNumber}</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5 text-center">
          <Calendar className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold">{stats.consultations}</p>
          <p className="text-sm text-muted-foreground">Séances réalisées</p>
        </Card>
        <Card className="p-5 text-center">
          <BookOpen className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold">{stats.journal}</p>
          <p className="text-sm text-muted-foreground">Entrées journal</p>
        </Card>
        <Card className="p-5 text-center">
          <span className="text-2xl font-bold">{stats.streak}</span>
          <p className="text-sm text-muted-foreground mt-2">Jours consécutifs</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Activité récente</h3>
        {activity.length === 0 ? (
          <p className="text-muted-foreground">Aucune activité récente.</p>
        ) : (
          <div className="space-y-4">
            {activity.map((a) => (
              <div key={a.id} className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-primary shrink-0">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">{a.title}</h4>
                  <p className="text-sm text-muted-foreground">{a.date}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
