import { useState, useEffect } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { BookOpen, Clock } from 'lucide-react';
import { api } from '@/app/services/api';

export function News() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getNews()
      .then((list) => setItems(Array.isArray(list) ? list : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const featured = items[0];
  const rest = items.slice(1);
  const readTime = (n: any) => `${Math.max(1, Math.ceil((n?.content?.length || 0) / 200))} min`;
  const excerpt = (n: any) => (n?.content ? n.content.slice(0, 120).trim() + (n.content.length > 120 ? '…' : '') : '');
  const defaultImg = 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-2">Actualités Bien-être</h1>
        <p className="text-muted-foreground">
          Articles, conseils et ressources pour prendre soin de votre santé mentale.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Chargement…</div>
      ) : items.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Aucun article pour le moment.</p>
        </Card>
      ) : (
        <>
          {featured && (
            <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <img
                  src={featured.imageUrl || defaultImg}
                  alt={featured.title}
                  className="w-full h-64 md:h-full object-cover"
                />
                <div className="p-6 flex flex-col justify-between">
                  <div>
                    <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full mb-3">
                      Bien-être
                    </span>
                    <h2 className="text-2xl font-semibold text-foreground mb-3">{featured.title}</h2>
                    <p className="text-muted-foreground mb-4">{excerpt(featured)}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span>{featured.authorName ?? '—'}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {readTime(featured)}
                      </span>
                      <span>•</span>
                      <span>
                        {featured.publishedAt
                          ? new Date(featured.publishedAt).toLocaleDateString('fr-FR')
                          : '—'}
                      </span>
                    </div>
                    <Button className="bg-primary hover:bg-primary/90">Lire l&apos;article</Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((article) => (
              <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                <img
                  src={article.imageUrl || defaultImg}
                  alt={article.title}
                  className="w-full h-48 object-cover group-hover:opacity-90 transition-opacity"
                />
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">Bien-être</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {readTime(article)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">{excerpt(article)}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {article.publishedAt
                        ? new Date(article.publishedAt).toLocaleDateString('fr-FR')
                        : '—'}
                    </span>
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                      Lire plus →
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
