import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Calendar, Users, Clock, TrendingUp, MessageSquare, Video, DollarSign, Star } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';

export function PractitionerDashboard() {
  const stats = [
    {
      icon: Users,
      label: 'Patients actifs',
      value: '42',
      change: '+5 ce mois',
      color: 'bg-primary',
    },
    {
      icon: Calendar,
      label: 'Séances ce mois',
      value: '87',
      change: '+12% vs mois dernier',
      color: 'bg-secondary',
    },
    {
      icon: Clock,
      label: 'Heures prestées',
      value: '72h',
      change: '18h cette semaine',
      color: 'bg-[#5CB85C]',
    },
    {
      icon: TrendingUp,
      label: 'Séances cette semaine',
      value: '18',
      change: '72h facturables',
      color: 'bg-[#F39C12]',
    },
  ];

  const todayAppointments = [
    {
      id: 1,
      patient: 'Marc D.',
      time: '14:00 - 14:50',
      type: 'Visioconférence',
      status: 'confirmed',
      isNew: false,
      notes: 'Suivi burn-out',
    },
    {
      id: 2,
      patient: 'Claire L.',
      time: '15:00 - 15:50',
      type: 'Téléphone',
      status: 'confirmed',
      isNew: false,
      notes: 'Gestion stress',
    },
    {
      id: 3,
      patient: 'Thomas B.',
      time: '16:00 - 16:50',
      type: 'Visioconférence',
      status: 'pending',
      isNew: true,
      notes: 'Première consultation',
    },
  ];

  const recentPatients = [
    {
      id: 1,
      initials: 'MD',
      name: 'Marc D.',
      lastSeen: 'Il y a 2 jours',
      sessions: 8,
      status: 'active',
    },
    {
      id: 2,
      initials: 'CL',
      name: 'Claire L.',
      lastSeen: 'Il y a 5 jours',
      sessions: 5,
      status: 'active',
    },
    {
      id: 3,
      initials: 'TB',
      name: 'Thomas B.',
      lastSeen: 'Il y a 1 semaine',
      sessions: 3,
      status: 'active',
    },
    {
      id: 4,
      initials: 'AL',
      name: 'Alice M.',
      lastSeen: 'Il y a 2 semaines',
      sessions: 12,
      status: 'inactive',
    },
  ];

  const messages = [
    {
      id: 1,
      from: 'Marc D.',
      preview: 'Merci pour la dernière séance, je me sens mieux...',
      time: 'Il y a 1h',
      unread: true,
    },
    {
      id: 2,
      from: 'Claire L.',
      preview: 'Est-ce possible de décaler notre RDV de demain ?',
      time: 'Il y a 3h',
      unread: true,
    },
    {
      id: 3,
      from: 'HuntZen Care',
      preview: 'Nouvelle demande de consultation de Thomas B.',
      time: 'Hier',
      unread: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-2">
          Bonjour Dr. Martin 👋
        </h1>
        <p className="text-muted-foreground">
          Voici un aperçu de votre activité. Vous avez 3 consultations aujourd'hui.
        </p>
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
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Today's Schedule */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Appointments */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Consultations d'aujourd'hui
              </h2>
              <Button variant="ghost" size="sm">
                Voir l'agenda complet
              </Button>
            </div>
            
            <div className="space-y-4">
              {todayAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {appointment.patient.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{appointment.patient}</h3>
                      {appointment.isNew && (
                        <span className="px-2 py-0.5 bg-secondary/10 text-secondary text-xs font-medium rounded-full">
                          Nouveau
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {appointment.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <Video className="w-4 h-4" />
                        {appointment.type}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{appointment.notes}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button size="sm" className="bg-primary hover:bg-primary/90">
                      {appointment.status === 'confirmed' ? 'Démarrer' : 'Confirmer'}
                    </Button>
                    <Button variant="outline" size="sm">
                      Notes
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Patients */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Patients récents
            </h2>
            <div className="space-y-3">
              {recentPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                      {patient.initials}
                    </div>
                    <div>
                      <p className="font-medium">{patient.name}</p>
                      <p className="text-sm text-muted-foreground">{patient.lastSeen}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{patient.sessions} séances</p>
                    <span className={`text-xs ${patient.status === 'active' ? 'text-[#5CB85C]' : 'text-muted-foreground'}`}>
                      {patient.status === 'active' ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              Voir tous les patients
            </Button>
          </Card>
        </div>

        {/* Right Column - Messages & Quick Actions */}
        <div className="space-y-6">
          {/* Messages */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Messages
            </h2>
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    message.unread ? 'bg-primary/5 hover:bg-primary/10' : 'bg-muted/30 hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-medium text-sm">{message.from}</p>
                    <span className="text-xs text-muted-foreground">{message.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{message.preview}</p>
                  {message.unread && (
                    <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  )}
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              <MessageSquare className="w-4 h-4 mr-2" />
              Voir tous les messages
            </Button>
          </Card>

          {/* Quick Stats */}
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
            <h3 className="font-semibold mb-4">Performance ce mois</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-[#F39C12]" />
                  <span className="text-sm">Note moyenne</span>
                </div>
                <span className="font-semibold">4.9/5</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#5CB85C]" />
                  <span className="text-sm">Taux de complétion</span>
                </div>
                <span className="font-semibold">98%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-sm">Nouveaux patients</span>
                </div>
                <span className="font-semibold">5</span>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Actions rapides</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Gérer mes disponibilités
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="w-4 h-4 mr-2" />
                Ajouter un patient
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="w-4 h-4 mr-2" />
                Envoyer un message groupé
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}