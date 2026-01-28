import { useEffect, useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Mail, Shield, Pencil, Check, X } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { api } from '@/app/services/api';

export function AdminProfile() {
  const [user, setUser] = useState<any | null>(null);
  const [company, setCompany] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [emailInput, setEmailInput] = useState('');
  const [firstNameInput, setFirstNameInput] = useState('');
  const [lastNameInput, setLastNameInput] = useState('');
  const [positionInput, setPositionInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      api.getMe().catch(() => null),
      api.getCompany().catch(() => null),
    ])
      .then(([u, c]) => {
        setUser(u || null);
        setCompany(c || null);
        if (u) {
          if (u.email) setEmailInput(u.email);
          if (u.firstName) setFirstNameInput(u.firstName);
          if (u.lastName) setLastNameInput(u.lastName);
          if (u.position) setPositionInput(u.position);
          if (u.phoneNumber) setPhoneInput(u.phoneNumber);
        }
      })
      .catch(() => setError('Impossible de charger votre profil administrateur.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-40 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">{error ?? 'Profil administrateur introuvable.'}</p>
      </Card>
    );
  }

  const role = user.role ?? 'ADMIN';
  const companyName = company?.name ?? '—';

  const handleCancelEdit = () => {
    setEditing(false);
    setEmailInput(user.email ?? '');
    setFirstNameInput(user.firstName ?? '');
    setLastNameInput(user.lastName ?? '');
    setPositionInput(user.position ?? '');
    setPhoneInput(user.phoneNumber ?? '');
    setError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await api.updateMe({
        email: emailInput.trim() || undefined,
        firstName: firstNameInput.trim() || undefined,
        lastName: lastNameInput.trim() || undefined,
        position: positionInput.trim() || undefined,
        phoneNumber: phoneInput.trim() || undefined,
      });
      setUser(updated || user);
      setEditing(false);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Erreur lors de la mise à jour du profil.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Mon profil administrateur</h1>
          <p className="text-sm text-muted-foreground">
            Informations liées à votre compte HuntZen (rôle {role}).
          </p>
        </div>
        {!editing ? (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => {
              setEmailInput(user.email ?? '');
              setFirstNameInput(user.firstName ?? '');
              setLastNameInput(user.lastName ?? '');
              setPositionInput(user.position ?? '');
              setPhoneInput(user.phoneNumber ?? '');
              setEditing(true);
            }}
          >
            <Pencil className="w-4 h-4" />
            Modifier
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              disabled={saving}
              onClick={handleCancelEdit}
            >
              <X className="w-4 h-4" />
              Annuler
            </Button>
            <Button
              size="sm"
              className="gap-2"
              disabled={saving}
              onClick={handleSave}
            >
              <Check className="w-4 h-4" />
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </div>
        )}
      </div>

      {error && (
        <Card className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/30">
          {error}
        </Card>
      )}

      <Card className="p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white">
            <Shield className="w-6 h-6" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Adresse e-mail</p>
              {editing ? (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  <Input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  <span className="font-medium text-foreground">{user.email ?? '—'}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Prénom</p>
                {editing ? (
                  <Input
                    value={firstNameInput}
                    onChange={(e) => setFirstNameInput(e.target.value)}
                  />
                ) : (
                  <p className="text-sm text-foreground">
                    {user.firstName ?? '—'}
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Nom</p>
                {editing ? (
                  <Input
                    value={lastNameInput}
                    onChange={(e) => setLastNameInput(e.target.value)}
                  />
                ) : (
                  <p className="text-sm text-foreground">
                    {user.lastName ?? '—'}
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Poste</p>
                {editing ? (
                  <Input
                    value={positionInput}
                    onChange={(e) => setPositionInput(e.target.value)}
                  />
                ) : (
                  <p className="text-sm text-foreground">
                    {user.position ?? '—'}
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Téléphone</p>
                {editing ? (
                  <Input
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                  />
                ) : (
                  <p className="text-sm text-foreground">
                    {user.phoneNumber ?? '—'}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-2">
              <p className="text-sm text-muted-foreground">
                Rôle&nbsp;: <span className="font-medium text-foreground">{role}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Entreprise&nbsp;: <span className="font-medium text-foreground">{companyName}</span>
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

