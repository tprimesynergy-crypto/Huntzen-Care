import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { BookOpen, Clock, Heart, TrendingUp, Bookmark } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';

export function News() {
  const featuredArticle = {
    id: 1,
    title: 'Comment gérer le stress au travail : Guide complet 2025',
    excerpt: 'Découvrez les techniques éprouvées par nos psychologues pour maintenir votre équilibre mental au travail.',
    category: 'Santé Mentale',
    author: 'Dr. Sophie Martin',
    readTime: '8 min',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
    date: '20 Jan 2025',
    views: 1234,
  };

  const articles = [
    {
      id: 2,
      title: '5 techniques de respiration pour gérer l\'anxiété',
      excerpt: 'Des exercices simples à pratiquer n\'importe où, n\'importe quand.',
      category: 'Bien-être',
      readTime: '3 min',
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400',
      date: '19 Jan 2025',
      isBookmarked: false,
    },
    {
      id: 3,
      title: 'Sommeil et santé mentale : le lien crucial',
      excerpt: 'Pourquoi bien dormir est essentiel pour votre bien-être psychologique.',
      category: 'Santé',
      readTime: '5 min',
      image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400',
      date: '18 Jan 2025',
      isBookmarked: true,
    },
    {
      id: 4,
      title: 'Burn-out : les signes qui doivent vous alerter',
      excerpt: 'Reconnaître les symptômes avant qu\'il ne soit trop tard.',
      category: 'Prévention',
      readTime: '6 min',
      image: 'https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?w=400',
      date: '17 Jan 2025',
      isBookmarked: false,
    },
    {
      id: 5,
      title: 'Méditation au quotidien : par où commencer ?',
      excerpt: 'Un guide pratique pour débuter la méditation de pleine conscience.',
      category: 'Pratique',
      readTime: '4 min',
      image: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=400',
      date: '16 Jan 2025',
      isBookmarked: false,
    },
    {
      id: 6,
      title: 'Équilibre vie pro/vie perso : nos conseils d\'experts',
      excerpt: 'Comment définir des frontières saines entre travail et vie personnelle.',
      category: 'Équilibre',
      readTime: '7 min',
      image: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400',
      date: '15 Jan 2025',
      isBookmarked: true,
    },
  ];

  const categories = [
    { value: 'all', label: 'Tout', icon: BookOpen },
    { value: 'mental-health', label: 'Santé Mentale', icon: Heart },
    { value: 'wellbeing', label: 'Bien-être', icon: TrendingUp },
    { value: 'bookmarked', label: 'Mes favoris', icon: Bookmark },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-2">
          Actualités Bien-être
        </h1>
        <p className="text-muted-foreground">
          Articles, conseils et ressources pour prendre soin de votre santé mentale.
        </p>
      </div>

      {/* Featured Article */}
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          <img
            src={featuredArticle.image}
            alt={featuredArticle.title}
            className="w-full h-64 md:h-full object-cover"
          />
          <div className="p-6 flex flex-col justify-between">
            <div>
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full mb-3">
                {featuredArticle.category}
              </span>
              <h2 className="text-2xl font-semibold text-foreground mb-3">
                {featuredArticle.title}
              </h2>
              <p className="text-muted-foreground mb-4">
                {featuredArticle.excerpt}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span>{featuredArticle.author}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {featuredArticle.readTime}
                </span>
                <span>•</span>
                <span>{featuredArticle.date}</span>
              </div>
              <Button className="bg-primary hover:bg-primary/90">
                Lire l'article
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Categories Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-4 gap-2">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <TabsTrigger key={category.value} value={category.value} className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                {category.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                <div className="relative">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-48 object-cover group-hover:opacity-90 transition-opacity"
                  />
                  <button className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors shadow-lg">
                    <Bookmark className={`w-4 h-4 ${article.isBookmarked ? 'fill-primary text-primary' : ''}`} />
                  </button>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                      {article.category}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {article.readTime}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{article.date}</span>
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                      Lire plus →
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="bookmarked" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.filter(a => a.isBookmarked).map((article) => (
              <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                <div className="relative">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-48 object-cover group-hover:opacity-90 transition-opacity"
                  />
                  <button className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors shadow-lg">
                    <Bookmark className="w-4 h-4 fill-primary text-primary" />
                  </button>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                      {article.category}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {article.readTime}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{article.date}</span>
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                      Lire plus →
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Impact Social Banner */}
      <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">💙 Notre engagement social</h3>
            <p className="text-sm text-muted-foreground">
              Chaque article que vous lisez contribue à notre mission : 30% des revenus 
              sont reversés à des associations de santé mentale.
            </p>
          </div>
          <Button variant="outline">
            En savoir plus
          </Button>
        </div>
      </Card>
    </div>
  );
}
