import { useState, useEffect } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { ArrowLeft, Clock, User, Eye, BookOpen } from 'lucide-react';
import { api } from '@/app/services/api';

const DEFAULT_IMG = 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800';

interface ArticlePageProps {
  articleId: string;
  onBack: () => void;
}

export function ArticlePage({ articleId, onBack }: ArticlePageProps) {
  const [article, setArticle] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!articleId) {
      setLoading(false);
      setError('Aucun article sélectionné.');
      return;
    }
    setLoading(true);
    setError(null);
    api
      .getNewsArticle(articleId)
      .then((data) => {
        setArticle(data);
        setError(null);
      })
      .catch(() => {
        setArticle(null);
        setError("Article introuvable ou vous n'avez pas accès à cet article.");
      })
      .finally(() => setLoading(false));
  }, [articleId]);

  const readTime = article
    ? `${Math.max(1, Math.ceil((article?.content?.length || 0) / 200))} min`
    : '—';
  const publishedAt = article?.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '—';

  if (loading) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 -ml-2">
          <ArrowLeft className="w-4 h-4" />
          Retour aux actualités
        </Button>
        <div className="text-center py-16 text-muted-foreground">Chargement de l&apos;article…</div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 -ml-2">
          <ArrowLeft className="w-4 h-4" />
          Retour aux actualités
        </Button>
        <Card className="p-12 text-center">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">{error ?? 'Article introuvable.'}</p>
          <Button onClick={onBack}>Retour aux actualités</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 -ml-2">
        <ArrowLeft className="w-4 h-4" />
        Retour aux actualités
      </Button>

      <Card className="overflow-hidden">
        <img
          src={article.imageUrl || DEFAULT_IMG}
          alt={article.title}
          className="w-full h-64 md:h-80 object-cover"
        />
        <div className="p-6 md:p-8">
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full mb-4">
            Bien-être
          </span>
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">{article.title}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mb-6">
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              {article.authorName ?? '—'}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {readTime}
            </span>
            <span>{publishedAt}</span>
            {article.viewCount != null && (
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                {article.viewCount} vue{article.viewCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div
            className="text-foreground leading-relaxed whitespace-pre-wrap [&>*+*]:mt-4"
          >
            {article.content || 'Aucun contenu.'}
          </div>
        </div>
      </Card>
    </div>
  );
}
