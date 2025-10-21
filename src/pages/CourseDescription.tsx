import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import { Course } from '../types/course';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

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
      <Link to={`/course-player/${encodeURIComponent(course.title)}`}>
        <Button>Start Course</Button>
      </Link>
    </div>
  );
};

export default CourseDescription;
