import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, X, Settings, Coffee, Brain, Volume2 } from 'lucide-react';
import { sounds } from '../utils/audioSynth';

interface PomodoroTimerProps {
  isOpen: boolean;
  onClose: () => void;
  onToggleFocusMode: () => void;
  onMinutesStudied: (minutes: number) => void;
  secondsRemaining: number;
  setSecondsRemaining: React.Dispatch<React.SetStateAction<number>>;
  isActive: boolean;
  setIsActive: React.Dispatch<React.SetStateAction<boolean>>;
  mode: 'work' | 'break';
  setMode: React.Dispatch<React.SetStateAction<'work' | 'break'>>;
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  isOpen,
  onClose,
  onToggleFocusMode,
  onMinutesStudied,
  secondsRemaining,
  setSecondsRemaining,
  isActive,
  setIsActive,
  mode,
  setMode
}) => {
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0 && isActive) {
      setIsActive(false);
      sounds.playPomodoroDone();

      if (mode === 'work') {
        onMinutesStudied(workDuration);
        alert(`🎉 Parabéns! Você completou um bloco de estudo de ${workDuration} minutos! Hora de tomar um café de ${breakDuration} min.`);
        setMode('break');
        setSecondsRemaining(breakDuration * 60);
      } else {
        alert('⚡ Seu tempo de descanso acabou! Pronto para focar novamente?');
        setMode('work');
        setSecondsRemaining(workDuration * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, secondsRemaining, mode, workDuration, breakDuration]);

  if (!isOpen) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const totalDuration = (mode === 'work' ? workDuration : breakDuration) * 60;
  const progressPercent = Math.min(100, Math.max(0, ((totalDuration - secondsRemaining) / totalDuration) * 100));

  const handleReset = () => {
    setIsActive(false);
    setSecondsRemaining((mode === 'work' ? workDuration : breakDuration) * 60);
  };

  const handleSwitchMode = (newMode: 'work' | 'break') => {
    setMode(newMode);
    setIsActive(false);
    setSecondsRemaining((newMode === 'work' ? workDuration : breakDuration) * 60);
  };

  const handleSaveSettings = () => {
    setShowSettings(false);
    setIsActive(false);
    setSecondsRemaining((mode === 'work' ? workDuration : breakDuration) * 60);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 text-slate-900 shadow-xl relative">
        {/* Close Button */}
        <button
          id="close-pomodoro-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${mode === 'work' ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'}`}>
              {mode === 'work' ? <Brain className="w-5 h-5" /> : <Coffee className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Timer Pomodoro</h2>
              <p className="text-xs text-slate-500">
                {mode === 'work' ? 'Modo de Estudo Focado' : 'Pausa para Descanso'}
              </p>
            </div>
          </div>

          <button
            id="pomodoro-settings-btn"
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-all text-xs flex items-center gap-1"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Settings view */}
        {showSettings ? (
          <div className="space-y-4 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm">
            <h3 className="font-bold text-indigo-700">Ajustar Tempos (Minutos)</h3>
            <div>
              <label className="block text-xs text-slate-600 mb-1 font-medium">Tempo de Estudo (Foco)</label>
              <input
                type="number"
                min="1"
                max="120"
                value={workDuration}
                onChange={(e) => setWorkDuration(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1 font-medium">Tempo de Pausa (Descanso)</label>
              <input
                type="number"
                min="1"
                max="60"
                value={breakDuration}
                onChange={(e) => setBreakDuration(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              onClick={handleSaveSettings}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-all shadow-sm"
            >
              Aplicar Ajustes
            </button>
          </div>
        ) : (
          <>
            {/* Mode Switcher */}
            <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
              <button
                onClick={() => handleSwitchMode('work')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  mode === 'work' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Brain className="w-3.5 h-3.5" />
                <span>Foco ({workDuration}m)</span>
              </button>
              <button
                onClick={() => handleSwitchMode('break')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  mode === 'break' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Coffee className="w-3.5 h-3.5" />
                <span>Pausa ({breakDuration}m)</span>
              </button>
            </div>

            {/* Timer Display Accent Card */}
            <div className="text-center my-6 bg-indigo-900 text-white rounded-2xl p-6 shadow-md shadow-indigo-100 border border-indigo-800">
              <div className="text-5xl font-mono font-light tracking-tight">
                {formattedTime}
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-indigo-950 h-2 rounded-full mt-6 overflow-hidden border border-indigo-800">
                <div
                  className={`h-full transition-all duration-1000 ${
                    mode === 'work' ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Timer Action Controls */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <button
                id="reset-pomodoro-btn"
                onClick={handleReset}
                className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all border border-slate-200"
                title="Reiniciar Timer"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                id="toggle-pomodoro-btn"
                onClick={() => setIsActive(!isActive)}
                className={`px-8 py-3.5 rounded-xl text-white font-bold text-sm shadow-sm transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : mode === 'work'
                    ? 'bg-indigo-600 hover:bg-indigo-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {isActive ? (
                  <>
                    <Pause className="w-5 h-5" />
                    <span>Pausar</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-white" />
                    <span>Iniciar</span>
                  </>
                )}
              </button>
            </div>

            {/* Distraction free focus mode trigger */}
            <div className="pt-4 border-t border-slate-100 text-center">
              <button
                onClick={() => {
                  onClose();
                  onToggleFocusMode();
                }}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold underline underline-offset-4 flex items-center justify-center gap-1 mx-auto"
              >
                <span>Ativar Modo Foco sem distrações</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
