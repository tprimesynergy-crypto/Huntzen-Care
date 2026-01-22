import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Heart, Shield, Users, TrendingUp, Check, Star, ArrowRight, Calendar, MessageSquare, Lock } from 'lucide-react';

export function LandingPage() {
  const features = [
    {
      icon: Heart,
      title: 'Accompagnement personnalisé',
      description: 'Accédez à des praticiens certifiés spécialisés en santé mentale au travail.',
    },
    {
      icon: Shield,
      title: 'Confidentialité absolue',
      description: 'Vos données de santé sont chiffrées et jamais partagées avec votre employeur.',
    },
    {
      icon: Calendar,
      title: 'Réservation simplifiée',
      description: 'Prenez rendez-vous en 2 clics avec les créneaux disponibles en temps réel.',
    },
    {
      icon: MessageSquare,
      title: 'Chat sécurisé 24/7',
      description: 'Communiquez avec vos praticiens via un chat chiffré de bout en bout.',
    },
    {
      icon: Users,
      title: 'Communauté bienveillante',
      description: 'Accédez à des ressources, articles et ateliers pour votre bien-être.',
    },
    {
      icon: TrendingUp,
      title: 'Suivi de progression',
      description: 'Visualisez votre évolution et vos progrès au fil des séances.',
    },
  ];

  const benefits = [
    'Réduction de 30-40% de l\'absentéisme',
    'Augmentation de 25% de l\'engagement',
    'Amélioration de 20% de la productivité',
    '30% des revenus reversés à des associations',
    'Conformité RGPD et secret médical',
    'Support client 7j/7',
  ];

  const pricing = [
    {
      name: 'Starter',
      price: '15€',
      period: 'par employé/mois',
      features: [
        'Jusqu\'à 50 employés',
        '3 praticiens disponibles',
        'Chat sécurisé',
        'Ressources bien-être',
        'Support email',
      ],
      cta: 'Essai gratuit 30 jours',
      popular: false,
    },
    {
      name: 'Premium',
      price: '12€',
      period: 'par employé/mois',
      features: [
        'Jusqu\'à 250 employés',
        'Praticiens illimités',
        'Chat + Visio',
        'Ressources premium',
        'Support prioritaire',
        'Dashboards RH',
      ],
      cta: 'Essai gratuit 30 jours',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Sur mesure',
      period: 'tarif négocié',
      features: [
        '250+ employés',
        'Praticiens dédiés',
        'Intégration sur mesure',
        'Formation équipes',
        'Account manager dédié',
        'SLA garanti',
      ],
      cta: 'Nous contacter',
      popular: false,
    },
  ];

  const testimonials = [
    {
      quote: 'Depuis que nous avons intégré HuntZen Care, l\'ambiance au travail s\'est nettement améliorée. Les employés se sentent écoutés et soutenus.',
      author: 'Claire Rousseau',
      role: 'DRH, TechCorp France',
      company: '250 employés',
      rating: 5,
    },
    {
      quote: 'Une plateforme intuitive et respectueuse de la vie privée. J\'ai pu consulter rapidement un psychologue sans craindre que mon employeur soit au courant.',
      author: 'Marc D.',
      role: 'Chef de Projet',
      company: 'Employé TechCorp',
      rating: 5,
    },
    {
      quote: 'L\'interface est magnifique et apaisante. On sent qu\'elle a été conçue avec soin pour nous mettre en confiance.',
      author: 'Sophie M.',
      role: 'Développeuse',
      company: 'Employée StartupXYZ',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/5 to-background py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
                <Heart className="w-4 h-4" />
                La santé mentale au cœur de l'entreprise
              </div>
              <h1 className="text-5xl font-bold text-foreground mb-6 leading-tight">
                Prenez soin de vos équipes avec <span className="text-primary">HuntZen Care</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                La première plateforme SaaS de santé mentale pour entreprises qui allie 
                technologie, confidentialité et accompagnement humain.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Demander une démo
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button size="lg" variant="outline">
                  Nous contacter
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                ✓ Solution sur mesure • ✓ Démo personnalisée • ✓ Support dédié
              </p>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600"
                alt="Dashboard HuntZen Care"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Une plateforme complète pour le bien-être de vos équipes
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tout ce dont vous avez besoin pour accompagner vos collaborateurs vers un mieux-être durable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-6">
                Des résultats mesurables pour votre entreprise
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Investir dans le bien-être de vos équipes, c'est investir dans la performance de votre entreprise.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#5CB85C] rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600"
                alt="Équipe heureuse"
                className="rounded-2xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section - SUPPRIMÉ (praticiens payés hors plateforme) */}

      {/* Testimonials */}
      <section className="py-20 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Ils nous font confiance
            </h2>
            <p className="text-xl text-muted-foreground">
              Découvrez les témoignages de nos utilisateurs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.author} className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#F39C12] text-[#F39C12]" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">
                  "{testimonial.quote}"
                </p>
                <div className="border-t pt-4">
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.company}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 px-6 bg-background">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Sécurité & Confidentialité garanties
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Vos données de santé sont protégées par un chiffrement AES-256 de bout en bout. 
            Nous sommes 100% conformes RGPD et respectons le secret médical absolu.
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-[#5CB85C]" />
              <span>Certifié RGPD</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-[#5CB85C]" />
              <span>Chiffrement E2E</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-[#5CB85C]" />
              <span>Hébergement France</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-[#5CB85C]" />
              <span>ISO 27001</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-6 bg-gradient-to-br from-primary to-secondary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            Prêt à transformer votre entreprise ?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Rejoignez les 100+ entreprises qui ont fait le choix du bien-être avec HuntZen Care.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
              Démarrer maintenant
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Parler à un expert
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-[#2C3E50] text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-6 h-6" />
                <span className="text-xl font-semibold">HuntZen Care</span>
              </div>
              <p className="text-sm text-white/60">
                La santé mentale au cœur de l'entreprise.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li><a href="#" className="hover:text-white">Fonctionnalités</a></li>
                <li><a href="#" className="hover:text-white">Tarifs</a></li>
                <li><a href="#" className="hover:text-white">Sécurité</a></li>
                <li><a href="#" className="hover:text-white">Démo</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li><a href="#" className="hover:text-white">À propos</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Carrières</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li><a href="#" className="hover:text-white">CGU</a></li>
                <li><a href="#" className="hover:text-white">Confidentialité</a></li>
                <li><a href="#" className="hover:text-white">Mentions légales</a></li>
                <li><a href="#" className="hover:text-white">RGPD</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-white/60">
            <p>© 2025 HuntZen Care. Tous droits réservés. 30% des revenus reversés à des associations de santé mentale. 💙</p>
          </div>
        </div>
      </footer>
    </div>
  );
}