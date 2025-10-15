import { CheckCircle2, Circle, Clock, Lock } from 'lucide-react';
import { Module, Lesson } from '@/types/course';
import { CourseProgress } from '@/types/course';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CourseSidebarProps {
  modules: Module[];
  currentLessonId: string;
  progress: Record<string, CourseProgress>;
  onLessonSelect: (lesson: Lesson) => void;
}

export const CourseSidebar = ({
  modules,
  currentLessonId,
  progress,
  onLessonSelect,
}: CourseSidebarProps) => {
  const isLessonLocked = (lessonId: string, lessonIndex: number): boolean => {
    if (lessonIndex === 0) return false;
    
    // Find previous lesson in the same module
    let prevLessonId: string | null = null;
    for (const module of modules) {
      const currentIndex = module.lessons.findIndex(l => l.id === lessonId);
      if (currentIndex > 0) {
        prevLessonId = module.lessons[currentIndex - 1].id;
        break;
      } else if (currentIndex === 0) {
        // First lesson of module - find last lesson of previous module
        const moduleIndex = modules.findIndex(m => m.id === module.id);
        if (moduleIndex > 0) {
          const prevModule = modules[moduleIndex - 1];
          prevLessonId = prevModule.lessons[prevModule.lessons.length - 1].id;
        }
        break;
      }
    }
    
    return prevLessonId ? !progress[prevLessonId]?.completed : false;
  };

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
          {modules.map((module, moduleIndex) => (
            <div key={module.id} className="space-y-2">
              <h3 className="font-semibold text-sidebar-foreground px-2">
                {module.title}
              </h3>
              
              <div className="space-y-1">
                {module.lessons.map((lesson, lessonIndex) => {
                  const globalIndex = modules
                    .slice(0, moduleIndex)
                    .reduce((acc, m) => acc + m.lessons.length, 0) + lessonIndex;
                  const isCompleted = progress[lesson.id]?.completed;
                  const isCurrent = lesson.id === currentLessonId;
                  const isLocked = isLessonLocked(lesson.id, globalIndex);

                  return (
                    <Button
                      key={lesson.id}
                      variant="ghost"
                      className={cn(
                        'w-full justify-start gap-3 h-auto py-3 px-3 transition-all',
                        isCurrent && 'bg-sidebar-accent',
                        isCompleted && !isCurrent && 'text-success',
                        isLocked && 'opacity-50 cursor-not-allowed'
                      )}
                      onClick={() => !isLocked && onLessonSelect(lesson)}
                      disabled={isLocked}
                    >
                      <div className="shrink-0">
                        {isLocked ? (
                          <Lock className="w-4 h-4 text-muted-foreground" />
                        ) : isCompleted ? (
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
        </div>
      </ScrollArea>
    </div>
  );
};
