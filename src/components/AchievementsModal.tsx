import React from 'react';
import { X, Flame, Award, Brain, Timer, PlayCircle, Sparkles, Trophy, CheckCircle2 } from 'lucide-react';
import { UserGamification } from '../types';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  gamification: UserGamification;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  gamification
}) => {
  if (!isOpen) return null;

  const nextLevelXP = gamification.level * 250;
  const xpProgressPercent = Math.min(100, (gamification.xp / nextLevelXP) * 100);

  const renderIcon = (name: string) => {
    switch (name) {
      case 'Flame': return <Flame className="w-5 h-5 text-amber-400" />;
      case 'Brain': return <Brain className="w-5 h-5 text-indigo-400" />;
      case 'Timer': return <Timer className="w-5 h-5 text-rose-400" />;
      case 'PlayCircle': return <PlayCircle className="w-5 h-5 text-emerald-400" />;
      case 'Award': return <Award className="w-5 h-5 text-yellow-400" />;
      default: return <Sparkles className="w-5 h-5 text-violet-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 text-slate-900 shadow-xl relative space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Gamificação e Progresso</h2>
            <p className="text-xs text-slate-500">Suas conquistas de estudo e nível</p>
          </div>
        </div>

        {/* Level & XP Banner */}
        <div className="bg-indigo-900 text-white p-4 rounded-xl border border-indigo-800 space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-extrabold flex items-center justify-center text-sm border border-indigo-500">
                {gamification.level}
              </div>
              <div>
                <span className="text-xs text-indigo-200">Nível do Estudante</span>
                <h4 className="text-sm font-bold text-white">Nível {gamification.level}</h4>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-amber-300 font-bold text-sm bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20">
              <Flame className="w-4 h-4 fill-amber-400 animate-pulse text-amber-400" />
              <span>{gamification.streakDays} Dias de Ofensiva</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-indigo-200 font-medium">
              <span>Progresso para Nível {gamification.level + 1}</span>
              <span className="font-mono text-amber-300 font-bold">{gamification.xp} / {nextLevelXP} XP</span>
            </div>
            <div className="w-full bg-indigo-950 h-2 rounded-full overflow-hidden border border-indigo-800">
              <div
                className="bg-amber-400 h-full transition-all"
                style={{ width: `${xpProgressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Achievements List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Conquistas e Medalhas ({gamification.achievements.filter((a) => a.unlocked).length} de {gamification.achievements.length})
          </h3>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {gamification.achievements.map((ach) => (
              <div
                key={ach.id}
                className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                  ach.unlocked
                    ? 'bg-slate-50 border-slate-200 text-slate-900'
                    : 'bg-slate-50/50 border-slate-100 text-slate-400 opacity-60'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${ach.unlocked ? 'bg-indigo-50 border border-indigo-100' : 'bg-slate-100'}`}>
                  {renderIcon(ach.iconName)}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold">{ach.title}</h4>
                    {ach.unlocked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  </div>
                  <p className="text-[11px] text-slate-500">{ach.description}</p>
                </div>

                {ach.unlocked && ach.unlockedAt && (
                  <span className="text-[10px] font-mono text-emerald-700 font-bold shrink-0">
                    {ach.unlockedAt}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
