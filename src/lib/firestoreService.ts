import {
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';
import { ClassLesson, UserGamification } from '../types';
import { SAMPLE_LESSONS, INITIAL_GAMIFICATION } from '../data/sampleLessons';

const SYSTEM_DOC_REF = doc(db, 'app_state', 'system');
const GAMIFICATION_DOC_REF = doc(db, 'app_state', 'gamification');
const ACTIVE_LESSON_DOC_REF = doc(db, 'app_state', 'active_lesson');
const LESSONS_COLLECTION_REF = collection(db, 'lessons');

/**
 * Subscribe to the real-time lessons collection in Firestore.
 * Performs initial seeding with SAMPLE_LESSONS if the system has never been initialized.
 */
export function subscribeToLessons(
  onData: (lessons: ClassLesson[], isLoading: boolean) => void
): () => void {
  let isInitial = true;

  const unsubscribe = onSnapshot(
    LESSONS_COLLECTION_REF,
    async (snapshot) => {
      let currentLessons = snapshot.docs.map(
        (d) => d.data() as ClassLesson
      );

      if (isInitial) {
        isInitial = false;
        try {
          const sysSnap = await getDoc(SYSTEM_DOC_REF);
          if (!sysSnap.exists() || !sysSnap.data()?.seeded) {
            // Seed initial sample lessons into Firestore
            for (const lesson of SAMPLE_LESSONS) {
              await setDoc(doc(db, 'lessons', lesson.id), lesson);
            }
            await setDoc(SYSTEM_DOC_REF, { seeded: true, createdAt: new Date().toISOString() });
            currentLessons = SAMPLE_LESSONS;
          }
        } catch (e) {
          console.error('Erro ao verificar ou semear Firestore:', e);
        }
      }

      // Sort by creation date or array position if needed
      onData(currentLessons, false);
    },
    (error) => {
      console.error('Erro ao escutar Firestore lessons:', error);
      onData([], false);
    }
  );

  return unsubscribe;
}

/**
 * Save or update a lesson directly in Firestore
 */
export async function saveLessonToFirestore(lesson: ClassLesson): Promise<void> {
  try {
    await setDoc(doc(db, 'lessons', lesson.id), lesson);
  } catch (err) {
    console.error(`Erro ao salvar aula ${lesson.id} no Firestore:`, err);
  }
}

/**
 * Delete a lesson document from Firestore
 */
export async function deleteLessonFromFirestore(lessonId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'lessons', lessonId));
  } catch (err) {
    console.error(`Erro ao deletar aula ${lessonId} no Firestore:`, err);
  }
}

/**
 * Subscribe to Gamification state in Firestore
 */
export function subscribeToGamification(
  onData: (gamification: UserGamification) => void
): () => void {
  const unsubscribe = onSnapshot(
    GAMIFICATION_DOC_REF,
    async (snapshot) => {
      if (snapshot.exists()) {
        onData(snapshot.data() as UserGamification);
      } else {
        // Initialize gamification doc if missing
        try {
          await setDoc(GAMIFICATION_DOC_REF, INITIAL_GAMIFICATION);
          onData(INITIAL_GAMIFICATION);
        } catch (e) {
          console.error('Erro ao criar gamificação inicial no Firestore:', e);
        }
      }
    },
    (err) => {
      console.error('Erro no escutador da gamificação no Firestore:', err);
    }
  );

  return unsubscribe;
}

/**
 * Save Gamification state to Firestore
 */
export async function saveGamificationToFirestore(
  gamification: UserGamification
): Promise<void> {
  try {
    await setDoc(GAMIFICATION_DOC_REF, gamification);
  } catch (err) {
    console.error('Erro ao salvar gamificação no Firestore:', err);
  }
}

/**
 * Subscribe to Active Lesson ID in Firestore
 */
export function subscribeToActiveLessonId(
  onData: (activeId: string) => void
): () => void {
  return onSnapshot(ACTIVE_LESSON_DOC_REF, (snapshot) => {
    if (snapshot.exists()) {
      onData(snapshot.data()?.activeId || '');
    }
  });
}

/**
 * Save Active Lesson ID to Firestore
 */
export async function saveActiveLessonIdToFirestore(activeId: string): Promise<void> {
  try {
    await setDoc(ACTIVE_LESSON_DOC_REF, { activeId });
  } catch (err) {
    console.error('Erro ao salvar ID ativo no Firestore:', err);
  }
}
