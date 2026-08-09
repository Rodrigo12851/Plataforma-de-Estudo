import React, { useState, useEffect } from 'react';
import { Plus, Youtube } from 'lucide-react';
import { INITIAL_GAMIFICATION } from './data/sampleLessons';
import { ClassLesson, UserGamification, SRSStage } from './types';
import { Header } from './components/Header';
import { VideoPlayerSection } from './components/VideoPlayerSection';
import { ClassroomTutorChat } from './components/ClassroomTutorChat';
import { FlashcardsSection } from './components/FlashcardsSection';
import { QuizSection } from './components/QuizSection';
import { PomodoroTimer } from './components/PomodoroTimer';
import { FocusModeOverlay } from './components/FocusModeOverlay';
import { ClassLibrary } from './components/ClassLibrary';
import { SRSReviewTab } from './components/SRSReviewTab';
import { NewLessonModal } from './components/NewLessonModal';
import { AchievementsModal } from './components/AchievementsModal';
import { generateLessonPdf } from './utils/pdfGenerator';
import {
  subscribeToLessons,
  saveLessonToFirestore,
  deleteLessonFromFirestore,
  subscribeToGamification,
  saveGamificationToFirestore,
  subscribeToActiveLessonId,
  saveActiveLessonIdToFirestore
} from './lib/firestoreService';

