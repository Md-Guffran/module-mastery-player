import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom'; // Import useParams
import axios from 'axios';
import { CourseSidebar } from '@/components/CourseSidebar';
import { VideoPlayer } from '@/components/VideoPlayer';
import { ResourcesSection } from '@/components/ResourcesSection';
import { ProgressBar } from '@/components/ProgressBar';
import { useCourseProgress } from '@/hooks/useCourseProgress';
import { Module, Lesson } from '@/types/course';
import { Button } from '@/components/ui/button';
import { ChevronRight, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '@/config';

// Helper function to format seconds into MM:SS
const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const formattedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : `${remainingSeconds}`;
  return `${minutes}:${formattedSeconds}`;
};

const CoursePlayer = () => {
  const { courseTitle } = useParams<{ courseTitle: string }>(); // Get courseTitle from URL
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await axios.get(`${API_BASE_URL}api/auth`, {
            headers: { 'x-auth-token': token },
          });
          setUserRole(res.data.role);
        } catch (err) {
          console.error('Failed to fetch user data:', err);
          localStorage.removeItem('token');
          navigate('/signin');
        }
      }
    };

    const fetchCourseData = async () => {
      try {
        const res = await axios.get(`/api/course/${courseTitle}`); // Fetch a single course by title
        setModules(res.data.modules); // Extract modules from the course object
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch course data:', err);
        setError('Failed to load course data.');
        setLoading(false);
      }
    };

    fetchUserData();
    if (courseTitle) {
      fetchCourseData();
    } else {
      setError('Course title not provided.');
      setLoading(false);
    }
  }, [courseTitle, navigate]);

  const initialLesson = modules.length > 0 && modules[0].videos.length > 0
    ? {
        id: modules[0].videos[0]._id,
        title: modules[0].videos[0].title,
        description: '',
        videoUrl: modules[0].videos[0].url,
        duration: 0,
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
        videoUrl: modules[0].videos[0].url,
        duration: 0,
        resources: modules[0].videos[0].resourcesUrl ? [{ title: 'Resources', url: modules[0].videos[0].resourcesUrl }] : [],
        notes: modules[0].videos[0].notesUrl ? [{ title: 'Notes', url: modules[0].videos[0].notesUrl }] : [],
      });
    }
  }, [modules, currentLesson]);

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        if (currentLesson) {
          const playerIframe = document.getElementById(`youtube-player-${currentLesson.id}`) as HTMLIFrameElement | null;
          if (playerIframe && playerIframe.contentWindow && 'YT' in playerIframe.contentWindow) {
            const player = (playerIframe.contentWindow as any).YT.get(playerIframe.id);
            if (player && typeof player.getCurrentTime === 'function') {
              const currentTime = player.getCurrentTime();
              updateProgress(currentLesson.id, { watchedSeconds: currentTime, lessonTitle: currentLesson.title });
            }
          }
        }
        await axios.post('api/auth/signout', {}, {
          headers: { 'x-auth-token': token },
        });
      } catch (err) {
        console.error('Failed to sign out:', err);
      } finally {
        localStorage.removeItem('token');
        setUserRole(null);
        navigate('/signin');
      }
    }
  };

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
      <div className="absolute top-4 right-4 z-10 flex space-x-2">
        {userRole === 'admin' && (
          <Button asChild>
            <Link to="/admin">Go to Dashboard</Link>
          </Button>
        )}
        {localStorage.getItem('token') && (
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
                  {currentLesson.duration > 0 && (
                    <p className="text-muted-foreground text-sm">
                      Duration: {formatDuration(currentLesson.duration)}
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

export default CoursePlayer;
