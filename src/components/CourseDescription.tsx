import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Course {
  id: string;
  title: string;
  description: string;
  // Add other course properties as needed
}

const CourseDescription: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;
      try {
        setLoading(true);
        const fetchedCourse = await api.get<Course>(`/api/course/${courseId}`);
        setCourse(fetchedCourse);
      } catch (err) {
        setError('Failed to load course description.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  if (loading) {
    return <div>Loading course description...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!course) {
    return <div>Course not found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>{course.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{course.description || 'No description available.'}</p>
          <Link to={`/course-player/${course.title}`}>
            <Button className="mt-4">Start Course</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseDescription;
