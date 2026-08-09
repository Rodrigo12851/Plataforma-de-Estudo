import React, { useState } from 'react';
import { X, Youtube, Sparkles, Loader2, Link, BookOpen, Layers } from 'lucide-react';
import { Category, ClassLesson } from '../types';

interface NewLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLesson: (lesson: ClassLesson) => void;
  existingLessons?: ClassLesson[];
}

export const NewLessonModal: React.FC<NewLessonModalProps> = ({
  isOpen,
  onClose,
  onAddLesson,
  existingLessons = []
}) => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [courseName, setCourseName] = useState('');
  const [category, setCategory] = useState<Category>('Tecnologia');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // Extract unique course names from existing lessons to present as suggestions
  const existingCourses = Array.from(
    new Set(existingLessons.map((l) => l.courseName).filter(Boolean))
  ) as string[];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl.trim() || isLoading) return;

    setIsLoading(true);

    // Build context of previous lessons in the same course/playlist for anti-repetition
    let existingCourseContext = '';
    const cleanCourse = courseName.trim();

    if (existingLessons && existingLessons.length > 0) {
      const matching = existingLessons.filter((l) => {
        if (cleanCourse) {
          return l.courseName && l.courseName.trim().toLowerCase() === cleanCourse.toLowerCase();
        }
        return false;
      });

      if (matching.length > 0) {
        existingCourseContext = matching
          .map((l, i) => {
            const qList = l.quiz.map((q) => `  - Pergunta da Aula ${i + 1}: "${q.question}"`).join('\n');
            const fcList = l.flashcards.slice(0, 5).map((fc) => `  - Card: "${fc.front}"`).join('\n');
            return `Aula ${i + 1}: "${l.title}"\nResumo da aula: ${l.summary.slice(0, 300)}...\nPerguntas já elaboradas para esta aula:\n${qList}\nCards já feitos:\n${fcList}`;
          })
          .join('\n\n');
      }
    }

    try {
      const response = await fetch('/api/process-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          youtubeUrl,
          category,
          customTitle,
          courseName: cleanCourse || undefined,
          existingCourseContext
        })
      });

      const newLesson = await response.json();
      onAddLesson(newLesson);
      setIsLoading(false);
      onClose();
      setYoutubeUrl('');
      setCustomTitle('');
      setCourseName('');
    } catch (err) {
      console.error('Error generating lesson:', err);
      setIsLoading(false);
      alert('Erro ao processar o vídeo. Tente novamente ou confira a URL.');
    }
  };

  const PRESET_VIDEOS = [
    {
      title: 'Estruturas de Dados e Algoritmos',
      url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM',
      cat: 'Tecnologia' as Category
    },
    {
      title: 'Neurociência da Aprendizagem',
      url: 'https://www.youtube.com/watch?v=vd2X63fMscg',
      cat: 'Humanas' as Category
    },
    {
      title: 'Cálculo e Derivadas Explicados',
      url: 'https://www.youtube.com/watch?v=WUvTyaaNkzM',
      cat: 'Exatas' as Category
    }
  ];

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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Youtube className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Processar Nova Aula com IA</h2>
            <p className="text-xs text-slate-500">Gere Flashcards, Quiz e Transcrição em 1 clique</p>
          </div>
        </div>

        {/* Preset suggestions */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Sugestões Rápidas:
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESET_VIDEOS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setYoutubeUrl(preset.url);
                  setCustomTitle(preset.title);
                  setCategory(preset.cat);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs border border-slate-200 transition-all flex items-center gap-1 font-semibold"
              >
                <BookOpen className="w-3 h-3 text-indigo-600" /> {preset.title}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Link className="w-3.5 h-3.5 text-indigo-600" /> Link do Vídeo no YouTube
            </label>
            <input
              type="text"
              required
              placeholder="https://www.youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs md:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-indigo-600" /> Nome do Curso / Playlist (Opcional)
              </span>
              {existingCourses.length > 0 && (
                <span className="text-[10px] text-indigo-600 font-semibold">
                  {existingCourses.length} playlist(s) salva(s)
                </span>
              )}
            </label>
            <input
              type="text"
              list="existing-courses-list"
              placeholder="Ex: Curso de Python Completo (ou selecione uma playlist)"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs md:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
            <datalist id="existing-courses-list">
              {existingCourses.map((c, i) => (
                <option key={i} value={c} />
              ))}
            </datalist>
            <p className="text-[10px] text-slate-500 mt-1 font-medium">
              ✨ <strong>Modo Playlist Anti-Repetição:</strong> Ao agrupar nesta playlist, a IA lerá as perguntas das aulas anteriores (Aula 1, Aula 2...) para garantir que NADA seja repetido!
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Título / Tema Específico da Aula
            </label>
            <input
              type="text"
              placeholder="Ex: Aula 2 - Funções de Ativação e Redes Neurais"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs md:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Categoria
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs md:text-sm text-slate-900 focus:outline-none focus:border-indigo-500 cursor-pointer focus:bg-white"
            >
              <option value="Tecnologia">Tecnologia & Programação</option>
              <option value="Exatas">Ciências Exatas (Física, Matemática)</option>
              <option value="Humanas">Humanas e História</option>
              <option value="Idiomas">Idiomas</option>
              <option value="Geral">Geral</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading || !youtubeUrl.trim()}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Gerando Resumo, Flashcards e Quiz com Gemini AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Processar Aula com Inteligência Artificial</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
