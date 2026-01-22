import { useState, useEffect } from 'react';
import { Card } from '@/app/components/ui/card';
import { Users } from 'lucide-react';
import { api } from '@/app/services/api';

export function EmployeeUsage() {
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
        <div className="h-32 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-2">Suivi Employés</h1>
        <p className="text-muted-foreground">
          {company?.name ? `Usage HuntZen pour ${company.name}` : 'Usage par département et employé'}
        </p>
      </div>

      <Card className="p-12 text-center">
        <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Données d&apos;usage</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Les statistiques d&apos;usage par département et par employé seront disponibles 
          lorsque les endpoints dédiés seront en place.
        </p>
      </Card>
    </div>
  );
}