export default function App() {
  const [lessons, setLessons] = useState<ClassLesson[]>([]);
  const [activeLessonId, setActiveLessonId] = useState<string>('');
  const [gamification, setGamification] = useState<UserGamification>(INITIAL_GAMIFICATION);

  // Real-time listener for Firestore database
  useEffect(() => {
    const unsubLessons = subscribeToLessons((firestoreLessons) => {
      setLessons(firestoreLessons);
      setActiveLessonId((currentId) => {
        if (!currentId && firestoreLessons.length > 0) {
          return firestoreLessons[0].id;
        }
        if (currentId && !firestoreLessons.some((l) => l.id === currentId)) {
          return firestoreLessons[0]?.id || '';
        }
        return currentId;
      });
    });

    const unsubGamification = subscribeToGamification((firestoreGamification) => {
      setGamification(firestoreGamification);
    });

    const unsubActiveId = subscribeToActiveLessonId((activeId) => {
      if (activeId) {
        setActiveLessonId(activeId);
      }
    });

    return () => {
      unsubLessons();
      unsubGamification();
      unsubActiveId();
    };
  }, []);

  const [activeTab, setActiveTab] = useState<'study' | 'library' | 'srs'>('study');
  const [activeStudySubTab, setActiveStudySubTab] = useState<'flashcards' | 'quiz' | 'tutor'>('flashcards');

  // Modal & Overlay States
  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);
  const [isNewLessonModalOpen, setIsNewLessonModalOpen] = useState(false);
  const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Active Timestamp & Tutor Prompting
  const [activeTimestamp, setActiveTimestamp] = useState<string | null>(null);
  const [tutorInitialPrompt, setTutorInitialPrompt] = useState<string | null>(null);

  // Pomodoro Timer state
  const [pomodoroWorkMinutes, setPomodoroWorkMinutes] = useState(25);
  const [pomodoroSecondsRemaining, setPomodoroSecondsRemaining] = useState(25 * 60);
  const [isPomodoroActive, setIsPomodoroActive] = useState(false);
  const [pomodoroMode, setPomodoroMode] = useState<'work' | 'break'>('work');

  const currentLesson = lessons.find((l) => l.id === activeLessonId) || lessons[0];

  // Pomodoro time formatting for header
  const pomodoroMinutes = Math.floor(pomodoroSecondsRemaining / 60);
  const pomodoroSeconds = pomodoroSecondsRemaining % 60;
  const pomodoroFormatted = `${String(pomodoroMinutes).padStart(2, '0')}:${String(pomodoroSeconds).padStart(2, '0')}`;

  // Handler: Jump to timestamp in YouTube player
  const handleSeekToTimestampSeconds = (seconds: number) => {
    const iframe = document.getElementById('youtube-player-iframe') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'seekTo', args: [seconds, true] }),
        '*'
      );
    }
  };

  const handleSeekToTimestampString = (timeStr: string) => {
    if (!currentLesson) return;
    setActiveTimestamp(timeStr);
    const ts = currentLesson.timestamps.find((t) => t.time === timeStr);
    if (ts) {
      handleSeekToTimestampSeconds(ts.seconds);
    } else {
      // Parse MM:SS to seconds
      const parts = timeStr.split(':');
      if (parts.length === 2) {
        const secs = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
        handleSeekToTimestampSeconds(secs);
      }
    }
  };

  const handleOpenTutorWithTimestamp = (timeStr: string) => {
    setActiveStudySubTab('tutor');
    setTutorInitialPrompt(`O que o professor quis dizer no minuto ${timeStr}?`);
  };

  // Handler: Generate PDF Apostila
  const handleGeneratePdf = () => {
    if (!currentLesson) return;
    generateLessonPdf(currentLesson);
    // Add XP reward for generating study guide
    const updatedGamification = {
      ...gamification,
      xp: gamification.xp + 25
    };
    setGamification(updatedGamification);
    saveGamificationToFirestore(updatedGamification);
  };

  // Handler: Update Flashcard SRS Stage
  const handleUpdateFlashcardSRS = (lessonId: string, cardId: string, stage: SRSStage, reviewDays: number) => {
    const targetLesson = lessons.find((l) => l.id === lessonId);
    if (!targetLesson) return;

    const updatedLesson: ClassLesson = {
      ...targetLesson,
      flashcards: targetLesson.flashcards.map((fc) => {
        if (fc.id !== cardId) return fc;
        return {
          ...fc,
          srsStage: stage,
          nextReviewDays: reviewDays,
          lastReviewed: new Date().toISOString().split('T')[0]
        };
      })
    };

    saveLessonToFirestore(updatedLesson);

    // Gamification XP boost
    if (stage === 'mastered') {
      const updatedGamification = {
        ...gamification,
        xp: gamification.xp + 15,
        totalFlashcardsMastered: gamification.totalFlashcardsMastered + 1
      };
      setGamification(updatedGamification);
      saveGamificationToFirestore(updatedGamification);
    }
  };

  // Handler: Quiz Complete
  const handleCompleteQuiz = (score: number, total: number) => {
    const gainedXp = score * 20;
    const updatedGamification = {
      ...gamification,
      xp: gamification.xp + gainedXp,
      totalQuizzesCompleted: gamification.totalQuizzesCompleted + 1,
      achievements: gamification.achievements.map((a) => {
        if (a.id === 'ach-5' && score === total) {
          return { ...a, unlocked: true, unlockedAt: new Date().toISOString().split('T')[0] };
        }
        return a;
      })
    };

    setGamification(updatedGamification);
    saveGamificationToFirestore(updatedGamification);

    // Update lesson progress in Firestore
    if (currentLesson) {
      const progressVal = Math.min(100, Math.round((score / total) * 100));
      const updatedLesson: ClassLesson = {
        ...currentLesson,
        progress: Math.max(currentLesson.progress, progressVal)
      };
      saveLessonToFirestore(updatedLesson);
    }
  };

  // Handler: Add New Lesson
  const handleAddLesson = (newLesson: ClassLesson) => {
    saveLessonToFirestore(newLesson);
    setActiveLessonId(newLesson.id);
    saveActiveLessonIdToFirestore(newLesson.id);
    setActiveTab('study');

    // Unlock achievement & XP
    const updatedGamification = {
      ...gamification,
      xp: gamification.xp + 50
    };
    setGamification(updatedGamification);
    saveGamificationToFirestore(updatedGamification);
  };

  // Handler: Delete Lesson
  const handleDeleteLesson = (id: string) => {
    deleteLessonFromFirestore(id);
    const remaining = lessons.filter((l) => l.id !== id);
    if (activeLessonId === id) {
      const nextId = remaining[0]?.id || '';
      setActiveLessonId(nextId);
      saveActiveLessonIdToFirestore(nextId);
    }
  };

  // Handler: Pomodoro Focus minutes completed
  const handleMinutesStudied = (minutes: number) => {
    const updatedGamification = {
      ...gamification,
      xp: gamification.xp + minutes * 5,
      totalMinutesFocused: gamification.totalMinutesFocused + minutes
    };
    setGamification(updatedGamification);
    saveGamificationToFirestore(updatedGamification);
  };


  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-indigo-500 selection:text-white flex flex-col">
      {/* Header */}
      <Header
        gamification={gamification}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenPomodoro={() => setIsPomodoroOpen(true)}
        onOpenNewLessonModal={() => setIsNewLessonModalOpen(true)}
        onToggleFocusMode={() => setIsFocusMode(!isFocusMode)}
        onOpenAchievementsModal={() => setIsAchievementsModalOpen(true)}
        pomodoroTimeFormatted={pomodoroFormatted}
        isPomodoroActive={isPomodoroActive}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {activeTab === 'study' && (
          !currentLesson ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-lg mx-auto my-12 space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto">
                <Youtube className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Sua biblioteca está vazia</h3>
              <p className="text-sm text-slate-500">
                Você excluiu todas as aulas. Adicione o link de um vídeo do YouTube para gerar novos flashcards, quiz e tutoria com IA.
              </p>
              <button
                onClick={() => setIsNewLessonModalOpen(true)}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Nova Aula</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left 7 Columns: YouTube Video Player & Key Notes */}
              <div className="lg:col-span-7 space-y-6">
                <VideoPlayerSection
                  lesson={currentLesson}
                  onSeekToTimestamp={handleSeekToTimestampSeconds}
                  onGeneratePdf={handleGeneratePdf}
                  onOpenTutorWithTimestamp={handleOpenTutorWithTimestamp}
                  activeTimestamp={activeTimestamp}
                />
              </div>

              {/* Right 5 Columns: Interactive Study Tools (Flashcards SRS, Quiz, Tutor Chat) */}
              <div className="lg:col-span-5 space-y-6">
                {/* Study Tools Navigation Sub-tabs */}
                <div className="flex bg-slate-200/80 p-1 rounded-2xl border border-slate-300 shadow-sm text-xs font-bold">
                  <button
                    onClick={() => setActiveStudySubTab('flashcards')}
                    className={`flex-1 py-2.5 rounded-xl transition-all ${
                      activeStudySubTab === 'flashcards'
                        ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Flashcards ({currentLesson.flashcards.length})
                  </button>
                  <button
                    onClick={() => setActiveStudySubTab('quiz')}
                    className={`flex-1 py-2.5 rounded-xl transition-all ${
                      activeStudySubTab === 'quiz'
                        ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Quiz ({currentLesson.quiz.length})
                  </button>
                  <button
                    onClick={() => setActiveStudySubTab('tutor')}
                    className={`flex-1 py-2.5 rounded-xl transition-all ${
                      activeStudySubTab === 'tutor'
                        ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Tutor de IA
                  </button>
                </div>

                {/* Active Subtab Panel */}
                {activeStudySubTab === 'flashcards' && (
                  <FlashcardsSection
                    lesson={currentLesson}
                    onUpdateFlashcardSRS={(cardId, stage, days) =>
                      handleUpdateFlashcardSRS(currentLesson.id, cardId, stage, days)
                    }
                  />
                )}

                {activeStudySubTab === 'quiz' && (
                  <QuizSection
                    lesson={currentLesson}
                    onCompleteQuiz={handleCompleteQuiz}
                    onSeekToTimestamp={handleSeekToTimestampString}
                  />
                )}

                {activeStudySubTab === 'tutor' && (
                  <ClassroomTutorChat
                    lesson={currentLesson}
                    onSeekToTimestamp={handleSeekToTimestampString}
                    initialPrompt={tutorInitialPrompt}
                  />
                )}
              </div>
            </div>
          )
        )}

        {/* Tab 2: Class Library */}
        {activeTab === 'library' && (
          <ClassLibrary
            lessons={lessons}
            activeLessonId={activeLessonId}
            onSelectLesson={(id) => {
              setActiveLessonId(id);
              saveActiveLessonIdToFirestore(id);
              setActiveTab('study');
            }}
            onDeleteLesson={handleDeleteLesson}
            onOpenNewLessonModal={() => setIsNewLessonModalOpen(true)}
          />
        )}

        {/* Tab 3: SRS Review Center */}
        {activeTab === 'srs' && (
          <SRSReviewTab
            lessons={lessons}
            onUpdateFlashcardSRS={handleUpdateFlashcardSRS}
          />
        )}
      </main>

      {/* Modals & Overlays */}
      <PomodoroTimer
        isOpen={isPomodoroOpen}
        onClose={() => setIsPomodoroOpen(false)}
        onToggleFocusMode={() => setIsFocusMode(true)}
        onMinutesStudied={handleMinutesStudied}
        secondsRemaining={pomodoroSecondsRemaining}
        setSecondsRemaining={setPomodoroSecondsRemaining}
        isActive={isPomodoroActive}
        setIsActive={setIsPomodoroActive}
        mode={pomodoroMode}
        setMode={setPomodoroMode}
      />

      <NewLessonModal
        isOpen={isNewLessonModalOpen}
        onClose={() => setIsNewLessonModalOpen(false)}
        onAddLesson={handleAddLesson}
        existingLessons={lessons}
      />

      <AchievementsModal
        isOpen={isAchievementsModalOpen}
        onClose={() => setIsAchievementsModalOpen(false)}
        gamification={gamification}
      />

      {isFocusMode && currentLesson && (
        <FocusModeOverlay
          lesson={currentLesson}
          onExitFocusMode={() => setIsFocusMode(false)}
          pomodoroFormatted={pomodoroFormatted}
          isPomodoroActive={isPomodoroActive}
          onTogglePomodoro={() => setIsPomodoroActive(!isPomodoroActive)}
        />
      )}
    </div>
  );
}
