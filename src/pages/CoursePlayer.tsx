import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { CourseSidebar } from '@/components/CourseSidebar';
import { VideoPlayer } from '@/components/VideoPlayer';
import { ResourcesSection } from '@/components/ResourcesSection';
import { ProgressBar } from '@/components/ProgressBar';
import { useCourseProgress } from '@/hooks/useCourseProgress';
import { Module, Lesson } from '@/types/course';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '@/config';
import Header from '@/components/Header';

interface YouTubePlayer {
  getCurrentTime: () => number;
  // Add other methods if needed
}

interface YouTubePlayerWindow extends Window {
  YT: {
    get: (id: string) => YouTubePlayer | undefined;
    // Add other YT properties if needed
  };
}

import { formatDurationMMSS } from '@/utils/duration';

const CoursePlayer = () => {
  const { courseId, moduleId, videoId } = useParams<{ courseId: string; moduleId?: string; videoId?: string }>();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/course/courses/${courseId}`);
        setModules(res.data.modules);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch course data:', err);
        setError('Failed to load course data.');
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseData();
    } else {
      setError('Course ID not provided.');
      setLoading(false);
    }
  }, [courseId]);

  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const { progress, updateProgress, getProgress, getTotalProgress } = useCourseProgress();

  useEffect(() => {
    if (modules.length > 0) {
      let selectedVideo = null;
      if (moduleId && videoId) {
        // Find the specific video if moduleId and videoId are provided
        const targetModule = modules.find(m => (m._id || m.id) === moduleId);
        if (targetModule) {
          selectedVideo = targetModule.videos.find(v => (v._id || v.id) === videoId);
        }
      }

      // If no specific video found or provided, default to the first video of the first module
      if (!selectedVideo && modules[0].videos.length > 0) {
        selectedVideo = modules[0].videos[0];
      }

      if (selectedVideo && !currentLesson) {
        setCurrentLesson({
          id: selectedVideo._id,
          title: selectedVideo.title,
          description: '', // Description is not in video schema, can be added if needed
          videoUrl: selectedVideo.url,
          duration: selectedVideo.duration || 0, // Use actual duration if available
          resources: selectedVideo.resourcesUrl ? [{ title: 'Resources', url: selectedVideo.resourcesUrl }] : [],
          notes: selectedVideo.notesUrl ? [{ title: 'Notes', url: selectedVideo.notesUrl }] : [],
        });
      }
    }
  }, [modules, currentLesson, moduleId, videoId]);


  const allLessons = modules.flatMap(m => m.videos.map(video => ({
    id: video._id,
    title: video.title,
    description: '',
    videoUrl: video.url,
    duration: video.duration || 0,
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
    return (
      <>
        <Header />
        <div className="flex justify-center items-center h-screen">Loading modules...</div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="flex justify-center items-center h-screen text-red-500">{error}</div>
      </>
    );
  }

  if (!currentLesson) {
    return (
      <>
        <Header />
        <div className="flex justify-center items-center h-screen">No lessons available.</div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="flex h-screen bg-background overflow-hidden pt-16">
      <CourseSidebar
        modules={modules.map(m => ({
          ...m,
          lessons: m.videos.map(video => ({
            id: video._id,
            title: video.title,
            description: '',
            videoUrl: video.url,
            duration: video.duration || 0,
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

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6 bg-card p-6 rounded-lg shadow-lg">
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
                  {currentLesson.duration > 0 && (
                    <p className="text-muted-foreground text-sm">
                      Duration: {formatDurationMMSS(currentLesson.duration)}
                    </p>
                  )}
                </div>

                <VideoPlayer
                  url={currentLesson.videoUrl}
                  lessonId={currentLesson.id}
                  lessonTitle={currentLesson.title}
                  progress={getProgress(currentLesson.id)}
                  onProgress={(update) => {
                    if (update.duration !== undefined) {
                      setCurrentLesson(prevLesson => prevLesson ? { ...prevLesson, duration: update.duration! } : null);
                    }
                    updateProgress(currentLesson.id, { ...update, lessonTitle: currentLesson.title });
                  }}
                />

                {nextLesson && (
                  <div className="flex justify-end">
                    <Button
                      onClick={handleNextLesson}
                      disabled={!isNextLessonUnlocked}
                      className="gap-2 rounded-lg shadow-md transition-all duration-300 ease-in-out hover:animate-hover-glow"
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
    </>
  );
};

export default CoursePlayer;
