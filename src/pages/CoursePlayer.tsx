import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { CourseSidebar } from '@/components/CourseSidebar';
import { VideoPlayer } from '@/components/VideoPlayer';
import { ResourcesSection } from '@/components/ResourcesSection';
import { ProgressBar } from '@/components/ProgressBar';
import { useCourseProgress } from '@/hooks/useCourseProgress';
import { Course, Module, Lesson, Week, Day, UserAssessmentProgress } from '@/types/course'; // Import Course, Week, Day, UserAssessmentProgress
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'; // Import Sheet components
import { ChevronRight, CheckCircle, XCircle, Clock, Send, Menu } from 'lucide-react'; // Import Menu icon
import { motion } from 'framer-motion';
import { API_BASE_URL } from '@/config';
import Header from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile'; // Import useIsMobile hook

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
  const [course, setCourse] = useState<Course | null>(null); // Store the entire course object
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'lessons' | 'assessments'>('lessons');
  const [userAssessments, setUserAssessments] = useState<UserAssessmentProgress[]>([]);
  const [submittedLink, setSubmittedLink] = useState<string>('');
  const { toast: shadcnToast } = useToast();
  const { user } = useAuth();
  const isMobile = useIsMobile(); // Use the hook
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for mobile sidebar

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const res = await axios.get<Course>(`${API_BASE_URL}/api/courses/${courseId}`);
        setCourse(res.data); // Set the entire course data
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch course data:', err);
        setError('Failed to load course data.');
        setLoading(false);
      }
    };

    const fetchUserAssessments = async () => {
      if (!user || !courseId) return;
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get<UserAssessmentProgress[]>(`${API_BASE_URL}/api/assessments/user/${courseId}`, {
          headers: {
            'x-auth-token': token,
          },
        });
        setUserAssessments(res.data);
      } catch (err) {
        console.error('Failed to fetch user assessment progress:', err);
        toast.error('Failed to load your assessment progress.');
      }
    };

    if (courseId) {
      fetchCourseData();
      fetchUserAssessments();
    } else {
      setError('Course ID not provided.');
      setLoading(false);
    }
  }, [courseId, user]);

  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const { progress, updateProgress, getProgress, getTotalProgress } = useCourseProgress();

  useEffect(() => {
    if (course && course.weeks.length > 0) {
      let selectedVideo = null;
      let foundModule: Module | undefined;

      // Try to find the specific video if moduleId and videoId are provided
      if (moduleId && videoId) {
        for (const week of course.weeks) {
          for (const day of week.days) {
            foundModule = day.modules.find(m => (m._id || m.id) === moduleId);
            if (foundModule) {
              selectedVideo = foundModule.videos.find(v => (v._id || v.id) === videoId);
              if (selectedVideo) break;
            }
          }
          if (selectedVideo) break;
        }
      }

      // If no specific video found or provided, default to the first video of the first module of the first day of the first week
      if (!selectedVideo && course.weeks[0]?.days[0]?.modules[0]?.videos[0]) {
        selectedVideo = course.weeks[0].days[0].modules[0].videos[0];
      }

      if (selectedVideo && !currentLesson) {
        setCurrentLesson({
          id: selectedVideo._id,
          title: selectedVideo.title,
          description: '',
          videoUrl: selectedVideo.url,
          duration: selectedVideo.duration || 0,
          notes: selectedVideo.notesUrl || [], // notes is now string[]
        });
      }
    }
  }, [course, currentLesson, moduleId, videoId]);


  const allLessons = course
    ? course.weeks.flatMap(week =>
        week.days.flatMap(day =>
          day.modules.flatMap(module =>
            module.videos.map(video => ({
              id: video._id,
              title: video.title,
              description: '',
              videoUrl: video.url,
              duration: video.duration || 0,
              notes: video.notesUrl || [], // notes is now string[]
            }))
          )
        )
      )
    : [];

  const allAssessments = course
    ? course.weeks.flatMap(week =>
        week.days.flatMap(day => {
          const assessments: Array<{
            _id?: string;
            dayId?: string;
            dayNumber: number;
            weekNumber: number;
            assessment: string;
            assessmentLink: string;
            moduleId?: string;
            moduleTitle?: string;
          }> = [];

          // Collect module-level assessments
          day.modules.forEach(module => {
            if (module.assessments && module.assessments.length > 0) {
              module.assessments.forEach(assessment => {
                const title = assessment.title?.trim() || '';
                const link = assessment.link?.trim() || '';
                // Filter out placeholder assessments
                if (title && 
                    title.toLowerCase() !== 'sample assessment' &&
                    title.toLowerCase() !== 'placeholder' &&
                    title.length > 0) {
                  assessments.push({
                    _id: assessment._id || module._id,
                    dayId: day._id,
                    dayNumber: day.dayNumber,
                    weekNumber: week.weekNumber,
                    assessment: title,
                    assessmentLink: link,
                    moduleId: module._id || module.id,
                    moduleTitle: module.title,
                  });
                }
              });
            }
          });

          // Also include day-level assessments (for backward compatibility)
          const dayAssessmentTitle = day.assessment?.trim() || '';
          const dayAssessmentLink = day.assessmentLink?.trim() || '';
          if (dayAssessmentTitle && 
              dayAssessmentTitle.toLowerCase() !== 'sample assessment' &&
              dayAssessmentTitle.toLowerCase() !== 'placeholder' &&
              dayAssessmentTitle.length > 0) {
            assessments.push({
              _id: day._id,
              dayId: day._id,
              dayNumber: day.dayNumber,
              weekNumber: week.weekNumber,
              assessment: dayAssessmentTitle,
              assessmentLink: dayAssessmentLink,
            });
          }

          return assessments;
        })
      )
    : [];

  const currentLessonIndex = currentLesson ? allLessons.findIndex(l => l.id === currentLesson.id) : -1;
  const nextLesson = currentLessonIndex !== -1 ? allLessons[currentLessonIndex + 1] : null;

  const totalLessons = allLessons.length;
  const completedLessons = Object.values(progress).filter(p => p.completed).length;
  const totalProgressPercentage = getTotalProgress(totalLessons);

  const handleLessonSelect = (lesson: Lesson) => {
    setCurrentLesson(lesson);
  };

  const handleNextLesson = () => {
    if (nextLesson) {
      setCurrentLesson(nextLesson);
    }
  };

  const getAssessmentStatus = (dayId: string) => {
    return userAssessments.find(ua => ua.dayId === dayId);
  };

  const handleSubmitAssessment = async (dayId: string, assessmentTitle: string, assessmentLink: string) => {
    if (!submittedLink) {
      shadcnToast({
        title: 'Submission Error',
        description: 'Please provide a link for your assessment.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE_URL}/api/assessments/submit`, {
        courseId,
        dayId,
        submittedLink,
        assessmentTitle,
        assessmentLink,
      }, {
        headers: {
          'x-auth-token': token,
        },
      });

      setUserAssessments(prev => {
        const existingIndex = prev.findIndex(ua => ua.dayId === dayId);
        if (existingIndex > -1) {
          const newArr = [...prev];
          newArr[existingIndex] = res.data;
          return newArr;
        }
        return [...prev, res.data];
      });
      setSubmittedLink('');
      toast.success('Assessment submitted successfully!');
    } catch (err) {
      console.error('Failed to submit assessment:', err);
      toast.error('Failed to submit assessment.');
    }
  };

  const getAssessmentStatusDisplay = (status: UserAssessmentProgress['status']) => {
    switch (status) {
      case 'pending':
        return <span className="flex items-center text-yellow-500"><Clock className="w-4 h-4 mr-1" /> Pending</span>;
      case 'submitted':
        return <span className="flex items-center text-blue-500"><Send className="w-4 h-4 mr-1" /> Submitted</span>;
      case 'waiting for review':
        return <span className="flex items-center text-orange-500"><Clock className="w-4 h-4 mr-1" /> Waiting for Review</span>;
      case 'completed':
        return <span className="flex items-center text-green-500"><CheckCircle className="w-4 h-4 mr-1" /> Completed</span>;
      case 'failed':
        return <span className="flex items-center text-red-500"><XCircle className="w-4 h-4 mr-1" /> Failed</span>;
      default:
        return <span className="flex items-center text-gray-500">Unknown</span>;
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex justify-center items-center h-screen">Loading course...</div>
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

  if (!course || !currentLesson) {
    return (
      <>
        <Header />
        <div className="flex justify-center items-center h-screen">No course or lessons available.</div>
      </>
    );
  }

  return (
    <>
      <Header onMenuClick={() => setIsSidebarOpen(true)} isMobile={isMobile} /> {/* Pass onMenuClick and isMobile */}
      <div className="flex h-screen bg-background overflow-hidden pt-16">
        {isMobile ? (
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetContent side="left" className="p-0 w-80">
              <CourseSidebar
                course={course}
                currentLessonId={currentLesson.id}
                progress={progress}
                onLessonSelect={(lesson) => {
                  handleLessonSelect(lesson);
                  setIsSidebarOpen(false); // Close sidebar on lesson select
                }}
              />
            </SheetContent>
          </Sheet>
        ) : (
          <CourseSidebar
            course={course}
            currentLessonId={currentLesson.id}
            progress={progress}
            onLessonSelect={handleLessonSelect}
          />
        )}

        <div className="flex-1 flex flex-col overflow-hidden">
          <ProgressBar
            completedLessons={completedLessons}
            totalLessons={totalLessons}
            percentage={totalProgressPercentage}
          />

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6 bg-card p-6 rounded-lg shadow-lg">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'lessons' | 'assessments')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="lessons">Lessons</TabsTrigger>
                <TabsTrigger value="assessments">Assessments</TabsTrigger>
              </TabsList>
              <TabsContent value="lessons">
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
                          className="gap-2 rounded-lg shadow-md transition-all duration-300 ease-in-out hover:animate-hover-glow"
                          size="lg"
                        >
                          Next Lesson: {nextLesson.title}
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    )}

                    <ResourcesSection
                      notes={currentLesson.notes} // Pass notes directly as string[]
                      lessonTitle={currentLesson.title}
                    />
                  </div>
                </motion.div>
              </TabsContent>
              <TabsContent value="assessments">
                <h2 className="text-2xl font-bold text-foreground mb-4">Assessments</h2>
                {allAssessments.length > 0 ? (
                  <div className="space-y-4">
                    {allAssessments.map((assessment, index) => (
                      <div key={index} className="bg-secondary p-4 rounded-lg shadow-sm">
                        <h3 className="text-xl font-semibold text-foreground">
                          Week {assessment.weekNumber}, Day {assessment.dayNumber}
                          {assessment.moduleTitle && ` - ${assessment.moduleTitle}`}: {assessment.assessment}
                        </h3>
                        {assessment.assessmentLink && (
                          <p className="text-muted-foreground mt-2">
                            <a href={assessment.assessmentLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                              View Assessment
                            </a>
                          </p>
                        )}
                        {user && (
                          <div className="mt-4">
                            {(() => {
                              const userAssessment = getAssessmentStatus(assessment._id);
                              if (userAssessment) {
                                return (
                                  <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">
                                      Status: {getAssessmentStatusDisplay(userAssessment.status)}
                                    </p>
                                    {userAssessment.submittedLink && (
                                      <p className="text-sm text-muted-foreground">
                                        Your Submission: <a href={userAssessment.submittedLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{userAssessment.submittedLink}</a>
                                      </p>
                                    )}
                                    {userAssessment.feedback && (
                                      <p className="text-sm text-muted-foreground">
                                        Feedback: {userAssessment.feedback}
                                      </p>
                                    )}
                                    {(userAssessment.status === 'pending' || userAssessment.status === 'failed') && (
                                      <div className="flex items-center space-x-2 mt-2">
                                        <Input
                                          type="url"
                                          placeholder="Submit your assessment link"
                                          value={submittedLink}
                                          onChange={(e) => setSubmittedLink(e.target.value)}
                                          className="flex-1"
                                        />
                                        <Button onClick={() => handleSubmitAssessment(assessment._id!, assessment.assessment!, assessment.assessmentLink!)}>
                                          Resubmit
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                );
                              } else {
                                return (
                                  <div className="flex items-center space-x-2 mt-2">
                                    <Input
                                      type="url"
                                      placeholder="Submit your assessment link"
                                      value={submittedLink}
                                      onChange={(e) => setSubmittedLink(e.target.value)}
                                      className="flex-1"
                                    />
                                    <Button onClick={() => handleSubmitAssessment(assessment._id!, assessment.assessment!, assessment.assessmentLink!)}>
                                      Submit
                                    </Button>
                                  </div>
                                );
                              }
                            })()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No assessments available for this course.</p>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default CoursePlayer;
