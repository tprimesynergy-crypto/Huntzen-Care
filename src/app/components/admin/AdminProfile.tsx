import { useEffect, useState, useRef } from 'react';
import { Card } from '@/app/components/ui/card';
import { Mail, Shield, Pencil, Check, X, Upload, Trash2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { api } from '@/app/services/api';

interface AdminProfileProps {
  onProfileUpdated?: () => void;
}

export function AdminProfile({ onProfileUpdated }: AdminProfileProps = {}) {
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
  const [uploading, setUploading] = useState<'avatar' | 'cover' | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

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

  const avatarDisplayUrl = user ? api.getUploadUrl(user.avatarUrl) || undefined : undefined;
  const coverDisplayUrl = user ? api.getUploadUrl(user.coverUrl) || undefined : undefined;

  const loadUser = () => {
    api.getMe().then((u) => u && setUser(u)).catch(() => {});
  };

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    e.target.value = '';
    setUploading('avatar');
    setError(null);
    try {
      const { url } = await api.uploadProfilePhoto(file, 'avatar');
      await api.updateMe({ avatarUrl: url });
      loadUser();
      onProfileUpdated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'upload.');
    } finally {
      setUploading(null);
    }
  };

  const handleCoverFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    e.target.value = '';
    setUploading('cover');
    setError(null);
    try {
      const { url } = await api.uploadProfilePhoto(file, 'cover');
      await api.updateMe({ coverUrl: url });
      loadUser();
      onProfileUpdated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'upload.');
    } finally {
      setUploading(null);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user) return;
    setUploading('avatar');
    setError(null);
    try {
      await api.updateMe({ avatarUrl: null });
      loadUser();
      onProfileUpdated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur.');
    } finally {
      setUploading(null);
    }
  };

  const handleRemoveCover = async () => {
    if (!user) return;
    setUploading('cover');
    setError(null);
    try {
      await api.updateMe({ coverUrl: null });
      loadUser();
      onProfileUpdated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur.');
    } finally {
      setUploading(null);
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

      <Card className="overflow-hidden">
        <input
          ref={coverInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={handleCoverFile}
        />
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={handleAvatarFile}
        />
        <div
          className="relative h-32 bg-gradient-to-r from-primary to-secondary group"
          style={coverDisplayUrl ? { backgroundImage: `url(${coverDisplayUrl})`, backgroundSize: 'cover' } : undefined}
        >
          <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
            <Button type="button" variant="secondary" size="sm" onClick={() => coverInputRef.current?.click()} disabled={!!uploading}>
              <Upload className="w-4 h-4 mr-1" />
              {uploading === 'cover' ? 'Envoi…' : 'Changer'}
            </Button>
            {(user.coverUrl || coverDisplayUrl) && (
              <Button type="button" variant="secondary" size="sm" onClick={handleRemoveCover} disabled={!!uploading}>
                <Trash2 className="w-4 h-4 mr-1" />
                Supprimer
              </Button>
            )}
          </div>
        </div>
        <div className="p-6 -mt-10 relative space-y-4">
          <div className="flex items-start gap-4">
            <div className="relative inline-block group/avatar">
              <div
                className="w-20 h-20 rounded-full border-4 border-background bg-primary flex items-center justify-center text-xl font-semibold text-primary-foreground shrink-0 overflow-hidden"
                style={avatarDisplayUrl ? { backgroundImage: `url(${avatarDisplayUrl})`, backgroundSize: 'cover' } : undefined}
              >
                {!avatarDisplayUrl && <Shield className="w-10 h-10" />}
              </div>
              <div className="absolute inset-0 flex items-center justify-center gap-1 rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity bg-black/40">
                <Button type="button" variant="secondary" size="icon" className="h-8 w-8" onClick={() => avatarInputRef.current?.click()} disabled={!!uploading} title="Changer la photo">
                  <Upload className="w-4 h-4" />
                </Button>
                {(user.avatarUrl || avatarDisplayUrl) && (
                  <Button type="button" variant="secondary" size="icon" className="h-8 w-8" onClick={handleRemoveAvatar} disabled={!!uploading} title="Supprimer la photo">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
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
        </div>
      </Card>
    </div>
  );
}

