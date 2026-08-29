import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Database,
  MessageSquare,
  BarChart3,
  LogOut,
  Brain,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Sun,
  Moon,
  Monitor,
  Menu,
  X,
  Download,
  Settings,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { usePWA } from '@/context/PWAContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/knowledge', icon: Database, label: 'Knowledge Bases' },
  { to: '/chat', icon: MessageSquare, label: 'Chat Assistant' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
];

export function Sidebar({ collapsed, onToggle, isDrawerOpen, onDrawerClose }: { 
  collapsed?: boolean; 
  onToggle?: () => void;
  isDrawerOpen?: boolean;
  onDrawerClose?: () => void;
}) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isInstalled, promptInstall } = usePWA();
  const location = useLocation();
  const navigate = useNavigate();
  const [internalCollapsed, setInternalCollapsed] = useState(false);

  // On mobile drawer, never collapse. On desktop, use the collapsed prop.
  const isCollapsed = isDrawerOpen ? false : (collapsed ?? internalCollapsed);
  const toggleCollapse = onToggle ?? (() => setInternalCollapsed(!internalCollapsed));

  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'U';

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-50 h-screen transition-all duration-300 ease-out glass-sidebar bg-white/90 backdrop-blur-2xl flex flex-col justify-between border-r border-sky-100 shadow-[clamp(0.625rem,0.625rem,0.78125rem)_0_clamp(3.125rem,3.125rem,3.90625rem)_clamp(-1.953125rem,-1.953125rem,-2.44140625rem)_rgba(10,50,100,.35)] overflow-hidden',
        // Desktop: always flex. Mobile/Responsive: hidden unless drawer open
        'md:flex',
        isDrawerOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      )}
      style={{
        width: isCollapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
      }}
    >
      {/* Top Section */}
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 py-5 h-20 border-b border-border">
          <div className="flex items-center gap-3.5 overflow-hidden">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#123e88] shadow-md shadow-blue-900/20 glow-sm">
              <Brain className="h-6 w-6 text-white" />
              <Sparkles className="absolute -top-1 -right-1 h-3.5 w-3.5 text-sky-300 animate-pulse" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col transition-opacity duration-200">
                <span className="brand-atlas text-2xl leading-none text-[#082c67]">
                  ATLAS
                </span>
                <span className="text-xs font-bold tracking-[0.16em] text-sky-700 uppercase">
                  Intelligence hub
                </span>
              </div>
            )}
          </div>

          {/* Collapse Toggle Button - Menu Icon with Animation */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className="hidden md:flex h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-transform duration-300"
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-2 p-3.5">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.to ||
              (item.to !== '/' && location.pathname.startsWith(item.to));

            const navLinkContent = (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={onDrawerClose}
                className={cn(
                  'relative flex items-center gap-3.5 rounded-xl px-4 py-3 text-base font-semibold transition-all duration-200 group',
                  isActive
                    ? 'bg-[#123e88] text-primary-foreground shadow-md shadow-blue-900/20 font-bold'
                    : 'text-muted-foreground hover:bg-sky-50 hover:text-[#123e88]',
                  isCollapsed && 'justify-center px-0',
                )}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110',
                    isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground',
                  )}
                />
                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            );

            if (isCollapsed) {
              return (
                <Tooltip key={item.to} delayDuration={0}>
                  <TooltipTrigger asChild>{navLinkContent}</TooltipTrigger>
                  <TooltipContent side="right" className="font-bold text-sm">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return navLinkContent;
          })}
        </nav>
      </div>

      {/* Bottom Actions & User Section */}
      <div className="p-4 border-t border-border space-y-3">
        {/* Get App Button - only show if not installed */}
        {!isInstalled && (
          isCollapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    promptInstall();
                    if (isDrawerOpen) onDrawerClose?.();
                  }}
                  className="w-full h-10 rounded-xl text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Install App</TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                promptInstall();
                if (isDrawerOpen) onDrawerClose?.();
              }}
              className="w-full justify-start gap-2.5 rounded-xl text-sm font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors h-10"
            >
              <Download className="h-4 w-4" />
              Get App
            </Button>
          )
        )}

        {/* User Card - Clickable to Settings */}
        <button
          onClick={() => {
            navigate('/settings');
            if (isDrawerOpen) onDrawerClose?.();
          }}
          className={cn(
            'w-full flex items-center gap-3 rounded-xl p-2.5 bg-muted/50 border border-border/80 shadow-sm transition-all hover:bg-muted hover:border-primary/50 hover:shadow-md',
            isCollapsed && 'justify-center p-1.5',
          )}
        >
          <Avatar className="h-9 w-9 shrink-0 shadow-sm">
            <AvatarFallback className="bg-gradient-to-br from-primary/30 to-purple-600/30 text-primary text-sm font-bold">
              {userInitial}
            </AvatarFallback>
          </Avatar>

          {!isCollapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-bold text-foreground truncate">{user?.email}</span>
              <span className="text-xs text-muted-foreground font-medium">Authenticated</span>
            </div>
          )}

          {!isCollapsed && (
            <Settings className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
        </button>
      </div>
    </aside>
  );
}
