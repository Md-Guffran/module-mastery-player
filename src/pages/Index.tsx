import { useState } from 'react';
import { CourseSidebar } from '@/components/CourseSidebar';
import { VideoPlayer } from '@/components/VideoPlayer';
import { ResourcesSection } from '@/components/ResourcesSection';
import { ProgressBar } from '@/components/ProgressBar';
import { useCourseProgress } from '@/hooks/useCourseProgress';
import { courseModules } from '@/data/courseData';
import { Lesson } from '@/types/course';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Index = () => {
  const [currentLesson, setCurrentLesson] = useState<Lesson>(courseModules[0].lessons[0]);
  const { progress, updateProgress, getProgress, getTotalProgress } = useCourseProgress();

  const allLessons = courseModules.flatMap(m => m.lessons);
  const currentLessonIndex = allLessons.findIndex(l => l.id === currentLesson.id);
  const nextLesson = allLessons[currentLessonIndex + 1];
  const isNextLessonUnlocked = !nextLesson || getProgress(currentLesson.id).completed;

  const totalLessons = allLessons.length;
  const completedLessons = Object.values(progress).filter(p => p.completed).length;
  const totalProgressPercentage = getTotalProgress(totalLessons);

  const handleLessonSelect = (lesson: Lesson) => {
    setCurrentLesson(lesson);
  };

  const handleNextLesson = () => {
    if (nextLesson && isNextLessonUnlocked) {
      setCurrentLesson(nextLesson);
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <CourseSidebar
        modules={courseModules}
        currentLessonId={currentLesson.id}
        progress={progress}
        onLessonSelect={handleLessonSelect}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <ProgressBar
          completedLessons={completedLessons}
          totalLessons={totalLessons}
          percentage={totalProgressPercentage}
        />

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-6 space-y-6">
            <motion.div
              key={currentLesson.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    {currentLesson.title}
                  </h1>
                  {currentLesson.description && (
                    <p className="text-muted-foreground mt-2">
                      {currentLesson.description}
                    </p>
                  )}
                </div>

                <VideoPlayer
                  url={currentLesson.videoUrl}
                  lessonId={currentLesson.id}
                  progress={getProgress(currentLesson.id)}
                  onProgress={(update) => updateProgress(currentLesson.id, update)}
                />

                {nextLesson && (
                  <div className="flex justify-end">
                    <Button
                      onClick={handleNextLesson}
                      disabled={!isNextLessonUnlocked}
                      className="gap-2"
                      size="lg"
                    >
                      {isNextLessonUnlocked ? (
                        <>
                          Next Lesson: {nextLesson.title}
                          <ChevronRight className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          🔒 Complete current lesson to unlock
                        </>
                      )}
                    </Button>
                  </div>
                )}

                <ResourcesSection
                  resources={currentLesson.resources}
                  notes={currentLesson.notes}
                  lessonTitle={currentLesson.title}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
