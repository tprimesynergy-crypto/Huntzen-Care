import { useState, useEffect } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Phone, Mail, Briefcase, Calendar, BookOpen, Heart } from 'lucide-react';
import { api } from '@/app/services/api';

export function MyProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<{ consultations: number; journal: number; streak: number }>({ consultations: 0, journal: 0, streak: 0 });
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getEmployeeMe().catch(() => null),
      api.getConsultations().catch(() => []),
      api.getJournalStats().catch(() => ({ total: 0, streak: 0 })),
    ]).then(([emp, cons, j]) => {
      setProfile(emp ?? null);
      const list = Array.isArray(cons) ? cons : [];
      setStats({
        consultations: list.filter((c: any) => c.status === 'COMPLETED').length,
        journal: (j && typeof j === 'object' && 'total' in j) ? j.total : 0,
        streak: (j && typeof j === 'object' && 'streak' in j) ? j.streak : 0,
      });
      const recent = list
        .sort((a: any, b: any) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
        .slice(0, 5)
        .map((c: any) => ({
          id: c.id,
          type: 'appointment',
          title: `Séance avec ${c.practitioner?.title || ''} ${c.practitioner?.firstName} ${c.practitioner?.lastName}`.trim(),
          date: new Date(c.scheduledAt).toLocaleDateString('fr-FR'),
          icon: Heart,
          color: 'text-primary',
        }));
      setActivity(recent);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading || !profile) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  const name = `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim();
  const companyName = profile.company?.name ?? '—';

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="relative h-48 bg-gradient-to-r from-primary to-secondary" />
        <div className="px-6 pb-6 -mt-16 relative">
          <div className="w-24 h-24 rounded-full border-4 border-background bg-muted flex items-center justify-center text-2xl font-semibold text-foreground">
            {(profile.firstName?.[0] ?? '') + (profile.lastName?.[0] ?? '')}
          </div>
          <h1 className="text-2xl font-bold text-foreground mt-4">{name || '—'}</h1>
          <div className="flex flex-wrap gap-3 mt-2 text-muted-foreground text-sm">
            <span className="flex items-center gap-1">
              <Briefcase className="w-4 h-4" />
              {profile.position ?? '—'} {companyName !== '—' && `chez ${companyName}`}
            </span>
            {profile.department && (
              <span className="flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                {profile.department}
              </span>
            )}
          </div>
          {profile.bio && (
            <p className="text-muted-foreground mt-4">{profile.bio}</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            {profile.user?.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-primary" />
                <span className="font-medium">{profile.user.email}</span>
              </div>
            )}
            {profile.phoneNumber && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-primary" />
                <span className="font-medium">{profile.phoneNumber}</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5 text-center">
          <Calendar className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold">{stats.consultations}</p>
          <p className="text-sm text-muted-foreground">Séances réalisées</p>
        </Card>
        <Card className="p-5 text-center">
          <BookOpen className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold">{stats.journal}</p>
          <p className="text-sm text-muted-foreground">Entrées journal</p>
        </Card>
        <Card className="p-5 text-center">
          <span className="text-2xl font-bold">{stats.streak}</span>
          <p className="text-sm text-muted-foreground mt-2">Jours consécutifs</p>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Activité récente</h2>
        {activity.length === 0 ? (
          <p className="text-muted-foreground">Aucune activité récente.</p>
        ) : (
          <div className="space-y-4">
            {activity.map((a) => (
              <div key={a.id} className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-primary">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">{a.title}</h4>
                  <p className="text-sm text-muted-foreground">{a.date}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
