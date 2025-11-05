import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import { Course, UserProgress } from '../types/course';
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
          const courseResponse = await api.get<Course>(`/api/course/courses/${courseId}`);
          setCourse(courseResponse);

          // Fetch progress separately to avoid blocking button display
          let progressResponse: UserProgress[] = [];
          try {
            // Fetch all user progress and filter for this course's videos
            const allProgress = await api.get<UserProgress[]>('/api/progress');
            // Get all video IDs from this course
            const courseVideoIds = courseResponse.modules
              .flatMap(module => module.videos || [])
              .map(video => String(video._id || video.id));
            // Filter progress to only include videos from this course
            progressResponse = allProgress.filter(p => courseVideoIds.includes(String(p.lessonId)));
            setUserProgress(progressResponse);
          } catch (progressError) {
            console.error('Error fetching progress (non-critical):', progressError);
            // Continue even if progress fetch fails
          }

          // Determine resume link - always set if course has modules and videos
          if (courseResponse.modules && courseResponse.modules.length > 0) {
            const firstModule = courseResponse.modules[0];
            if (firstModule.videos && firstModule.videos.length > 0) {
              const firstVideo = firstModule.videos[0];
              const firstVideoId = firstVideo._id || firstVideo.id || '';
              const firstModuleId = firstModule._id || firstModule.id || '';
              
              let lastWatchedVideoId = firstVideoId;
              let lastWatchedModuleId = firstModuleId;

              // If we have progress, find the last watched video
              if (progressResponse.length > 0) {
                // Find the most recently updated progress item for this course
                const latestProgress = progressResponse.reduce((prev, current) =>
                  new Date(prev.updatedAt) > new Date(current.updatedAt) ? prev : current
                );
                lastWatchedVideoId = latestProgress.lessonId || firstVideoId;

                // Find module ID for the last watched video
                for (const module of courseResponse.modules) {
                  if (module.videos && module.videos.some(video => {
                    const videoId = String(video._id || video.id || '');
                    return videoId === String(lastWatchedVideoId);
                  })) {
                    lastWatchedModuleId = module._id || module.id || firstModuleId;
                    break;
                  }
                }
              }
              
              // Always set resumeLink if we have valid IDs (not empty strings)
              const videoId = lastWatchedVideoId || firstVideoId;
              const moduleId = lastWatchedModuleId || firstModuleId;
              
              if (videoId && moduleId && courseId && String(videoId).trim() && String(moduleId).trim()) {
                setResumeLink(`/course-player/${courseId}/${moduleId}/${videoId}`);
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
      <p className="text-lg mb-4">{course.description}</p>
      <p className="text-sm mb-2">Skills: {course.skills}</p>
      <p className="text-sm mb-2">Tools: {course.tools}</p>
      <p className="text-sm mb-2">Level: {course.level}</p>
      <p className="text-sm mb-4">Duration: {course.duration}</p>
      {(() => {
        // Determine the link to use
        let linkToUse = resumeLink;
        
        // If no resumeLink, create one from first module/video
        if (!linkToUse && course.modules && course.modules.length > 0) {
          const firstModule = course.modules[0];
          if (firstModule.videos && firstModule.videos.length > 0) {
            const firstVideo = firstModule.videos[0];
            const moduleId = firstModule._id || firstModule.id;
            const videoId = firstVideo._id || firstVideo.id;
            if (moduleId && videoId && courseId) {
              linkToUse = `/course-player/${courseId}/${moduleId}/${videoId}`;
            }
          }
        }
        
        // Render button if we have a valid link
        return linkToUse ? (
          <Link to={linkToUse}>
            <Button className="mb-4">{hasStartedCourse ? 'Resume Course' : 'Start Course'}</Button>
          </Link>
        ) : null;
      })()}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Course content</h2>
        <Accordion type="multiple" className="w-full">
          {course.modules.map((module, moduleIndex) => (
            <AccordionItem key={module._id || module.id || moduleIndex} value={`item-${moduleIndex}`} className="mb-2 rounded-lg shadow-sm transition-all duration-300 ease-in-out hover:animate-hover-glow">
              <AccordionTrigger className="text-lg font-semibold p-4">
                {module.title}
              </AccordionTrigger>
              <AccordionContent>
                {module.videos.map((video, videoIndex) => (
                  <div key={video._id || video.id || videoIndex} className="flex items-center justify-between py-3 pl-6 pr-4 border-b last:border-b-0 hover:bg-muted/50 transition-colors duration-200 ease-in-out rounded-b-lg">
                    <div className="flex items-center">
                      <PlayCircle className="h-5 w-5 mr-3 text-primary" />
                      <Link to={`/course-player/${courseId}/${module._id || module.id}/${video._id || video.id}`} className="hover:underline">
                        <span>{video.title}</span>
                      </Link>
                    </div>
                    <span className="text-sm text-gray-600">
                      {formatDurationMinutes(video.duration || 0)}
                    </span>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      </div>
    </>
  );
};

export default CourseDescription;
