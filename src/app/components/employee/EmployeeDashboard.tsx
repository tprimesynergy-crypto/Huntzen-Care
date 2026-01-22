import { useState, useEffect } from 'react';
import { Card } from '@/app/components/ui/card';
import { Calendar, MessageSquare, BookOpen, TrendingUp, Heart, Clock } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { api } from '@/app/services/api';

export function EmployeeDashboard() {
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    {
      icon: Calendar,
      label: 'Prochaine séance',
      value: 'Aucune séance',
      subValue: 'Prenez un rendez-vous',
      color: 'bg-primary',
    },
    {
      icon: MessageSquare,
      label: 'Messages',
      value: '0 nouveau',
      subValue: 'Aucun message',
      color: 'bg-secondary',
    },
    {
      icon: BookOpen,
      label: 'Mon Journal',
      value: '0 entrée',
      subValue: 'Commencez votre journal',
      color: 'bg-[#5CB85C]',
    },
    {
      icon: TrendingUp,
      label: 'Progression',
      value: '0%',
      subValue: 'Humeur ce mois-ci',
      color: 'bg-[#F39C12]',
    },
  ]);

  useEffect(() => {
    loadConsultations();
  }, []);

  const loadConsultations = async () => {
    try {
      setLoading(true);
      const consultations = await api.getConsultations();
      
      // Filter upcoming consultations
      const now = new Date();
      const upcoming = consultations
        .filter((c: any) => new Date(c.scheduledAt) >= now && c.status !== 'CANCELLED')
        .sort((a: any, b: any) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
        .slice(0, 2)
        .map((c: any) => ({
          id: c.id,
          practitioner: `${c.practitioner?.title || ''} ${c.practitioner?.firstName} ${c.practitioner?.lastName}`.trim(),
          specialty: c.practitioner?.specialty || '',
          date: new Date(c.scheduledAt).toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
          time: `${new Date(c.scheduledAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - ${new Date(c.scheduledEndAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
          type: c.format === 'VIDEO' ? 'Visioconférence' : c.format === 'AUDIO' ? 'Appel audio' : 'En personne',
          avatar: `${c.practitioner?.firstName?.[0] || ''}${c.practitioner?.lastName?.[0] || ''}`.toUpperCase(),
          roomName: c.roomName,
        }));

      setUpcomingAppointments(upcoming);

      // Update stats
      if (upcoming.length > 0) {
        const nextAppointment = upcoming[0];
        const nextDate = new Date(consultations.find((c: any) => c.id === nextAppointment.id)?.scheduledAt);
        setStats(prev => [
          {
            ...prev[0],
            value: nextDate.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }),
            subValue: `${nextDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} avec ${nextAppointment.practitioner}`,
          },
          ...prev.slice(1),
        ]);
      }
    } catch (error) {
      console.error('Error loading consultations:', error);
      // Fallback to empty state
      setUpcomingAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const newsArticles = [
    {
      id: 1,
      title: '5 techniques de respiration pour gérer le stress au travail',
      category: 'Bien-être',
      readTime: '3 min',
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400',
    },
    {
      id: 2,
      title: 'Comment améliorer la qualité de votre sommeil',
      category: 'Santé',
      readTime: '5 min',
      image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-2">
          Bonjour Marc 👋
        </h1>
        <p className="text-muted-foreground">
          Prenez soin de vous aujourd'hui. Voici un aperçu de votre bien-être.
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
                  <p className="text-xl font-semibold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.subValue}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Appointments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Appointments */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Mes prochaines séances
              </h2>
              <Button variant="ghost" size="sm">
                Voir tout
              </Button>
            </div>
            
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Chargement des rendez-vous...
                </div>
              ) : upcomingAppointments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun rendez-vous à venir
                </div>
              ) : (
                upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                    {appointment.avatar}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{appointment.practitioner}</h3>
                    <p className="text-sm text-muted-foreground">{appointment.specialty}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {appointment.date}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {appointment.time}
                      </span>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => {
                      // Open Jitsi room in new window
                      const roomName = appointment.roomName || `huntzen-${appointment.id}`;
                      const jitsiUrl = `https://meet.jit.si/${roomName}`;
                      window.open(jitsiUrl, '_blank', 'width=1200,height=800');
                    }}
                  >
                    Rejoindre
                  </Button>
                </div>
                ))
              )}
            </div>

            <Button variant="outline" className="w-full mt-4">
              <Heart className="w-4 h-4 mr-2" />
              Prendre un nouveau rendez-vous
            </Button>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Actions rapides</h2>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                <Heart className="w-6 h-6 text-primary" />
                <span className="text-sm">Trouver un praticien</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                <BookOpen className="w-6 h-6 text-[#5CB85C]" />
                <span className="text-sm">Mon journal</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                <MessageSquare className="w-6 h-6 text-secondary" />
                <span className="text-sm">Messages</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                <TrendingUp className="w-6 h-6 text-[#F39C12]" />
                <span className="text-sm">Ma progression</span>
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column - News & Impact */}
        <div className="space-y-6">
          {/* News Section */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Actualités bien-être
            </h2>
            <div className="space-y-4">
              {newsArticles.map((article) => (
                <div key={article.id} className="group cursor-pointer">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-32 object-cover rounded-lg mb-2 group-hover:opacity-90 transition-opacity"
                  />
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <span className="text-primary">{article.category}</span>
                    <span>•</span>
                    <span>{article.readTime}</span>
                  </div>
                  <h3 className="text-sm font-medium group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                </div>
              ))}
            </div>
            <Button variant="link" className="w-full mt-4 text-primary">
              Voir tous les articles →
            </Button>
          </Card>

          {/* Social Impact */}
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Impact Social</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Grâce à votre utilisation de HuntZen Care, nous avons reversé :
            </p>
            <div className="text-3xl font-bold text-primary mb-2">450 €</div>
            <p className="text-xs text-muted-foreground">
              À des associations de santé mentale ce mois-ci 💙
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
