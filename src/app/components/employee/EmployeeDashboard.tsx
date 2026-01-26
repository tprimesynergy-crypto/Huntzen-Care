import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/app/components/ui/card';
import { Calendar, MessageSquare, BookOpen, TrendingUp, Heart, Clock } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { api } from '@/app/services/api';

/** Structure only (icon, label, color). value/subValue are overwritten from API in loadAll. */
const STATS_TEMPLATE = [
  { icon: Calendar, label: 'Prochaine séance', value: 'Aucune séance', subValue: 'Prenez un rendez-vous', color: 'bg-primary' },
  { icon: MessageSquare, label: 'Messages', value: '0 nouveau', subValue: 'Aucun message', color: 'bg-secondary' },
  { icon: BookOpen, label: 'Mon Journal', value: '0 entrée', subValue: 'Commencez votre journal', color: 'bg-[#5CB85C]' },
  { icon: TrendingUp, label: 'Progression', value: '—', subValue: 'Humeur ce mois-ci', color: 'bg-[#F39C12]' },
];

interface EmployeeDashboardProps {
  onNavigate?: (tab: string) => void;
  onViewArticle?: (articleId: string) => void;
}

export function EmployeeDashboard({ onNavigate, onViewArticle }: EmployeeDashboardProps) {
  const [employee, setEmployee] = useState<{ firstName: string; lastName: string } | null>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [stats, setStats] = useState(STATS_TEMPLATE);
  const [newsArticles, setNewsArticles] = useState<{ id: string; title: string; category: string; readTime: string; image: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      const [consultationsRes, newsRes, employeeRes, journalStatsRes, unreadCount] = await Promise.all([
        api.getConsultations().catch(() => []),
        api.getNews().catch(() => []),
        api.getEmployeeMe().catch(() => null),
        api.getJournalStats().catch(() => ({ total: 0, avgMood: null, streak: 0 })),
        api.getUnreadNotificationsCount().catch(() => 0),
      ]);

      const consultations = Array.isArray(consultationsRes) ? consultationsRes : [];
      const now = new Date();
      const isDev = import.meta.env.DEV; // true in development, false in production
      const upcoming = consultations
        .filter((c: any) => new Date(c.scheduledAt) >= now && c.status !== 'CANCELLED')
        .sort((a: any, b: any) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
        .slice(0, 2)
        .map((c: any) => {
          // In dev: always allow joining. In prod: only 10 minutes before
          const minutesUntilStart = (new Date(c.scheduledAt).getTime() - now.getTime()) / (60 * 1000);
          const canJoin = isDev ? true : minutesUntilStart <= 10;
          
          return {
            id: c.id,
            practitioner: `${c.practitioner?.title || ''} ${c.practitioner?.firstName} ${c.practitioner?.lastName}`.trim(),
            specialty: c.practitioner?.specialty ?? '',
            date: new Date(c.scheduledAt).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
            time: `${new Date(c.scheduledAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - ${new Date(c.scheduledEndAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
            type: c.format === 'VIDEO' ? 'Visioconférence' : c.format === 'AUDIO' ? 'Appel audio' : 'En personne',
            avatar: `${c.practitioner?.firstName?.[0] || ''}${c.practitioner?.lastName?.[0] || ''}`.toUpperCase(),
            roomName: c.roomName,
            canJoin,
          };
        });

      setUpcomingAppointments(upcoming);

      const items = Array.isArray(newsRes) ? newsRes : [];
      setNewsArticles(
        items.map((n: any) => ({
          id: n.id,
          title: n.title,
          category: 'Bien-être',
          readTime: `${Math.max(1, Math.ceil((n.content?.length || 0) / 200))} min`,
          image: n.imageUrl || 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400',
        }))
      );

      if (employeeRes?.firstName) setEmployee({ firstName: employeeRes.firstName, lastName: employeeRes.lastName || '' });

      const jStats = journalStatsRes && typeof journalStatsRes === 'object' ? journalStatsRes : { total: 0, avgMood: null, streak: 0 };
      const next = upcoming[0];
      const nextConsult = consultations.find((c: any) => c.id === next?.id);
      const nextDate = nextConsult ? new Date(nextConsult.scheduledAt) : null;

      setStats([
        {
          ...STATS_TEMPLATE[0],
          value: nextDate ? nextDate.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }) : 'Aucune séance',
          subValue: nextDate ? `${nextDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} avec ${next?.practitioner}` : 'Prenez un rendez-vous',
        },
        {
          ...STATS_TEMPLATE[1],
          value: unreadCount > 0 ? `${unreadCount} nouveau${unreadCount > 1 ? 'x' : ''}` : '0 nouveau',
          subValue: unreadCount > 0 ? 'Notifications' : 'Aucun message',
        },
        {
          ...STATS_TEMPLATE[2],
          value: jStats.total ? `${jStats.total} entrée${jStats.total > 1 ? 's' : ''}` : '0 entrée',
          subValue: jStats.total ? 'Journal' : 'Commencez votre journal',
        },
        {
          ...STATS_TEMPLATE[3],
          value: jStats.avgMood != null ? `${(jStats.avgMood * 20).toFixed(0)}%` : '—',
          subValue: jStats.streak ? `${jStats.streak} jour${jStats.streak > 1 ? 's' : ''} consécutifs` : 'Humeur ce mois-ci',
        },
      ]);
    } catch (e) {
      console.error('Error loading dashboard:', e);
      setUpcomingAppointments([]);
      setNewsArticles([]);
      setEmployee(null);
      setStats(STATS_TEMPLATE);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-2">
          Bonjour {employee?.firstName ?? '…'} 👋
        </h1>
        <p className="text-muted-foreground">
          Prenez soin de vous aujourd'hui. Voici un aperçu de votre bien-être.
        </p>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Mes prochaines séances
              </h2>
              <Button variant="ghost" size="sm" onClick={() => onNavigate?.('appointments')}>
                Voir tout
              </Button>
            </div>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Chargement des rendez-vous...</div>
              ) : upcomingAppointments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Aucun rendez-vous à venir</div>
              ) : (
                upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
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
                      disabled={!appointment.canJoin}
                      onClick={() => {
                        const roomName = appointment.roomName || `huntzen-${appointment.id}`;
                        window.open(`https://meet.jit.si/${roomName}`, '_blank', 'width=1200,height=800');
                      }}
                    >
                      Rejoindre
                    </Button>
                  </div>
                ))
              )}
            </div>
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => onNavigate?.('practitioners')}
            >
              <Heart className="w-4 h-4 mr-2" />
              Prendre un nouveau rendez-vous
            </Button>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Actions rapides</h2>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center gap-2"
                onClick={() => onNavigate?.('practitioners')}
              >
                <Heart className="w-6 h-6 text-primary" />
                <span className="text-sm">Trouver un praticien</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center gap-2"
                onClick={() => onNavigate?.('journal')}
              >
                <BookOpen className="w-6 h-6 text-[#5CB85C]" />
                <span className="text-sm">Mon journal</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center gap-2"
                onClick={() => onNavigate?.('messages')}
              >
                <MessageSquare className="w-6 h-6 text-secondary" />
                <span className="text-sm">Messages</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center gap-2"
                onClick={() => onNavigate?.('profile')}
              >
                <TrendingUp className="w-6 h-6 text-[#F39C12]" />
                <span className="text-sm">Ma progression</span>
              </Button>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Actualités bien-être
            </h2>
            <div className="space-y-4">
              {newsArticles.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">Aucun article pour le moment.</p>
              ) : (
                newsArticles.map((article) => (
                  <div
                    key={article.id}
                    role="button"
                    tabIndex={0}
                    className="group cursor-pointer"
                    onClick={() => (onViewArticle ? onViewArticle(article.id) : onNavigate?.('news'))}
                    onKeyDown={(e) => e.key === 'Enter' && (onViewArticle ? onViewArticle(article.id) : onNavigate?.('news'))}
                  >
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
                    <h3 className="text-sm font-medium group-hover:text-primary transition-colors">{article.title}</h3>
                  </div>
                ))
              )}
            </div>
            <Button variant="link" className="w-full mt-4 text-primary" onClick={() => onNavigate?.('news')}>
              Voir tous les articles →
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
