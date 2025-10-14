import { useState, useEffect } from 'react';
import axios from 'axios';
import { CourseSidebar } from '@/components/CourseSidebar';
import { VideoPlayer } from '@/components/VideoPlayer'; // Re-added VideoPlayer
import { ResourcesSection } from '@/components/ResourcesSection';
import { ProgressBar } from '@/components/ProgressBar';
import { useCourseProgress } from '@/hooks/useCourseProgress';
// import { courseModules } from '@/data/courseData'; // No longer needed
import { Module, Lesson } from '@/types/course'; // Import Module type
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Index = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const res = await axios.get('/api/course');
        setModules(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch modules:', err);
        setError('Failed to load course modules.');
        setLoading(false);
      }
    };
    fetchModules();
  }, []);

  const initialLesson = modules.length > 0 && modules[0].videos.length > 0
    ? {
        id: modules[0].videos[0]._id, // Assuming _id is available from MongoDB
        title: modules[0].videos[0].title,
        description: '', // Assuming description is not directly available on video, or needs to be fetched
        videoUrl: modules[0].videos[0].url, // Reverted to dynamic URL
        duration: '0:00', // Placeholder, needs to be fetched or calculated
        resources: modules[0].videos[0].resourcesUrl ? [{ title: 'Resources', url: modules[0].videos[0].resourcesUrl }] : [],
        notes: modules[0].videos[0].notesUrl ? [{ title: 'Notes', url: modules[0].videos[0].notesUrl }] : [],
      }
    : null;

  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(initialLesson);
  const { progress, updateProgress, getProgress, getTotalProgress } = useCourseProgress();

  useEffect(() => {
    if (modules.length > 0 && modules[0].videos.length > 0 && !currentLesson) {
      setCurrentLesson({
        id: modules[0].videos[0]._id,
        title: modules[0].videos[0].title,
        description: '',
        videoUrl: modules[0].videos[0].url, // Reverted to dynamic URL
        duration: '0:00',
        resources: modules[0].videos[0].resourcesUrl ? [{ title: 'Resources', url: modules[0].videos[0].resourcesUrl }] : [],
        notes: modules[0].videos[0].notesUrl ? [{ title: 'Notes', url: modules[0].videos[0].notesUrl }] : [],
      });
    }
  }, [modules, currentLesson]);

  const allLessons = modules.flatMap(m => m.videos.map(video => ({
    id: video._id,
    title: video.title,
    description: '', // Placeholder
    videoUrl: video.url, // Reverted to dynamic URL
    duration: '0:00', // Placeholder
    resources: video.resourcesUrl ? [{ title: 'Resources', url: video.resourcesUrl }] : [],
    notes: video.notesUrl ? [{ title: 'Notes', url: video.notesUrl }] : [],
  })));

  const currentLessonIndex = currentLesson ? allLessons.findIndex(l => l.id === currentLesson.id) : -1;
  const nextLesson = currentLessonIndex !== -1 ? allLessons[currentLessonIndex + 1] : null;
  const isNextLessonUnlocked = !nextLesson || (currentLesson && getProgress(currentLesson.id).completed);

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

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading modules...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  }

  if (!currentLesson) {
    return <div className="flex justify-center items-center h-screen">No lessons available.</div>;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <CourseSidebar
        modules={modules.map(m => ({
          ...m,
          lessons: m.videos.map(video => ({
            id: video._id,
            title: video.title,
            description: '',
            videoUrl: video.url,
            duration: '0:00',
            resources: video.resourcesUrl ? [{ title: 'Resources', url: video.resourcesUrl }] : [],
            notes: video.notesUrl ? [{ title: 'Notes', url: video.notesUrl }] : [],
          }))
        }))}
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
