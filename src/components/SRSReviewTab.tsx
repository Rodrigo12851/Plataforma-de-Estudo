import React, { useState } from 'react';
import { ShieldCheck, Brain, RotateCw, CheckCircle, Flame, Calendar, Sparkles } from 'lucide-react';
import { ClassLesson, Flashcard, SRSStage } from '../types';
import { sounds } from '../utils/audioSynth';

interface SRSReviewTabProps {
  lessons: ClassLesson[];
  onUpdateFlashcardSRS: (lessonId: string, cardId: string, stage: SRSStage, days: number) => void;
}

export const SRSReviewTab: React.FC<SRSReviewTabProps> = ({
  lessons,
  onUpdateFlashcardSRS
}) => {
  // Aggregate all flashcards across lessons
  const allCards = lessons.flatMap((l) =>
    l.flashcards.map((fc) => ({ ...fc, lessonTitle: l.title, lessonId: l.id }))
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedLessonFilter, setSelectedLessonFilter] = useState<string>('all');

  const filteredCards = allCards.filter((card) => {
    if (selectedLessonFilter === 'all') return true;
    return card.lessonId === selectedLessonFilter;
  });

  const activeCard = filteredCards[currentIndex];

  const handleFlip = () => {
    sounds.playFlip();
    setIsFlipped(!isFlipped);
  };

  const handleResponse = (stage: SRSStage, reviewDays: number) => {
    if (!activeCard) return;
    onUpdateFlashcardSRS(activeCard.lessonId, activeCard.id, stage, reviewDays);
    setIsFlipped(false);
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const newCards = allCards.filter((c) => c.srsStage === 'new').length;
  const learningCards = allCards.filter((c) => c.srsStage === 'learning').length;
  const masteredCards = allCards.filter((c) => c.srsStage === 'mastered').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-indigo-900 text-white p-6 rounded-2xl border border-indigo-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">Centro de Repetição Espaçada (SRS)</h2>
          </div>
          <p className="text-xs text-indigo-100 max-w-xl">
            Revisão inteligente baseada na curva de esquecimento de Ebbinghaus.
            Revise diariamente seus cartões para transferir o conhecimento para a memória de longo prazo.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-xl text-center min-w-[90px]">
            <span className="text-xl font-extrabold text-amber-300 block">{newCards}</span>
            <span className="text-[10px] uppercase font-bold text-indigo-200">Novos</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-xl text-center min-w-[90px]">
            <span className="text-xl font-extrabold text-blue-300 block">{learningCards}</span>
            <span className="text-[10px] uppercase font-bold text-indigo-200">Em Treino</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-xl text-center min-w-[90px]">
            <span className="text-xl font-extrabold text-emerald-300 block">{masteredCards}</span>
            <span className="text-[10px] uppercase font-bold text-indigo-200">Dominados</span>
          </div>
        </div>
      </div>

      {/* Filter by Lesson */}
      <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-slate-200 text-xs overflow-x-auto no-scrollbar shadow-2xs">
        <span className="font-bold text-slate-500 shrink-0">Filtrar por Aula:</span>
        <button
          onClick={() => { setSelectedLessonFilter('all'); setCurrentIndex(0); setIsFlipped(false); }}
          className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all ${
            selectedLessonFilter === 'all' ? 'bg-indigo-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
          }`}
        >
          Todas as Aulas ({allCards.length})
        </button>
        {lessons.map((lesson) => (
          <button
            key={lesson.id}
            onClick={() => { setSelectedLessonFilter(lesson.id); setCurrentIndex(0); setIsFlipped(false); }}
            className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all ${
              selectedLessonFilter === lesson.id ? 'bg-indigo-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            {lesson.title} ({lesson.flashcards.length})
          </button>
        ))}
      </div>

      {/* Review Arena */}
      {filteredCards.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900">Nenhum cartão para revisar!</h3>
          <p className="text-xs text-slate-500 mt-1">Sua fila de repetição espaçada está em dia.</p>
        </div>
      ) : activeCard ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold text-indigo-700">Aula: {activeCard.lessonTitle}</span>
            <span>Card {currentIndex + 1} de {filteredCards.length}</span>
          </div>

          <div
            onClick={handleFlip}
            className="cursor-pointer w-full min-h-[220px] rounded-2xl p-8 bg-gradient-to-br from-slate-50 to-white border border-slate-200 hover:border-indigo-300 flex flex-col justify-between transition-all shadow-sm"
          >
            <div className="flex justify-between text-xs text-slate-500">
              <span className="font-semibold text-indigo-700">{isFlipped ? 'Resposta (Gabarito)' : 'Pergunta'}</span>
              <span className="text-[11px] text-slate-400">Clique para Virar</span>
            </div>

            <div className="my-auto py-4 text-center">
              <p className="text-lg md:text-xl font-bold text-slate-900 leading-relaxed">
                {isFlipped ? activeCard.back : activeCard.front}
              </p>
            </div>

            <div className="text-center text-[11px] text-slate-500 font-mono">
              {isFlipped ? 'Selecione a facilidade para agendar a próxima revisão' : 'Toque para revelar'}
            </div>
          </div>

          {/* Assessment Controls */}
          {isFlipped && (
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleResponse('new', 1)}
                className="py-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs transition-all flex flex-col items-center"
              >
                <span>Errei / Difícil</span>
                <span className="text-[10px] text-rose-600/80 font-mono">Em 1 dia</span>
              </button>
              <button
                onClick={() => handleResponse('learning', 3)}
                className="py-3 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-bold text-xs transition-all flex flex-col items-center"
              >
                <span>Bom (Lembrei)</span>
                <span className="text-[10px] text-blue-600/80 font-mono">Em 3 dias</span>
              </button>
              <button
                onClick={() => handleResponse('mastered', 7)}
                className="py-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold text-xs transition-all flex flex-col items-center shadow-2xs"
              >
                <span>Fácil / Dominado</span>
                <span className="text-[10px] text-emerald-600/80 font-mono">Em 7 dias</span>
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
