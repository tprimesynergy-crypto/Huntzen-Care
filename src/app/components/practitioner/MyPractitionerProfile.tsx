import { useEffect, useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { MapPin, Calendar, Clock, GraduationCap, CheckCircle, Mail } from 'lucide-react';
import { api } from '@/app/services/api';

const SPECIALTY_LABELS: Record<string, string> = {
  PSYCHOLOGUE_CLINICIEN: 'Psychologue clinicien',
  PSYCHOLOGUE_TRAVAIL: 'Psychologue du travail',
  PSYCHIATRE: 'Psychiatre',
  PSYCHOTHERAPEUTE: 'Psychothérapeute',
  NEUROPSYCHOLOGUE: 'Neuropsychologue',
  COACH_MENTAL: 'Coach mental',
  SEXOLOGUE: 'Sexologue',
  PSYCHANALYSTE: 'Psychanalyste',
};

const DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

export function MyPractitionerProfile() {
  const [practitioner, setPractitioner] = useState<any | null>(null);
  const [availability, setAvailability] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .getPractitionerMe()
      .then(async (me) => {
        if (cancelled) return;
        if (!me) {
          setPractitioner(null);
          setAvailability([]);
          return;
        }
        setPractitioner(me);
        try {
          const slots = await api.getPractitionerAvailability(me.id).catch(() => []);
          if (!cancelled) {
            setAvailability(Array.isArray(slots) ? slots : []);
          }
        } catch {
          if (!cancelled) {
            setAvailability([]);
          }
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Impossible de charger votre profil praticien.');
          setPractitioner(null);
          setAvailability([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

  return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  if (!practitioner) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">
          {error ?? 'Profil praticien introuvable. Vérifiez que votre compte est bien configuré.'}
        </p>
      </Card>
    );
  }

  const name = `${practitioner.title || ''} ${practitioner.firstName} ${practitioner.lastName}`.trim();
  const specialty = SPECIALTY_LABELS[practitioner.specialty] ?? practitioner.specialty ?? '';
  const avatar = `${practitioner.firstName?.[0] ?? ''}${practitioner.lastName?.[0] ?? ''}`.toUpperCase();
  const types: string[] = [];
  if (practitioner.offersVideo) types.push('Visioconférence');
  if (practitioner.offersPhone) types.push('Téléphone');
  types.push('Présentiel');

  const recurring = availability.filter((a: any) => a.type === 'RECURRING' && a.dayOfWeek != null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-foreground mb-2">Mon profil praticien</h1>
      </div>

      <Card className="overflow-hidden">
        <div className="relative h-32 bg-gradient-to-r from-primary/20 to-secondary/20" />
        <div className="px-6 pb-6 -mt-12 relative">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
            <div className="w-24 h-24 rounded-full border-4 border-background bg-primary flex items-center justify-center text-2xl font-semibold text-white shrink-0">
              {avatar}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-foreground">{name}</h2>
                {practitioner.isValidated && (
                  <span className="flex items-center gap-1 text-sm text-[#5CB85C]">
                    <CheckCircle className="w-4 h-4" />
                    Certifié HuntZen
                  </span>
                )}
              </div>
              <p className="text-primary font-medium mt-1">{specialty}</p>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                {practitioner.experience != null && (
                  <span>{practitioner.experience} ans d&apos;expérience</span>
                )}
                {practitioner.timezone && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {practitioner.timezone}
                  </span>
                )}
              </div>
            </div>
          </div>
          {practitioner.bio && (
            <p className="text-muted-foreground mt-6">{practitioner.bio}</p>
          )}
          <div className="flex flex-wrap gap-2 mt-4">
            {types.map((t) => (
              <span key={t} className="px-3 py-1 bg-muted rounded-full text-sm">
                {t}
              </span>
            ))}
          </div>
          {(practitioner.languages?.length > 0) && (
            <p className="text-sm text-muted-foreground mt-2">
              Langues : {practitioner.languages.join(', ')}
            </p>
          )}
          {practitioner.user?.email && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
              <Mail className="w-4 h-4" />
              <span>{practitioner.user.email}</span>
            </div>
          )}
        </div>
      </Card>

      {practitioner.education && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Formation
          </h2>
          <p className="text-muted-foreground whitespace-pre-wrap">{practitioner.education}</p>
        </Card>
      )}

      {recurring.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Disponibilités
          </h2>
          <div className="space-y-2">
            {recurring.map((a: any) => (
              <div
                key={a.id}
                className="flex justify-between py-2 border-b border-border last:border-0"
              >
                <span>{DAYS[a.dayOfWeek] ?? `Jour ${a.dayOfWeek}`}</span>
                <span className="text-muted-foreground">
                  {a.startTime} – {a.endTime}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

