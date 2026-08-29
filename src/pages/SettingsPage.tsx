import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ArrowLeft,
  LogOut,
  Sun,
  Moon,
  Monitor,
  Settings,
  ChevronDown,
  Check,
  Trash2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { FadeIn } from '@/components/shared/motion';
import { useState } from 'react';
import { authApi } from '@/api/auth';
import { toast } from 'sonner';

function ColorModeSection({
  theme,
  setTheme,
  themeOptions,
}: {
  theme: string;
  setTheme: (t: 'light' | 'dark' | 'system') => void;
  themeOptions: Array<{ value: string; label: string; icon: any }>;
}) {
  const [expanded, setExpanded] = useState(false);

  const currentOption = themeOptions.find((opt) => opt.value === theme);
  const CurrentIcon = currentOption?.icon || Monitor;

  return (
    <div className="space-y-3">
      {/* Collapsed View - Clickable */}
      {!expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="w-full p-4 rounded-xl border border-border/60 bg-card/50 hover:bg-card/80 hover:border-primary/50 transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <CurrentIcon className="h-5 w-5 text-muted-foreground" />
            <div className="text-left">
              <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Color mode
              </p>
              <p className="text-base font-semibold text-foreground">{currentOption?.label}</p>
            </div>
          </div>
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        </button>
      )}

      {/* Expanded View - All Options */}
      {expanded && (
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground px-2">
            Color mode
          </p>
          <div className="space-y-2">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = theme === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() => {
                    setTheme(option.value as 'light' | 'dark' | 'system');
                    setExpanded(false);
                  }}
                  className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-primary bg-primary/10 shadow-md shadow-primary/20'
                      : 'border-border/60 bg-card/50 hover:border-primary/50 hover:bg-card/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`h-5 w-5 transition-colors ${
                        isSelected ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    />
                    <span
                      className={`font-semibold ${
                        isSelected ? 'text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {option.label}
                    </span>
                  </div>
                  {isSelected && <Check className="h-5 w-5 text-primary" />}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setExpanded(false)}
            className="w-full p-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const response = await authApi.deleteAccount();
      if (response.success) {
        toast.success('Account deleted successfully');
        // Logout and redirect
        logout();
        navigate('/login');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete account');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const themeOptions = [
    { value: 'system', label: 'System', icon: Monitor },
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-border/70 bg-card/90 backdrop-blur-2xl">
        <div className="flex items-center justify-between px-6 py-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="h-10 w-10 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-3">
                <Settings className="h-6 w-6 text-primary" />
                Settings
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Content */}
      <div className="p-6 max-w-4xl mx-auto space-y-8">
        {/* Email Section */}
        <FadeIn>
          <Card className="p-6 border border-border/80 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Email Address
                </h2>
                <p className="text-xl font-bold text-foreground break-all">{user?.email}</p>
              </div>
              <Badge variant="secondary" className="font-semibold">
                Active
              </Badge>
            </div>
          </Card>
        </FadeIn>

        {/* Color Mode Section */}
        <FadeIn delay={0.1}>
          <ColorModeSection theme={theme} setTheme={setTheme} themeOptions={themeOptions} />
        </FadeIn>

        {/* Logout Section */}
        <FadeIn delay={0.2}>
          <div className="pt-6 border-t border-border/50 space-y-4">
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="w-full gap-2.5 h-12 rounded-xl font-semibold text-base shadow-md shadow-red-500/20"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              You will be signed out and redirected to the login page
            </p>

            {/* Delete Account Button */}
            <Button
              onClick={() => setDeleteDialogOpen(true)}
              variant="outline"
              className="w-full gap-2.5 h-12 rounded-xl font-semibold text-base text-red-600 border-red-600/30 hover:bg-red-600/10 hover:text-red-700"
            >
              <Trash2 className="h-5 w-5" />
              Delete Account
            </Button>
          </div>
        </FadeIn>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Delete Account?
            </DialogTitle>
            <DialogDescription>
              This action is permanent and cannot be undone. All your data will be deleted.
            </DialogDescription>
          </DialogHeader>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm ml-2">
              All knowledge bases, chats, uploads, and account data will be permanently removed.
            </AlertDescription>
          </Alert>

          <DialogFooter className="gap-3 sm:gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="gap-2"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              {isDeleting ? 'Deleting...' : 'Delete Permanently'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
