import { CheckCircle2, Circle, Lock } from 'lucide-react';
import { Course, Module, Lesson, Week, Day } from '@/types/course';
import { CourseProgress } from '@/types/course';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CourseSidebarProps {
  course: Course; // Changed to accept the entire course object
  currentLessonId: string;
  progress: Record<string, CourseProgress>;
  onLessonSelect: (lesson: Lesson) => void;
}

export const CourseSidebar = ({
  course,
  currentLessonId,
  progress,
  onLessonSelect,
}: CourseSidebarProps) => {

  // Flatten all lessons for global index calculation and easy lookup
  const allLessonsFlat: Lesson[] = course.weeks.flatMap(week =>
    week.days.flatMap(day =>
      day.modules.flatMap(module =>
        module.videos.map(video => ({
          id: video._id || video.id || '',
          title: video.title,
          description: '', // Assuming description is not directly on video
          videoUrl: video.url,
          duration: video.duration || 0,
          notes: video.notesUrl || [], // notes is now string[]
        }))
      )
    )
  );

  // Removed isLessonLocked function to unlock all lessons

  return (
    <div className="w-80 bg-sidebar border-r border-sidebar-border flex flex-col h-screen">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Course Player
        </h1>
        <p className="text-sm text-sidebar-foreground/60 mt-1">
          Modern Learning Platform
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {course.weeks.map((week) => (
            <div key={week.weekNumber} className="space-y-4">
              <h3 className="font-bold text-lg text-sidebar-foreground px-2">
                Week {week.weekNumber}
              </h3>
              {week.days.map((day) => (
                <div key={`${week.weekNumber}-${day.dayNumber}`} className="space-y-2 pl-4">
                  <h4 className="font-semibold text-md text-sidebar-foreground/90 px-2">
                    Day {day.dayNumber}
                  </h4>
                  {day.modules.map((module) => (
                    <div key={module._id || module.id} className="space-y-1 pl-4">
                      <h5 className="font-medium text-sm text-sidebar-foreground/80 px-2">
                        {module.title}
                      </h5>
                      <div className="space-y-1">
                        {module.videos.map((video) => {
                          const lesson: Lesson = {
                            id: video._id || video.id || '',
                            title: video.title,
                            description: '',
                            videoUrl: video.url,
                            duration: video.duration || 0,
                            resources: video.resourcesUrl ? [{ title: 'Resources', url: video.resourcesUrl }] : [],
                            notes: video.notesUrl ? [{ title: 'Notes', url: video.notesUrl }] : [],
                          };
                          const isCompleted = progress[lesson.id]?.completed;
                          const isCurrent = lesson.id === currentLessonId;

                          return (
                            <Button
                              key={lesson.id}
                              variant="ghost"
                              className={cn(
                                'w-full justify-start gap-3 h-auto py-3 px-3 transition-all',
                                isCurrent && 'bg-sidebar-accent',
                                isCompleted && !isCurrent && 'text-success',
                              )}
                              onClick={() => onLessonSelect(lesson)}
                            >
                              <div className="shrink-0">
                                {isCompleted ? (
                                  <CheckCircle2 className="w-4 h-4 text-success" />
                                ) : (
                                  <Circle className="w-4 h-4 text-muted-foreground" />
                                )}
                              </div>
                              
                              <div className="flex-1 text-left">
                                <div className="font-medium text-sm leading-tight">
                                  {lesson.title}
                                </div>
                              </div>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  {day.assessment && (
                    <Button
                      variant="ghost"
                      className={cn(
                        'w-full justify-start gap-3 h-auto py-3 px-3 transition-all',
                        // Add styling for current assessment if needed
                      )}
                      onClick={() => {
                        // Handle assessment click, e.g., navigate to assessment tab or link
                        if (day.assessmentLink) {
                          window.open(day.assessmentLink, '_blank');
                        }
                      }}
                    >
                      <div className="shrink-0">
                        <Circle className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-sm leading-tight">
                          Assessment: {day.assessment}
                        </div>
                      </div>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
