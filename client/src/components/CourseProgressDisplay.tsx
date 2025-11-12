import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Course, UserProgress } from '@/types/course';

interface CourseProgressDisplayProps {
  courseId: string;
  courses: Course[];
  userProgress: UserProgress[];
}

const CourseProgressDisplay: React.FC<CourseProgressDisplayProps> = ({ courseId, courses, userProgress }) => {
  const course = courses.find(c => c._id === courseId);

  if (!course) {
    return null; // Or some error handling
  }

  let totalVideos = 0;
  let completedVideos = 0;

  // Handle both old structure (modules) and new structure (weeks.days.modules)
  if (course.modules && Array.isArray(course.modules)) {
    // Old structure: course.modules
    course.modules.forEach(module => {
      if (module.videos && Array.isArray(module.videos)) {
        module.videos.forEach(video => {
          totalVideos++;
          const progress = userProgress.find(p => (p.lessonId === video._id || p.lessonId === video.id) && p.completed);
          if (progress) {
            completedVideos++;
          }
        });
      }
    });
  } else if (course.weeks && Array.isArray(course.weeks)) {
    // New structure: course.weeks.days.modules
    course.weeks.forEach(week => {
      if (week.days && Array.isArray(week.days)) {
        week.days.forEach(day => {
          if (day.modules && Array.isArray(day.modules)) {
            day.modules.forEach(module => {
              if (module.videos && Array.isArray(module.videos)) {
                module.videos.forEach(video => {
                  totalVideos++;
                  const progress = userProgress.find(p => (p.lessonId === video._id || p.lessonId === video.id) && p.completed);
                  if (progress) {
                    completedVideos++;
                  }
                });
              }
            });
          }
        });
      }
    });
  }

  const progressPercentage = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

  return (
    <div className="flex items-center justify-between mb-2">
      <Progress value={progressPercentage} className="w-3/4 h-2" />
      <span className="text-sm">{progressPercentage}%</span>
    </div>
  );
};

export default CourseProgressDisplay;
