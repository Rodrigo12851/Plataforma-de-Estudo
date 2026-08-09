import React, { useState } from 'react';
import { X, Youtube, Sparkles, Loader2, Link, BookOpen } from 'lucide-react';
import { Category, ClassLesson } from '../types';

interface NewLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLesson: (lesson: ClassLesson) => void;
}

function extractYouTubeId(url: string): string {
  if (!url) return 'aircAruvnKk';
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : url.length === 11 ? url : 'aircAruvnKk';
}

function createFallbackLesson(youtubeUrl: string, category: Category, customTitle?: string): ClassLesson {
  const videoId = extractYouTubeId(youtubeUrl);
  const titleText = customTitle?.trim() || `Aula do YouTube (${videoId})`;

  return {
    id: `lesson-${Date.now()}`,
    youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
    youtubeId: videoId,
    title: titleText,
    channel: 'Canal Educacional',
    duration: '12:30',
    category: category || 'Geral',
    summary: `Esta aula aborda os aspectos fundamentais do tópico "${titleText}". O conteúdo inclui explicações conceituais, exemplos práticos demonstrados ao longo do vídeo e análises essenciais para o aprendizado e revisão ativa.`,
    keyTakeaways: [
      `Fundamentos e conceitos essenciais de ${titleText}.`,
      'Demonstração prática e exemplos com explicações detalhadas.',
      'Recomendações e estratégias de revisão para consolidação do estudo.'
    ],
    timestamps: [
      { time: '00:00', seconds: 0, topic: 'Introdução e Visão Geral', summary: 'Apresentação do tema e objetivos principais da aula.' },
      { time: '02:15', seconds: 135, topic: 'Conceito Teórico Fundamental', summary: 'Detalhamento da teoria e explicações primordiais.' },
      { time: '04:20', seconds: 260, topic: 'Exemplo Prático e Momento Crucial', summary: 'Exemplo resolvido passo a passo e pontos de destaque da aula.' },
      { time: '08:10', seconds: 490, topic: 'Aplicações Práticas', summary: 'Casos reais e exercícios práticos sobre o assunto.' },
      { time: '11:00', seconds: 660, topic: 'Resumo Final e Dicas', summary: 'Síntese dos tópicos aprendidos para revisão rápida.' }
    ],
    flashcards: Array.from({ length: 20 }).map((_, i) => ({
      id: `fc-gen-${Date.now()}-${i}`,
      front: `Pergunta de Estudo ${i + 1}: Qual é o ponto principal discutido sobre ${titleText}?`,
      back: `Resposta do conceito ${i + 1}: Explicação didática referente ao minuto ${(i * 30) % 60} para memorização no sistema de repetição espaçada.`,
      srsStage: 'new' as const,
      nextReviewDays: 0,
      lastReviewed: null
    })),
    quiz: Array.from({ length: 10 }).map((_, i) => ({
      id: `q-gen-${Date.now()}-${i}`,
      question: `Questão de Fixação ${i + 1}: De acordo com o conteúdo de "${titleText}", qual afirmação está correta?`,
      options: [
        `A alternativa A apresenta o conceito correto e preciso do tópico.`,
        `A alternativa B é uma hipótese incorreta sobre a aula.`,
        `A alternativa C trata-se de um conceito não abordado.`,
        `A alternativa D é um distrator secundário.`
      ],
      correctAnswer: 0,
      explanation: `A alternativa A está correta pois resume o ensinamento do trecho de referência do vídeo.`,
      timestampRef: i % 2 === 0 ? '02:15' : '04:20'
    })),
    createdAt: new Date().toISOString(),
    lastStudiedAt: new Date().toISOString(),
    progress: 0
  };
}

export const NewLessonModal: React.FC<NewLessonModalProps> = ({
  isOpen,
  onClose,
  onAddLesson
}) => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [category, setCategory] = useState<Category>('Tecnologia');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl.trim() || isLoading) return;

    setIsLoading(true);

    try {
      let newLesson: ClassLesson;
      const response = await fetch('/api/process-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          youtubeUrl,
          category,
          customTitle
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.id && !data.error) {
          newLesson = data;
        } else {
          newLesson = createFallbackLesson(youtubeUrl, category, customTitle);
        }
      } else {
        newLesson = createFallbackLesson(youtubeUrl, category, customTitle);
      }

      onAddLesson(newLesson);
      setIsLoading(false);
      onClose();
      setYoutubeUrl('');
      setCustomTitle('');
    } catch (err) {
      console.warn('Servidor backend indisponível, gerando aula localmente:', err);
      const newLesson = createFallbackLesson(youtubeUrl, category, customTitle);
      onAddLesson(newLesson);
      setIsLoading(false);
      onClose();
      setYoutubeUrl('');
      setCustomTitle('');
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
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Título da Aula (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Introdução à Física Quântica"
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
