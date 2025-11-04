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

/**
 * Finds the courseId and moduleId for a given videoId.
 * @param courses - Array of courses with modules and videos.
 * @param videoId - The ID of the video/lesson to find.
 * @returns An object containing courseId and moduleId, or null if not found.
 */
export const findVideoDetails = (courses: Course[], videoId: string): { courseId: string; moduleId: string; videoId: string } | null => {
  const videoIdStr = String(videoId);

  for (const course of courses) {
    if (course.modules && Array.isArray(course.modules)) {
      for (const module of course.modules) {
        if (module.videos && Array.isArray(module.videos)) {
          const video = module.videos.find((v: Video) => {
            const currentVideoId = v._id ? String(v._id) : (v.id ? String(v.id) : '');
            return currentVideoId === videoIdStr;
          });
          if (video) {
            return {
              courseId: course._id,
              moduleId: module._id || module.id || '',
              videoId: videoIdStr,
            };
          }
        }
      }
    }
  }

  return null;
};
