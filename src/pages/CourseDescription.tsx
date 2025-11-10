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
} from '@/components/ui/accordion'; // Re-import Accordion components
import { PlayCircle, FileText } from 'lucide-react';
import { formatDurationMinutes } from '@/utils/duration';
import Header from '../components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Import Card components
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Import Tabs components

const CourseDescription: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [resumeLink, setResumeLink] = useState<string | null>(null);
  const [activeWeek, setActiveWeek] = useState<string>(''); // State to manage active week tab

  useEffect(() => {
    const fetchCourseAndProgress = async () => {
      if (courseId) {
        try {
          const courseResponse = await api.get<Course>(`/api/courses/${courseId}`);
          setCourse(courseResponse);
          // Set the first week as active by default
          if (courseResponse.weeks && courseResponse.weeks.length > 0) {
            setActiveWeek(`week-${courseResponse.weeks[0].weekNumber}`);
          }

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
          <h2 className="text-3xl font-bold mb-6 text-foreground">Course Content</h2>
          {course.weeks && course.weeks.length > 0 ? (
            <Tabs value={activeWeek} onValueChange={setActiveWeek} className="w-full">
              <div className="flex flex-wrap gap-2 mb-4 overflow-x-auto pb-2">
                {course.weeks.map((week) => (
                  <Button
                    key={`week-${week.weekNumber}`}
                    onClick={() => setActiveWeek(`week-${week.weekNumber}`)}
                    variant={activeWeek === `week-${week.weekNumber}` ? 'default' : 'outline'}
                    className="min-w-[120px] py-2 px-4 rounded-lg shadow-md text-sm sm:text-base"
                  >
                    Week {week.weekNumber}
                  </Button>
                ))}
              </div>
              {course.weeks.map((week) => (
                <TabsContent key={`week-${week.weekNumber}`} value={`week-${week.weekNumber}`}>
                  <Card className="rounded-lg shadow-lg bg-card text-card-foreground">
                    <CardHeader className="p-4 border-b border-border">
                      <CardTitle className="text-xl font-bold">Week {week.weekNumber} Content</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      {week.days && week.days.length > 0 ? (
                        <Accordion type="multiple" className="w-full">
                          {week.days.map((day, dayIndex) => (
                            <AccordionItem key={day.dayNumber || dayIndex} value={`day-${week.weekNumber}-${day.dayNumber || dayIndex}`} className="mb-2 rounded-lg shadow-sm bg-white dark:bg-gray-700">
                              <AccordionTrigger className="text-lg font-semibold p-3">
                                Day {day.dayNumber}
                              </AccordionTrigger>
                              <AccordionContent>
                                {day.modules && day.modules.length > 0 ? (
                                  day.modules.map((module, moduleIndex) => (
                                    <div key={module._id || module.id || moduleIndex} className="space-y-1 pl-4">
                                      <h4 className="text-md font-medium text-muted-foreground">{module.title}</h4>
                                      {/* Collect all unique notes from videos in this module */}
                                      {(() => {
                                        const moduleNotes: string[] = [];
                                        module.videos.forEach(video => {
                                          if (video.notesUrl) {
                                            video.notesUrl.forEach(noteUrl => {
                                              // Only include valid, non-empty note URLs
                                              const trimmed = noteUrl?.trim() || '';
                                              if (trimmed.length > 0 && 
                                                  !trimmed.toLowerCase().includes('placeholder') &&
                                                  (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) &&
                                                  !moduleNotes.includes(trimmed)) {
                                                moduleNotes.push(trimmed);
                                              }
                                            });
                                          }
                                        });

                                        if (moduleNotes.length > 0) {
                                          return (
                                            <div className="pl-4 pb-2">
                                              <h5 className="text-sm font-semibold text-foreground mb-1">Notes:</h5>
                                              <ul className="list-disc list-inside space-y-1">
                                                {moduleNotes.map((noteUrl, noteIndex) => {
                                                  // Extract filename from URL, or use a meaningful default
                                                  let noteTitle = noteUrl.substring(noteUrl.lastIndexOf('/') + 1);
                                                  // If no filename found or it's empty, use the domain or a generic name
                                                  if (!noteTitle || noteTitle.trim() === '' || noteTitle === noteUrl) {
                                                    try {
                                                      const urlObj = new URL(noteUrl.startsWith('/') ? `http://localhost${noteUrl}` : noteUrl);
                                                      noteTitle = urlObj.hostname || 'Note';
                                                    } catch {
                                                      noteTitle = 'Note';
                                                    }
                                                  }
                                                  // Remove query parameters and fragments from title
                                                  noteTitle = noteTitle.split('?')[0].split('#')[0];
                                                  
                                                  return (
                                                    <li key={noteIndex} className="text-sm">
                                                      <a href={noteUrl} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-500">
                                                        {noteTitle}
                                                      </a>
                                                    </li>
                                                  );
                                                })}
                                              </ul>
                                            </div>
                                          );
                                        }
                                        return null;
                                      })()}

                                      {module.videos && module.videos.length > 0 ? (
                                        module.videos.map((video, videoIndex) => (
                                          <div key={video._id || video.id || videoIndex} className="flex items-center justify-between py-2 pl-4 pr-2 border-b last:border-b-0 hover:bg-muted/50 transition-colors duration-200 ease-in-out rounded-b-lg">
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
                                        <p className="p-2 text-sm text-muted-foreground">No videos in this module.</p>
                                      )}

                                      {/* Display module-level assessments */}
                                      {(() => {
                                        const moduleAssessments = module.assessments || [];
                                        const validModuleAssessments = moduleAssessments.filter(assessment => {
                                          const title = assessment.title?.trim() || '';
                                          const link = assessment.link?.trim() || '';
                                          return title && 
                                                 title.toLowerCase() !== 'sample assessment' &&
                                                 title.toLowerCase() !== 'placeholder' &&
                                                 title.length > 0;
                                        });

                                        if (validModuleAssessments.length > 0) {
                                          return (
                                            <div className="pl-4 pb-2 border-t border-border mt-2 pt-2">
                                              <h5 className="text-sm font-semibold text-foreground mb-1">Assessments:</h5>
                                              <ul className="list-disc list-inside space-y-1">
                                                {validModuleAssessments.map((assessment, assessmentIndex) => (
                                                  <li key={assessmentIndex} className="text-sm">
                                                    {assessment.link ? (
                                                      <a href={assessment.link} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-500">
                                                        {assessment.title}
                                                      </a>
                                                    ) : (
                                                      <span>{assessment.title}</span>
                                                    )}
                                                  </li>
                                                ))}
                                              </ul>
                                            </div>
                                          );
                                        }
                                        return null;
                                      })()}
                                    </div>
                                  ))
                                ) : (
                                  <p className="p-2 text-sm text-muted-foreground">No modules for this day.</p>
                                )}
                                {(() => {
                                  // Also display day-level assessments if they exist (for backward compatibility)
                                  const assessmentTitle = day.assessment?.trim() || '';
                                  const assessmentLink = day.assessmentLink?.trim() || '';
                                  
                                  // Only show if assessment exists, is not empty, and is not a placeholder
                                  const isValidAssessment = assessmentTitle && 
                                                           assessmentTitle.toLowerCase() !== 'sample assessment' &&
                                                           assessmentTitle.toLowerCase() !== 'placeholder' &&
                                                           assessmentTitle.length > 0;
                                  
                                  if (isValidAssessment) {
                                    return (
                                      <div className="pl-4 pb-2 border-t border-border mt-2 pt-2">
                                        <h5 className="text-sm font-semibold text-foreground mb-1">Assessments:</h5>
                                        <ul className="list-disc list-inside space-y-1">
                                          <li className="text-sm">
                                            {assessmentLink ? (
                                              <a href={assessmentLink} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-500">
                                                {assessmentTitle}
                                              </a>
                                            ) : (
                                              <span>{assessmentTitle}</span>
                                            )}
                                          </li>
                                        </ul>
                                      </div>
                                    );
                                  }
                                  return null;
                                })()}
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      ) : (
                        <p className="p-4 text-sm text-muted-foreground">No days in this week.</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <p className="p-4 text-sm text-muted-foreground">No weeks in this course.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default CourseDescription;
