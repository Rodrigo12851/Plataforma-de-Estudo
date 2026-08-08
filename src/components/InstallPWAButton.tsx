import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Laptop, Check, X, Share, MoreVertical, PlusSquare, ExternalLink, Sparkles } from 'lucide-react';

export const InstallPWAButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'android' | 'ios'>('android');
  const [isIframe, setIsIframe] = useState<boolean>(false);

  useEffect(() => {
    // Detect if inside iframe
    try {
      setIsIframe(window.self !== window.top);
    } catch (e) {
      setIsIframe(true);
    }

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
    if (isIOSDevice) {
      setActiveTab('ios');
    }

    // Listen for beforeinstallprompt event (Android, Chrome, Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowInstructionsModal(false);
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
      try {
        // Trigger native browser install prompt directly
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsInstalled(true);
          setDeferredPrompt(null);
          return;
        }
      } catch (err) {
        console.warn('Native install prompt error:', err);
      }
    }
    // Show instruction modal with interactive guidance and direct action
    setShowInstructionsModal(true);
  };

  const handleOpenInNewTab = () => {
    window.open(window.location.href, '_blank');
  };

  const triggerNativePrompt = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        setShowInstructionsModal(false);
      }
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
        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-md hover:shadow-lg flex items-center gap-1.5 border border-emerald-500 active:scale-95 cursor-pointer"
        title="Baixar e Instalar Aplicativo no seu Celular ou Computador"
      >
        <Download className="w-4 h-4 text-emerald-100 animate-bounce" />
        <span>Baixar App</span>
      </button>

      {/* Modal with instructions for devices where native prompt is disabled or iOS */}
      {showInstructionsModal && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 text-slate-800 shadow-2xl relative space-y-5">
            <button
              onClick={() => setShowInstructionsModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
                <Download className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
                  Instalar TubeStudy AI
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Baixe e use como aplicativo nativo no seu dispositivo
                </p>
              </div>
            </div>

            {/* If direct browser prompt is available */}
            {deferredPrompt && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Instalação rápida disponível!</span>
                </div>
                <button
                  onClick={triggerNativePrompt}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all"
                >
                  Instalar Agora
                </button>
              </div>
            )}

            {/* Iframe notice if applicable */}
            {isIframe && (
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl text-[11px] font-medium text-indigo-900 space-y-2">
                <div className="flex items-start gap-2">
                  <ExternalLink className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Dica de Instalação:</strong> Os navegadores exigem que o app seja aberto fora do pré-visualizador para ativar a instalação nativa com 1 clique na tela inicial.
                  </span>
                </div>
                <button
                  onClick={handleOpenInNewTab}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Abrir em Nova Aba para Instalar</span>
                </button>
              </div>
            )}

            {/* Device Selector Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('android')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'android'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>Android / Chrome / PC</span>
              </button>
              <button
                onClick={() => setActiveTab('ios')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'ios'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>iPhone / iPad (iOS)</span>
              </button>
            </div>

            {/* Instructions list */}
            <div className="space-y-3 text-xs font-medium text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              {activeTab === 'ios' ? (
                /* iOS Instructions */
                <div className="space-y-3">
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-indigo-600" />
                    Como instalar no iPhone/iPad (Safari):
                  </div>
                  <ol className="space-y-2.5 text-slate-600">
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
                      <span>Toque no botão de <strong>Compartilhar</strong> <Share className="w-3.5 h-3.5 inline mx-1 text-indigo-600" /> na barra inferior do Safari.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
                      <span>Role a lista para baixo e toque em <strong>Adicionar à Tela de Início</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-indigo-600" />.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[11px] flex items-center justify-center shrink-0">3</span>
                      <span>Toque em <strong>Adicionar</strong> no canto superior direito para finalizar.</span>
                    </li>
                  </ol>
                </div>
              ) : (
                /* Android / Chrome / Desktop Instructions */
                <div className="space-y-3">
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                    <Laptop className="w-4 h-4 text-indigo-600" />
                    Como instalar no Android / Chrome / Edge:
                  </div>
                  <ol className="space-y-2.5 text-slate-600">
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
                      <span>Abra o menu de opções <MoreVertical className="w-3.5 h-3.5 inline mx-1 text-indigo-600" /> (3 pontinhos no canto superior do navegador).</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
                      <span>Clique em <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[11px] flex items-center justify-center shrink-0">3</span>
                      <span>Confirme e o ícone do TubeStudy AI aparecerá junto com seus outros aplicativos!</span>
                    </li>
                  </ol>
                </div>
              )}
            </div>

            <div className="pt-1 flex justify-end">
              <button
                onClick={() => setShowInstructionsModal(false)}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition-colors shadow-sm"
              >
                Entendi!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

