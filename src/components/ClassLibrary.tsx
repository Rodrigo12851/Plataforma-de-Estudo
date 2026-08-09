import React, { useState } from 'react';
import { Search, Plus, Play, Trash2, Youtube, Sparkles, Filter, Clock, BookOpen, Layers } from 'lucide-react';
import { ClassLesson, Category } from '../types';

interface ClassLibraryProps {
  lessons: ClassLesson[];
  activeLessonId: string;
  onSelectLesson: (id: string) => void;
  onDeleteLesson: (id: string) => void;
  onOpenNewLessonModal: () => void;
}

export const ClassLibrary: React.FC<ClassLibraryProps> = ({
  lessons,
  activeLessonId,
  onSelectLesson,
  onDeleteLesson,
  onOpenNewLessonModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'Todas'>('Todas');

  const filteredLessons = lessons.filter((lesson) => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          lesson.channel.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (lesson.courseName && lesson.courseName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'Todas' || lesson.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Search & Action Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex-1 w-full relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar aula por título, canal ou assunto..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs md:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white"
          />
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 text-xs no-scrollbar">
          {['Todas', 'Tecnologia', 'Exatas', 'Humanas', 'Idiomas', 'Geral'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat as any)}
              className={`px-3 py-2 rounded-xl font-semibold shrink-0 transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Add New Lesson Button */}
        <button
          onClick={onOpenNewLessonModal}
          className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Aula do YouTube</span>
        </button>
      </div>

      {/* Class Cards Grid */}
      {filteredLessons.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto">
            <Youtube className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            {lessons.length === 0 ? 'Sua biblioteca está vazia' : 'Nenhuma aula encontrada'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {lessons.length === 0
              ? 'Você excluiu todas as aulas da sua biblioteca. Clique abaixo para adicionar novas aulas do YouTube.'
              : 'Nenhuma aula encontrada para esta busca ou categoria.'}
          </p>
          <button
            onClick={onOpenNewLessonModal}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-2 mx-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Aula do YouTube</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLessons.map((lesson) => {
          const isActive = lesson.id === activeLessonId;
          const thumbnailUrl = `https://img.youtube.com/vi/${lesson.youtubeId}/mqdefault.jpg`;

          return (
            <div
              key={lesson.id}
              className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between group ${
                isActive
                  ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
              }`}
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video bg-slate-900 overflow-hidden cursor-pointer" onClick={() => onSelectLesson(lesson.id)}>
                <img
                  src={thumbnailUrl}
                  alt={lesson.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-slate-900/30 group-hover:bg-slate-900/10 transition-all flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  </div>
                </div>

                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md text-[10px] font-bold text-indigo-700 border border-slate-200">
                  {lesson.category}
                </span>

                <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-slate-900/80 font-mono text-[10px] text-white font-bold">
                  {lesson.duration}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  {lesson.courseName && (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-[10px] font-bold text-indigo-700 mb-1.5">
                      <Layers className="w-3 h-3 text-indigo-600" />
                      <span>{lesson.courseName}</span>
                    </div>
                  )}
                  <h3 className="font-bold text-sm text-slate-900 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                    {lesson.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">{lesson.channel}</p>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                    <span>Progresso</span>
                    <span className="font-mono text-indigo-600 font-bold">{lesson.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full transition-all"
                      style={{ width: `${lesson.progress}%` }}
                    />
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => onSelectLesson(lesson.id)}
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 font-bold transition-all flex items-center gap-1.5 border border-indigo-100"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Estudar Agora</span>
                  </button>

                  <button
                    onClick={() => onDeleteLesson(lesson.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-all"
                    title="Remover Aula"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
};
