import React from 'react';
import { Flame, Timer, Sparkles, BookOpen, Plus, ShieldCheck, Zap } from 'lucide-react';
import { UserGamification } from '../types';
import { InstallPWAButton } from './InstallPWAButton';

interface HeaderProps {
  gamification: UserGamification;
  activeTab: 'study' | 'library' | 'srs';
  setActiveTab: (tab: 'study' | 'library' | 'srs') => void;
  onOpenPomodoro: () => void;
  onOpenNewLessonModal: () => void;
  onToggleFocusMode: () => void;
  onOpenAchievementsModal: () => void;
  pomodoroTimeFormatted: string;
  isPomodoroActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  gamification,
  activeTab,
  setActiveTab,
  onOpenPomodoro,
  onOpenNewLessonModal,
  onToggleFocusMode,
  onOpenAchievementsModal,
  pomodoroTimeFormatted,
  isPomodoroActive
}) => {
  return (
    <header id="app-header" className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-800 px-4 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand logo & Navigation */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('study')}>
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-slate-900">
                TubeStudy AI
              </h1>
              <p className="text-[10px] text-indigo-600 font-semibold tracking-wide">
                Estudo Inteligente com YouTube
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              id="tab-study-btn"
              onClick={() => setActiveTab('study')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'study'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-indigo-600" />
              <span>Aula Atual</span>
            </button>
            <button
              id="tab-library-btn"
              onClick={() => setActiveTab('library')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'library'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Minhas Aulas</span>
            </button>
            <button
              id="tab-srs-btn"
              onClick={() => setActiveTab('srs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'srs'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Revisão SRS</span>
            </button>
          </nav>
        </div>

        {/* Gamification Badges & Tools */}
        <div className="flex items-center gap-2 flex-wrap justify-end w-full md:w-auto">
          {/* Streak Flame Badge */}
          <div
            id="streak-badge"
            onClick={onOpenAchievementsModal}
            title="Sua Ofensiva de Estudos Diários! Clique para ver Conquistas"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 cursor-pointer hover:bg-orange-100 transition-all text-xs font-bold shadow-sm"
          >
            <Flame className="w-4 h-4 fill-orange-500 text-orange-500 animate-pulse" />
            <span>{gamification.streakDays} Dias de Ofensiva</span>
          </div>

          {/* XP / Level Badge */}
          <div
            id="xp-badge"
            onClick={onOpenAchievementsModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 cursor-pointer hover:bg-indigo-100 transition-all text-xs font-bold"
          >
            <div className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-extrabold">
              N{gamification.level}
            </div>
            <span>{gamification.xp} XP</span>
          </div>

          {/* Pomodoro Timer Toggle */}
          <button
            id="pomodoro-header-btn"
            onClick={onOpenPomodoro}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              isPomodoroActive
                ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold animate-pulse'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Timer className="w-4 h-4 text-rose-500" />
            <span>{pomodoroTimeFormatted}</span>
          </button>

          {/* Focus Mode */}
          <button
            id="focus-mode-header-btn"
            onClick={onToggleFocusMode}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold transition-all flex items-center gap-1.5"
            title="Modo Foco Sem Distrações"
          >
            <span>Modo Foco</span>
          </button>

          {/* Add New Lesson Button */}
          <button
            id="add-lesson-header-btn"
            onClick={onOpenNewLessonModal}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nova Aula</span>
          </button>

          {/* Download PWA App Button */}
          <InstallPWAButton />
        </div>
      </div>
    </header>
  );
};
