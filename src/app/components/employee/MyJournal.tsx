import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';
import { BookOpen, Plus, Calendar, Smile, Meh, Frown, Trash2 } from 'lucide-react';
import { api } from '@/app/services/api';

const MOOD_ENUM = ['VERY_BAD', 'BAD', 'NEUTRAL', 'GOOD', 'VERY_GOOD'] as const;
const moodIcons = [
  { value: 5, icon: Smile, label: 'Très bien', color: 'text-[#5CB85C]', mood: 'VERY_GOOD' as const },
  { value: 4, icon: Smile, label: 'Bien', color: 'text-[#5BC0DE]', mood: 'GOOD' as const },
  { value: 3, icon: Meh, label: 'Neutre', color: 'text-[#F39C12]', mood: 'NEUTRAL' as const },
  { value: 2, icon: Frown, label: 'Pas bien', color: 'text-[#E74C3C]', mood: 'BAD' as const },
  { value: 1, icon: Frown, label: 'Très mal', color: 'text-[#C0392B]', mood: 'VERY_BAD' as const },
];

function moodToValue(m: string | null): number {
  const idx = MOOD_ENUM.indexOf(m as any);
  return idx >= 0 ? idx + 1 : 3;
}

export function MyJournal() {
  const [entries, setEntries] = useState<any[]>([]);
  const [stats, setStats] = useState<{ total: number; avgMood: number | null; streak: number }>({ total: 0, avgMood: null, streak: 0 });
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({ content: '', mood: 3 as number, tags: '' });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [list, st] = await Promise.all([
        api.getJournal(),
        api.getJournalStats(),
      ]);
      setEntries(Array.isArray(list) ? list : []);
      setStats(
        st && typeof st === 'object' && 'total' in st
          ? { total: st.total, avgMood: st.avgMood ?? null, streak: st.streak ?? 0 }
          : { total: 0, avgMood: null, streak: 0 }
      );
    } catch {
      setEntries([]);
      setStats({ total: 0, avgMood: null, streak: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async () => {
    if (!form.content.trim()) return;
    try {
      const moodEntry = moodIcons.find((m) => m.value === form.mood);
      await api.createJournalEntry({
        content: form.content.trim(),
        mood: moodEntry?.mood,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      });
      setForm({ content: '', mood: 3, tags: '' });
      setIsCreating(false);
      load();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteJournalEntry(id);
      load();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground mb-2">Mon Journal Personnel</h1>
          <p className="text-muted-foreground">
            Notez vos pensées, vos progrès et votre état d&apos;esprit. Totalement confidentiel.
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90" onClick={() => setIsCreating(!isCreating)}>
          <Plus className="w-4 h-4 mr-2" /> Nouvelle entrée
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{loading ? '…' : stats.total}</p>
              <p className="text-sm text-muted-foreground">Entrées totales</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#5CB85C]/10 rounded-lg flex items-center justify-center">
              <Smile className="w-6 h-6 text-[#5CB85C]" />
            </div>
            <div>
              <p className="text-2xl font-semibold">
                {loading ? '…' : stats.avgMood != null ? `${stats.avgMood.toFixed(1)}/5` : '—'}
              </p>
              <p className="text-sm text-muted-foreground">Humeur moyenne</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#F39C12]/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-[#F39C12]" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{loading ? '…' : stats.streak}</p>
              <p className="text-sm text-muted-foreground">Jours consécutifs</p>
            </div>
          </div>
        </Card>
      </div>

      {isCreating && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Nouvelle entrée</h3>
          <div className="mb-4">
            <label className="text-sm font-medium mb-2 block">Comment vous sentez-vous aujourd&apos;hui ?</label>
            <div className="flex gap-4">
              {moodIcons.map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, mood: m.value }))}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-colors ${
                      form.mood === m.value ? 'bg-primary/10 ring-2 ring-primary' : 'hover:bg-muted'
                    }`}
                  >
                    <Icon className={`w-8 h-8 ${m.color}`} />
                    <span className="text-xs text-muted-foreground">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mb-4">
            <label className="text-sm font-medium mb-2 block">Vos pensées</label>
            <Textarea
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              placeholder="Décrivez votre journée, vos émotions, vos réflexions..."
              className="min-h-32 bg-input-background"
            />
          </div>
          <div className="mb-4">
            <label className="text-sm font-medium mb-2 block">Tags (optionnel)</label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              placeholder="Ex: travail, stress, progrès"
              className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">Séparez les tags par des virgules</p>
          </div>
          <div className="flex gap-3">
            <Button className="bg-primary hover:bg-primary/90" onClick={handleCreate}>
              Enregistrer
            </Button>
            <Button variant="outline" onClick={() => setIsCreating(false)}>
              Annuler
            </Button>
          </div>
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              🔒 Vos entrées sont strictement confidentielles. Personne ne peut les lire.
            </p>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Vos entrées</h2>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Chargement…</div>
        ) : entries.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">Aucune entrée. Créez-en une pour commencer.</p>
          </Card>
        ) : (
          entries.map((e) => {
            const v = moodToValue(e.mood);
            const m = moodIcons.find((x) => x.value === v) ?? moodIcons[2];
            const Icon = m.icon;
            const title = e.content ? e.content.split('\n')[0].slice(0, 50) : 'Sans titre';
            const date = new Date(e.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
            return (
              <Card key={e.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Icon className={`w-6 h-6 ${m.color}`} />
                    <div>
                      <h3 className="text-lg font-semibold">{title}{title.length >= 50 ? '…' : ''}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{date}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(e.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-muted-foreground mb-3 whitespace-pre-wrap">{e.content}</p>
                <div className="flex flex-wrap gap-2">
                  {(e.tags ?? []).map((tag: string) => (
                    <span key={tag} className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
