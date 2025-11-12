import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import fetchCourses from "@/api";
import api from "@/api";

interface Course {
  id: string;
  title: string;
  description: string;
  // Add other course properties as needed
}

const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        const fetchedCourses = await api.get<Course[]>('/api/admin/courses'); // This should call GET api/admin/courses
        setCourses(fetchedCourses);
      } catch (err) {
        setError('Failed to load courses.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  if (loading) {
    return <div>Loading courses...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Our Courses</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.length > 0 ? (
          courses.map((course) => (
            <Link key={course.id} to={`/course-player/${course.id}`}>
              <Card className="rounded-lg shadow-md transition-all duration-300 ease-in-out hover:animate-hover-glow cursor-pointer">
                <CardHeader>
                  <CardTitle>{course.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{course.description}</p>
                  {/* Add more course details here if available */}
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <p>No courses available yet. Please add some courses.</p>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
