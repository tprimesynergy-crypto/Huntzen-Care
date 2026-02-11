import { useState, useEffect } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Switch } from '@/app/components/ui/switch';
import { Label } from '@/app/components/ui/label';
import { User, Bell, Lock, Globe, Shield, Trash2, Download } from 'lucide-react';
import { Separator } from '@/app/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/app/components/ui/alert-dialog';
import { api } from '@/app/services/api';

interface SettingsProps {
  userRole?: string | null;
  onAccountDeleted?: () => void;
}

export function Settings({ userRole, onAccountDeleted }: SettingsProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [sessionReminderEnabled, setSessionReminderEnabled] = useState(true);
  const [newArticlesEnabled, setNewArticlesEnabled] = useState(true);
  const [notifPrefsLoading, setNotifPrefsLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        if (userRole === 'EMPLOYEE') {
          const emp = await api.getEmployeeMe().catch(() => null);
          if (emp) {
            setFirstName(emp.firstName ?? '');
            setLastName(emp.lastName ?? '');
            setPhoneNumber(emp.phoneNumber ?? '');
            setEmail(emp.user?.email ?? '');
          }
        } else if (userRole === 'PRACTITIONER') {
          const prac = await api.getPractitionerMe().catch(() => null);
          if (prac) {
            setFirstName(prac.firstName ?? '');
            setLastName(prac.lastName ?? '');
            setPhoneNumber('');
            setEmail(prac.user?.email ?? '');
          }
        } else if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN_HUNTZEN' || userRole === 'ADMIN_RH') {
          const user = await api.getMe().catch(() => null);
          if (user) {
            setFirstName(user.firstName ?? '');
            setLastName(user.lastName ?? '');
            setPhoneNumber(user.phoneNumber ?? '');
            setEmail(user.email ?? '');
          }
        } else {
          const user = await api.getMe().catch(() => null);
          if (user) {
            setFirstName(user.firstName ?? '');
            setLastName(user.lastName ?? '');
            setPhoneNumber(user.phoneNumber ?? '');
            setEmail(user.email ?? '');
          }
        }
      } catch {
        setError('Impossible de charger votre profil.');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [userRole]);

  useEffect(() => {
    const loadPrefs = async () => {
      try {
        const prefs = await api.getNotificationPreferences().catch(() => null);
        if (prefs && typeof prefs === 'object') {
          setNotificationsEnabled(prefs.notificationsEnabled !== false);
          setSessionReminderEnabled(prefs.sessionReminderEnabled !== false);
          setNewArticlesEnabled(prefs.newArticlesEnabled !== false);
        }
      } catch {
        // keep defaults
      }
    };
    loadPrefs();
  }, []);

  const handleNotifPrefChange = async (
    key: 'notificationsEnabled' | 'sessionReminderEnabled' | 'newArticlesEnabled',
    value: boolean,
  ) => {
    const setters: Record<string, (v: boolean) => void> = {
      notificationsEnabled: setNotificationsEnabled,
      sessionReminderEnabled: setSessionReminderEnabled,
      newArticlesEnabled: setNewArticlesEnabled,
    };
    setters[key](value);
    setNotifPrefsLoading(true);
    try {
      await api.updateNotificationPreferences({ [key]: value });
    } catch {
      setters[key](!value); // revert on error
    } finally {
      setNotifPrefsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError(null);
    setPasswordSuccess(false);
    if (!currentPassword.trim()) {
      setPasswordError('Veuillez saisir votre mot de passe actuel.');
      return;
    }
    if (!newPassword.trim()) {
      setPasswordError('Veuillez saisir le nouveau mot de passe.');
      return;
    }
    if (newPassword.trim().length < 8) {
      setPasswordError('Le nouveau mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas.');
      return;
    }
    setPasswordSaving(true);
    try {
      await api.changeMyPassword(currentPassword.trim(), newPassword.trim());
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (e) {
      setPasswordError(e instanceof Error ? e.message : 'Erreur lors du changement de mot de passe.');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleDownloadData = async () => {
    setDownloadLoading(true);
    setDownloadError(null);
    try {
      const data = await api.getMyDataExport();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mes-donnees-huntzen-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      setDownloadError(e instanceof Error ? e.message : 'Erreur lors du téléchargement.');
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await api.deleteMyAccount();
      api.logout();
      onAccountDeleted?.();
    } catch (e) {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
      setDeleteError(e instanceof Error ? e.message : 'Erreur lors de la suppression.');
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      if (userRole === 'EMPLOYEE') {
        await api.updateEmployeeMe({
          firstName: firstName.trim() || undefined,
          lastName: lastName.trim() || undefined,
          phoneNumber: phoneNumber.trim() || undefined,
        });
      } else if (userRole === 'PRACTITIONER') {
        await api.updatePractitionerMe({
          firstName: firstName.trim() || undefined,
          lastName: lastName.trim() || undefined,
        });
      } else {
        await api.updateMe({
          firstName: firstName.trim() || undefined,
          lastName: lastName.trim() || undefined,
          phoneNumber: phoneNumber.trim() || undefined,
        });
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de l\'enregistrement.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-2">
          Paramètres
        </h1>
        <p className="text-muted-foreground">
          Gérez vos préférences et paramètres de confidentialité.
        </p>
      </div>

      {/* Profile Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Informations personnelles</h2>
            <p className="text-sm text-muted-foreground">
              Mettez à jour vos informations de profil
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 text-destructive px-4 py-3 text-sm" role="alert">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-md bg-green-500/10 text-green-700 dark:text-green-400 px-4 py-3 text-sm" role="alert">
              Modifications enregistrées.
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="bg-input-background mt-1"
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="bg-input-background mt-1"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              className="bg-input-background mt-1"
              disabled
            />
            <p className="text-xs text-muted-foreground mt-1">
              Votre email professionnel ne peut pas être modifié
            </p>
          </div>

          {userRole !== 'PRACTITIONER' && (
            <div>
              <Label htmlFor="phone">Téléphone (optionnel)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+33 6 12 34 56 78"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="bg-input-background mt-1"
                disabled={loading}
              />
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={handleSaveProfile}
              disabled={loading || saving}
            >
              {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
            <Bell className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Notifications</h2>
            <p className="text-sm text-muted-foreground">
              Choisissez comment vous souhaitez être notifié
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notif-enabled">Activer les notifications</Label>
              <p className="text-sm text-muted-foreground">
                {userRole === 'ADMIN_HUNTZEN' || userRole === 'ADMIN_RH' || userRole === 'SUPER_ADMIN'
                  ? 'Recevoir les notifications de la plateforme'
                  : 'Recevoir les notifications dans l\'application'}
              </p>
            </div>
            <Switch
              id="notif-enabled"
              checked={notificationsEnabled}
              onCheckedChange={(v) => handleNotifPrefChange('notificationsEnabled', v)}
              disabled={notifPrefsLoading}
            />
          </div>

          {(userRole === 'EMPLOYEE' || userRole === 'PRACTITIONER') && (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="rdv-reminder">Rappels de rendez-vous (1h avant)</Label>
                  <p className="text-sm text-muted-foreground">
                    Recevoir un rappel 1h avant vos consultations (employé et praticien)
                  </p>
                </div>
                <Switch
                  id="rdv-reminder"
                  checked={sessionReminderEnabled}
                  onCheckedChange={(v) => handleNotifPrefChange('sessionReminderEnabled', v)}
                  disabled={notifPrefsLoading}
                />
              </div>

              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="news-notif">Nouveaux articles publiés</Label>
                  <p className="text-sm text-muted-foreground">
                    Être notifié des nouveaux articles et conseils bien-être
                  </p>
                </div>
                <Switch
                  id="news-notif"
                  checked={newArticlesEnabled}
                  onCheckedChange={(v) => handleNotifPrefChange('newArticlesEnabled', v)}
                  disabled={notifPrefsLoading}
                />
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Privacy & Security */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#5CB85C]/10 rounded-lg flex items-center justify-center">
            <Lock className="w-5 h-5 text-[#5CB85C]" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Confidentialité et sécurité</h2>
            <p className="text-sm text-muted-foreground">
              Gérez vos paramètres de confidentialité
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm mb-1">Vos données sont protégées</h4>
                <p className="text-sm text-muted-foreground">
                  Toutes vos conversations, notes et informations médicales sont chiffrées de bout en bout. 
                  Votre employeur n'a aucun accès à vos données de santé.
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold mb-2">Modifier mon mot de passe</h4>
            {passwordError && (
              <div className="rounded-md bg-destructive/10 text-destructive px-4 py-3 text-sm mb-3" role="alert">
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="rounded-md bg-green-500/10 text-green-700 dark:text-green-400 px-4 py-3 text-sm mb-3" role="alert">
                Mot de passe modifié avec succès.
              </div>
            )}
            <div className="space-y-3">
              <Input
                type="password"
                placeholder="Mot de passe actuel"
                className="bg-input-background"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={passwordSaving}
              />
              <Input
                type="password"
                placeholder="Nouveau mot de passe"
                className="bg-input-background"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={passwordSaving}
              />
              <Input
                type="password"
                placeholder="Confirmer le nouveau mot de passe"
                className="bg-input-background"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={passwordSaving}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleChangePassword}
                disabled={passwordSaving}
              >
                {passwordSaving ? 'Modification…' : 'Changer le mot de passe'}
              </Button>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold mb-2">Télécharger mes données</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Conformément au RGPD, vous pouvez télécharger une copie de toutes vos données.
            </p>
            {downloadError && (
              <div className="rounded-md bg-destructive/10 text-destructive px-4 py-3 text-sm mb-3" role="alert">
                {downloadError}
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadData}
              disabled={downloadLoading}
            >
              <Download className="w-4 h-4 mr-2" />
              {downloadLoading ? 'Préparation…' : 'Télécharger mes données'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 border-destructive/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-destructive">Zone de danger</h2>
            <p className="text-sm text-muted-foreground">
              Actions irréversibles sur votre compte
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {deleteError && (
            <div className="rounded-md bg-destructive/10 text-destructive px-4 py-3 text-sm" role="alert">
              {deleteError}
            </div>
          )}
          <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
            <h4 className="font-semibold mb-1 text-destructive">Supprimer mon compte</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Cette action est définitive. Toutes vos données seront supprimées de manière sécurisée.
            </p>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
            >
              Supprimer mon compte
            </Button>
          </div>
        </div>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer mon compte</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.
                Toutes vos données (profil, consultations, messages, journal) seront définitivement supprimées.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteLoading}>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  handleDeleteAccount();
                }}
                disabled={deleteLoading}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteLoading ? 'Suppression…' : 'Supprimer définitivement'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Card>

      {/* Support Info */}
      <Card className="p-6 bg-muted/30">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Besoin d'aide avec vos paramètres ?
          </p>
          <Button variant="link" className="text-primary">
            Contactez le support
          </Button>
        </div>
      </Card>
    </div>
  );
}
