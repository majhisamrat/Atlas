import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="app-aurora min-h-screen bg-[radial-gradient(circle_at_16%_14%,rgba(255,174,68,.72),transparent_23%),radial-gradient(circle_at_89%_10%,rgba(233,83,151,.70),transparent_28%),radial-gradient(circle_at_48%_94%,rgba(120,62,227,.58),transparent_45%),linear-gradient(135deg,#7563ed_0%,#b949c5_48%,#fc6a76_100%)] text-foreground relative overflow-x-hidden selection:bg-primary/20 selection:text-primary transition-colors duration-300">
      {/* Ambient background mesh lighting */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-80 dark:opacity-100">
        <div className="absolute -top-40 -left-40 rounded-full blur-[150px]" style={{ width: 'clamp(54.6875rem, 54.6875rem, 68.359375rem)', height: 'clamp(54.6875rem, 54.6875rem, 68.359375rem)', backgroundColor: 'rgb(217 119 6 / 0.25)' }} />
        <div className="absolute top-1/3 -right-40 rounded-full blur-[150px]" style={{ width: 'clamp(54.6875rem, 54.6875rem, 68.359375rem)', height: 'clamp(54.6875rem, 54.6875rem, 68.359375rem)', backgroundColor: 'rgb(232 121 206 / 0.25)' }} />
        <div className="absolute -bottom-40 left-1/3 rounded-full blur-[150px]" style={{ width: 'clamp(54.6875rem, 54.6875rem, 68.359375rem)', height: 'clamp(54.6875rem, 54.6875rem, 68.359375rem)', backgroundColor: 'rgb(168 85 247 / 0.35)' }} />
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 z-50 flex items-center px-4 gap-3 bg-gradient-to-r from-[#7563ed] via-[#b949c5] to-[#fc6a76] dark:!bg-[#3a3a38] dark:bg-none">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDrawerOpen(!drawerOpen)}
          className="h-9 w-9"
        >
          <Menu className="h-5 w-5 text-white" />
        </Button>
        <span className="brand-atlas text-2xl font-black text-white">ATLAS</span>
      </div>

      {/* Drawer Backdrop */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Sidebar - outside the main flex container for proper z-index */}
      <Sidebar 
        collapsed={collapsed} 
        onToggle={() => setCollapsed(!collapsed)}
        isDrawerOpen={drawerOpen}
        onDrawerClose={() => setDrawerOpen(false)}
      />

      <div className="flex min-h-screen relative z-10 pt-16 md:pt-0 w-full overflow-hidden">

        <main
          className={cn(
            'flex-1 transition-all duration-300 ease-out min-h-screen flex flex-col',
            'hidden md:flex',
          )}
          style={{
            marginLeft: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
          }}
        >
          <div className="p-5 md:p-8 lg:p-10 max-w-[clamp(125rem,125rem,156.25rem)] w-full mx-auto flex-1 flex flex-col min-h-0">
            <Outlet />
          </div>
        </main>

        {/* Mobile Main Content - Don't shift when drawer is open, sidebar is positioned fixed */}
        <main className="md:hidden w-full flex flex-col fixed top-16 left-0 right-0 bottom-0">
          <div className="p-4 max-w-full w-full flex-1 flex flex-col overflow-x-hidden overflow-y-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
