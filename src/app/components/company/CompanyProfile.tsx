import { useState, useEffect, useRef } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { MapPin, Briefcase, Building2, Pencil, X, Check, Upload, Trash2 } from 'lucide-react';
import { api } from '@/app/services/api';

interface CompanyProfileProps {
  userRole?: string | null;
}

export function CompanyProfile({ userRole }: CompanyProfileProps) {
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<'logo' | 'cover' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const canEdit = userRole === 'ADMIN_RH' || userRole === 'ADMIN_HUNTZEN' || userRole === 'SUPER_ADMIN';
  const canEditIsActive = userRole === 'ADMIN_HUNTZEN' || userRole === 'SUPER_ADMIN';

  const [form, setForm] = useState({
    name: '',
    slug: '',
    legalName: '',
    siret: '',
    sector: '',
    address: '',
    city: '',
    country: 'France',
    logoUrl: '',
    coverUrl: '',
    isActive: true,
  });

  const loadCompany = () => {
    setLoading(true);
    api
      .getCompany()
      .then((c) => {
        setCompany(c);
        if (c) {
          setForm({
            name: c.name ?? '',
            slug: c.slug ?? '',
            legalName: c.legalName ?? '',
            siret: c.siret ?? '',
            sector: c.sector ?? '',
            address: c.address ?? '',
            city: c.city ?? '',
            country: c.country ?? 'France',
            logoUrl: c.logoUrl ?? '',
            coverUrl: c.coverUrl ?? '',
            isActive: c.isActive ?? true,
          });
        }
      })
      .catch(() => setCompany(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCompany();
  }, []);

  const handleSave = async () => {
    if (!company) return;
    setSaving(true);
    setError(null);
    try {
      await api.updateAdminCompany(company.id, {
        name: form.name.trim() || undefined,
        slug: form.slug.trim() || undefined,
        legalName: form.legalName.trim() || null,
        siret: form.siret.trim() || null,
        sector: form.sector.trim() || null,
        address: form.address.trim() || null,
        city: form.city.trim() || null,
        country: form.country.trim() || 'France',
        logoUrl: form.logoUrl.trim() || null,
        coverUrl: form.coverUrl.trim() || null,
        ...(canEditIsActive ? { isActive: form.isActive } : {}),
      });
      setEditing(false);
      loadCompany();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de l\'enregistrement.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !company) return;
    e.target.value = '';
    setUploading('logo');
    setError(null);
    try {
      const { url } = await api.uploadCompanyPhoto(file, 'logo', company.id);
      await api.updateAdminCompany(company.id, { logoUrl: url });
      loadCompany();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'upload.');
    } finally {
      setUploading(null);
    }
  };

  const handleCoverFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !company) return;
    e.target.value = '';
    setUploading('cover');
    setError(null);
    try {
      const { url } = await api.uploadCompanyPhoto(file, 'cover', company.id);
      await api.updateAdminCompany(company.id, { coverUrl: url });
      loadCompany();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'upload.');
    } finally {
      setUploading(null);
    }
  };

  const handleRemoveLogo = async () => {
    if (!company) return;
    setUploading('logo');
    setError(null);
    try {
      await api.updateAdminCompany(company.id, { logoUrl: null });
      loadCompany();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur.');
    } finally {
      setUploading(null);
    }
  };

  const handleRemoveCover = async () => {
    if (!company) return;
    setUploading('cover');
    setError(null);
    try {
      await api.updateAdminCompany(company.id, { coverUrl: null });
      loadCompany();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur.');
    } finally {
      setUploading(null);
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

  if (!company) {
    return (
      <Card className="p-12 text-center">
        <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Aucune entreprise associée.</p>
      </Card>
    );
  }

  const logoDisplayUrl = api.getUploadUrl(company.logoUrl) || company.logoUrl;
  const coverDisplayUrl = api.getUploadUrl(company.coverUrl) || company.coverUrl;

  if (editing && canEdit) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-foreground">Modifier l&apos;entreprise</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditing(false)} disabled={saving}>
              <X className="w-4 h-4 mr-2" />
              Annuler
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              <Check className="w-4 h-4 mr-2" />
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </div>
        </div>
        {error && (
          <Card className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/30">
            {error}
          </Card>
        )}
        <Card className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Nom</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Slug</Label>
              <Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="identifiant-url" />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>Raison sociale</Label>
              <Input value={form.legalName} onChange={(e) => setForm((f) => ({ ...f, legalName: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>SIRET</Label>
              <Input value={form.siret} onChange={(e) => setForm((f) => ({ ...f, siret: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Secteur</Label>
              <Input value={form.sector} onChange={(e) => setForm((f) => ({ ...f, sector: e.target.value }))} />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>Adresse</Label>
              <Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Ville</Label>
              <Input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Pays</Label>
              <Input value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Logo</Label>
            <div className="flex items-center gap-3">
              <input
                ref={logoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={handleLogoFile}
              />
              <div
                className="w-20 h-20 rounded-xl border border-border bg-muted overflow-hidden flex items-center justify-center shrink-0"
                style={logoDisplayUrl ? { backgroundImage: `url(${logoDisplayUrl})`, backgroundSize: 'cover' } : undefined}
              >
                {!logoDisplayUrl && <Building2 className="w-10 h-10 text-muted-foreground" />}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => logoInputRef.current?.click()} disabled={!!uploading}>
                  {uploading === 'logo' ? 'Envoi…' : 'Téléverser'}
                </Button>
                {logoDisplayUrl && (
                  <Button type="button" variant="ghost" size="sm" onClick={handleRemoveLogo} disabled={!!uploading}>
                    Supprimer
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Image de couverture</Label>
            <div className="flex items-center gap-3">
              <input
                ref={coverInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={handleCoverFile}
              />
              <div
                className="w-full max-w-xs h-24 rounded-lg border border-border bg-muted overflow-hidden"
                style={coverDisplayUrl ? { backgroundImage: `url(${coverDisplayUrl})`, backgroundSize: 'cover' } : undefined}
              >
                {!coverDisplayUrl && (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => coverInputRef.current?.click()} disabled={!!uploading}>
                  {uploading === 'cover' ? 'Envoi…' : 'Téléverser'}
                </Button>
                {coverDisplayUrl && (
                  <Button type="button" variant="ghost" size="sm" onClick={handleRemoveCover} disabled={!!uploading}>
                    Supprimer
                  </Button>
                )}
              </div>
            </div>
          </div>

          {canEditIsActive && (
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="company-isActive"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="rounded border-border"
              />
              <Label htmlFor="company-isActive">Entreprise active</Label>
            </div>
          )}
        </Card>
      </div>
    );
  }

  const address = [company.address, company.city, company.country].filter(Boolean).join(', ') || '—';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Mon entreprise</h1>
        {canEdit && (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil className="w-4 h-4 mr-2" />
            Modifier
          </Button>
        )}
      </div>
      <Card className="overflow-hidden">
        <div className="relative h-48 bg-gradient-to-r from-primary/20 to-secondary/20">
          {coverDisplayUrl && (
            <img src={coverDisplayUrl} alt="" className="w-full h-full object-cover" />
          )}
        </div>
        <div className="px-6 pb-6 -mt-12 relative flex flex-col md:flex-row gap-6 items-start md:items-end">
          <div className="w-24 h-24 rounded-xl border-4 border-background bg-muted overflow-hidden flex items-center justify-center shrink-0">
            {logoDisplayUrl ? (
              <img src={logoDisplayUrl} alt={company.name} className="w-full h-full object-cover" />
            ) : (
              <Building2 className="w-12 h-12 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground">{company.name}</h2>
            {company.legalName && (
              <p className="text-muted-foreground mt-1">{company.legalName}</p>
            )}
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
              {company.sector && (
                <span className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  {company.sector}
                </span>
              )}
              {company.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {company.city}, {company.country || 'France'}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {address !== '—' && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span className="text-muted-foreground">{address}</span>
              </div>
            )}
            {company.siret && (
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="w-4 h-4 text-primary shrink-0" />
                <span className="text-muted-foreground">SIRET {company.siret}</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
