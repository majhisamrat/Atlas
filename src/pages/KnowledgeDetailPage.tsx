import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useKnowledgeBase,
  useUploadHistory,
  useDeleteKnowledgeBase,
  useUploadDocument,
  useReindexKb,
  useDeleteUpload,
} from '@/hooks/useKnowledge';
import { PageHeader } from '@/components/shared/PageHeader';
import { CardSkeleton } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  ArrowLeft, Upload, RefreshCw, Trash2, FileText, AlertCircle, Clock, Database, BarChart3, Loader2, Sparkles, CheckCircle2, XCircle, HelpCircle,
} from 'lucide-react';
import { formatBytes, formatMs } from '@/lib/utils';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/shared/motion';
import UploadLimitAlert from '@/components/knowledge/UploadLimitAlert';

export default function KnowledgeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: kb, isLoading, error, refetch } = useKnowledgeBase(id);
  const { data: history } = useUploadHistory(id);
  const deleteKb = useDeleteKnowledgeBase();
  const uploadDoc = useUploadDocument();
  const reindexKb = useReindexKb();
  const deleteUpload = useDeleteUpload();

  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteUploadId, setDeleteUploadId] = useState<string | null>(null);
  const [deleteUploadOpen, setDeleteUploadOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [tags, setTags] = useState('');
  
  // Upload limit state
  const [uploadLimitInfo, setUploadLimitInfo] = useState<{
    isLimitReached: boolean;
    uploadCount: number;
    maxUploads: number;
    resetTime: string;
  } | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <PageHeader title="Loading..." />
        <CardSkeleton />
      </div>
    );
  }

  if (error) return <ErrorState title="Failed to load knowledge base" onRetry={() => refetch()} />;
  if (!kb) return <ErrorState title="Knowledge base not found" />;

  // Check if upload limit is reached (5 files per KB)
  const isUploadLimitReached = history && history.uploads.length >= 5;

  const handleUploadDialogOpen = (open: boolean) => {
    setUploadOpen(open);
    // Show limit alert when dialog opens and limit is reached
    if (open && isUploadLimitReached) {
      setUploadLimitInfo({
        isLimitReached: true,
        uploadCount: history?.uploads.length || 5,
        maxUploads: 5,
        resetTime: 'Daily reset at 00:00 UTC',
      });
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      const result = await uploadDoc.mutateAsync({ kbId: id!, file, displayName: displayName || undefined, tags: tags || undefined });
      setUploadOpen(false);
      setFile(null);
      setDisplayName('');
      setTags('');
      setUploadLimitInfo(null);
    } catch (error: any) {
      // Check if error is upload limit error (429)
      if (error?.response?.status === 429) {
        const errorData = error?.response?.data?.detail;
        if (errorData) {
          setUploadLimitInfo({
            isLimitReached: true,
            uploadCount: errorData.upload_count || 5,
            maxUploads: errorData.max_uploads || 5,
            resetTime: errorData.reset_time || 'Unknown',
          });
          // Close the upload dialog but keep the alert visible
          setUploadOpen(false);
          setFile(null);
          setDisplayName('');
          setTags('');
        }
      }
      // Other errors handled by mutation error state
    }
  };

  const handleDelete = async () => {
    await deleteKb.mutateAsync(id!);
    navigate('/knowledge');
  };

  const handleDeleteUpload = async () => {
    if (!deleteUploadId) return;
    await deleteUpload.mutateAsync({ kbId: id!, uploadId: deleteUploadId });
    setDeleteUploadOpen(false);
    setDeleteUploadId(null);
  };

  const stats = [
    { label: 'Total Uploads', value: history?.total ?? 0, icon: FileText, color: 'text-blue-400' },
    { label: 'Total Queries', value: kb.query_count, icon: BarChart3, color: 'text-purple-400' },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title={kb.display_name}
        description={
          <div className="flex items-center gap-2 mt-1">
            <span className="font-mono text-xs text-muted-foreground bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 rounded-md">
              {kb.name}
            </span>
            <Badge variant={kb.status === 'active' ? 'success' : 'secondary'}>{kb.status}</Badge>
          </div>
        }
      >
        <Button variant="outline" onClick={() => navigate('/knowledge')} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button variant="outline" onClick={() => reindexKb.mutate(id!)} disabled={reindexKb.isPending} className="gap-1.5">
          <RefreshCw className={`h-4 w-4 ${reindexKb.isPending ? 'animate-spin' : ''}`} />
          {reindexKb.isPending ? 'Reindexing...' : 'Reindex'}
        </Button>
        <Button onClick={() => handleUploadDialogOpen(true)} disabled={isUploadLimitReached} className="gap-1.5 shadow-md shadow-primary/20">
          <Upload className="h-4 w-4" />
          Upload Document
        </Button>
        <Button variant="destructive" onClick={() => setDeleteOpen(true)} className="gap-1.5">
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </PageHeader>

      {kb.description && (
        <FadeIn className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
          <p className="text-sm text-muted-foreground leading-relaxed">{kb.description}</p>
        </FadeIn>
      )}

      {/* Metrics Row */}
      <StaggerContainer className="grid gap-4 md:grid-cols-2">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <StaggerItem key={s.label}>
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {s.label}
                  </CardTitle>
                  <div className={`p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] ${s.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-extrabold tracking-tight mt-1">{String(s.value)}</div>
                </CardContent>
              </Card>
            </StaggerItem>
          );
        })}
      </StaggerContainer>

      {/* Upload History Section */}
      <FadeIn delay={0.2} className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-bold tracking-tight">Upload History</h2>
        </div>

        {/* Upload Limit Alert */}
        {uploadLimitInfo && (
          <UploadLimitAlert
            isLimitReached={uploadLimitInfo.isLimitReached}
            uploadCount={uploadLimitInfo.uploadCount}
            maxUploads={uploadLimitInfo.maxUploads}
            resetTime={uploadLimitInfo.resetTime}
          />
        )}

        {!history || history.uploads.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No documents uploaded yet"
            description="Upload PDF, DOCX, TXT, or CSV files to index content into vector embeddings for search."
            action={{ label: 'Upload First Document', onClick: () => setUploadOpen(true) }}
          />
        ) : (
          <StaggerContainer className="space-y-3">
            {history.uploads.map((u) => (
              <StaggerItem key={u.id}>
                <Card className="hover:border-white/[0.12] transition-colors">
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <p className="font-semibold text-sm truncate text-foreground">{u.original_filename}</p>
                        <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-2">
                          <span>{formatBytes(u.file_size_bytes)}</span>
                          <span>&middot;</span>
                          <span>{u.page_count} pages</span>
                          <span>&middot;</span>
                          <span>{u.chunk_count} chunks</span>
                          <span>&middot;</span>
                          <span>{u.total_vectors} vectors</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      <Badge
                        variant={
                          u.processing_status === 'completed'
                            ? 'success'
                            : u.processing_status === 'failed'
                            ? 'destructive'
                            : 'warning'
                        }
                      >
                        {u.processing_status}
                      </Badge>

                      {u.processing_duration_ms > 0 && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground/60" />
                          {formatMs(u.processing_duration_ms)}
                        </span>
                      )}

                      {/* Delete Upload Button - Red Icon */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                        title="Delete this upload"
                        onClick={() => {
                          setDeleteUploadId(u.id);
                          setDeleteUploadOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </FadeIn>

      {/* Upload Modal */}
      <Dialog open={uploadOpen} onOpenChange={handleUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Upload Document
            </DialogTitle>
            <DialogDescription>
              Supported formats: PDF, DOCX, PPTX, XLSX, XLS, CSV, TXT, MD
            </DialogDescription>
          </DialogHeader>

          {/* Upload Limit Alert inside Modal */}
          {isUploadLimitReached && (
            <Alert variant="destructive" className="border-red-400/50 bg-red-50/80 dark:bg-red-950/20 rounded-xl">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-sm text-red-800 dark:text-red-300 ml-2">
                <span className="font-bold">Max 5 files per KB</span> - You have reached the upload limit for this knowledge base.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="file">Select File</Label>
              <Input
                id="file"
                type="file"
                accept=".pdf,.docx,.pptx,.xlsx,.xls,.csv,.txt,.md"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="cursor-pointer"
                disabled={isUploadLimitReached}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="display-name">Display Name (Optional)</Label>
              <Input
                id="display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Defaults to original filename"
                disabled={isUploadLimitReached}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tags">Tags (Comma-Separated)</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. sales, q1_report, 2026"
                disabled={isUploadLimitReached}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadOpen(false)}>Cancel</Button>
            <Button onClick={handleUpload} disabled={!file || uploadDoc.isPending || isUploadLimitReached} className="gap-3">
              {uploadDoc.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Start Processing'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <Trash2 className="h-5 w-5" />
              Delete Knowledge Base?
            </DialogTitle>
            <DialogDescription>
              This will permanently delete all uploads, vector embeddings, and chat history associated with this knowledge base.
            </DialogDescription>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              All {history?.total ?? 0} uploaded documents and their vectors will be permanently purged.
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteKb.isPending} className="gap-2">
              {deleteKb.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete Permanently'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Upload Modal */}
      <Dialog open={deleteUploadOpen} onOpenChange={setDeleteUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <Trash2 className="h-5 w-5" />
              Delete Upload?
            </DialogTitle>
            <DialogDescription>
              This will permanently delete this document and its vector embeddings. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              All chunks and vectors associated with this upload will be permanently removed.
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteUploadOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteUpload} disabled={deleteUpload.isPending} className="gap-2">
              {deleteUpload.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
