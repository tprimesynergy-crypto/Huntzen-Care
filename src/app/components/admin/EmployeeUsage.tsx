import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Clock, Download, Search, Calendar, TrendingUp, Users, AlertCircle, Shield } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';

export function EmployeeUsage() {
  // Données anonymisées par département (seuil minimum 10 employés)
  const departmentStats = [
    {
      name: 'Développement',
      totalEmployees: 85,
      activeUsers: 68,
      thisMonth: {
        sessions: 142,
        hours: 118.5,
        avgPerEmployee: 1.67,
      },
      total: {
        sessions: 524,
        hours: 437,
      },
    },
    {
      name: 'Marketing & Communication',
      totalEmployees: 42,
      activeUsers: 35,
      thisMonth: {
        sessions: 78,
        hours: 65,
        avgPerEmployee: 1.86,
      },
      total: {
        sessions: 298,
        hours: 248.5,
      },
    },
    {
      name: 'Ventes',
      totalEmployees: 38,
      activeUsers: 28,
      thisMonth: {
        sessions: 58,
        hours: 48.5,
        avgPerEmployee: 1.53,
      },
      total: {
        sessions: 215,
        hours: 179,
      },
    },
    {
      name: 'RH & Administration',
      totalEmployees: 25,
      activeUsers: 18,
      thisMonth: {
        sessions: 42,
        hours: 35,
        avgPerEmployee: 1.68,
      },
      total: {
        sessions: 168,
        hours: 140,
      },
    },
    {
      name: 'Support Client',
      totalEmployees: 35,
      activeUsers: 26,
      thisMonth: {
        sessions: 52,
        hours: 43.5,
        avgPerEmployee: 1.49,
      },
      total: {
        sessions: 198,
        hours: 165,
      },
    },
  ];

  const stats = [
    {
      icon: Users,
      label: 'Employés actifs',
      value: '175',
      change: '70% des inscrits',
      color: 'bg-primary',
    },
    {
      icon: Calendar,
      label: 'Total consultations',
      value: '372',
      change: 'Ce mois',
      color: 'bg-secondary',
    },
    {
      icon: Clock,
      label: 'Total heures',
      value: '310.5h',
      change: 'Ce mois',
      color: 'bg-[#5CB85C]',
    },
    {
      icon: TrendingUp,
      label: 'Moyenne par employé',
      value: '1.65',
      change: 'Séances/mois',
      color: 'bg-[#F39C12]',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground mb-2">
            Utilisation par Employés
          </h1>
          <p className="text-muted-foreground">
            Statistiques d'utilisation anonymisées (par département uniquement)
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

      {/* RGPD Notice */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
              🔒 Protection de la vie privée
            </h4>
            <p className="text-sm text-muted-foreground">
              <strong>Aucune donnée individuelle accessible.</strong> Conformément au RGPD et au secret médical, 
              seules les statistiques agrégées par département (minimum 10 employés) sont visibles. 
              Les données individuelles de santé restent strictement confidentielles entre l'employé et son praticien.
            </p>
          </div>
        </div>
      </Card>

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

      {/* Department Table */}
      <Card className="overflow-hidden">
        <div className="p-4 bg-muted/50 border-b border-border">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Utilisation par Département
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Données anonymisées (seuil minimum : 10 employés par département)
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left p-4 font-semibold">Département</th>
                <th className="text-center p-4 font-semibold">Effectif</th>
                <th className="text-center p-4 font-semibold">Utilisateurs actifs</th>
                <th className="text-center p-4 font-semibold">Taux utilisation</th>
                <th className="text-center p-4 font-semibold">Séances ce mois</th>
                <th className="text-center p-4 font-semibold">Heures ce mois</th>
                <th className="text-center p-4 font-semibold">Moy. par employé</th>
                <th className="text-center p-4 font-semibold">Total (cumulé)</th>
              </tr>
            </thead>
            <tbody>
              {departmentStats.map((dept) => {
                const usageRate = (dept.activeUsers / dept.totalEmployees * 100).toFixed(0);
                
                return (
                  <tr key={dept.name} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-medium">{dept.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-medium">{dept.totalEmployees}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-semibold text-[#5CB85C]">{dept.activeUsers}</span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-semibold">{usageRate}%</span>
                        <div className="w-full max-w-[100px] bg-muted rounded-full h-1.5">
                          <div 
                            className="bg-primary h-1.5 rounded-full"
                            style={{ width: `${usageRate}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-semibold text-lg">{dept.thisMonth.sessions}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-semibold text-lg">{dept.thisMonth.hours}h</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-sm font-medium">{dept.thisMonth.avgPerEmployee.toFixed(2)}</span>
                      <span className="text-xs text-muted-foreground block">séances/employé</span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-medium">{dept.total.sessions}</span>
                        <span className="text-xs text-muted-foreground">{dept.total.hours}h</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-muted/50 border-t-2 border-border">
              <tr>
                <td className="p-4 font-semibold">TOTAL ENTREPRISE</td>
                <td className="p-4 text-center font-bold">225</td>
                <td className="p-4 text-center font-bold text-[#5CB85C]">175</td>
                <td className="p-4 text-center font-bold">78%</td>
                <td className="p-4 text-center font-bold text-lg">372</td>
                <td className="p-4 text-center font-bold text-lg">310.5h</td>
                <td className="p-4 text-center font-bold">1.65</td>
                <td className="p-4 text-center font-bold">1,403</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#5CB85C]" />
            Département le plus engagé
          </h3>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-primary">Marketing & Communication</p>
            <p className="text-sm text-muted-foreground">
              83% d'utilisation • 1.86 séances/employé en moyenne
            </p>
            <div className="mt-4 p-3 bg-[#5CB85C]/10 rounded-lg">
              <p className="text-xs text-muted-foreground">
                ✨ Excellent engagement ! Ce département montre l'exemple.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-secondary" />
            Temps moyen par séance
          </h3>
          <div className="space-y-2">
            <p className="text-2xl font-bold text-primary">50 minutes</p>
            <p className="text-sm text-muted-foreground">
              Conforme aux standards de consultation
            </p>
            <div className="mt-4 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Min :</span>
                <span className="font-medium">45 min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Max :</span>
                <span className="font-medium">55 min</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-primary" />
            Recommandations
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
              <p>Encourager l'utilisation dans le département Ventes (74%)</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
              <p>Maintenir la communication sur la confidentialité</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
              <p>Planifier une campagne de sensibilisation au Q2</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Important Notes */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">📋 Notes importantes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <h4 className="font-medium text-primary">Respect de la vie privée</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Aucun accès aux données individuelles de santé</li>
              <li>• Impossible de savoir qui consulte quoi</li>
              <li>• Seuil minimum de 10 employés par statistique</li>
              <li>• Conformité RGPD stricte</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-primary">Utilisation des données</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Évaluer l'efficacité du programme</li>
              <li>• Identifier les départements à accompagner</li>
              <li>• Justifier l'investissement bien-être</li>
              <li>• Améliorer les campagnes de communication</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
