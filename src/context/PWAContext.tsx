import { createContext, useContext, useState, useEffect } from 'react';

interface PWAContextType {
  isInstallPromptAvailable: boolean;
  isInstalled: boolean;
  promptInstall: () => Promise<boolean>;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [isInstallPromptAvailable, setIsInstallPromptAvailable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallPromptAvailable(true);
    };

    const installedHandler = () => {
      setIsInstalled(true);
      setIsInstallPromptAvailable(false);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) return false;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setIsInstallPromptAvailable(false);
    }
    
    setDeferredPrompt(null);
    return outcome === 'accepted';
  };

  return (
    <PWAContext.Provider value={{ isInstallPromptAvailable, isInstalled, promptInstall }}>
      {children}
    </PWAContext.Provider>
  );
}

export function usePWA() {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWA must be used within PWAProvider');
  }
  return context;
}
