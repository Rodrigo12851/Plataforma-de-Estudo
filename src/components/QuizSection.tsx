import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, Award, RotateCcw, ArrowRight, Sparkles, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ClassLesson, QuizQuestion } from '../types';
import { sounds } from '../utils/audioSynth';

interface QuizSectionProps {
  lesson: ClassLesson;
  onCompleteQuiz: (score: number, total: number) => void;
  onSeekToTimestamp: (timeStr: string) => void;
}

export const QuizSection: React.FC<QuizSectionProps> = ({
  lesson,
  onCompleteQuiz,
  onSeekToTimestamp
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: number }>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion: QuizQuestion | undefined = lesson.quiz[currentQuestionIndex];

  const handleSelectOption = (optionIndex: number) => {
    if (selectedOption !== null) return; // Prevent changing after answer
    setSelectedOption(optionIndex);
    setShowExplanation(true);

    const isCorrect = optionIndex === currentQuestion?.correctAnswer;
    if (isCorrect) {
      sounds.playCorrect();
    }

    setUserAnswers((prev) => ({ ...prev, [currentQuestionIndex]: optionIndex }));
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setShowExplanation(false);

    if (currentQuestionIndex < lesson.quiz.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
      // Calculate score
      let correctCount = 0;
      lesson.quiz.forEach((q, idx) => {
        if (userAnswers[idx] === q.correctAnswer || (idx === currentQuestionIndex && selectedOption === q.correctAnswer)) {
          correctCount++;
        }
      });

      if (correctCount >= 3) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      onCompleteQuiz(correctCount, lesson.quiz.length);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setUserAnswers({});
    setShowExplanation(false);
    setIsFinished(false);
  };

  if (!currentQuestion && !isFinished) {
    return null;
  }

  // Calculate final score
  let correctTotal = 0;
  lesson.quiz.forEach((q, idx) => {
    if (userAnswers[idx] === q.correctAnswer) correctTotal++;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Quiz de Fixação da Aula</h3>
            <p className="text-xs text-slate-500">Avalue sua retenção com questões sobre a transcrição</p>
          </div>
        </div>

        {!isFinished && (
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Questão {currentQuestionIndex + 1} de {lesson.quiz.length}
          </span>
        )}
      </div>

      {/* Finished Summary State */}
      {isFinished ? (
        <div className="py-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-amber-500 flex items-center justify-center text-white mx-auto shadow-md">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <h4 className="text-2xl font-black text-slate-900">
              {correctTotal === lesson.quiz.length ? '🎉 Desempenho Perfeito!' : correctTotal >= 3 ? '👏 Muito Bom!' : '📚 Continue Praticando!'}
            </h4>
            <p className="text-sm text-slate-600 mt-1">
              Você acertou <span className="text-indigo-600 font-bold">{correctTotal}</span> de <span className="text-slate-900 font-bold">{lesson.quiz.length}</span> questões.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 max-w-md mx-auto text-xs text-slate-700">
            Recompensas: <span className="text-amber-600 font-bold">+{correctTotal * 30} XP</span> acumulados na sua conta!
          </div>

          <button
            onClick={handleRestartQuiz}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-2 mx-auto"
          >
            <RotateCcw className="w-4 h-4" /> Tentar Novamente
          </button>
        </div>
      ) : (
        /* Active Question State */
        <div className="space-y-6">
          {/* Question Text */}
          <div className="space-y-2">
            <h4 className="text-base md:text-lg font-bold text-slate-900 leading-snug">
              {currentQuestion.question}
            </h4>
            {currentQuestion.timestampRef && (
              <button
                onClick={() => onSeekToTimestamp(currentQuestion.timestampRef!)}
                className="text-xs text-indigo-600 hover:underline font-mono flex items-center gap-1"
              >
                <Clock className="w-3.5 h-3.5" /> Referência no vídeo: min {currentQuestion.timestampRef}
              </button>
            )}
          </div>

          {/* Options Grid */}
          <div className="space-y-3">
            {currentQuestion.options.map((optionText, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrectAnswer = idx === currentQuestion.correctAnswer;

              let btnClass = 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300';

              if (selectedOption !== null) {
                if (isCorrectAnswer) {
                  btnClass = 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold';
                } else if (isSelected && !isCorrectAnswer) {
                  btnClass = 'bg-rose-50 border-rose-300 text-rose-800 font-semibold';
                } else {
                  btnClass = 'bg-slate-50/50 border-slate-100 text-slate-400 opacity-60';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={selectedOption !== null}
                  className={`w-full p-4 rounded-xl border text-left text-xs md:text-sm transition-all flex items-start gap-3 ${btnClass}`}
                >
                  <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 text-slate-700">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-1 leading-relaxed">{optionText}</span>
                  {selectedOption !== null && isCorrectAnswer && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                  {selectedOption !== null && isSelected && !isCorrectAnswer && (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Box */}
          {showExplanation && (
            <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Explicação do Gabarito:</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {currentQuestion.explanation}
              </p>
            </div>
          )}

          {/* Next Button */}
          {selectedOption !== null && (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleNextQuestion}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-2"
              >
                <span>{currentQuestionIndex < lesson.quiz.length - 1 ? 'Próxima Questão' : 'Ver Resultado'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
