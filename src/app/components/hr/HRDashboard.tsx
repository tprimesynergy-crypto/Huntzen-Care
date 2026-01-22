import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Users, TrendingUp, TrendingDown, Activity, Heart, Clock, AlertCircle, Download } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export function HRDashboard() {
  const stats = [
    {
      icon: Users,
      label: 'Employés inscrits',
      value: '187/250',
      percentage: '75%',
      change: '+12 ce mois',
      trend: 'up',
      color: 'bg-primary',
    },
    {
      icon: Activity,
      label: 'Utilisateurs actifs',
      value: '142',
      percentage: '57%',
      change: '+8% vs mois dernier',
      trend: 'up',
      color: 'bg-[#5CB85C]',
    },
    {
      icon: Heart,
      label: 'Consultations',
      value: '328',
      percentage: null,
      change: '+15% ce mois',
      trend: 'up',
      color: 'bg-secondary',
    },
    {
      icon: TrendingDown,
      label: 'Absentéisme',
      value: '-28%',
      percentage: null,
      change: 'vs année dernière',
      trend: 'down',
      color: 'bg-[#F39C12]',
    },
  ];

  // Données anonymisées (seuil min 10 employés)
  const wellbeingTrend = [
    { month: 'Sep', score: 3.2, participation: 45 },
    { month: 'Oct', score: 3.5, participation: 58 },
    { month: 'Nov', score: 3.8, participation: 62 },
    { month: 'Déc', score: 4.1, participation: 68 },
    { month: 'Jan', score: 4.3, participation: 75 },
  ];

  const departmentUsage = [
    { name: 'IT', value: 32, color: '#4A90E2' },
    { name: 'Marketing', value: 24, color: '#5BC0DE' },
    { name: 'Ventes', value: 28, color: '#5CB85C' },
    { name: 'RH', value: 16, color: '#F39C12' },
  ];

  const consultationTypes = [
    { type: 'Visioconférence', count: 186 },
    { type: 'Téléphone', count: 98 },
    { type: 'Présentiel', count: 44 },
  ];

  const satisfactionData = [
    { rating: '5 étoiles', count: 245, percentage: 75 },
    { rating: '4 étoiles', count: 62, percentage: 19 },
    { rating: '3 étoiles', count: 16, percentage: 5 },
    { rating: '2 étoiles', count: 3, percentage: 1 },
    { rating: '1 étoile', count: 2, percentage: 0 },
  ];

  const topPractitioners = [
    { name: 'Dr. Sophie Martin', sessions: 127, rating: 4.9 },
    { name: 'Dr. Thomas Lefebvre', sessions: 98, rating: 4.8 },
    { name: 'Dr. Marie Dubois', sessions: 103, rating: 4.7 },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground mb-2">
            Tableau de Bord RH
          </h1>
          <p className="text-muted-foreground">
            Vue d'ensemble du bien-être de vos équipes (données anonymisées, seuil min. 10 employés)
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Download className="w-4 h-4 mr-2" />
          Exporter le rapport
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-5 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-start gap-4">
                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center text-white`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    {stat.percentage && (
                      <span className="text-sm text-muted-foreground">({stat.percentage})</span>
                    )}
                  </div>
                  <p className={`text-xs mt-1 flex items-center gap-1 ${
                    stat.trend === 'up' ? 'text-[#5CB85C]' : 'text-[#F39C12]'
                  }`}>
                    {stat.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {stat.change}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* RGPD Notice */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm mb-1">🔒 Protection des données personnelles</h4>
            <p className="text-sm text-muted-foreground">
              Conformément au RGPD, toutes les données affichées sont anonymisées et agrégées. 
              Les informations individuelles de santé ne sont jamais accessibles. 
              Seuil minimum de 10 employés par statistique.
            </p>
          </div>
        </div>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wellbeing Trend */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Évolution du bien-être</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={wellbeingTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" domain={[0, 5]} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="score" 
                stroke="#4A90E2" 
                strokeWidth={2}
                name="Score moyen (/5)"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="participation" 
                stroke="#5CB85C" 
                strokeWidth={2}
                name="Taux de participation (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Department Usage */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Utilisation par département</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={departmentUsage}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name} (${entry.value}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {departmentUsage.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Consultation Types */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Types de consultations</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={consultationTypes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#5BC0DE" name="Nombre de séances" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Satisfaction */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Satisfaction des employés</h2>
          <div className="space-y-4 mt-4">
            {satisfactionData.map((item) => (
              <div key={item.rating} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.rating}</span>
                  <span className="text-muted-foreground">{item.count} avis ({item.percentage}%)</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-[#F39C12] h-2 rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-[#5CB85C]/10 border border-[#5CB85C]/20 rounded-lg">
            <p className="text-center">
              <span className="text-3xl font-bold text-[#5CB85C]">4.6/5</span>
              <span className="text-sm text-muted-foreground block mt-1">Score de satisfaction moyen</span>
            </p>
          </div>
        </Card>
      </div>

      {/* Top Practitioners */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Praticiens les plus sollicités</h2>
        <div className="space-y-4">
          {topPractitioners.map((practitioner, index) => (
            <div key={practitioner.name} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                  #{index + 1}
                </div>
                <div>
                  <p className="font-semibold">{practitioner.name}</p>
                  <p className="text-sm text-muted-foreground">{practitioner.sessions} consultations</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#F39C12]">★</span>
                <span className="font-semibold">{practitioner.rating}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow">
          <Users className="w-8 h-8 text-primary mb-3" />
          <h3 className="font-semibold mb-2">Gérer les employés</h3>
          <p className="text-sm text-muted-foreground">Ajouter ou retirer des collaborateurs de la plateforme</p>
        </Card>

        <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow">
          <Heart className="w-8 h-8 text-secondary mb-3" />
          <h3 className="font-semibold mb-2">Campagnes de sensibilisation</h3>
          <p className="text-sm text-muted-foreground">Créer des actions de communication interne</p>
        </Card>

        <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow">
          <Download className="w-8 h-8 text-[#5CB85C] mb-3" />
          <h3 className="font-semibold mb-2">Rapports mensuels</h3>
          <p className="text-sm text-muted-foreground">Télécharger les rapports d'utilisation anonymisés</p>
        </Card>
      </div>
    </div>
  );
}
