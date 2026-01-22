import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Camera, MapPin, Phone, Mail, Globe, Users, Briefcase, Calendar, Edit, Building2, TrendingUp, Heart, Award } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';

export function CompanyProfile() {
  const company = {
    name: 'TechCorp France',
    logo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=200',
    coverPhoto: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200',
    tagline: 'Innovation et bien-être au cœur de nos valeurs',
    bio: 'TechCorp France est une entreprise innovante spécialisée dans les solutions digitales pour les entreprises. Nous plaçons le bien-être de nos collaborateurs au centre de notre stratégie, convaincus qu\'une équipe épanouie est une équipe performante.',
    longDescription: `Fondée en 2015, TechCorp France s'est imposée comme un acteur majeur de la transformation digitale en France. Notre mission est d'accompagner les entreprises dans leur évolution numérique tout en garantissant un environnement de travail sain et équilibré.

Nous croyons que la santé mentale au travail n'est pas un luxe, mais une nécessité. C'est pourquoi nous avons rejoint HuntZen Care pour offrir à nos collaborateurs un accès privilégié à des professionnels de la santé mentale.

Notre engagement : 0% de turnover lié au mal-être au travail d'ici 2026.`,
    
    // Contact Info
    address: '123 Avenue de la Grande Armée, 75017 Paris',
    city: 'Paris',
    country: 'France',
    phone: '+33 1 42 00 00 00',
    email: 'contact@techcorp.fr',
    website: 'www.techcorp.fr',
    
    // Company Details
    industry: 'Technologie & Digital',
    size: '250 employés',
    founded: '2015',
    ceo: 'Jean-Pierre Durand',
    hrManager: 'Claire Rousseau',
    
    // HuntZen Subscription
    huntzenSince: 'Septembre 2024',
    plan: 'Premium',
    employeesEnrolled: '187/250',
    
    // Stats
    stats: {
      totalEmployees: 250,
      enrolled: 187,
      activeUsers: 142,
      appointments: 328,
      satisfaction: 4.6,
    },
    
    // Values
    values: [
      {
        title: 'Innovation',
        description: 'Nous encourageons la créativité et l\'innovation',
        icon: TrendingUp,
      },
      {
        title: 'Bien-être',
        description: 'Le bien-être de nos équipes est notre priorité',
        icon: Heart,
      },
      {
        title: 'Excellence',
        description: 'Nous visons l\'excellence dans tout ce que nous faisons',
        icon: Award,
      },
      {
        title: 'Collaboration',
        description: 'Le travail d\'équipe est au cœur de notre culture',
        icon: Users,
      },
    ],
    
    // Benefits
    benefits: [
      'Télétravail flexible (3j/semaine)',
      'Accès HuntZen Care illimité',
      'Salle de sport dans les locaux',
      'Formation continue',
      'RTT supplémentaires',
      'Tickets restaurant',
      'Mutuelle premium',
      'Budget bien-être (500€/an)',
    ],
    
    // Departments
    departments: [
      { name: 'Développement', count: 85 },
      { name: 'Marketing & Communication', count: 42 },
      { name: 'Ventes', count: 38 },
      { name: 'RH & Administration', count: 25 },
      { name: 'Support Client', count: 35 },
      { name: 'Direction', count: 25 },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Cover Photo & Logo Section */}
      <Card className="overflow-hidden">
        {/* Cover Photo */}
        <div className="relative h-64 bg-gradient-to-r from-primary to-secondary">
          <img
            src={company.coverPhoto}
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
          
          {/* Edit Cover Button */}
          <Button
            size="sm"
            variant="secondary"
            className="absolute top-4 right-4 bg-white/90 hover:bg-white"
          >
            <Camera className="w-4 h-4 mr-2" />
            Modifier la couverture
          </Button>
        </div>

        {/* Company Info Section */}
        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-16 relative">
            {/* Logo */}
            <div className="relative">
              <div className="w-32 h-32 rounded-xl border-4 border-white bg-white overflow-hidden shadow-lg">
                <img
                  src={company.logo}
                  alt={company.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <button className="absolute bottom-2 right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary/90 shadow-lg">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Company Name & Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground">
                {company.name}
              </h1>
              <p className="text-lg text-primary font-medium mt-1">
                {company.tagline}
              </p>
              
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  {company.industry}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {company.size}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {company.city}, {company.country}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Fondée en {company.founded}
                </span>
              </div>
            </div>

            {/* Edit Button */}
            <Button className="bg-primary hover:bg-primary/90">
              <Edit className="w-4 h-4 mr-2" />
              Modifier le profil
            </Button>
          </div>

          {/* Short Bio */}
          <div className="mt-6">
            <p className="text-muted-foreground leading-relaxed">
              {company.bio}
            </p>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground truncate">{company.address}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">{company.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">{company.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Globe className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">{company.website}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* HuntZen Stats */}
      <Card className="p-6 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Abonnement HuntZen Care</h3>
              <p className="text-sm text-muted-foreground">
                Membre depuis {company.huntzenSince} - Plan {company.plan}
              </p>
            </div>
          </div>
          <Button variant="outline">
            Gérer l'abonnement
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-primary">{company.stats.totalEmployees}</p>
            <p className="text-sm text-muted-foreground mt-1">Employés totaux</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-secondary">{company.stats.enrolled}</p>
            <p className="text-sm text-muted-foreground mt-1">Inscrits</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-[#5CB85C]">{company.stats.activeUsers}</p>
            <p className="text-sm text-muted-foreground mt-1">Utilisateurs actifs</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-[#F39C12]">{company.stats.appointments}</p>
            <p className="text-sm text-muted-foreground mt-1">Consultations</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-primary">{company.stats.satisfaction}/5</p>
            <p className="text-sm text-muted-foreground mt-1">Satisfaction</p>
          </div>
        </div>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="about" className="w-full">
        <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-4 gap-2">
          <TabsTrigger value="about">À propos</TabsTrigger>
          <TabsTrigger value="values">Valeurs</TabsTrigger>
          <TabsTrigger value="benefits">Avantages</TabsTrigger>
          <TabsTrigger value="departments">Départements</TabsTrigger>
        </TabsList>

        {/* About Tab */}
        <TabsContent value="about" className="mt-6 space-y-6">
          {/* Description */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Notre histoire</h2>
            <div className="prose prose-sm max-w-none">
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {company.longDescription}
              </p>
            </div>
          </Card>

          {/* Leadership */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Direction</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                    {company.ceo.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold">{company.ceo}</p>
                    <p className="text-sm text-muted-foreground">CEO & Fondateur</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-white font-semibold">
                    {company.hrManager.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold">{company.hrManager}</p>
                    <p className="text-sm text-muted-foreground">Directrice RH</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Informations légales</h2>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Raison sociale</span>
                  <span className="font-medium">{company.name} SAS</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Secteur</span>
                  <span className="font-medium">{company.industry}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Effectif</span>
                  <span className="font-medium">{company.size}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Année de création</span>
                  <span className="font-medium">{company.founded}</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Values Tab */}
        <TabsContent value="values" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {company.values.map((value) => {
              const Icon = value.icon;
              return (
                <Card key={value.title} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                      <p className="text-muted-foreground">{value.description}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Benefits Tab */}
        <TabsContent value="benefits" className="mt-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Avantages employés</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {company.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Departments Tab */}
        <TabsContent value="departments" className="mt-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Structure organisationnelle</h2>
            <div className="space-y-3">
              {company.departments.map((dept) => (
                <div key={dept.name} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-primary" />
                    <span className="font-medium">{dept.name}</span>
                  </div>
                  <span className="text-muted-foreground">{dept.count} employés</span>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
