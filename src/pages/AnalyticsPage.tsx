import { useState } from 'react';
import { useUsageAnalytics, usePerformanceMetrics } from '@/hooks/useAnalytics';
import { PageHeader } from '@/components/shared/PageHeader';
import { CardSkeleton } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  BarChart3, Clock, Zap, Activity, TrendingUp, Search, Calendar as CalendarIcon, Check, Filter,
} from 'lucide-react';
import { formatMs } from '@/lib/utils';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/shared/motion';

export default function AnalyticsPage() {
  // Period states
  const [period, setPeriod] = useState<number>(7);
  const [selectedOption, setSelectedOption] = useState<string>('7');
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);

  // Custom date picker states
  const todayStr = new Date().toISOString().split('T')[0];
  const sevenDaysAgoStr = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [startDate, setStartDate] = useState<string>(sevenDaysAgoStr);
  const [endDate, setEndDate] = useState<string>(todayStr);
  const [customRangeLabel, setCustomRangeLabel] = useState<string | null>(null);

  const { data: perf, isLoading: perfLoading, error: perfError, refetch: refetchPerf } = usePerformanceMetrics({ days: period });
  const { data: usage, isLoading: usageLoading, error: usageError, refetch: refetchUsage } = useUsageAnalytics({ days: period });

  const isLoading = perfLoading || usageLoading;
  const error = perfError || usageError;

  // Handle standard period select change
  const handleSelectChange = (value: string) => {
    if (value === 'custom') {
      setIsCalendarOpen(true);
    } else {
      setSelectedOption(value);
      setPeriod(Number(value));
      setCustomRangeLabel(null);
    }
  };

  // Quick preset handler inside custom date modal
  const applyPreset = (days: number) => {
    const end = new Date();
    const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  // Apply custom dates from modal
  const handleApplyCustomDates = () => {
    if (!startDate || !endDate) return;
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Calculate difference in days
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    setPeriod(diffDays);
    setSelectedOption('custom');
    setCustomRangeLabel(`${startDate} to ${endDate} (${diffDays}d)`);
    setIsCalendarOpen(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Analytics" description="System performance and usage metrics" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} className="h-40" />)}
        </div>
      </div>
    );
  }

  if (error) return <ErrorState title="Failed to load analytics" onRetry={() => { refetchPerf(); refetchUsage(); }} />;

  const queryMetrics = perf?.query_metrics;
  const uploadMetrics = perf?.upload_metrics;
  const usageSummary = usage?.summary;

  return (
    <div className="space-y-10">
      {/* Header with Interactive Calendar & Custom Date Range */}
      <PageHeader title="Analytics" description="System performance, latency distributions, and query usage analytics">
        <div className="flex items-center gap-2.5">
          {/* Clickable Calendar Icon Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsCalendarOpen(true)}
            title="Open Custom Date Picker"
            className="h-11 w-11 rounded-xl border-border bg-card hover:bg-muted hover:text-primary transition-all shadow-sm group"
          >
            <CalendarIcon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </Button>

          {/* Range Selector */}
          <Select value={selectedOption} onValueChange={handleSelectChange}>
            <SelectTrigger className="w-[190px] h-11 text-xs font-bold rounded-xl bg-card border-border shadow-sm">
              <SelectValue placeholder="Select Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="custom" className="font-bold text-primary">
                📅 Custom Date Range...
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Active Custom Filter Badge */}
          {customRangeLabel && (
            <Badge variant="secondary" className="h-11 px-3.5 gap-1.5 font-mono text-xs font-bold bg-primary/10 text-primary border-primary/20 rounded-xl">
              <Filter className="h-3.5 w-3.5" />
              {customRangeLabel}
            </Badge>
          )}
        </div>
      </PageHeader>

      {/* ─── CUSTOM DATE RANGE DIALOG MODAL ─── */}
      <Dialog open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <DialogContent className="max-w-xl sm:max-w-xl p-8 rounded-3xl border border-border bg-card/95 backdrop-blur-2xl shadow-2xl space-y-6">
          <DialogHeader className="space-y-2">
            <DialogTitle className="flex items-center gap-3 text-xl font-black text-foreground">
              <CalendarIcon className="h-6 w-6 text-primary" />
              Custom Analytics Date Range
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-muted-foreground">
              Filter workspace performance, latencies, and usage metrics between specific dates.
            </DialogDescription>
          </DialogHeader>

          {/* Quick Presets */}
          <div className="space-y-2.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Quick Timeframe Presets
            </Label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: '7 Days', days: 7 },
                { label: '14 Days', days: 14 },
                { label: '30 Days', days: 30 },
                { label: '60 Days', days: 60 },
                { label: '90 Days', days: 90 },
                { label: '180 Days', days: 180 },
              ].map((p) => (
                <button
                  key={p.days}
                  type="button"
                  onClick={() => applyPreset(p.days)}
                  className="py-2.5 px-4 text-xs font-extrabold rounded-2xl border border-border bg-muted/40 hover:bg-primary/10 hover:border-primary/40 text-muted-foreground hover:text-primary transition-all shadow-sm"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Custom Date Inputs */}
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="start-date" className="text-xs font-extrabold text-foreground">
                From Date
              </Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-12 text-sm font-semibold rounded-2xl bg-background border-border px-4"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date" className="text-xs font-extrabold text-foreground">
                To Date
              </Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-12 text-sm font-semibold rounded-2xl bg-background border-border px-4"
              />
            </div>
          </div>

          {/* Summary Box */}
          <div className="p-4 rounded-2xl bg-muted/50 border border-border/80 text-sm font-semibold text-muted-foreground flex items-center justify-between">
            <span>Selected Duration:</span>
            <span className="font-mono font-bold text-primary text-sm">
              {startDate && endDate ? `${startDate} to ${endDate}` : 'Select dates'}
            </span>
          </div>

          {/* Dialog Action Buttons */}
          <DialogFooter className="gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsCalendarOpen(false)}
              className="rounded-2xl h-11 text-xs font-extrabold border-border px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApplyCustomDates}
              className="gap-2 rounded-2xl h-11 text-xs font-black shadow-lg shadow-primary/25 px-7"
            >
              <Check className="h-4 w-4" />
              Apply Date Filter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* Top Cards Row */}
      <StaggerContainer className="grid gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
        <StaggerItem>
          <Card className="relative overflow-hidden p-6 glass-card border border-border shadow-md">
            <div className="absolute top-4 right-2 p-3 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
              <Search className="h-5 w-5" />
            </div>
            <CardHeader className="flex flex-row items-start justify-start p-0 pb-6 space-y-0">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground pr-14">
                Total Queries
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-4xl font-black tracking-tight text-foreground">
                {queryMetrics?.total_queries?.toLocaleString() ?? 0}
              </div>
            </CardContent>
          </Card>
        </StaggerItem>

        <StaggerItem>
          <Card className="relative overflow-hidden p-6 glass-card border border-border shadow-md">
            <div className="absolute top-4 right-2 p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Clock className="h-5 w-5" />
            </div>
            <CardHeader className="flex flex-row items-start justify-start p-0 pb-6 space-y-0">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground pr-14">
                Avg Latency
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-4xl font-black tracking-tight text-foreground">
                {formatMs(queryMetrics?.avg_latency_ms ?? 0)}
              </div>
            </CardContent>
          </Card>
        </StaggerItem>

        <StaggerItem>
          <Card className="relative overflow-hidden p-6 glass-card border border-border shadow-md">
            <div className="absolute top-4 right-2 p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <Activity className="h-5 w-5" />
            </div>
            <CardHeader className="flex flex-row items-start justify-start p-0 pb-6 space-y-0">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground pr-14">
                Total Uploads
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-4xl font-black tracking-tight text-foreground">
                {uploadMetrics?.total_uploads?.toLocaleString() ?? 0}
              </div>
            </CardContent>
          </Card>
        </StaggerItem>

        <StaggerItem>
          <Card className="relative overflow-hidden p-6 glass-card border border-border shadow-md">
            <div className="absolute top-4 right-2 p-3 rounded-2xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
              <TrendingUp className="h-5 w-5" />
            </div>
            <CardHeader className="flex flex-row items-start justify-start p-0 pb-6 space-y-0">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground pr-14">
                Pages Indexed
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-4xl font-black tracking-tight text-foreground">
                {usageSummary?.total_pages_indexed?.toLocaleString() ?? 0}
              </div>
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerContainer>

      {/* Breakdown Section */}
      <FadeIn delay={0.2} className="grid gap-8 grid-cols-1">
        {/* Query Performance Card */}
        <Card className="p-8 glass-card border border-border shadow-lg">
          <CardHeader className="p-0 pb-6">
            <CardTitle className="text-lg font-extrabold flex items-center gap-2.5 text-foreground">
              <Zap className="h-5 w-5 text-primary" />
              Query Performance & Percentiles
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-2xl bg-muted/50 border border-border">
                <p className="text-xs uppercase font-extrabold text-muted-foreground">p50 Latency</p>
                <p className="text-2xl font-black mt-2 text-foreground">{formatMs(queryMetrics?.p50_latency_ms ?? 0)}</p>
              </div>
              <div className="text-center p-4 rounded-2xl bg-muted/50 border border-border">
                <p className="text-xs uppercase font-extrabold text-muted-foreground">p95 Latency</p>
                <p className="text-2xl font-black mt-2 text-foreground">{formatMs(queryMetrics?.p95_latency_ms ?? 0)}</p>
              </div>
              <div className="text-center p-4 rounded-2xl bg-muted/50 border border-border">
                <p className="text-xs uppercase font-extrabold text-muted-foreground">p99 Latency</p>
                <p className="text-2xl font-black mt-2 text-foreground">{formatMs(queryMetrics?.p99_latency_ms ?? 0)}</p>
              </div>
              <div className="text-center p-4 rounded-2xl bg-muted/50 border border-border">
                <p className="text-xs uppercase font-extrabold text-muted-foreground">Avg Retrieved Chunks</p>
                <p className="text-2xl font-black mt-2 text-foreground">
                  {queryMetrics?.avg_retrieved_chunks != null ? queryMetrics.avg_retrieved_chunks.toFixed(1) : '0.0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upload Performance Card */}
        <Card className="p-8 glass-card border border-border shadow-lg">
          <CardHeader className="p-0 pb-6">
            <CardTitle className="text-lg font-extrabold flex items-center gap-2.5 text-foreground">
              <BarChart3 className="h-5 w-5 text-emerald-500" />
              Upload & Vector Processing
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-2xl bg-muted/50 border border-border">
                <p className="text-xs uppercase font-extrabold text-muted-foreground">Avg Proc Time</p>
                <p className="text-2xl font-black mt-2 text-foreground">{formatMs(uploadMetrics?.avg_processing_time_ms ?? 0)}</p>
              </div>
              <div className="text-center p-4 rounded-2xl bg-muted/50 border border-border">
                <p className="text-xs uppercase font-extrabold text-muted-foreground">p50 Proc Time</p>
                <p className="text-2xl font-black mt-2 text-foreground">{formatMs(uploadMetrics?.p50_processing_time_ms ?? 0)}</p>
              </div>
              <div className="text-center p-4 rounded-2xl bg-muted/50 border border-border">
                <p className="text-xs uppercase font-extrabold text-muted-foreground">p95 Proc Time</p>
                <p className="text-2xl font-black mt-2 text-foreground">{formatMs(uploadMetrics?.p95_processing_time_ms ?? 0)}</p>
              </div>
              <div className="text-center p-4 rounded-2xl bg-muted/50 border border-border">
                <p className="text-xs uppercase font-extrabold text-muted-foreground">Failed Uploads</p>
                <p className="text-2xl font-black mt-2 text-foreground">
                  {uploadMetrics?.failed_uploads ?? 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Usage Summary Card */}
      <FadeIn delay={0.3}>
        <Card className="p-8 glass-card border border-border shadow-lg">
          <CardHeader className="p-0 pb-6">
            <CardTitle className="text-lg font-extrabold flex items-center gap-2.5 text-foreground">
              <Activity className="h-5 w-5 text-purple-500" />
              Usage Summary ({customRangeLabel || `${period}-Day Period`})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="p-5 rounded-2xl bg-muted/40 border border-border">
                <p className="text-xs text-muted-foreground uppercase font-extrabold">Chat Messages</p>
                <p className="text-3xl font-black text-foreground mt-2">
                  {usageSummary?.total_chat_messages?.toLocaleString() ?? 0}
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-muted/40 border border-border">
                <p className="text-xs text-muted-foreground uppercase font-extrabold">Total Vectors</p>
                <p className="text-3xl font-black text-foreground mt-2">
                  {usageSummary?.total_vectors?.toLocaleString() ?? 0}
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-muted/40 border border-border">
                <p className="text-xs text-muted-foreground uppercase font-extrabold">Queries / Day</p>
                <p className="text-3xl font-black text-foreground mt-2">
                  {usageSummary?.queries_per_day != null ? usageSummary.queries_per_day.toFixed(1) : '0.0'}
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-muted/40 border border-border">
                <p className="text-xs text-muted-foreground uppercase font-extrabold">Messages / Day</p>
                <p className="text-3xl font-black text-foreground mt-2">
                  {usageSummary?.messages_per_day != null ? usageSummary.messages_per_day.toFixed(1) : '0.0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
