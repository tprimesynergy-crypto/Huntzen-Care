import { useState, useEffect } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { api } from '@/app/services/api';
import { Heart, CheckCircle } from 'lucide-react';

interface RegisterWithInvitationProps {
  invitationToken: string;
  onSuccess: () => void;
  onBack?: () => void;
}

export function RegisterWithInvitation({ invitationToken, onSuccess, onBack }: RegisterWithInvitationProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [invitationInfo, setInvitationInfo] = useState<{
    companyName: string;
    email?: string;
    singleUse: boolean;
    autoApproved: boolean;
  } | null>(null);

  useEffect(() => {
    api
      .validateInvitationToken(invitationToken)
      .then((data) => {
        setInvitationInfo({
          companyName: data.companyName,
          email: data.email,
          singleUse: data.singleUse,
          autoApproved: data.autoApproved,
        });
        if (data.email) setEmail(data.email);
      })
      .catch(() => setError("Ce lien d'invitation est invalide ou a expiré."))
      .finally(() => setValidating(false));
  }, [invitationToken]);

  const [accountCreatedPendingValidation, setAccountCreatedPendingValidation] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setAccountCreatedPendingValidation(false);
    try {
      const res = await api.register(email.trim(), password, {
        invitationToken,
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
      });
      if (res.requiresValidation) {
        setAccountCreatedPendingValidation(true);
        return;
      }
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <p className="text-muted-foreground">Vérification du lien d&apos;invitation…</p>
        </Card>
      </div>
    );
  }

  if (error && !invitationInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md p-8">
          <div className="flex flex-col items-center gap-2 mb-6">
            <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center text-white">
              <Heart className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">Lien invalide</h1>
            <p className="text-sm text-destructive text-center">{error}</p>
          </div>
          {onBack && (
            <Button variant="outline" className="w-full" onClick={onBack}>
              Retour à la connexion
            </Button>
          )}
        </Card>
      </div>
    );
  }

  if (accountCreatedPendingValidation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md p-8 shadow-lg">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">Compte créé</h1>
            <p className="text-sm text-muted-foreground">
              Votre compte a été créé avec succès. Veuillez attendre la validation par l&apos;administration pour pouvoir vous connecter. Vous recevrez un accès dès que votre compte sera activé.
            </p>
            {onBack && (
              <Button className="w-full" onClick={onBack}>
                Retour à la connexion
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8 shadow-lg">
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center text-white">
            <Heart className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Rejoindre HuntZen Care</h1>
          <p className="text-sm text-muted-foreground text-center">
            Vous avez été invité par votre entreprise{invitationInfo?.companyName ? ` (${invitationInfo.companyName})` : ''}. Créez votre compte pour accéder à l&apos;espace bien-être.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reg-email">Email</Label>
            <Input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@entreprise.com"
              required
              autoComplete="email"
              disabled={loading || (invitationInfo?.singleUse === true && !!invitationInfo?.email)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reg-firstName">Prénom</Label>
              <Input
                id="reg-firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Prénom"
                autoComplete="given-name"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-lastName">Nom</Label>
              <Input
                id="reg-lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Nom"
                autoComplete="family-name"
                disabled={loading}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-password">Mot de passe</Label>
            <Input
              id="reg-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
              autoComplete="new-password"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">Minimum 8 caractères</p>
          </div>
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3">
              <p className="text-sm text-destructive font-medium">{error}</p>
            </div>
          )}
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? 'Création du compte…' : 'Créer mon compte'}
          </Button>
          {onBack && (
            <Button type="button" variant="ghost" className="w-full" onClick={onBack} disabled={loading}>
              Retour à la connexion
            </Button>
          )}
        </form>
      </Card>
    </div>
  );
}
