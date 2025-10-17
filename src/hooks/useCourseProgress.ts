import { useState, useEffect } from 'react';
import { CourseProgress, UserProgressResponse } from '@/types/course';
import api from '../apiClient';

export const useCourseProgress = () => {
  const [progress, setProgress] = useState<Record<string, CourseProgress>>({});

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await api.get<UserProgressResponse[]>('/api/progress');
        const progressData = res.data.reduce((acc: Record<string, CourseProgress>, p: UserProgressResponse) => {
          acc[p.lessonId] = {
            lessonId: p.lessonId,
            lessonTitle: p.lessonTitle,
            completed: p.completed,
            watchedSeconds: p.watchedSeconds,
            totalDuration: 0, // This will be updated by the video player
            unlockedSeek: false,
            watched: false,
          };
          return acc;
        }, {});
        setProgress(progressData);
      } catch (err) {
        console.error('Failed to fetch progress', err);
      }
    };

    fetchProgress();
  }, []);

  const updateProgress = (lessonId: string, update: Partial<CourseProgress>) => {
    console.log('useCourseProgress: updateProgress called', { lessonId, update });
    setProgress(prev => {
      const newProgress = {
        ...prev,
        [lessonId]: {
          ...prev[lessonId],
          lessonId,
          lessonTitle: update.lessonTitle !== undefined ? update.lessonTitle : (prev[lessonId]?.lessonTitle || ''), // Ensure lessonTitle is set
          totalDuration: 0,
          unlockedSeek: false,
          watched: false,
          // Apply updates, ensuring completed and watchedSeconds are handled correctly
          ...update,
          completed: update.completed !== undefined ? update.completed : (prev[lessonId]?.completed || false),
          watchedSeconds: update.completed ? (update.watchedSeconds !== undefined ? update.watchedSeconds : (prev[lessonId]?.watchedSeconds || 0)) : (update.watchedSeconds !== undefined ? update.watchedSeconds : (prev[lessonId]?.watchedSeconds || 0)),
        },
      };

      // Persist to backend
      const lessonData = newProgress[lessonId];
      console.log('useCourseProgress: Sending to API', { lessonId: lessonData.lessonId, lessonTitle: lessonData.lessonTitle, watchedSeconds: lessonData.watchedSeconds, completed: lessonData.completed });
      api.post('/api/progress', {
        lessonId: lessonData.lessonId,
        lessonTitle: lessonData.lessonTitle, // Include lessonTitle
        watchedSeconds: lessonData.watchedSeconds,
        completed: lessonData.completed,
      });

      return newProgress;
    });
  };

  const getProgress = (lessonId: string): CourseProgress => {
    return progress[lessonId] || {
      lessonId,
      lessonTitle: '', // Default lessonTitle
      completed: false,
      watchedSeconds: 0,
      totalDuration: 0,
      unlockedSeek: false,
      watched: false,
    };
  };

  const getTotalProgress = (totalLessons: number): number => {
    const completed = Object.values(progress).filter(p => p.completed).length;
    return totalLessons > 0 ? (completed / totalLessons) * 100 : 0;
  };

  return { progress, updateProgress, getProgress, getTotalProgress };
};
