import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKnowledgeBases, useCreateKnowledgeBase } from '@/hooks/useKnowledge';
import { PageHeader } from '@/components/shared/PageHeader';
import { CardSkeleton } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Database, Calendar, MessageSquare, Loader2 } from 'lucide-react';
import { StaggerContainer, StaggerItem } from '@/components/shared/motion';

export default function KnowledgeBasesPage() {
  const { data: kbs, isLoading, error, refetch } = useKnowledgeBases();
  const createKb = useCreateKnowledgeBase();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', display_name: '', description: '' });

  const handleCreate = async () => {
    if (!form.name || !form.display_name) return;
    await createKb.mutateAsync({
      name: form.name,
      display_name: form.display_name,
      description: form.description || undefined,
    });
    setOpen(false);
    setForm({ name: '', display_name: '', description: '' });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Knowledge Bases" description="Organize documents into domain-specific collections" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} className="h-48" />)}
        </div>
      </div>
    );
  }

  if (error) return <ErrorState title="Failed to load knowledge bases" onRetry={() => refetch()} />;

  return (
    <div className="space-y-8">
      <PageHeader title="Knowledge Bases" description="Organize documents into domain-specific collections">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2.5 shadow-lg shadow-primary/25 text-base font-semibold px-6 h-12">
              <Plus className="h-5 w-5" />
              New Knowledge Base
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl p-8">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2.5 text-2xl font-bold">
                <Database className="h-6 w-6 text-primary" />
                Create Knowledge Base
              </DialogTitle>
              <DialogDescription className="text-lg">
                A knowledge base groups related documents for focused semantic search and AI chat.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-3">
              <div className="space-y-2">
                <Label htmlFor="kb-name" className="text-lg font-bold">Identifier Name</Label>
                <Input
                  id="kb-name"
                  placeholder="e.g. sales_2026"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value.toLowerCase().replace(/\s+/g, '_') }))}
                  className="h-12 text-base"
                />
                <p className="text-sm text-muted-foreground font-medium">Unique identifier used in API requests (no spaces)</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="kb-display" className="text-lg font-bold">Display Title</Label>
                <Input
                  id="kb-display"
                  placeholder="e.g. Sales 2026 Reports"
                  value={form.display_name}
                  onChange={(e) => setForm((p) => ({ ...p, display_name: e.target.value }))}
                  className="h-12 text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kb-desc" className="text-lg font-bold">Description (Optional)</Label>
                <Input
                  id="kb-desc"
                  placeholder="Internal documentation and client invoices..."
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  className="h-12 text-base"
                />
              </div>
            </div>
            <DialogFooter className="gap-3 pt-4">
              <Button variant="outline" size="lg" onClick={() => setOpen(false)} className="text-base font-semibold px-6">Cancel</Button>
              <Button size="lg" onClick={handleCreate} disabled={createKb.isPending || !form.name || !form.display_name} className="gap-2 text-base font-semibold px-6">
                {createKb.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Knowledge Base'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {(!kbs || kbs.length === 0) ? (
        <EmptyState
          icon={Database}
          title="No knowledge bases created yet"
          description="Create your first knowledge base to organize PDF documents, text files, and spreadsheets."
          action={{ label: 'Create Knowledge Base', onClick: () => setOpen(true) }}
        />
      ) : (
        <div className="w-full px-4 sm:px-6 md:px-0">
          <StaggerContainer className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {kbs.map((kb) => (
            <StaggerItem key={kb.id}>
              <Card
                className="group cursor-pointer hover:border-primary/50 hover:shadow-xl transition-all duration-300 relative overflow-hidden h-full flex flex-col justify-between p-6 glass-card border border-border"
                onClick={() => navigate(`/knowledge/${kb.id}`)}
              >
                <CardHeader className="p-0 pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
                        <Database className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-extrabold group-hover:text-primary transition-colors text-foreground">
                          {kb.display_name}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground font-mono font-semibold">{kb.name}</p>
                      </div>
                    </div>
                    <Badge variant={kb.status === 'active' ? 'success' : 'secondary'} className="text-xs px-3 py-1 font-bold">
                      {kb.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-0 space-y-4">
                  {kb.description ? (
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{kb.description}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground/60 italic  ">No description provided</p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-border text-sm font-semibold text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      <strong className="text-foreground">{kb.query_count}</strong> queries
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {new Date(kb.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>
        </div>
      )}
    </div>
  );
}
