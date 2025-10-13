import { useState, useEffect } from 'react';
import { CourseProgress } from '@/types/course';

const STORAGE_KEY = 'course_progress';

export const useCourseProgress = () => {
  const [progress, setProgress] = useState<Record<string, CourseProgress>>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const updateProgress = (lessonId: string, update: Partial<CourseProgress>) => {
    setProgress(prev => ({
      ...prev,
      [lessonId]: {
        ...prev[lessonId],
        lessonId,
        completed: false,
        watchedSeconds: 0,
        totalDuration: 0,
        unlockedSeek: false,
        ...update,
      },
    }));
  };

  const getProgress = (lessonId: string): CourseProgress => {
    return progress[lessonId] || {
      lessonId,
      completed: false,
      watchedSeconds: 0,
      totalDuration: 0,
      unlockedSeek: false,
    };
  };

  const getTotalProgress = (totalLessons: number): number => {
    const completed = Object.values(progress).filter(p => p.completed).length;
    return totalLessons > 0 ? (completed / totalLessons) * 100 : 0;
  };

  return { progress, updateProgress, getProgress, getTotalProgress };
};
