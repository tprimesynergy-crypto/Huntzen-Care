import { useEffect, useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/app/components/ui/dialog';
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
import { Phone, Globe, Plus, Pencil, Trash2, AlertCircle } from 'lucide-react';
import { api } from '@/app/services/api';

const DEFAULT_CONTACTS = [
  { name: 'Urgences Psychiatriques', number: '01 45 65 81 09', available: '24h/24 - 7j/7' },
  { name: 'SOS Amitié', number: '09 72 39 40 50', available: '24h/24 - 7j/7' },
  { name: 'Suicide Écoute', number: '01 45 39 40 00', available: '24h/24 - 7j/7' },
  { name: '3114 - Prévention Suicide', number: '3114', available: 'Gratuit - 24h/24' },
];

const DEFAULT_RESOURCES = [
  { name: 'Chat SOS Amitié', description: 'Discutez en direct avec un bénévole formé à l\'écoute', url: 'https://www.sos-amitie.com/web/guest/accueil' },
];

type Contact = { id: string; name: string; number: string; available: string | null; sortOrder: number };
type Resource = { id: string; name: string; description: string | null; url: string; sortOrder: number };

export function AdminEmergencyResources() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);

  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [contactEdit, setContactEdit] = useState<Contact | null>(null);
  const [contactName, setContactName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [contactAvailable, setContactAvailable] = useState('');
  const [contactSaving, setContactSaving] = useState(false);

  const [resourceDialogOpen, setResourceDialogOpen] = useState(false);
  const [resourceEdit, setResourceEdit] = useState<Resource | null>(null);
  const [resourceName, setResourceName] = useState('');
  const [resourceDescription, setResourceDescription] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');
  const [resourceSaving, setResourceSaving] = useState(false);

  const [deleteContact, setDeleteContact] = useState<Contact | null>(null);
  const [deleteResource, setDeleteResource] = useState<Resource | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([api.getAdminEmergencyContacts(), api.getAdminEmergencyResources()])
      .then(([c, r]) => {
        setContacts(Array.isArray(c) ? c : []);
        setResources(Array.isArray(r) ? r : []);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Erreur de chargement'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openAddContact = () => {
    setContactEdit(null);
    setContactName('');
    setContactNumber('');
    setContactAvailable('');
    setContactDialogOpen(true);
  };

  const openEditContact = (c: Contact) => {
    setContactEdit(c);
    setContactName(c.name);
    setContactNumber(c.number);
    setContactAvailable(c.available ?? '');
    setContactDialogOpen(true);
  };

  const saveContact = async () => {
    if (!contactName.trim() || !contactNumber.trim()) return;
    setContactSaving(true);
    try {
      if (contactEdit) {
        await api.updateAdminEmergencyContact(contactEdit.id, {
          name: contactName.trim(),
          number: contactNumber.trim(),
          available: contactAvailable.trim() || undefined,
        });
      } else {
        await api.createAdminEmergencyContact({
          name: contactName.trim(),
          number: contactNumber.trim(),
          available: contactAvailable.trim() || undefined,
        });
      }
      setContactDialogOpen(false);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la sauvegarde');
    } finally {
      setContactSaving(false);
    }
  };

  const openAddResource = () => {
    setResourceEdit(null);
    setResourceName('');
    setResourceDescription('');
    setResourceUrl('');
    setResourceDialogOpen(true);
  };

  const openEditResource = (r: Resource) => {
    setResourceEdit(r);
    setResourceName(r.name);
    setResourceDescription(r.description ?? '');
    setResourceUrl(r.url);
    setResourceDialogOpen(true);
  };

  const saveResource = async () => {
    if (!resourceName.trim() || !resourceUrl.trim()) return;
    setResourceSaving(true);
    try {
      if (resourceEdit) {
        await api.updateAdminEmergencyResource(resourceEdit.id, {
          name: resourceName.trim(),
          description: resourceDescription.trim() || undefined,
          url: resourceUrl.trim(),
        });
      } else {
        await api.createAdminEmergencyResource({
          name: resourceName.trim(),
          description: resourceDescription.trim() || undefined,
          url: resourceUrl.trim(),
        });
      }
      setResourceDialogOpen(false);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la sauvegarde');
    } finally {
      setResourceSaving(false);
    }
  };

  const handleDeleteContact = async () => {
    if (!deleteContact) return;
    setDeleting(true);
    try {
      await api.deleteAdminEmergencyContact(deleteContact.id);
      setDeleteContact(null);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la suppression');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteResource = async () => {
    if (!deleteResource) return;
    setDeleting(true);
    try {
      await api.deleteAdminEmergencyResource(deleteResource.id);
      setDeleteResource(null);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la suppression');
    } finally {
      setDeleting(false);
    }
  };

  const seedDefaults = async () => {
    setLoading(true);
    try {
      for (const c of DEFAULT_CONTACTS) {
        await api.createAdminEmergencyContact(c);
      }
      for (const r of DEFAULT_RESOURCES) {
        await api.createAdminEmergencyResource(r);
      }
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de l\'initialisation');
    } finally {
      setLoading(false);
    }
  };

  if (loading && contacts.length === 0 && resources.length === 0) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-2">
          Numéros d&apos;urgence et Ressources en ligne
        </h1>
        <p className="text-muted-foreground">
          Gérez les numéros d&apos;urgence et ressources affichés dans le bouton &quot;Besoin d&apos;aide immédiate&quot;.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 text-destructive px-4 py-3 text-sm" role="alert">
          {error}
        </div>
      )}

      {contacts.length === 0 && resources.length === 0 && (
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-10 h-10 text-amber-500 shrink-0" />
            <div>
              <h3 className="font-semibold mb-1">Aucune donnée configurée</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Ajoutez des numéros d&apos;urgence et des ressources en ligne, ou initialisez avec les valeurs par défaut.
              </p>
              <Button onClick={seedDefaults} disabled={loading}>
                Initialiser avec les valeurs par défaut
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Numéros d&apos;urgence
          </h2>
          <Button size="sm" onClick={openAddContact} className="gap-2">
            <Plus className="w-4 h-4" />
            Ajouter
          </Button>
        </div>
        {contacts.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun numéro configuré.</p>
        ) : (
          <div className="space-y-3">
            {contacts.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-lg font-bold text-primary">{c.number}</p>
                  {c.available && <p className="text-sm text-muted-foreground">{c.available}</p>}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openEditContact(c)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteContact(c)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Ressources en ligne
          </h2>
          <Button size="sm" onClick={openAddResource} className="gap-2">
            <Plus className="w-4 h-4" />
            Ajouter
          </Button>
        </div>
        {resources.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune ressource configurée.</p>
        ) : (
          <div className="space-y-3">
            {resources.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                <div>
                  <p className="font-medium">{r.name}</p>
                  {r.description && <p className="text-sm text-muted-foreground">{r.description}</p>}
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                    {r.url}
                  </a>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openEditResource(r)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteResource(r)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{contactEdit ? 'Modifier' : 'Ajouter'} un numéro d&apos;urgence</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="contact-name">Nom</Label>
              <Input id="contact-name" value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="ex. SOS Amitié" />
            </div>
            <div>
              <Label htmlFor="contact-number">Numéro</Label>
              <Input id="contact-number" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} placeholder="ex. 09 72 39 40 50" />
            </div>
            <div>
              <Label htmlFor="contact-available">Disponibilité (optionnel)</Label>
              <Input id="contact-available" value={contactAvailable} onChange={(e) => setContactAvailable(e.target.value)} placeholder="ex. 24h/24 - 7j/7" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setContactDialogOpen(false)}>Annuler</Button>
            <Button onClick={saveContact} disabled={contactSaving || !contactName.trim() || !contactNumber.trim()}>
              {contactSaving ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={resourceDialogOpen} onOpenChange={setResourceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{resourceEdit ? 'Modifier' : 'Ajouter'} une ressource en ligne</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="resource-name">Nom</Label>
              <Input id="resource-name" value={resourceName} onChange={(e) => setResourceName(e.target.value)} placeholder="ex. Chat SOS Amitié" />
            </div>
            <div>
              <Label htmlFor="resource-description">Description (optionnel)</Label>
              <Textarea id="resource-description" value={resourceDescription} onChange={(e) => setResourceDescription(e.target.value)} placeholder="ex. Discutez en direct avec un bénévole" rows={2} />
            </div>
            <div>
              <Label htmlFor="resource-url">URL</Label>
              <Input id="resource-url" value={resourceUrl} onChange={(e) => setResourceUrl(e.target.value)} placeholder="https://..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResourceDialogOpen(false)}>Annuler</Button>
            <Button onClick={saveResource} disabled={resourceSaving || !resourceName.trim() || !resourceUrl.trim()}>
              {resourceSaving ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteContact} onOpenChange={(o) => !o && setDeleteContact(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce numéro ?</AlertDialogTitle>
            <AlertDialogDescription>Êtes-vous sûr de vouloir supprimer &quot;{deleteContact?.name}&quot; ?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteContact} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteResource} onOpenChange={(o) => !o && setDeleteResource(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette ressource ?</AlertDialogTitle>
            <AlertDialogDescription>Êtes-vous sûr de vouloir supprimer &quot;{deleteResource?.name}&quot; ?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteResource} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
