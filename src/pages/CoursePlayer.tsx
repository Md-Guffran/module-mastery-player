import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../apiClient';
import { UserContext } from '../context/UserContext';
import { CourseSidebar } from '@/components/CourseSidebar';
import { VideoPlayer } from '@/components/VideoPlayer';
import { ResourcesSection } from '@/components/ResourcesSection';
import { ProgressBar } from '@/components/ProgressBar';
import { useCourseProgress } from '@/hooks/useCourseProgress';
import { Module, Lesson } from '@/types/course';
import { Button } from '@/components/ui/button';
import { ChevronRight, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

declare global {
  interface Window {
    YT: {
      Player: new (element: string | HTMLElement, options: YT.PlayerOptions) => YT.Player;
      PlayerState: typeof YT.PlayerState;
      get: (id: string) => YT.Player;
    };
  }
}

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

const CoursePlayer = () => {
  const { courseTitle } = useParams<{ courseTitle: string }>();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const { user, logout } = useContext(UserContext);
  const { progress, updateProgress, getProgress, getTotalProgress } = useCourseProgress();
  const navigate = useNavigate();

  // Fetch course data
  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseTitle) {
        setError('Course title not provided.');
        setLoading(false);
        return;
      }

      try {
        const res = await api.get(`/api/course/${courseTitle}`);
        setModules(res.data.modules);
        setLoading(false);

        // Set initial lesson
        if (res.data.modules.length > 0 && res.data.modules[0].videos.length > 0) {
          const firstVideo = res.data.modules[0].videos[0];
          setCurrentLesson({
            id: firstVideo._id,
            title: firstVideo.title,
            description: '',
            videoUrl: firstVideo.url,
            duration: 0,
            resources: firstVideo.resourcesUrl ? [{ title: 'Resources', url: firstVideo.resourcesUrl }] : [],
            notes: firstVideo.notesUrl ? [{ title: 'Notes', url: firstVideo.notesUrl }] : [],
          });
        }
      } catch (err) {
        console.error('Failed to fetch course data:', err);
        setError('Failed to load course data.');
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseTitle]);

  const handleLogout = async () => {
    if (currentLesson) {
      const playerIframe = document.getElementById(`youtube-player-${currentLesson.id}`) as HTMLIFrameElement | null;
      if (playerIframe?.contentWindow?.YT) {
        const player = playerIframe.contentWindow.YT.get(playerIframe.id);
        if (player && typeof player.getCurrentTime === 'function') {
          const currentTime = player.getCurrentTime();
          updateProgress(currentLesson.id, { watchedSeconds: currentTime, lessonTitle: currentLesson.title });
        }
      }
    }

    await logout();
    navigate('/signin');
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading modules...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  if (!currentLesson) return <div className="flex justify-center items-center h-screen">No lessons available.</div>;

  // Flatten lessons for progress & navigation
  const allLessons = modules.flatMap(m => m.videos.map(video => ({
    id: video._id,
    title: video.title,
    description: '',
    videoUrl: video.url,
    duration: 0,
    resources: video.resourcesUrl ? [{ title: 'Resources', url: video.resourcesUrl }] : [],
    notes: video.notesUrl ? [{ title: 'Notes', url: video.notesUrl }] : [],
  })));

  const currentLessonIndex = currentLesson ? allLessons.findIndex(l => l.id === currentLesson.id) : -1;
  const nextLesson = currentLessonIndex !== -1 ? allLessons[currentLessonIndex + 1] : null;
  const isNextLessonUnlocked = !nextLesson || getProgress(currentLesson.id).completed;
  const totalLessons = allLessons.length;
  const completedLessons = Object.values(progress).filter(p => p.completed).length;
  const totalProgressPercentage = getTotalProgress(totalLessons);

  const handleLessonSelect = (lesson: Lesson) => setCurrentLesson(lesson);
  const handleNextLesson = () => { if (nextLesson && isNextLessonUnlocked) setCurrentLesson(nextLesson); };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <div className="absolute top-4 right-4 z-10 flex space-x-2">
        {user?.role === 'admin' && (
          <Button asChild>
            <Link to="/admin">Go to Dashboard</Link>
          </Button>
        )}
        {user && (
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        )}
      </div>

      <CourseSidebar
        modules={modules.map(m => ({
          ...m,
          lessons: m.videos.map(video => ({
            id: video._id,
            title: video.title,
            description: '',
            videoUrl: video.url,
            duration: 0,
            resources: video.resourcesUrl ? [{ title: 'Resources', url: video.resourcesUrl }] : [],
            notes: video.notesUrl ? [{ title: 'Notes', url: video.notesUrl }] : [],
          }))
        }))}
        currentLessonId={currentLesson.id}
        progress={progress}
        onLessonSelect={handleLessonSelect}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <ProgressBar completedLessons={completedLessons} totalLessons={totalLessons} percentage={totalProgressPercentage} />

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-6 space-y-6">
            <motion.div
              key={currentLesson.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-3xl font-bold text-foreground">{currentLesson.title}</h1>
              <VideoPlayer
                url={currentLesson.videoUrl}
                lessonId={currentLesson.id}
                lessonTitle={currentLesson.title}
                progress={getProgress(currentLesson.id)}
                onProgress={(update) => {
                  if (update.duration !== undefined) {
                    setCurrentLesson(prev => prev ? { ...prev, duration: update.duration! } : null);
                  }
                  updateProgress(currentLesson.id, { ...update, lessonTitle: currentLesson.title });
                }}
              />
              {nextLesson && (
                <div className="flex justify-end">
                  <Button onClick={handleNextLesson} disabled={!isNextLessonUnlocked} className="gap-2" size="lg">
                    {isNextLessonUnlocked ? <>Next Lesson: {nextLesson.title}<ChevronRight className="w-4 h-4" /></> : <>🔒 Complete current lesson to unlock</>}
                  </Button>
                </div>
              )}
              <ResourcesSection resources={currentLesson.resources} notes={currentLesson.notes} lessonTitle={currentLesson.title} />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;
