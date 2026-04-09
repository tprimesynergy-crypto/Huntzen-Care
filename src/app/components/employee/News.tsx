import { useState, useEffect, useRef } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/app/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/app/components/ui/alert-dialog';
import { BookOpen, Clock, Plus, Pencil, Trash2, Upload } from 'lucide-react';
import { api } from '@/app/services/api';

interface NewsProps {
  onViewArticle?: (articleId: string) => void;
  searchQuery?: string;
  userRole?: string | null;
}

export function News({ onViewArticle, searchQuery, userRole }: NewsProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const canEdit = userRole === 'ADMIN_HUNTZEN' || userRole === 'SUPER_ADMIN';

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const fetchNews = () => {
    setLoading(true);
    api
      .getNews()
      .then((list) => setItems(Array.isArray(list) ? list : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const openCreate = () => {
    setEditingArticle(null);
    setFormTitle('');
    setFormContent('');
    setFormImageUrl('');
    setCreateOpen(true);
  };

  const openEdit = (article: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingArticle(article);
    setFormTitle(article?.title ?? '');
    setFormContent(article?.content ?? '');
    setFormImageUrl(article?.imageUrl ?? '');
    setEditOpen(true);
  };

  const handleCreate = async () => {
    if (!formTitle.trim() || !formContent.trim()) return;
    setSaving(true);
    try {
      await api.createNews({
        title: formTitle.trim(),
        content: formContent.trim(),
        imageUrl: formImageUrl.trim() || null,
      });
      setCreateOpen(false);
      fetchNews();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingArticle?.id || !formTitle.trim() || !formContent.trim()) return;
    setSaving(true);
    try {
      await api.updateNews(editingArticle.id, {
        title: formTitle.trim(),
        content: formContent.trim(),
        imageUrl: formImageUrl.trim() || null,
      });
      setEditOpen(false);
      setEditingArticle(null);
      fetchNews();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm?.id) return;
    setDeleting(true);
    try {
      await api.deleteNews(deleteConfirm.id);
      setDeleteConfirm(null);
      fetchNews();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setImageUploading(true);
    try {
      const { url } = await api.uploadNewsImage(file);
      setFormImageUrl(url);
    } catch (err) {
      console.error(err);
    } finally {
      setImageUploading(false);
      e.target.value = '';
    }
  };

  const normalizedSearch = (searchQuery ?? '').trim().toLowerCase();
  const filteredItems =
    normalizedSearch === ''
      ? items
      : items.filter((n) => {
          const title = (n?.title || '').toString().toLowerCase();
          const content = (n?.content || '').toString().toLowerCase();
          const author = (n?.authorName || '').toString().toLowerCase();
          return (
            title.includes(normalizedSearch) ||
            content.includes(normalizedSearch) ||
            author.includes(normalizedSearch)
          );
        });

  const featured = filteredItems[0];
  const rest = filteredItems.slice(1);
  const readTime = (n: any) => `${Math.max(1, Math.ceil((n?.content?.length || 0) / 200))} min`;
  const excerpt = (n: any) => (n?.content ? n.content.slice(0, 120).trim() + (n.content.length > 120 ? '…' : '') : '');
  const defaultImg = 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400';
  const imageSrc = (url: string | null | undefined) =>
    (url && api.getUploadUrl(url)) || defaultImg;

  return (
    <div className="space-y-6">
      <input
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={handleImageUpload}
      />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-foreground mb-2">Actualités Bien-être</h1>
          <p className="text-muted-foreground">
            Articles, conseils et ressources pour prendre soin de votre santé mentale.
          </p>
        </div>
        {canEdit && (
          <Button onClick={openCreate} className="shrink-0">
            <Plus className="w-4 h-4 mr-2" />
            Créer un article
          </Button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Chargement…</div>
      ) : filteredItems.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Aucun article pour le moment.</p>
          {canEdit && (
            <Button onClick={openCreate} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Créer un article
            </Button>
          )}
        </Card>
      ) : (
        <>
          {featured && (
            <Card
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer relative group/card"
              onClick={() => onViewArticle?.(featured.id)}
              onKeyDown={(e) => e.key === 'Enter' && onViewArticle?.(featured.id)}
              role="button"
              tabIndex={0}
            >
              {canEdit && (
                <div className="absolute top-3 right-3 z-10 flex gap-2 opacity-0 group-hover/card:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                  <Button variant="secondary" size="icon" onClick={(e) => openEdit(featured, e)} title="Modifier">
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={(e) => { e.stopPropagation(); setDeleteConfirm(featured); }} title="Supprimer">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <img
                  src={imageSrc(featured.imageUrl)}
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
                    <span className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                      Lire l&apos;article
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((article) => (
              <Card
                key={article.id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group relative"
                onClick={() => onViewArticle?.(article.id)}
                onKeyDown={(e) => e.key === 'Enter' && onViewArticle?.(article.id)}
                role="button"
                tabIndex={0}
              >
                {canEdit && (
                  <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    <Button variant="secondary" size="icon" className="h-8 w-8" onClick={(e) => openEdit(article, e)} title="Modifier">
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button variant="destructive" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setDeleteConfirm(article); }} title="Supprimer">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
                <img
                  src={imageSrc(article.imageUrl)}
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
                    <span className="text-primary hover:text-primary/80 font-medium">Lire plus →</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer un article</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="create-title">Titre</Label>
              <Input
                id="create-title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Titre de l'article"
              />
            </div>
            <div>
              <Label htmlFor="create-content">Contenu</Label>
              <textarea
                id="create-content"
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="Contenu de l'article"
              />
            </div>
            <div className="space-y-2">
              <Label>Image de l&apos;article (optionnel)</Label>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={imageUploading || saving}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {imageUploading ? 'Envoi…' : 'Téléverser une image'}
                </Button>
                {formImageUrl && (
                  <>
                    <img
                      src={api.getUploadUrl(formImageUrl) ?? formImageUrl}
                      alt="Aperçu"
                      className="h-16 w-16 object-cover rounded border"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormImageUrl('')}
                      disabled={saving}
                    >
                      Supprimer l&apos;image
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={saving}>Annuler</Button>
            <Button onClick={handleCreate} disabled={saving || !formTitle.trim() || !formContent.trim()}>
              {saving ? 'Enregistrement…' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={(open) => { if (!open) setEditingArticle(null); setEditOpen(open); }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier l&apos;article</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="edit-title">Titre</Label>
              <Input
                id="edit-title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Titre de l'article"
              />
            </div>
            <div>
              <Label htmlFor="edit-content">Contenu</Label>
              <textarea
                id="edit-content"
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="Contenu de l'article"
              />
            </div>
            <div className="space-y-2">
              <Label>Image de l&apos;article (optionnel)</Label>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={imageUploading || saving}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {imageUploading ? 'Envoi…' : 'Téléverser une image'}
                </Button>
                {formImageUrl && (
                  <>
                    <img
                      src={api.getUploadUrl(formImageUrl) ?? formImageUrl}
                      alt="Aperçu"
                      className="h-16 w-16 object-cover rounded border"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormImageUrl('')}
                      disabled={saving}
                    >
                      Supprimer l&apos;image
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={saving}>Annuler</Button>
            <Button onClick={handleUpdate} disabled={saving || !formTitle.trim() || !formContent.trim()}>
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l&apos;article</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer &quot;{deleteConfirm?.title}&quot; ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Suppression…' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
