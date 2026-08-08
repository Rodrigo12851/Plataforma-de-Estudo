import React from 'react';
import { X, Timer, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { ClassLesson } from '../types';

interface FocusModeOverlayProps {
  lesson: ClassLesson;
  onExitFocusMode: () => void;
  pomodoroFormatted: string;
  isPomodoroActive: boolean;
  onTogglePomodoro: () => void;
}

export const FocusModeOverlay: React.FC<FocusModeOverlayProps> = ({
  lesson,
  onExitFocusMode,
  pomodoroFormatted,
  isPomodoroActive,
  onTogglePomodoro
}) => {
  const [ambientAudio, setAmbientAudio] = React.useState<boolean>(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const toggleAmbientSound = () => {
    setAmbientAudio(!ambientAudio);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-md text-slate-100 flex flex-col p-4 md:p-6 overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-extrabold">Modo Foco Sem Distrações</span>
            <h2 className="text-sm md:text-base font-bold text-white truncate max-w-md">{lesson.title}</h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Pomodoro indicator */}
          <button
            onClick={onTogglePomodoro}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
              isPomodoroActive ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse' : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            <Timer className="w-4 h-4 text-rose-400" />
            <span>{pomodoroFormatted}</span>
          </button>

          {/* Exit button */}
          <button
            onClick={onExitFocusMode}
            className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
          >
            <X className="w-4 h-4" />
            <span>Sair do Modo Foco</span>
          </button>
        </div>
      </div>

      {/* Main Focus Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
        {/* Main Video Section */}
        <div className="lg:col-span-2 flex flex-col justify-center bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative">
          <iframe
            src={`https://www.youtube.com/embed/${lesson.youtubeId}?autoplay=1&enablejsapi=1`}
            title={lesson.title}
            className="w-full h-full min-h-[300px] md:min-h-[450px]"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Timestamps & Key Takeaways Panel */}
        <div className="bg-white border border-slate-200 text-slate-900 rounded-2xl p-4 overflow-y-auto flex flex-col gap-4 shadow-xl">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
            Pontos de Foco & Marcadores
          </h3>

          <div className="space-y-3">
            {lesson.timestamps.map((ts, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all text-xs"
              >
                <div className="flex items-center justify-between font-bold text-indigo-700 mb-1">
                  <span>{ts.topic}</span>
                  <span className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-100 text-indigo-700 font-mono text-[10px]">
                    {ts.time}
                  </span>
                </div>
                <p className="text-slate-700 text-[11px] leading-relaxed">{ts.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
