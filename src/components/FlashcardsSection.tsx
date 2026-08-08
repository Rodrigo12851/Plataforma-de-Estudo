import React, { useState } from 'react';
import { RotateCw, CheckCircle, Brain, Sparkles, ArrowLeft, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { ClassLesson, Flashcard, SRSStage } from '../types';
import { sounds } from '../utils/audioSynth';

interface FlashcardsSectionProps {
  lesson: ClassLesson;
  onUpdateFlashcardSRS: (cardId: string, newStage: SRSStage, reviewDays: number) => void;
}

export const FlashcardsSection: React.FC<FlashcardsSectionProps> = ({
  lesson,
  onUpdateFlashcardSRS
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [filterStage, setFilterStage] = useState<'all' | 'new' | 'learning' | 'mastered'>('all');

  const filteredCards = lesson.flashcards.filter((card) => {
    if (filterStage === 'all') return true;
    return card.srsStage === filterStage;
  });

  const activeCard: Flashcard | undefined = filteredCards[currentIndex];

  const handleFlip = () => {
    sounds.playFlip();
    setIsFlipped(!isFlipped);
  };

  const handleSRSResponse = (stage: SRSStage, reviewDays: number) => {
    if (!activeCard) return;
    onUpdateFlashcardSRS(activeCard.id, stage, reviewDays);
    setIsFlipped(false);
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const nextCard = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % (filteredCards.length || 1));
  };

  const prevCard = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + (filteredCards.length || 1)) % (filteredCards.length || 1));
  };

  // SRS Count metrics
  const newCount = lesson.flashcards.filter((c) => c.srsStage === 'new').length;
  const learningCount = lesson.flashcards.filter((c) => c.srsStage === 'learning').length;
  const masteredCount = lesson.flashcards.filter((c) => c.srsStage === 'mastered').length;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Header & SRS Metric Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Flashcards com Repetição Espaçada (SRS)</h3>
          </div>
          <p className="text-xs text-slate-500">
            Algoritmo de memorização para retenção de longo prazo. Clique no card para ver a resposta.
          </p>
        </div>

        {/* Stage Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => { setFilterStage('all'); setCurrentIndex(0); setIsFlipped(false); }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterStage === 'all' ? 'bg-indigo-600 text-white font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todos ({lesson.flashcards.length})
          </button>
          <button
            onClick={() => { setFilterStage('new'); setCurrentIndex(0); setIsFlipped(false); }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterStage === 'new' ? 'bg-amber-600 text-white font-bold shadow-2xs' : 'text-amber-700 hover:bg-slate-200/50'
            }`}
          >
            Novos ({newCount})
          </button>
          <button
            onClick={() => { setFilterStage('learning'); setCurrentIndex(0); setIsFlipped(false); }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterStage === 'learning' ? 'bg-blue-600 text-white font-bold shadow-2xs' : 'text-blue-700 hover:bg-slate-200/50'
            }`}
          >
            Aprendendo ({learningCount})
          </button>
          <button
            onClick={() => { setFilterStage('mastered'); setCurrentIndex(0); setIsFlipped(false); }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filterStage === 'mastered' ? 'bg-emerald-600 text-white font-bold shadow-2xs' : 'text-emerald-700 hover:bg-slate-200/50'
            }`}
          >
            Dominados ({masteredCount})
          </button>
        </div>
      </div>

      {/* Main Flashcard Flip Arena */}
      {filteredCards.length === 0 ? (
        <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
          <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
          <p className="font-bold text-slate-800">Nenhum flashcard nesta categoria!</p>
          <p className="text-xs text-slate-500 mt-1">Selecione "Todos" para revisar todo o deck.</p>
        </div>
      ) : activeCard ? (
        <div className="space-y-6">
          {/* Card Indicator */}
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Card {currentIndex + 1} de {filteredCards.length}</span>
            <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
              activeCard.srsStage === 'mastered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
              activeCard.srsStage === 'learning' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
              'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              Estágio: {activeCard.srsStage === 'mastered' ? 'Dominado' : activeCard.srsStage === 'learning' ? 'Aprendendo' : 'Novo'}
            </span>
          </div>

          {/* Interactive 3D Flip Card */}
          <div
            id="interactive-flashcard"
            onClick={handleFlip}
            className="perspective-1000 cursor-pointer w-full min-h-[220px] md:min-h-[260px] relative transition-transform duration-500 group"
          >
            <div
              className={`w-full h-full min-h-[220px] md:min-h-[260px] rounded-2xl p-6 md:p-8 border flex flex-col justify-between transition-all duration-500 shadow-sm relative ${
                isFlipped
                  ? 'bg-gradient-to-br from-indigo-50/90 via-white to-slate-50 border-indigo-300 ring-2 ring-indigo-500/10 shadow-md'
                  : 'bg-gradient-to-br from-slate-50 to-white border-slate-200 hover:border-indigo-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-indigo-700 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5" />
                  {isFlipped ? 'Resposta (Gabarito)' : 'Pergunta (Frente)'}
                </span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1 group-hover:text-indigo-600">
                  <RotateCw className="w-3 h-3" /> Clique para virar
                </span>
              </div>

              <div className="my-auto py-4 text-center">
                <p className="text-base md:text-xl font-bold text-slate-900 leading-relaxed">
                  {isFlipped ? activeCard.back : activeCard.front}
                </p>
              </div>

              <div className="text-center text-[11px] text-slate-500 font-mono">
                {isFlipped ? 'Como foi a sua facilidade para lembrar?' : 'Pense na resposta e clique para virar'}
              </div>
            </div>
          </div>

          {/* SRS Assessment Action Buttons */}
          {isFlipped ? (
            <div className="grid grid-cols-3 gap-3 pt-2">
              <button
                id="srs-hard-btn"
                onClick={() => handleSRSResponse('new', 1)}
                className="py-3 px-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs transition-all flex flex-col items-center gap-0.5"
              >
                <span>Difícil / Errei</span>
                <span className="text-[10px] text-rose-600/80 font-mono font-normal">Revisar em 1 dia</span>
              </button>
              <button
                id="srs-good-btn"
                onClick={() => handleSRSResponse('learning', 3)}
                className="py-3 px-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-bold text-xs transition-all flex flex-col items-center gap-0.5"
              >
                <span>Lembrei (Bom)</span>
                <span className="text-[10px] text-blue-600/80 font-mono font-normal">Revisar em 3 dias</span>
              </button>
              <button
                id="srs-easy-btn"
                onClick={() => handleSRSResponse('mastered', 7)}
                className="py-3 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold text-xs transition-all flex flex-col items-center gap-0.5 shadow-2xs"
              >
                <span>Fácil! (Dominado)</span>
                <span className="text-[10px] text-emerald-600/80 font-mono font-normal">Revisar em 7 dias</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={prevCard}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Anterior
              </button>
              <button
                onClick={handleFlip}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm"
              >
                Virar Card
              </button>
              <button
                onClick={nextCard}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                Próximo <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
