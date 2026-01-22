import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Clock, Download, Search, Calendar, TrendingUp, Users } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';

export function PractitionerBilling() {
  const practitioners = [
    {
      id: 1,
      name: 'Dr. Sophie Martin',
      specialty: 'Psychologue clinicienne',
      thisMonth: {
        sessions: 87,
        hours: 72.5,
        avgDuration: 50,
      },
      lastMonth: {
        sessions: 78,
        hours: 65,
      },
      total: {
        sessions: 328,
        hours: 273,
      },
    },
    {
      id: 2,
      name: 'Dr. Thomas Lefebvre',
      specialty: 'Psychothérapeute',
      thisMonth: {
        sessions: 62,
        hours: 51.5,
        avgDuration: 50,
      },
      lastMonth: {
        sessions: 58,
        hours: 48.5,
      },
      total: {
        sessions: 245,
        hours: 204,
      },
    },
    {
      id: 3,
      name: 'Dr. Marie Dubois',
      specialty: 'Psychiatre',
      thisMonth: {
        sessions: 43,
        hours: 35.5,
        avgDuration: 49,
      },
      lastMonth: {
        sessions: 45,
        hours: 37.5,
      },
      total: {
        sessions: 198,
        hours: 165,
      },
    },
    {
      id: 4,
      name: 'Dr. Jean Moreau',
      specialty: 'Psychologue du travail',
      thisMonth: {
        sessions: 56,
        hours: 46.5,
        avgDuration: 50,
      },
      lastMonth: {
        sessions: 52,
        hours: 43.5,
      },
      total: {
        sessions: 215,
        hours: 179,
      },
    },
  ];

  const stats = [
    {
      icon: Users,
      label: 'Praticiens actifs',
      value: '4',
      change: 'Ce mois',
      color: 'bg-primary',
    },
    {
      icon: Calendar,
      label: 'Total consultations',
      value: '248',
      change: 'Ce mois',
      color: 'bg-secondary',
    },
    {
      icon: Clock,
      label: 'Total heures',
      value: '206h',
      change: 'Ce mois',
      color: 'bg-[#5CB85C]',
    },
    {
      icon: TrendingUp,
      label: 'Durée moyenne',
      value: '50 min',
      change: 'Par séance',
      color: 'bg-[#F39C12]',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground mb-2">
            Suivi des Consultations - Praticiens
          </h1>
          <p className="text-muted-foreground">
            Temps de consultation par praticien pour facturation
          </p>
        </div>
        <div className="flex gap-3">
          <Select defaultValue="current">
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Mois en cours</SelectItem>
              <SelectItem value="last">Mois dernier</SelectItem>
              <SelectItem value="quarter">Ce trimestre</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-primary hover:bg-primary/90">
            <Download className="w-4 h-4 mr-2" />
            Exporter (CSV)
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-5">
              <div className="flex items-start gap-4">
                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center text-white`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Search & Filters */}
      <Card className="p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Rechercher un praticien..."
              className="pl-10"
            />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes spécialités</SelectItem>
              <SelectItem value="psycho">Psychologue</SelectItem>
              <SelectItem value="psychiatre">Psychiatre</SelectItem>
              <SelectItem value="psychotherapeute">Psychothérapeute</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Practitioners Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left p-4 font-semibold">Praticien</th>
                <th className="text-left p-4 font-semibold">Spécialité</th>
                <th className="text-center p-4 font-semibold">Séances ce mois</th>
                <th className="text-center p-4 font-semibold">Heures ce mois</th>
                <th className="text-center p-4 font-semibold">Durée moy.</th>
                <th className="text-center p-4 font-semibold">Évolution</th>
                <th className="text-center p-4 font-semibold">Total (cumulé)</th>
                <th className="text-right p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {practitioners.map((practitioner) => {
                const evolution = ((practitioner.thisMonth.sessions - practitioner.lastMonth.sessions) / practitioner.lastMonth.sessions * 100).toFixed(0);
                const isPositive = Number(evolution) >= 0;
                
                return (
                  <tr key={practitioner.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                          {practitioner.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium">{practitioner.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {practitioner.specialty}
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-semibold text-lg">{practitioner.thisMonth.sessions}</span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-semibold text-lg">{practitioner.thisMonth.hours}h</span>
                        <span className="text-xs text-muted-foreground">
                          ({practitioner.thisMonth.sessions * practitioner.thisMonth.avgDuration} min)
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-sm">{practitioner.thisMonth.avgDuration} min</span>
                    </td>
                    <td className="p-4 text-center">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        isPositive ? 'bg-[#5CB85C]/10 text-[#5CB85C]' : 'bg-red-100 text-red-600'
                      }`}>
                        <TrendingUp className={`w-3 h-3 ${!isPositive ? 'rotate-180' : ''}`} />
                        {isPositive ? '+' : ''}{evolution}%
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-medium">{practitioner.total.sessions} séances</span>
                        <span className="text-xs text-muted-foreground">{practitioner.total.hours}h</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="sm">
                        Détails
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-muted/50 border-t-2 border-border">
              <tr>
                <td colSpan={2} className="p-4 font-semibold">TOTAL</td>
                <td className="p-4 text-center font-bold text-lg">248</td>
                <td className="p-4 text-center font-bold text-lg">206h</td>
                <td className="p-4 text-center">50 min</td>
                <td className="p-4"></td>
                <td className="p-4 text-center font-medium">986 séances</td>
                <td className="p-4"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* Monthly Detail Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">📊 Répartition ce mois</h3>
          <div className="space-y-3">
            {practitioners.map((p) => {
              const percentage = (p.thisMonth.sessions / 248 * 100).toFixed(1);
              return (
                <div key={p.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{p.name.split(' ')[1]}</span>
                    <span className="text-sm text-muted-foreground">{percentage}% ({p.thisMonth.sessions})</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
          <h3 className="text-lg font-semibold mb-4">💡 Informations importantes</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Temps facturable</p>
                <p className="text-muted-foreground">Seules les séances confirmées et terminées sont comptabilisées</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Période de facturation</p>
                <p className="text-muted-foreground">Du 1er au dernier jour du mois (clôture automatique)</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Download className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Export mensuel</p>
                <p className="text-muted-foreground">Disponible au format CSV pour import dans votre comptabilité</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
