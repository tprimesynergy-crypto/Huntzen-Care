import { useState, useEffect } from 'react';
import { Card } from '@/app/components/ui/card';
import { MapPin, Briefcase, Building2 } from 'lucide-react';
import { api } from '@/app/services/api';

export function CompanyProfile() {
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCompany()
      .then((c) => setCompany(c))
      .catch(() => setCompany(null))
      .finally(() => setLoading(false));
  }, []);

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

  const address = [company.address, company.city, company.country].filter(Boolean).join(', ') || '—';

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="relative h-48 bg-gradient-to-r from-primary/20 to-secondary/20">
          {company.coverUrl && (
            <img src={company.coverUrl} alt="" className="w-full h-full object-cover" />
          )}
        </div>
        <div className="px-6 pb-6 -mt-12 relative flex flex-col md:flex-row gap-6 items-start md:items-end">
          <div className="w-24 h-24 rounded-xl border-4 border-background bg-muted overflow-hidden flex items-center justify-center shrink-0">
            {company.logoUrl ? (
              <img src={company.logoUrl} alt={company.name} className="w-full h-full object-cover" />
            ) : (
              <Building2 className="w-12 h-12 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{company.name}</h1>
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
