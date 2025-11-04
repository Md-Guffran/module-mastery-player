import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import { Course } from '../types/course';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { PlayCircle, FileText } from 'lucide-react';
import { formatDurationMinutes } from '@/utils/duration';

const CourseDescription: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      if (courseId) {
        try {
          const response = await api.get<Course>(`/api/course/courses/${courseId}`);
          setCourse(response);
        } catch (error) {
          console.error('Error fetching course:', error);
        }
      }
    };

    fetchCourse();
  }, [courseId]);

  if (!course) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
      <p className="text-lg mb-4">{course.description}</p>
      <p className="text-sm mb-2">Skills: {course.skills}</p>
      <p className="text-sm mb-2">Tools: {course.tools}</p>
      <p className="text-sm mb-2">Level: {course.level}</p>
      <p className="text-sm mb-4">Duration: {course.duration}</p>
      {course.modules.length > 0 && course.modules[0].videos.length > 0 && (
        <Link to={`/course-player/${courseId}/${course.modules[0]._id || course.modules[0].id}/${course.modules[0].videos[0]._id || course.modules[0].videos[0].id}`}>
          <Button>Start Course</Button>
        </Link>
      )}

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Course content</h2>
        <Accordion type="multiple" className="w-full">
          {course.modules.map((module, moduleIndex) => (
            <AccordionItem key={module._id || module.id || moduleIndex} value={`item-${moduleIndex}`}>
              <AccordionTrigger className="text-lg font-semibold">
                {module.title}
              </AccordionTrigger>
              <AccordionContent>
                {module.videos.map((video, videoIndex) => (
                  <div key={video._id || video.id || videoIndex} className="flex items-center justify-between py-2 pl-4 border-b last:border-b-0">
                    <div className="flex items-center">
                      <PlayCircle className="h-5 w-5 mr-2 text-gray-500" />
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
  );
};

export default CourseDescription;
