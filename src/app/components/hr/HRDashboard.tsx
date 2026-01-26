import { useState, useEffect } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Users, Download, Calendar, CheckCircle, Clock, Building2 } from 'lucide-react';
import { api } from '@/app/services/api';

export function HRDashboard() {
  const [company, setCompany] = useState<any>(null);
  const [stats, setStats] = useState<{
    totalEmployees: number;
    activeUsers: number;
    totalConsultations: number;
    consultationsThisMonth: number;
    completedConsultations: number;
    upcomingConsultations: number;
    departments: string[];
    employeesByDepartment: Record<string, number>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    Promise.all([
      api.getCompany().catch((err) => {
        console.warn('Failed to load company:', err);
        return null;
      }),
      api.getHRStats().catch((err) => {
        console.error('Failed to load HR stats:', err);
        return null;
      }),
    ]).then(([c, s]) => {
      setCompany(c);
      setStats(s);
      if (!s) {
        console.error('HR stats are null - export button will be disabled');
      }
    }).finally(() => setLoading(false));
  }, []);

  const handleExport = () => {
    if (!stats) return;
    
    setExporting(true);
    
    try {
      const now = new Date();
      const dateStr = now.toLocaleDateString('fr-FR', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      }).replace(/\//g, '-');
      
      // Create CSV content
      const csvRows: string[] = [];
      
      // Header
      csvRows.push(`Rapport RH - ${company?.name || 'HuntZen'}`);
      csvRows.push(`Date d'export: ${dateStr}`);
      csvRows.push('');
      
      // Statistics section
      csvRows.push('INDICATEURS RH');
      csvRows.push('Indicateur,Valeur');
      csvRows.push(`Employés inscrits,${stats.totalEmployees}`);
      csvRows.push(`Utilisateurs actifs (30 jours),${stats.activeUsers}`);
      csvRows.push(`Consultations totales,${stats.totalConsultations}`);
      csvRows.push(`Consultations ce mois,${stats.consultationsThisMonth}`);
      csvRows.push(`Séances réalisées,${stats.completedConsultations}`);
      csvRows.push(`Consultations à venir,${stats.upcomingConsultations}`);
      csvRows.push('');
      
      // Departments section
      if (stats.departments.length > 0) {
        csvRows.push('RÉPARTITION PAR DÉPARTEMENT');
        csvRows.push('Département,Nombre d\'employés');
        stats.departments.forEach((dept) => {
          csvRows.push(`${dept},${stats.employeesByDepartment[dept] ?? 0}`);
        });
      }
      
      // Convert to CSV string
      const csvContent = csvRows.join('\n');
      
      // Create blob and download
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rapport-rh-${company?.name?.toLowerCase().replace(/\s+/g, '-') || 'huntzen'}-${dateStr}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      alert('Erreur lors de l\'export du rapport. Veuillez réessayer.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded" />
          ))}
        </div>
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
        <Button 
          className="bg-primary hover:bg-primary/90" 
          onClick={handleExport}
          disabled={!stats || exporting}
        >
          <Download className="w-4 h-4 mr-2" />
          {exporting ? 'Export en cours...' : 'Exporter le rapport'}
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center text-white">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Employés inscrits</p>
              <p className="text-2xl font-bold">{stats?.totalEmployees ?? 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#5CB85C] flex items-center justify-center text-white">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Utilisateurs actifs</p>
              <p className="text-2xl font-bold">{stats?.activeUsers ?? 0}</p>
              <p className="text-xs text-muted-foreground mt-1">30 derniers jours</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center text-white">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Consultations totales</p>
              <p className="text-2xl font-bold">{stats?.totalConsultations ?? 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#F39C12] flex items-center justify-center text-white">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Séances réalisées</p>
              <p className="text-2xl font-bold">{stats?.completedConsultations ?? 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-primary" />
            Consultations ce mois
          </h2>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold">{stats?.consultationsThisMonth ?? 0}</p>
            <p className="text-sm text-muted-foreground">consultations</p>
          </div>
          {stats && stats.upcomingConsultations > 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              {stats.upcomingConsultations} consultation{stats.upcomingConsultations > 1 ? 's' : ''} à venir
            </p>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-primary" />
            Répartition par département
          </h2>
          {stats && stats.departments.length > 0 ? (
            <div className="space-y-2">
              {stats.departments.map((dept) => (
                <div key={dept} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{dept}</span>
                  <span className="text-sm text-muted-foreground">
                    {stats.employeesByDepartment[dept] ?? 0} employé{stats.employeesByDepartment[dept] !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Aucun département renseigné</p>
          )}
        </Card>
      </div>
    </div>
  );
}
