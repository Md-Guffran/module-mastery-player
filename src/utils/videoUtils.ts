import { Course, Video } from '@/types/course';

/**
 * Finds a video's duration from courses by lessonId
 * @param courses - Array of courses with modules and videos
 * @param lessonId - The video/lesson ID to find
 * @returns Video duration in seconds, or 0 if not found
 */
export const findVideoDuration = (courses: Course[], lessonId: string): number => {
  const lessonIdStr = String(lessonId);
  
  for (const course of courses) {
    if (course.modules && Array.isArray(course.modules)) {
      for (const module of course.modules) {
        if (module.videos && Array.isArray(module.videos)) {
          const video = module.videos.find((v: Video) => {
            const videoId = v._id ? String(v._id) : (v.id ? String(v.id) : '');
            return videoId === lessonIdStr;
          });
          if (video && video.duration && video.duration > 0) {
            return video.duration;
          }
        }
      }
    }
  }
  
  return 0;
};

