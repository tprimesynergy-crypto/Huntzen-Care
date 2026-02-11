import { useState, useEffect } from 'react';
import { Card } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Search, MapPin, Star, Calendar, Heart, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { api } from '@/app/services/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';

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

interface FindPractitionerProps {
  onViewProfile?: (practitionerId: string) => void;
  userRole?: string | null;
  searchQuery?: string;
  onSearchQueryChange?: (value: string) => void;
}

export function FindPractitioner({
  onViewProfile,
  userRole,
  searchQuery,
  onSearchQueryChange,
}: FindPractitionerProps) {
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [practitioners, setPractitioners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingPractitioner, setBookingPractitioner] = useState<any | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingSaving, setBookingSaving] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [employeeInfo, setEmployeeInfo] = useState<any | null>(null);
  const [searchName, setSearchName] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    api.getPractitioners()
      .then((list) => {
        setPractitioners(Array.isArray(list) ? list : []);
      })
      .catch(() => setPractitioners([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // Only employees have an Employee profile; avoid 404s for practitioners / admins.
    if (userRole !== 'EMPLOYEE') {
      setEmployeeInfo(null);
      setFavoriteIds([]);
      return;
    }
    // Preload employee info (company + employee id) for booking
    api.getEmployeeMe()
      .then((e) => {
        setEmployeeInfo(e || null);
      })
      .catch(() => {
        setEmployeeInfo(null);
      });

    // Load favorites for this employee
    api
      .getEmployeeFavoritePractitioners()
      .then((ids) => {
        setFavoriteIds(Array.isArray(ids) ? ids : []);
      })
      .catch(() => {
        setFavoriteIds([]);
      });
  }, [userRole]);

  const toggleFavorite = (id: string) => {
    setFavoriteIds((prev) => {
      const exists = prev.includes(id);
      if (exists) {
        // Optimistically update state, then call API to remove
        api.removeEmployeeFavoritePractitioner(id).catch(() => {
          // On error, re-add id
          setFavoriteIds((current) => (current.includes(id) ? current : [...current, id]));
        });
        return prev.filter((x) => x !== id);
      }
      // Optimistically add, then call API
      api.addEmployeeFavoritePractitioner(id).catch(() => {
        // On error, remove id again
        setFavoriteIds((current) => current.filter((x) => x !== id));
      });
      return [...prev, id];
    });
  };

  const effectiveSearchName = (searchQuery ?? searchName).trim();

  const filtered = practitioners.filter((p) => {
    if (selectedSpecialty !== 'all' && p.specialty !== selectedSpecialty) return false;
    const name = `${p.title || ''} ${p.firstName || ''} ${p.lastName || ''}`.toLowerCase();
    const citySource = (p.timezone || '').toLowerCase();
    const nameSearch = effectiveSearchName.toLowerCase();
    const citySearch = searchCity.trim().toLowerCase();
    if (nameSearch && !name.includes(nameSearch)) return false;
    if (citySearch && !citySource.includes(citySearch)) return false;
    if (onlyFavorites && !favoriteIds.includes(p.id)) return false;
    return true;
  });

  const visiblePractitioners = filtered.slice(0, visibleCount);

  const specialties = [
    { value: 'all', label: 'Toutes les spécialités' },
    ...Array.from(new Set(practitioners.map((p) => p.specialty).filter(Boolean))).map((s) => ({
      value: s,
      label: SPECIALTY_LABELS[s] ?? s,
    })),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-2">Trouver votre praticien</h1>
        <p className="text-muted-foreground">
          Parcourez nos professionnels certifiés et trouvez celui qui vous correspond.
        </p>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un nom..."
                className="pl-10 bg-input-background"
                value={effectiveSearchName}
                onChange={(e) => {
                  const v = e.target.value;
                  if (onSearchQueryChange) {
                    onSearchQueryChange(v);
                  } else {
                    setSearchName(v);
                  }
                }}
              />
            </div>
          </div>
          <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
            <SelectTrigger className="bg-input-background">
              <SelectValue placeholder="Spécialité" />
            </SelectTrigger>
            <SelectContent>
              {specialties.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Ville..."
              className="pl-10 bg-input-background"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
            />
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{filtered.length} praticiens disponibles</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowMoreFilters((prev) => !prev)}
        >
          <Filter className="w-4 h-4 mr-2" /> {showMoreFilters ? 'Moins de filtres' : 'Plus de filtres'}
        </Button>
      </div>

      {showMoreFilters && (
        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Input
              id="only-favorites"
              type="checkbox"
              className="w-4 h-4"
              checked={onlyFavorites}
              onChange={(e) => setOnlyFavorites(e.target.checked)}
            />
            <Label htmlFor="only-favorites" className="text-sm">
              Afficher uniquement mes praticiens favoris
            </Label>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Chargement…</div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Aucun praticien disponible.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {visiblePractitioners.map((p) => {
            const name = `${p.title || ''} ${p.firstName} ${p.lastName}`.trim();
            const avatar = `${p.firstName?.[0] || ''}${p.lastName?.[0] || ''}`.toUpperCase();
            const specialtyLabel = SPECIALTY_LABELS[p.specialty] ?? p.specialty ?? '';
            const types: string[] = [];
            if (p.offersVideo) types.push('Visio');
            if (p.offersPhone) types.push('Téléphone');
            types.push('Présentiel');
            const isFavorite = favoriteIds.includes(p.id);
            return (
              <Card key={p.id} className="p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-xl font-semibold flex-shrink-0">
                    {avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="cursor-pointer" onClick={() => onViewProfile?.(p.id)}>
                        <h3 className="text-lg font-semibold text-foreground hover:text-primary transition-colors">{name}</h3>
                        <p className="text-sm text-primary font-medium">{specialtyLabel}</p>
                      </div>
                      {userRole === 'EMPLOYEE' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-pressed={isFavorite}
                          onClick={() => toggleFavorite(p.id)}
                        >
                          <Heart
                            className={`w-5 h-5 transition-colors ${
                              isFavorite ? 'text-red-500 fill-red-500' : 'text-muted-foreground'
                            }`}
                          />
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      {p.experience != null && (
                        <span className="text-sm text-muted-foreground">{p.experience} ans d&apos;expérience</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{p.bio ?? ''}</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{p.timezone ?? '—'}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {types.map((type) => (
                          <span key={type} className="px-2 py-1 bg-muted text-xs rounded-md">{type}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="text-muted-foreground">Disponible sur rendez-vous</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => onViewProfile?.(p.id)}>
                          Voir le profil
                        </Button>
                        {userRole === 'EMPLOYEE' && (
                          <Button
                            size="sm"
                            className="bg-primary hover:bg-primary/90"
                            onClick={() => {
                              setBookingPractitioner(p);
                              setBookingDate('');
                              setBookingTime('');
                              setBookingError(null);
                              setBookingSuccess(null);
                            }}
                          >
                            Prendre RDV
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {!loading && filtered.length > visibleCount && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => setVisibleCount((prev) => Math.min(prev + 6, filtered.length))}
          >
            Charger plus de praticiens
          </Button>
        </div>
      )}

      <Dialog
        open={!!bookingPractitioner}
        onOpenChange={(open) => {
          if (!open) {
            setBookingPractitioner(null);
            setBookingError(null);
            setBookingSuccess(null);
            setBookingSaving(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Prendre rendez-vous</DialogTitle>
          </DialogHeader>
          {bookingPractitioner && (
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                setBookingError(null);
                setBookingSuccess(null);

                if (userRole !== 'EMPLOYEE') {
                  setBookingError(
                    'La prise de rendez-vous est réservée aux employés connectés.',
                  );
                  return;
                }

                if (!employeeInfo) {
                  setBookingError(
                    'Impossible de récupérer vos informations employé. Vérifiez que votre profil est bien configuré.',
                  );
                  return;
                }

                const employeeId = employeeInfo.id;
                const companyId = employeeInfo.company?.id ?? employeeInfo.companyId;

                if (!employeeId || !companyId) {
                  setBookingError(
                    'Impossible de déterminer votre entreprise ou votre profil employé.',
                  );
                  return;
                }

                const dt = new Date(`${bookingDate}T${bookingTime}:00`);
                if (Number.isNaN(dt.getTime())) {
                  setBookingError('Date ou heure invalide.');
                  return;
                }
                if (dt.getTime() < Date.now()) {
                  setBookingError('La date et l’heure doivent être dans le futur.');
                  return;
                }

                const durationMinutes = 50;
                const end = new Date(dt.getTime() + durationMinutes * 60 * 1000);

                setBookingSaving(true);
                try {
                  await api.createConsultation({
                    companyId,
                    employeeId,
                    practitionerId: bookingPractitioner.id,
                    scheduledAt: dt.toISOString(),
                    scheduledEndAt: end.toISOString(),
                    duration: durationMinutes,
                    format: 'VIDEO',
                  });
                  setBookingSuccess(
                    'Votre demande de rendez-vous a été envoyée au praticien. Elle sera confirmée une fois acceptée.',
                  );
                } catch (err) {
                  setBookingError(
                    err instanceof Error ? err.message : 'Erreur lors de la création du rendez-vous.',
                  );
                } finally {
                  setBookingSaving(false);
                }
              }}
            >
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Vous prenez rendez-vous avec{' '}
                  <span className="font-medium text-foreground">
                    {`${bookingPractitioner.title || ''} ${bookingPractitioner.firstName} ${bookingPractitioner.lastName}`.trim()}
                  </span>
                  .
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="booking-date">Date</Label>
                  <Input
                    id="booking-date"
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    disabled={bookingSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="booking-time">Heure</Label>
                  <Input
                    id="booking-time"
                    type="time"
                    required
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    disabled={bookingSaving}
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Durée par défaut : 50 minutes. Les créneaux déjà réservés par ce praticien sont
                automatiquement refusés.
              </p>
              {bookingError && (
                <p className="text-sm text-destructive">
                  {bookingError}
                </p>
              )}
              {bookingSuccess && (
                <p className="text-sm text-emerald-600">
                  {bookingSuccess}
                </p>
              )}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setBookingPractitioner(null);
                    setBookingError(null);
                    setBookingSuccess(null);
                  }}
                  disabled={bookingSaving}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={bookingSaving}>
                  {bookingSaving ? 'Envoi…' : 'Confirmer la demande'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
