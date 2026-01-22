import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Switch } from '@/app/components/ui/switch';
import { Label } from '@/app/components/ui/label';
import { User, Bell, Lock, Globe, Shield, Trash2 } from 'lucide-react';
import { Separator } from '@/app/components/ui/separator';

export function Settings() {
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Prénom</Label>
              <Input id="firstName" defaultValue="Marc" className="bg-input-background mt-1" />
            </div>
            <div>
              <Label htmlFor="lastName">Nom</Label>
              <Input id="lastName" defaultValue="Dupont" className="bg-input-background mt-1" />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              defaultValue="marc.dupont@entreprise.com" 
              className="bg-input-background mt-1"
              disabled
            />
            <p className="text-xs text-muted-foreground mt-1">
              Votre email professionnel ne peut pas être modifié
            </p>
          </div>

          <div>
            <Label htmlFor="phone">Téléphone (optionnel)</Label>
            <Input 
              id="phone" 
              type="tel" 
              placeholder="+33 6 12 34 56 78" 
              className="bg-input-background mt-1"
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button className="bg-primary hover:bg-primary/90">
              Enregistrer les modifications
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
              <Label htmlFor="email-notif">Notifications par email</Label>
              <p className="text-sm text-muted-foreground">
                Recevoir des emails pour les événements importants
              </p>
            </div>
            <Switch id="email-notif" defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-notif">Notifications push</Label>
              <p className="text-sm text-muted-foreground">
                Notifications sur votre appareil
              </p>
            </div>
            <Switch id="push-notif" defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="rdv-reminder">Rappels de rendez-vous</Label>
              <p className="text-sm text-muted-foreground">
                Recevoir un rappel 1h avant vos consultations
              </p>
            </div>
            <Switch id="rdv-reminder" defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="new-msg">Nouveaux messages</Label>
              <p className="text-sm text-muted-foreground">
                Être notifié des messages de vos praticiens
              </p>
            </div>
            <Switch id="new-msg" defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="news-notif">Actualités bien-être</Label>
              <p className="text-sm text-muted-foreground">
                Nouveaux articles et conseils
              </p>
            </div>
            <Switch id="news-notif" defaultChecked />
          </div>
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
            <div className="space-y-3">
              <Input 
                type="password" 
                placeholder="Mot de passe actuel" 
                className="bg-input-background"
              />
              <Input 
                type="password" 
                placeholder="Nouveau mot de passe" 
                className="bg-input-background"
              />
              <Input 
                type="password" 
                placeholder="Confirmer le nouveau mot de passe" 
                className="bg-input-background"
              />
              <Button variant="outline" size="sm">
                Changer le mot de passe
              </Button>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold mb-2">Télécharger mes données</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Conformément au RGPD, vous pouvez télécharger une copie de toutes vos données.
            </p>
            <Button variant="outline" size="sm">
              <Globe className="w-4 h-4 mr-2" />
              Demander mes données
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
          <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
            <h4 className="font-semibold mb-1 text-destructive">Supprimer mon compte</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Cette action est définitive. Toutes vos données seront supprimées de manière sécurisée.
            </p>
            <Button variant="destructive" size="sm">
              Supprimer mon compte
            </Button>
          </div>
        </div>
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
