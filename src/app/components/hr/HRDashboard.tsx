import { useState, useEffect } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Users, Download } from 'lucide-react';
import { api } from '@/app/services/api';

export function HRDashboard() {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground mb-2">Tableau de Bord RH</h1>
          <p className="text-muted-foreground">
            {company?.name
              ? `Vue d'ensemble pour ${company.name}`
              : "Vue d'ensemble du bien-être de vos équipes"}
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90" disabled>
          <Download className="w-4 h-4 mr-2" />
          Exporter le rapport
        </Button>
      </div>

      <Card className="p-12 text-center">
        <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Indicateurs RH</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Les statistiques (employés inscrits, utilisateurs actifs, consultations, etc.) 
          seront affichées ici lorsqu&apos;elles seront disponibles depuis l&apos;API.
        </p>
      </Card>
    </div>
  );
}
