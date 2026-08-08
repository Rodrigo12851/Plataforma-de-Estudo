import React, { useState, useEffect, useRef } from 'react';
import { Play, FileText, Download, Sparkles, Clock, CheckCircle2, Bookmark, HelpCircle, X, Check, AlertCircle, PauseCircle, PlayCircle, ToggleLeft, ToggleRight, Maximize, Minimize } from 'lucide-react';
import { ClassLesson, QuizQuestion } from '../types';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: any;
  }
}

interface VideoPlayerSectionProps {
  lesson: ClassLesson;
  onSeekToTimestamp: (seconds: number) => void;
  onGeneratePdf: () => void;
  onOpenTutorWithTimestamp: (timeStr: string) => void;
  activeTimestamp: string | null;
}

export const VideoPlayerSection: React.FC<VideoPlayerSectionProps> = ({
  lesson,
  onSeekToTimestamp,
  onGeneratePdf,
  onOpenTutorWithTimestamp,
  activeTimestamp
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'takeaways' | 'timestamps'>('timestamps');
  const [autoPauseEnabled, setAutoPauseEnabled] = useState<boolean>(true);
  const [triggeredCheckpoints, setTriggeredCheckpoints] = useState<Record<string, boolean>>({});
  const [completedCheckpoints, setCompletedCheckpoints] = useState<Record<string, boolean>>({});

  const [activeReferenceQuestion, setActiveReferenceQuestion] = useState<{
    timeStr: string;
    topic: string;
    question: QuizQuestion;
    isAutoPaused?: boolean;
  } | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answeredCorrectly, setAnsweredCorrectly] = useState<boolean | null>(null);

  const playerRef = useRef<any>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleContainerFullscreen = () => {
    if (!videoContainerRef.current) return;
    if (!document.fullscreenElement) {
      if (videoContainerRef.current.requestFullscreen) {
        videoContainerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Helper to pause YouTube embed iframe
  const pauseIframeVideo = () => {
    if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
      try {
        playerRef.current.pauseVideo();
      } catch (e) {
        // Fallback below
      }
    }
    const iframe = document.getElementById('youtube-player-iframe') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: '' }), '*');
    }
  };

  // Helper to resume YouTube embed iframe
  const playIframeVideo = () => {
    if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
      try {
        playerRef.current.playVideo();
      } catch (e) {
        // Fallback below
      }
    }
    const iframe = document.getElementById('youtube-player-iframe') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: '' }), '*');
    }
  };

  // Open reference check question for a timestamp and pause video
  const handleOpenReferenceQuestion = (timeStr: string, topic: string, isAutoPaused = false) => {
    // Pause video immediately
    pauseIframeVideo();

    // Find matching quiz question for this timestamp, or fallback to available question
    const matched = lesson.quiz.find((q) => q.timestampRef === timeStr) || lesson.quiz[0];
    if (matched) {
      setActiveReferenceQuestion({
        timeStr,
        topic,
        question: matched,
        isAutoPaused
      });
      setSelectedOption(null);
      setAnsweredCorrectly(null);
    }
  };

  // Initialize YouTube Iframe API and track video current time for automatic pause
  useEffect(() => {
    let intervalId: any = null;

    const initPlayer = () => {
      if (window.YT && window.YT.Player) {
        try {
          playerRef.current = new window.YT.Player('youtube-player-iframe', {
            events: {
              onReady: (event: any) => {
                playerRef.current = event.target;
              }
            }
          });
        } catch (err) {
          // Player already attached or API error
        }
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      const existingScript = document.getElementById('youtube-iframe-api');
      if (!existingScript) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(tag);
      }

      const prevReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevReady) prevReady();
        initPlayer();
      };
    }

    // Check time updates against timestamps
    const checkTimeUpdate = (currentTime: number) => {
      if (!autoPauseEnabled || activeReferenceQuestion) return;

      lesson.timestamps.forEach((ts, idx) => {
        const nextTs = lesson.timestamps[idx + 1];
        // Target trigger time is when this reference segment finishes (when nextTs starts or ts.seconds + 120)
        const triggerSec = nextTs ? nextTs.seconds : ts.seconds + 120;

        if (
          currentTime >= triggerSec - 1.5 &&
          currentTime <= triggerSec + 5 &&
          !triggeredCheckpoints[ts.time]
        ) {
          setTriggeredCheckpoints((prev) => ({ ...prev, [ts.time]: true }));
          pauseIframeVideo();
          handleOpenReferenceQuestion(ts.time, ts.topic, true);
        }
      });
    };

    // 1. PostMessage window listener for YouTube iframe events
    const handleMessage = (event: MessageEvent) => {
      try {
        let data = event.data;
        if (typeof data === 'string') {
          data = JSON.parse(data);
        }
        if (data && data.event === 'infoDelivery' && data.info) {
          if (typeof data.info.currentTime === 'number') {
            checkTimeUpdate(data.info.currentTime);
          }
        }
      } catch (e) {
        // ignore non-json messages
      }
    };

    window.addEventListener('message', handleMessage);

    // 2. Fallback interval polling via YouTube Player API
    intervalId = setInterval(() => {
      // Ping YouTube iframe to send listening events
      const iframe = document.getElementById('youtube-player-iframe') as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(JSON.stringify({ event: 'listening' }), '*');
      }

      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        try {
          const currentTime = playerRef.current.getCurrentTime();
          checkTimeUpdate(currentTime);
        } catch (e) {
          // ignore
        }
      }
    }, 500);

    return () => {
      window.removeEventListener('message', handleMessage);
      if (intervalId) clearInterval(intervalId);
    };
  }, [lesson, autoPauseEnabled, triggeredCheckpoints, activeReferenceQuestion]);

  const handleSelectOption = (index: number) => {
    if (!activeReferenceQuestion || selectedOption !== null) return;
    setSelectedOption(index);
    const isCorrect = index === activeReferenceQuestion.question.correctAnswer;
    setAnsweredCorrectly(isCorrect);
    
    // Mark this checkpoint reference as completed
    setCompletedCheckpoints((prev) => ({
      ...prev,
      [activeReferenceQuestion.timeStr]: true
    }));
  };

  const handleFinishQuestionAndResume = () => {
    const timeStr = activeReferenceQuestion?.timeStr;
    if (timeStr) {
      setCompletedCheckpoints((prev) => ({
        ...prev,
        [timeStr]: true
      }));
    }
    setActiveReferenceQuestion(null);
    setSelectedOption(null);
    setAnsweredCorrectly(null);

    // Automatically resume video playback!
    playIframeVideo();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Video Container */}
      <div ref={videoContainerRef} className="relative aspect-video bg-black w-full overflow-hidden group">
        <iframe
          id="youtube-player-iframe"
          src={`https://www.youtube.com/embed/${lesson.youtubeId}?enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}&rel=0`}
          title={lesson.title}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />

        {/* Fullscreen Control Button inside Video Box */}
        <button
          onClick={toggleContainerFullscreen}
          className="absolute top-3 right-3 z-30 bg-slate-900/85 hover:bg-slate-900 text-white px-3 py-1.5 rounded-lg opacity-80 hover:opacity-100 transition-all backdrop-blur-sm border border-white/20 shadow-md flex items-center gap-1.5 text-xs font-semibold"
          title="Alternar Modo Tela Cheia Interativa"
        >
          {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
          <span>{isFullscreen ? 'Sair da Tela Cheia' : 'Tela Cheia'}</span>
        </button>

        {/* Question Popup Modal Overlay */}
        {activeReferenceQuestion && (
          <div className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-5 md:p-6 text-slate-900 shadow-2xl relative space-y-4 my-auto">
              <button
                onClick={handleFinishQuestionAndResume}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all"
                title="Fechar e dar play no vídeo"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header notification */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 rounded-md bg-rose-100 text-rose-800 font-mono text-xs font-bold flex items-center gap-1 border border-rose-200 animate-pulse">
                  <PauseCircle className="w-3.5 h-3.5" />
                  Vídeo Pausado ({activeReferenceQuestion.timeStr})
                </span>
                <h3 className="text-sm font-bold text-slate-800 truncate">
                  {activeReferenceQuestion.topic}
                </h3>
              </div>

              <div className="bg-indigo-50/90 border border-indigo-200 p-3.5 md:p-4 rounded-xl space-y-2">
                <p className="text-xs text-indigo-800 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  O professor acabou de explicar essa referência no vídeo:
                </p>
                <h4 className="text-sm md:text-base font-bold text-slate-900 leading-snug">
                  {activeReferenceQuestion.question.question}
                </h4>
              </div>

              {/* Options */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {activeReferenceQuestion.question.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === activeReferenceQuestion.question.correctAnswer;
                  let btnStyle = 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800 hover:border-indigo-300';

                  if (selectedOption !== null) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold ring-2 ring-emerald-400';
                    } else if (isSelected) {
                      btnStyle = 'bg-rose-50 border-rose-300 text-rose-900 font-bold ring-2 ring-rose-300';
                    } else {
                      btnStyle = 'bg-slate-50 border-slate-100 text-slate-400 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={selectedOption !== null}
                      className={`w-full p-3 rounded-xl border text-left text-xs md:text-sm transition-all flex items-center justify-between gap-3 ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {selectedOption !== null && isCorrect && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                      {selectedOption !== null && isSelected && !isCorrect && <X className="w-4 h-4 text-rose-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Answer Explanation Feedback */}
              {selectedOption !== null && (
                <div
                  className={`p-3.5 md:p-4 rounded-xl border text-xs md:text-sm leading-relaxed space-y-1.5 animate-in fade-in ${
                    answeredCorrectly
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    {answeredCorrectly ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span>Excelente! Resposta Correta (+15 XP)</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                        <span>Explicação do Professor no Vídeo:</span>
                      </>
                    )}
                  </div>
                  <p>{activeReferenceQuestion.question.explanation}</p>
                </div>
              )}

              {/* Action to Resume Video */}
              <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
                <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                  {selectedOption !== null
                    ? 'Tudo certo! Clique para dar play e continuar assistindo.'
                    : 'Selecione uma opção para responder.'}
                </span>
                <button
                  onClick={handleFinishQuestionAndResume}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs md:text-sm transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>{selectedOption !== null ? 'Continuar Vídeo (Play)' : 'Fechar e Dar Play no Vídeo'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Video Info Bar */}
      <div className="p-4 md:p-6 border-b border-slate-100 bg-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                {lesson.category}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {lesson.duration}
              </span>
              <span className="text-xs text-slate-500 font-medium">• {lesson.channel}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
              {lesson.title}
            </h2>
          </div>

          {/* Action Buttons: Auto-Pause Toggle, Fullscreen & Export PDF */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={toggleContainerFullscreen}
              className={`px-3.5 py-1.5 rounded-full font-bold text-xs transition-all flex items-center gap-1.5 border shadow-sm ${
                isFullscreen
                  ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600'
                  : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-700'
              }`}
              title="Assistir com Pausa Interativa em Tela Cheia"
            >
              {isFullscreen ? (
                <>
                  <Minimize className="w-3.5 h-3.5 text-white" />
                  <span>Sair da Tela Cheia</span>
                </>
              ) : (
                <>
                  <Maximize className="w-3.5 h-3.5 text-white" />
                  <span>Tela Cheia Interativa</span>
                </>
              )}
            </button>

            <button
              onClick={() => setAutoPauseEnabled(!autoPauseEnabled)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border ${
                autoPauseEnabled
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
              title="Pausar o vídeo automaticamente após cada referência para fazer uma pergunta"
            >
              {autoPauseEnabled ? (
                <>
                  <ToggleRight className="w-4 h-4 text-indigo-600" />
                  <span>Pausa Auto nas Referências: ON</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-4 h-4 text-slate-400" />
                  <span>Pausa Auto: OFF</span>
                </>
              )}
            </button>

            <button
              id="export-pdf-btn"
              onClick={onGeneratePdf}
              className="px-4 py-2 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200 transition-all flex items-center gap-2 shadow-sm"
              title="Exportar Apostila em PDF completa em 1 clique"
            >
              <Download className="w-4 h-4" />
              <span>Exportar PDF</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation for Lesson Details */}
        <div className="flex items-center gap-2 border-b border-slate-100 pt-2">
          <button
            onClick={() => setActiveTab('timestamps')}
            className={`px-3 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'timestamps'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Referências do Vídeo ({lesson.timestamps.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-3 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'summary'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Resumo da Aula</span>
          </button>
          <button
            onClick={() => setActiveTab('takeaways')}
            className={`px-3 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'takeaways'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Pontos-Chave</span>
          </button>
        </div>
      </div>

      {/* Tab Content Display */}
      <div className="p-4 md:p-6 bg-slate-50/50">
        {activeTab === 'summary' && (
          <div className="space-y-3">
            <p className="text-sm text-slate-700 leading-relaxed font-normal">
              {lesson.summary}
            </p>
          </div>
        )}

        {activeTab === 'takeaways' && (
          <ul className="space-y-2.5">
            {lesson.keyTakeaways.map((takeaway, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs md:text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{takeaway}</span>
              </li>
            ))}
          </ul>
        )}

        {activeTab === 'timestamps' && (
          <div className="space-y-3">
            <div className="bg-indigo-50/80 border border-indigo-200 rounded-xl p-3 text-xs text-indigo-950 flex items-center gap-2.5 shadow-xs">
              <PauseCircle className="w-5 h-5 text-indigo-600 shrink-0" />
              <span>
                <strong>Modo Interativo com Pausa Automática:</strong> Assim que a referência do vídeo termina, o professor <strong>pausa o vídeo automaticamente</strong> e faz uma pergunta sobre o trecho explicativo. Responda à pergunta para dar play e continuar a aula!
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {lesson.timestamps.map((ts, idx) => {
                const isCompleted = completedCheckpoints[ts.time];
                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      activeTimestamp === ts.time
                        ? 'bg-indigo-50/90 border-indigo-300 text-slate-900 shadow-sm'
                        : isCompleted
                        ? 'bg-emerald-50/40 border-emerald-200 text-slate-800'
                        : 'bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50/80 text-slate-700'
                    }`}
                    onClick={() => onSeekToTimestamp(ts.seconds)}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-xs text-slate-900 group-hover:text-indigo-600 flex items-center gap-1.5">
                          {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                          {ts.topic}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono text-xs font-bold border border-indigo-100">
                          {ts.time}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{ts.summary}</p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap text-[11px]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSeekToTimestamp(ts.seconds);
                        }}
                        className="text-indigo-600 font-bold hover:underline flex items-center gap-1"
                      >
                        <Play className="w-3 h-3 fill-indigo-600" /> Ir para {ts.time}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenReferenceQuestion(ts.time, ts.topic, false);
                          }}
                          className={`font-bold flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-all shadow-xs ${
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                              : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
                          }`}
                        >
                          <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{isCompleted ? 'Refazer Pergunta' : 'Pergunta da Referência'}</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenTutorWithTimestamp(ts.time);
                          }}
                          className="text-amber-700 hover:text-amber-800 font-medium flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200"
                          title="Tirar dúvidas com o Tutor de IA"
                        >
                          <Sparkles className="w-3 h-3" /> Tutor
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


