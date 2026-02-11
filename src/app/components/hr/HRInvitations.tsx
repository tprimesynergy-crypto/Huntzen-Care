import { useState, useEffect } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Switch } from '@/app/components/ui/switch';
import { Link2, Copy, Check, UserPlus, Users } from 'lucide-react';
import { api } from '@/app/services/api';

type InvitationType = 'unique' | 'shared';

export function HRInvitations() {
  const [type, setType] = useState<InvitationType>('shared');
  const [email, setEmail] = useState('');
  const [autoApproved, setAutoApproved] = useState(false);
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCreated, setLastCreated] = useState<{
    link: string;
    type: InvitationType;
    autoApproved: boolean;
    email?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [list, setList] = useState<any[]>([]);
  const [listLoading, setListLoading] = useState(true);

  const loadList = () => {
    setListLoading(true);
    api
      .getHRInvitations()
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setListLoading(false));
  };

  useEffect(() => {
    loadList();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLastCreated(null);
    if (type === 'unique' && !email.trim()) {
      setError("L'email est requis pour une invitation nominative.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.createHRInvitation({
        type,
        email: type === 'unique' ? email.trim() : undefined,
        autoApproved,
        expiresInDays: expiresInDays || 7,
      });
      setLastCreated({
        link: res.link,
        type,
        autoApproved: res.autoApproved,
        email: res.email,
      });
      if (type === 'unique') setEmail('');
      loadList();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du lien.');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (!lastCreated?.link) return;
    navigator.clipboard.writeText(lastCreated.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-2">Inviter des employés</h1>
        <p className="text-muted-foreground">
          Créez un lien unique pour une personne ou un lien partagé pour inviter toute l&apos;équipe. Vous pouvez activer la validation automatique des comptes ou les valider vous-même.
        </p>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Link2 className="w-5 h-5" />
          Nouveau lien d&apos;invitation
        </h2>
        <form onSubmit={handleCreate} className="space-y-6">
          <div className="space-y-2">
            <Label>Type d&apos;invitation</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  checked={type === 'shared'}
                  onChange={() => setType('shared')}
                  className="rounded-full border-input"
                />
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Lien partagé — tous les employés (un seul lien à partager)
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  checked={type === 'unique'}
                  onChange={() => setType('unique')}
                  className="rounded-full border-input"
                />
                <span className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Lien unique — une personne (email requis)
                </span>
              </label>
            </div>
          </div>

          {type === 'unique' && (
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email de la personne invitée</Label>
              <Input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="prenom.nom@entreprise.com"
              />
            </div>
          )}

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label htmlFor="auto-approved" className="text-base font-medium">
                Validation automatique des comptes créés
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Si activé, les personnes qui s&apos;inscrivent via ce lien pourront se connecter immédiatement. Sinon, vous devrez valider chaque compte dans « Suivi Employés ».
              </p>
            </div>
            <Switch
              id="auto-approved"
              checked={autoApproved}
              onCheckedChange={setAutoApproved}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expires">Expiration du lien (jours)</Label>
            <Input
              id="expires"
              type="number"
              min={1}
              max={365}
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(parseInt(e.target.value, 10) || 7)}
            />
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? 'Génération…' : 'Générer le lien'}
          </Button>
        </form>

        {lastCreated && (
          <div className="mt-6 pt-6 border-t space-y-2">
            <p className="text-sm font-medium text-foreground">Lien généré</p>
            <div className="flex gap-2">
              <Input readOnly value={lastCreated.link} className="font-mono text-sm" />
              <Button type="button" variant="outline" size="icon" onClick={copyLink}>
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {lastCreated.type === 'unique' && lastCreated.email && `Pour ${lastCreated.email}. `}
              {lastCreated.autoApproved
                ? 'Validation automatique activée.'
                : 'Les comptes devront être validés par vos soins.'}
            </p>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Liens créés récemment</h2>
        {listLoading ? (
          <p className="text-muted-foreground text-sm">Chargement…</p>
        ) : list.length === 0 ? (
          <p className="text-muted-foreground text-sm">Aucun lien créé pour le moment.</p>
        ) : (
          <ul className="space-y-2">
            {list.map((inv) => (
              <li
                key={inv.id}
                className="flex items-center justify-between text-sm py-2 border-b last:border-0"
              >
                <span>
                  {inv.singleUse ? 'Lien unique' : 'Lien partagé'}
                  {inv.email && ` — ${inv.email}`}
                  {inv.usedAt && ' (utilisé)'}
                  {' · '}
                  {inv.autoApproved ? 'Validation auto' : 'Validation manuelle'}
                </span>
                <span className="text-muted-foreground">
                  {inv.expiresAt ? new Date(inv.expiresAt).toLocaleDateString('fr-FR') : '—'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
