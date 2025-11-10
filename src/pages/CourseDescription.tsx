import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import { Course, UserProgress, Week, Day, Module } from '../types/course';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { findVideoDetails } from '../utils/videoUtils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { PlayCircle, FileText } from 'lucide-react';
import { formatDurationMinutes } from '@/utils/duration';
import Header from '../components/Header';

const CourseDescription: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [resumeLink, setResumeLink] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourseAndProgress = async () => {
      if (courseId) {
        try {
          const courseResponse = await api.get<Course>(`/api/courses/${courseId}`);
          setCourse(courseResponse);

          let progressResponse: UserProgress[] = [];
          try {
            const allProgress = await api.get<UserProgress[]>('/api/progress');
            const courseVideoIds = courseResponse.weeks
              ? courseResponse.weeks
                  .flatMap(week => week.days || [])
                  .flatMap(day => day.modules || [])
                  .flatMap(module => module.videos || [])
                  .map(video => String(video._id || video.id))
              : [];
            progressResponse = allProgress.filter(p => courseVideoIds.includes(String(p.lessonId)));
            setUserProgress(progressResponse);
          } catch (progressError) {
            console.error('Error fetching progress (non-critical):', progressError);
          }

          if (courseResponse.weeks && courseResponse.weeks.length > 0) {
            const firstWeek = courseResponse.weeks[0];
            if (firstWeek.days && firstWeek.days.length > 0) {
              const firstDay = firstWeek.days[0];
              if (firstDay.modules && firstDay.modules.length > 0) {
                const firstModule = firstDay.modules[0];
                if (firstModule.videos && firstModule.videos.length > 0) {
                  const firstVideo = firstModule.videos[0];
                  const firstVideoId = firstVideo._id || firstVideo.id || '';
                  const firstModuleId = firstModule._id || firstModule.id || '';

                  let lastWatchedVideoId = firstVideoId;
                  let lastWatchedModuleId = firstModuleId;

                  if (progressResponse.length > 0) {
                    const latestProgress = progressResponse.reduce((prev, current) =>
                      new Date(prev.updatedAt) > new Date(current.updatedAt) ? prev : current
                    );
                    lastWatchedVideoId = latestProgress.lessonId || firstVideoId;

                    // Find module ID for the last watched video within the new structure
                    for (const week of courseResponse.weeks) {
                      for (const day of week.days) {
                        for (const module of day.modules) {
                          if (module.videos && module.videos.some(video => {
                            const videoId = String(video._id || video.id || '');
                            return videoId === String(lastWatchedVideoId);
                          })) {
                            lastWatchedModuleId = module._id || module.id || firstModuleId;
                            break;
                          }
                        }
                        if (lastWatchedModuleId !== firstModuleId) break;
                      }
                      if (lastWatchedModuleId !== firstModuleId) break;
                    }
                  }

                  const videoId = lastWatchedVideoId || firstVideoId;
                  const moduleId = lastWatchedModuleId || firstModuleId;

                  if (videoId && moduleId && courseId && String(videoId).trim() && String(moduleId).trim()) {
                    setResumeLink(`/course-player/${courseId}/${moduleId}/${videoId}`);
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error('Error fetching course:', error);
        }
      }
    };

    fetchCourseAndProgress();
  }, [courseId]);

  if (!course) {
    return (
      <>
        <Header />
        <div className="flex justify-center items-center h-screen">Loading...</div>
      </>
    );
  }

  const hasStartedCourse = userProgress.length > 0;

  return (
    <>
      <Header />
      <div className="container mx-auto p-8 pt-24 bg-background rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
        <img src="/images/genAI.png" alt="Generative AI Development" className="w-full max-h-64 object-contain rounded-lg mb-6 mx-auto" />
        <div className="bg-secondary p-6 rounded-lg mb-6">
          <h2 className="text-2xl font-bold mb-4 text-foreground">Course Concepts</h2>
          <div className="text-xl leading-relaxed space-y-4">
            {course.description.split('•').map((item, index) => (
              item.trim() && (
                index === 0 ? (
                  <p key={index}>{item.trim()}</p>
                ) : (
                  <ul key={index} className="list-disc pl-5 space-y-2">
                    <li>{item.trim()}</li>
                  </ul>
                )
              )
            ))}
          </div>
        </div>
        <div className="bg-secondary p-6 rounded-lg mb-6">
          <h2 className="text-2xl font-bold mb-4 text-foreground">Course Details</h2>
          <div className="text-lg space-y-2">
            <p><strong>Skills:</strong> {course.skills}</p>
            <p><strong>Tools:</strong> {course.tools}</p>
            <p><strong>Level:</strong> {course.level}</p>
            <p><strong>Duration:</strong> {course.duration}</p>
          </div>
        </div>
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Course content</h2>
          <Accordion type="multiple" className="w-full">
            {course.weeks && course.weeks.length > 0 ? (
              course.weeks.map((week, weekIndex) => (
                <AccordionItem key={week.weekNumber || weekIndex} value={`week-${week.weekNumber || weekIndex}`} className="mb-4 rounded-lg shadow-lg bg-gray-50 dark:bg-gray-800">
                  <AccordionTrigger className="text-xl font-bold p-4">
                    Week {week.weekNumber}
                  </AccordionTrigger>
                  <AccordionContent>
                    <Accordion type="multiple" className="w-full pl-4">
                      {week.days && week.days.length > 0 ? (
                        week.days.map((day, dayIndex) => (
                          <AccordionItem key={day.dayNumber || dayIndex} value={`day-${week.weekNumber}-${day.dayNumber || dayIndex}`} className="mb-2 rounded-lg shadow-sm bg-white dark:bg-gray-700">
                            <AccordionTrigger className="text-lg font-semibold p-3">
                              Day {day.dayNumber}
                            </AccordionTrigger>
                            <AccordionContent>
                              {day.modules && day.modules.length > 0 ? (
                                day.modules.map((module, moduleIndex) => (
                                  <Accordion type="single" collapsible className="w-full pl-4" key={module._id || module.id || moduleIndex}>
                                    <AccordionItem value={`module-${module._id || module.id || moduleIndex}`} className="mb-1 rounded-lg shadow-xs bg-gray-100 dark:bg-gray-600">
                                      <AccordionTrigger className="text-md font-medium p-2">
                                        {module.title}
                                      </AccordionTrigger>
                                      <AccordionContent>
                                        {module.videos && module.videos.length > 0 ? (
                                          module.videos.map((video, videoIndex) => (
                                            <div key={video._id || video.id || videoIndex} className="flex items-center justify-between py-2 pl-8 pr-4 border-b last:border-b-0 hover:bg-muted/50 transition-colors duration-200 ease-in-out rounded-b-lg">
                                              <div className="flex items-center">
                                                <PlayCircle className="h-4 w-4 mr-2 text-primary" />
                                                <Link to={`/course-player/${courseId}/${module._id || module.id}/${video._id || video.id}`} className="hover:underline text-sm">
                                                  <span>{video.title}</span>
                                                </Link>
                                              </div>
                                              <span className="text-xs text-gray-500">
                                                {formatDurationMinutes(video.duration || 0)}
                                              </span>
                                            </div>
                                          ))
                                        ) : (
                                          <p className="p-4 text-sm text-muted-foreground">No videos in this module.</p>
                                        )}
                                      </AccordionContent>
                                    </AccordionItem>
                                  </Accordion>
                                ))
                              ) : (
                                <p className="p-4 text-sm text-muted-foreground">No modules for this day.</p>
                              )}
                              {(day.assessment && day.assessment.trim()) && (
                                <div className="flex items-center justify-between py-2 pl-8 pr-4 border-b last:border-b-0 hover:bg-muted/50 transition-colors duration-200 ease-in-out rounded-b-lg">
                                  <div className="flex items-center">
                                    <FileText className="h-4 w-4 mr-2 text-secondary-foreground" />
                                    {day.assessmentLink && day.assessmentLink.trim() ? (
                                      <a href={day.assessmentLink} target="_blank" rel="noopener noreferrer" className="hover:underline text-sm text-blue-500">
                                        <span>Assessment: {day.assessment}</span>
                                      </a>
                                    ) : (
                                      <span className="text-sm">Assessment: {day.assessment}</span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </AccordionContent>
                          </AccordionItem>
                        ))
                      ) : (
                        <p className="p-4 text-sm text-muted-foreground">No days in this week.</p>
                      )}
                    </Accordion>
                  </AccordionContent>
                </AccordionItem>
              ))
            ) : (
              <p className="p-4 text-sm text-muted-foreground">No weeks in this course.</p>
            )}
          </Accordion>
        </div>
      </div>
    </>
  );
};

export default CourseDescription;
