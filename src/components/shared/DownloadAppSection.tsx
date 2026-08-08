import { useState } from 'react';
import { Download, Check } from 'lucide-react';
import { usePWA } from '@/context/PWAContext';
import { Button } from '@/components/ui/button';

export function DownloadAppSection() {
  const { isInstallPromptAvailable, isInstalled, promptInstall } = usePWA();
  const [isInstalling, setIsInstalling] = useState(false);

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      await promptInstall();
    } finally {
      setIsInstalling(false);
    }
  };

  if (isInstalled) {
    return (
      <section className="relative overflow-hidden px-5 py-24 lg:py-32">
        <div className="aurora-panel absolute inset-x-0 bottom-0 h-3/4 opacity-60" />
        <div className="relative mx-auto max-w-5xl rounded-[2rem] border border-white bg-white/80 p-8 text-center shadow-xl shadow-blue-950/5 backdrop-blur sm:p-14">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#dff4ff] text-[#1452a0]">
            <Check className="h-6 w-6" />
          </div>
          <p className="app-kicker mt-5">App Installed</p>
          <h2 className="font-display mx-auto mt-3 max-w-2xl text-4xl font-black text-[#06285f] sm:text-5xl">Atlas is ready to use.</h2>
          <p className="mx-auto mt-5 max-w-xl text-[#526b91]">You can now access Atlas from your home screen and use it with or without an internet connection.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="download-app" className="relative overflow-hidden px-5 py-24 lg:py-32 scroll-mt-24">
      <div className="aurora-panel absolute inset-x-0 bottom-0 h-3/4 opacity-60" />
      <div className="relative mx-auto max-w-5xl rounded-[2rem] border border-white bg-white/80 p-8 text-center shadow-xl shadow-blue-950/5 backdrop-blur sm:p-14">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#dff4ff] text-[#1452a0]">
          <Download className="h-6 w-6" />
        </div>
        <p className="app-kicker mt-5">Install Atlas</p>
        <h2 className="font-display mx-auto mt-3 max-w-2xl text-4xl font-black text-[#06285f] sm:text-5xl">Install Atlas on your device for a faster, app-like experience.</h2>
        <p className="mx-auto mt-5 max-w-xl text-[#526b91]">Access Atlas from your home screen and use it offline. Works on Android and desktop browsers.</p>
        <Button
          onClick={handleInstall}
          disabled={isInstalling}
          className="mt-8 rounded-full bg-[#1246a7] px-6 py-3.5 font-bold text-white shadow-lg shadow-blue-900/20 hover:bg-[#0d398a] disabled:opacity-60"
        >
          {isInstalling ? 'Installing...' : 'Download App'}
        </Button>
        {!isInstallPromptAvailable && (
          <p className="mt-4 text-sm text-[#526b91]">Install option available on supported browsers (Chrome, Edge, Firefox on Android)</p>
        )}
      </div>
    </section>
  );
}
