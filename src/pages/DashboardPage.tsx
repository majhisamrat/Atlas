import { useNavigate } from 'react-router-dom';
import { useDashboard } from '@/hooks/useAnalytics';
import { PageHeader } from '@/components/shared/PageHeader';
import { CardSkeleton } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Database, FileText, Layers, Search, BarChart3, ArrowUpRight, Sparkles, ChevronRight } from 'lucide-react';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/shared/motion';

const statCards = [
  { key: 'total_knowledge_bases', label: 'Knowledge Bases', icon: Database, gradient: 'from-blue-500/20 to-cyan-500/20', iconColor: 'text-blue-500' },
  { key: 'total_uploads', label: 'Uploads', icon: FileText, gradient: 'from-emerald-500/20 to-teal-500/20', iconColor: 'text-emerald-500' },
  { key: 'total_chunks', label: 'Vector Chunks', icon: Layers, gradient: 'from-purple-500/20 to-pink-500/20', iconColor: 'text-purple-500' },
  { key: 'total_queries', label: 'Queries Run', icon: Search, gradient: 'from-amber-500/20 to-orange-500/20', iconColor: 'text-amber-500' },
  { key: 'total_pages', label: 'Pages Indexed', icon: BarChart3, gradient: 'from-rose-500/20 to-red-500/20', iconColor: 'text-rose-500' },
];

export default function DashboardPage() {
  const { data, isLoading, error, refetch } = useDashboard();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <PageHeader title="Dashboard" description="Overview of your intelligent document workspace" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} className="h-48" />)}
        </div>
      </div>
    );
  }

  if (error) return <ErrorState title="Failed to load dashboard" onRetry={() => refetch()} />;

  const summary = data?.summary;

  return (
    <div className="space-y-12">
      <PageHeader title="Dashboard" description="Overview of your intelligent document workspace">
        <Button onClick={() => navigate('/knowledge')} size="lg" className="gap-3 shadow-xl shadow-primary/30 text-lg font-black px-8 h-14 rounded-2xl">
          <Plus className="h-6 w-6" />
          New Knowledge Base
        </Button>
      </PageHeader>

      {/* Metrics Row */}
      <StaggerContainer className="grid gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map((stat) => {
          const value = summary?.[stat.key as keyof typeof summary] ?? 0;
          const Icon = stat.icon;
          return (
            <StaggerItem key={stat.key}>
              <Card className="relative overflow-hidden group p-5 md:p-8 glass-card border border-border shadow-xl rounded-2xl md:rounded-3xl">
                <div className={`absolute top-0 right-0 w-40 h-40 rounded-full bg-gradient-to-br ${stat.gradient} blur-3xl pointer-events-none group-hover:scale-150 transition-transform duration-500`} />
                <div className={`absolute top-4 md:top-6 right-2 md:right-3 p-2.5 md:p-3.5 rounded-xl md:rounded-2xl bg-muted/80 border border-border ${stat.iconColor}`}>
                  <Icon className="h-4 md:h-6 w-4 md:w-6" />
                </div>
                <CardHeader className="flex flex-col items-start justify-start p-0 pb-6 md:pb-8 space-y-0">
                  <CardTitle className="text-lg md:text-xs font-black uppercase tracking-wider text-muted-foreground pr-14">
                    {stat.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
                    {Number(value).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          );
        })}
      </StaggerContainer>

      {/* Knowledge Bases Section */}
      <FadeIn delay={0.2} className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-black tracking-tight text-foreground">Active Knowledge Bases</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/knowledge')} className="text-base font-extrabold text-muted-foreground gap-1.5 hover:text-foreground ">
            View All <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {(!data?.knowledge_bases || data.knowledge_bases.length === 0) ? (
          <Card className="p-8 md:p-16 text-center border-dashed border-2 rounded-3xl">
            <p className="text-base md:text-lg text-muted-foreground font-semibold">No active knowledge bases found.</p>
            <Button variant="outline" onClick={() => navigate('/knowledge')} className="mt-6 gap-2 md:gap-3 text-sm md:text-lg font-black px-4 md:px-8 h-10 md:h-14 rounded-lg md:rounded-2xl w-full md:w-auto">
              <Plus className="h-5 md:h-6 w-5 md:w-6" /> 
              <span>Create First Knowledge Base</span>
            </Button>
          </Card>
        ) : (
          <StaggerContainer className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {data.knowledge_bases.map((kb) => (
              <StaggerItem key={kb.id}>
                <Card
                  className="group cursor-pointer hover:border-primary/60 hover:shadow-2xl transition-all duration-300 relative overflow-hidden glass-card p-8 border border-border rounded-3xl"
                  onClick={() => navigate(`/knowledge/${kb.id}`)}
                >
                  <CardHeader className="p-0 pb-5">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1.5">
                        <CardTitle className="text-2xl font-black group-hover:text-primary transition-colors flex items-center gap-2.5 text-foreground">
                          {kb.display_name}
                          <ArrowUpRight className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                        </CardTitle>
                        <p className="text-sm text-muted-foreground font-mono font-bold">{kb.name}</p>
                      </div>
                      <Badge variant={kb.status === 'active' ? 'success' : 'secondary'} className="text-xs px-3.5 py-1.5 font-black uppercase tracking-wider">
                        {kb.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="grid grid-cols-2 gap-4 p-5 rounded-2xl bg-muted/50 border border-border text-base">
                      <div>
                        <span className="text-muted-foreground block text-sm uppercase font-extrabold">Uploads</span>
                        <span className="font-black text-lg text-foreground">{kb.statistics?.total_uploads ?? 0}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-sm uppercase font-extrabold">Queries</span>
                        <span className="font-black text-lg text-foreground">{kb.statistics?.query_count ?? 0}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-sm uppercase font-extrabold">Vectors</span>
                        <span className="font-black text-lg text-foreground">{kb.statistics?.total_vectors ?? 0}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-sm uppercase font-extrabold">Pages</span>
                        <span className="font-black text-lg text-foreground">{kb.statistics?.total_pages ?? 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </FadeIn>
    </div>
  );
}
