import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { MapPin, Phone, Mail, Calendar, Star, Award, GraduationCap, Globe, Heart, MessageSquare, Video, CheckCircle, Clock, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';

interface PractitionerProfileProps {
  practitionerId?: number;
  onClose?: () => void;
}

export function PractitionerProfile({ practitionerId = 1, onClose }: PractitionerProfileProps) {
  const practitioner = {
    id: 1,
    firstName: 'Sophie',
    lastName: 'Martin',
    title: 'Dr.',
    specialty: 'Psychologue clinicienne',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    coverPhoto: 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=1200',
    bio: 'Psychologue clinicienne spécialisée dans la gestion du stress et de l\'anxiété en milieu professionnel. Formée aux thérapies cognitivo-comportementales (TCC) et à la pleine conscience. Mon approche est centrée sur la personne, bienveillante et basée sur des méthodes scientifiquement validées.',
    longBio: `Passionnée par l'accompagnement des personnes en souffrance psychologique, j'exerce depuis plus de 12 ans. Mon parcours m'a permis de développer une expertise particulière dans la gestion du stress au travail, le burn-out, et les troubles anxieux.

Je crois profondément en une approche holistique de la santé mentale, intégrant le corps et l'esprit. Mes consultations sont un espace sûr où vous pouvez vous exprimer librement, sans jugement.`,
    
    // Contact
    phone: '+33 1 23 45 67 89',
    email: 'dr.sophie.martin@huntzen.care',
    location: 'Paris 8ème, Île-de-France',
    address: '42 Avenue des Champs-Élysées, 75008 Paris',
    
    // Professional Info
    experience: '12 ans',
    patients: '200+',
    rating: 4.8,
    reviewCount: 127,
    consultationTypes: ['Visioconférence', 'Téléphone', 'Présentiel'],
    languages: ['Français', 'Anglais', 'Espagnol'],
    
    // Education
    education: [
      {
        degree: 'Doctorat en Psychologie Clinique',
        school: 'Université Paris Descartes',
        year: '2013',
      },
      {
        degree: 'Master en Psychopathologie',
        school: 'Université Paris Diderot',
        year: '2010',
      },
      {
        degree: 'Licence de Psychologie',
        school: 'Université Sorbonne',
        year: '2008',
      },
    ],
    
    // Certifications
    certifications: [
      'Thérapie Cognitivo-Comportementale (TCC)',
      'EMDR - Niveau 2',
      'Mindfulness-Based Stress Reduction (MBSR)',
      'Coaching professionnel certifié ICF',
    ],
    
    // Specialties
    specialties: [
      'Gestion du stress et de l\'anxiété',
      'Burn-out et épuisement professionnel',
      'Troubles dépressifs',
      'Confiance en soi',
      'Gestion des émotions',
      'Transitions de vie',
    ],
    
    // Availability
    nextAvailable: 'Jeudi 23 Janvier',
    availability: [
      { day: 'Lundi', hours: '9h00 - 18h00' },
      { day: 'Mardi', hours: '9h00 - 18h00' },
      { day: 'Mercredi', hours: '14h00 - 20h00' },
      { day: 'Jeudi', hours: '9h00 - 18h00' },
      { day: 'Vendredi', hours: '9h00 - 16h00' },
    ],
    
    // Pricing
    price: {
      initial: '80€',
      followUp: '70€',
      duration: '50 min',
    },
    
    // Reviews
    reviews: [
      {
        id: 1,
        author: 'Marc D.',
        rating: 5,
        date: '10 Janvier 2025',
        comment: 'Dr. Martin est une excellente professionnelle. Son écoute et sa bienveillance m\'ont vraiment aidé à traverser une période difficile. Je recommande vivement.',
      },
      {
        id: 2,
        author: 'Claire L.',
        rating: 5,
        date: '5 Janvier 2025',
        comment: 'Grâce à Dr. Martin, j\'ai appris à gérer mon stress au travail. Ses techniques sont très efficaces et faciles à appliquer au quotidien.',
      },
      {
        id: 3,
        author: 'Thomas B.',
        rating: 4,
        date: '28 Décembre 2024',
        comment: 'Très bon accompagnement. Dr. Martin est à l\'écoute et propose des solutions concrètes. Je me sens beaucoup mieux après 5 séances.',
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Back Button (if modal) */}
      {onClose && (
        <Button variant="ghost" onClick={onClose}>
          ← Retour
        </Button>
      )}

      {/* Cover Photo & Avatar Section */}
      <Card className="overflow-hidden">
        {/* Cover Photo */}
        <div className="relative h-64 bg-gradient-to-r from-primary to-secondary">
          <img
            src={practitioner.coverPhoto}
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
          
          {/* Verified Badge */}
          <div className="absolute top-4 right-4 bg-white px-3 py-2 rounded-full shadow-lg flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#5CB85C]" />
            <span className="text-sm font-medium">Certifié HuntZen</span>
          </div>
        </div>

        {/* Profile Info Section */}
        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-16 relative">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-white overflow-hidden shadow-lg">
                <img
                  src={practitioner.avatar}
                  alt={`${practitioner.title} ${practitioner.firstName} ${practitioner.lastName}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute bottom-2 right-2 w-6 h-6 bg-[#5CB85C] border-2 border-white rounded-full" />
            </div>

            {/* Name & Specialty */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground">
                {practitioner.title} {practitioner.firstName} {practitioner.lastName}
              </h1>
              <p className="text-lg text-primary font-medium mt-1">
                {practitioner.specialty}
              </p>
              
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {practitioner.location}
                </span>
                <span className="flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  {practitioner.experience} d'expérience
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {practitioner.patients} patients accompagnés
                </span>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(practitioner.rating)
                          ? 'fill-[#F39C12] text-[#F39C12]'
                          : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-semibold">{practitioner.rating}</span>
                <span className="text-muted-foreground">({practitioner.reviewCount} avis)</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 w-full md:w-auto">
              <Button className="bg-primary hover:bg-primary/90">
                <Calendar className="w-4 h-4 mr-2" />
                Prendre rendez-vous
              </Button>
              <Button variant="outline">
                <MessageSquare className="w-4 h-4 mr-2" />
                Envoyer un message
              </Button>
            </div>
          </div>

          {/* Short Bio */}
          <div className="mt-6">
            <p className="text-muted-foreground leading-relaxed">
              {practitioner.bio}
            </p>
          </div>

          {/* Quick Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Prochaine dispo</p>
                  <p className="font-semibold">{practitioner.nextAvailable}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-secondary/5 border-secondary/20">
              <div className="flex items-center gap-3">
                <Video className="w-8 h-8 text-secondary" />
                <div>
                  <p className="text-sm text-muted-foreground">Consultation</p>
                  <p className="font-semibold">{practitioner.price.initial}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-[#5CB85C]/5 border-[#5CB85C]/20">
              <div className="flex items-center gap-3">
                <Heart className="w-8 h-8 text-[#5CB85C]" />
                <div>
                  <p className="text-sm text-muted-foreground">Durée</p>
                  <p className="font-semibold">{practitioner.price.duration}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="about" className="w-full">
        <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-4 gap-2">
          <TabsTrigger value="about">À propos</TabsTrigger>
          <TabsTrigger value="specialties">Spécialités</TabsTrigger>
          <TabsTrigger value="reviews">Avis ({practitioner.reviewCount})</TabsTrigger>
          <TabsTrigger value="availability">Disponibilités</TabsTrigger>
        </TabsList>

        {/* About Tab */}
        <TabsContent value="about" className="mt-6 space-y-6">
          {/* Long Bio */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Présentation</h2>
            <div className="prose prose-sm max-w-none">
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {practitioner.longBio}
              </p>
            </div>
          </Card>

          {/* Education */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" />
              Formation
            </h2>
            <div className="space-y-4">
              {practitioner.education.map((edu, index) => (
                <div key={index} className="flex gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{edu.degree}</h4>
                    <p className="text-sm text-muted-foreground">{edu.school}</p>
                    <p className="text-sm text-muted-foreground">{edu.year}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Certifications */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Certifications
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {practitioner.certifications.map((cert, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-[#5CB85C] flex-shrink-0" />
                  <span className="text-sm">{cert}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Languages & Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Langues parlées
              </h2>
              <div className="flex flex-wrap gap-2">
                {practitioner.languages.map((lang) => (
                  <span
                    key={lang}
                    className="px-3 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium"
                  >
                    {lang}
                  </span>
                ))}
              </div>

              <h3 className="text-lg font-semibold mt-6 mb-3">Types de consultation</h3>
              <div className="space-y-2">
                {practitioner.consultationTypes.map((type) => (
                  <div key={type} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#5CB85C]" />
                    <span className="text-sm">{type}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Contact</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Adresse du cabinet</p>
                    <p className="text-sm text-muted-foreground">{practitioner.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Téléphone</p>
                    <p className="text-sm text-muted-foreground">{practitioner.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{practitioner.email}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Specialties Tab */}
        <TabsContent value="specialties" className="mt-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Domaines d'expertise</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {practitioner.specialties.map((specialty, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="font-medium">{specialty}</span>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="mt-6 space-y-4">
          {practitioner.reviews.map((review) => (
            <Card key={review.id} className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold">{review.author}</p>
                  <p className="text-sm text-muted-foreground">{review.date}</p>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating
                          ? 'fill-[#F39C12] text-[#F39C12]'
                          : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-muted-foreground">{review.comment}</p>
            </Card>
          ))}
        </TabsContent>

        {/* Availability Tab */}
        <TabsContent value="availability" className="mt-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Horaires d'ouverture</h2>
            <div className="space-y-3">
              {practitioner.availability.map((slot) => (
                <div key={slot.day} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <span className="font-medium">{slot.day}</span>
                  <span className="text-muted-foreground">{slot.hours}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <h4 className="font-semibold mb-2">Tarifs</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Première consultation</span>
                  <span className="font-semibold">{practitioner.price.initial}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Consultation de suivi</span>
                  <span className="font-semibold">{practitioner.price.followUp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Durée de séance</span>
                  <span className="font-semibold">{practitioner.price.duration}</span>
                </div>
              </div>
            </div>

            <Button className="w-full mt-6 bg-primary hover:bg-primary/90">
              <Calendar className="w-4 h-4 mr-2" />
              Réserver un créneau
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
