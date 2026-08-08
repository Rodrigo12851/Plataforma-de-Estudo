import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Laptop, Check, X, Share, MoreVertical, PlusSquare } from 'lucide-react';

export const InstallPWAButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);

  useEffect(() => {
    // Check if app is already running as standalone PWA
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // Listen for beforeinstallprompt event (Android, Chrome, Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Trigger browser install prompt
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      // If prompt is not available or iOS, show custom step-by-step install modal
      setShowInstructionsModal(true);
    }
  };

  if (isInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold shadow-sm">
        <Check className="w-4 h-4 text-emerald-600" />
        <span className="hidden sm:inline">App Instalado</span>
      </div>
    );
  }

  return (
    <>
      <button
        id="download-app-pwa-btn"
        onClick={handleInstallClick}
        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-md hover:shadow-lg flex items-center gap-1.5 animate-bounce-subtle border border-emerald-500"
        title="Baixar e Instalar Aplicativo no seu Celular ou Computador"
      >
        <Download className="w-4 h-4 text-emerald-100" />
        <span>Baixar App</span>
      </button>

      {/* Modal with instructions for devices where native prompt is disabled or iOS */}
      {showInstructionsModal && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 text-slate-800 shadow-2xl relative space-y-5">
            <button
              onClick={() => setShowInstructionsModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xl shadow-inner">
                <Smartphone className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Instalar TubeStudy AI
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Baixe e use como aplicativo nativo no seu dispositivo
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs font-medium text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200">
              {isIOS ? (
                /* iOS Instructions */
                <div className="space-y-3">
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-indigo-600" />
                    No iPhone ou iPad (Safari):
                  </div>
                  <ol className="list-decimal list-inside space-y-2 text-slate-600">
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-indigo-600">1.</span>
                      <span>Toque no ícone de <strong className="text-slate-900 flex-inline items-center"><Share className="w-3.5 h-3.5 inline mx-0.5 text-indigo-600" /> Compartilhar</strong> no menu inferior do Safari.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-indigo-600">2.</span>
                      <span>Role para baixo e selecione <strong className="text-slate-900"><PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-indigo-600" /> Adicionar à Tela de Início</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-indigo-600">3.</span>
                      <span>Confirme tocando em <strong className="text-slate-900">Adicionar</strong> no canto superior direito.</span>
                    </li>
                  </ol>
                </div>
              ) : (
                /* Android / Chrome / Desktop Instructions */
                <div className="space-y-3">
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Laptop className="w-4 h-4 text-indigo-600" />
                    No Android ou Computador (Chrome/Edge):
                  </div>
                  <ol className="list-decimal list-inside space-y-2 text-slate-600">
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-indigo-600">1.</span>
                      <span>Clique ou toque nos <strong className="text-slate-900 flex-inline items-center"><MoreVertical className="w-3.5 h-3.5 inline mx-0.5 text-indigo-600" /> 3 pontos</strong> no canto superior do navegador.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-indigo-600">2.</span>
                      <span>Selecione <strong className="text-slate-900">"Instalar aplicativo"</strong> ou <strong className="text-slate-900">"Adicionar à tela inicial"</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-indigo-600">3.</span>
                      <span>Pronto! O app aparecerá diretamente na lista de aplicativos do seu dispositivo.</span>
                    </li>
                  </ol>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowInstructionsModal(false)}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition-colors shadow-sm"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
