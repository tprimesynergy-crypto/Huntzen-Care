import { useState, useEffect } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import {
  Stethoscope,
  Building2,
  Users,
  Calendar,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Activity,
} from 'lucide-react';
import { api } from '@/app/services/api';

type PlatformStats = {
  practitionersTotal: number;
  practitionersActive: number;
  practitionersValidated: number;
  companiesTotal: number;
  employeesTotal: number;
  consultationsTotal: number;
  consultationsThisMonth: number;
  consultationsCompleted: number;
};

interface AdminHuntzenDashboardProps {
  onNavigate?: (tab: string) => void;
}

export function AdminHuntzenDashboard({ onNavigate }: AdminHuntzenDashboardProps) {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getAdminPlatformStats()
      .then((data) => setStats(data))
      .catch((err) => console.error('Failed to load platform stats', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-48 bg-muted animate-pulse rounded-xl" />
          <div className="h-48 bg-muted animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header - distinct from RH dashboard */}
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Tableau de bord HuntZen
        </h1>
        <p className="mt-1 text-muted-foreground">
          Vue d&apos;ensemble de la plateforme : praticiens, entreprises, employés et consultations.
        </p>
      </div>

      {/* Main KPIs - 4 cards in a row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Praticiens actifs
              </p>
              <p className="text-3xl font-bold mt-1">
                {stats?.practitionersActive ?? 0}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.practitionersValidated ?? 0} validés · {stats?.practitionersTotal ?? 0} au total
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-primary" />
            </div>
          </div>
          {onNavigate && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 -ml-2 text-primary hover:text-primary"
              onClick={() => onNavigate('admin-practitioners')}
            >
              Gérer les praticiens
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </Card>

        <Card className="p-5 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Entreprises
              </p>
              <p className="text-3xl font-bold mt-1 text-emerald-700 dark:text-emerald-400">
                {stats?.companiesTotal ?? 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          {onNavigate && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 -ml-2 text-emerald-700 dark:text-emerald-400"
              onClick={() => onNavigate('admin-management-companies')}
            >
              Voir les entreprises
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </Card>

        <Card className="p-5 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Employés inscrits
              </p>
              <p className="text-3xl font-bold mt-1 text-blue-700 dark:text-blue-400">
                {stats?.employeesTotal ?? 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          {onNavigate && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 -ml-2 text-blue-700 dark:text-blue-400"
              onClick={() => onNavigate('employee-usage')}
            >
              Suivi employés
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </Card>

        <Card className="p-5 bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Consultations
              </p>
              <p className="text-3xl font-bold mt-1 text-amber-700 dark:text-amber-400">
                {stats?.consultationsTotal ?? 0}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.consultationsCompleted ?? 0} réalisées
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Secondary stats - 2 cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            Activité ce mois
          </h2>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{stats?.consultationsThisMonth ?? 0}</span>
            <span className="text-muted-foreground">consultations planifiées</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Sur l&apos;ensemble des entreprises de la plateforme.
          </p>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-primary" />
            Résumé plateforme
          </h2>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>
                <strong>{stats?.practitionersValidated ?? 0}</strong> praticiens validés
              </span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>
                <strong>{stats?.companiesTotal ?? 0}</strong> entreprises actives
              </span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>
                <strong>{stats?.consultationsCompleted ?? 0}</strong> séances réalisées au total
              </span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
