import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../apiClient';
import { UserContext } from '../context/UserContext'; // Import UserContext
import { Course } from '@/types/course';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const Index = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, logout } = useContext(UserContext); // Use UserContext
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/api/course');
        setCourses(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch courses:', err);
        setError('Failed to load courses.');
        setLoading(false);
      }
    };

    fetchCourses();
  }, []); // Removed navigate from dependency array as it's not directly used in fetchCourses

  const handleLogout = async () => {
    await logout();
    navigate('/signin');
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading courses...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="absolute top-4 right-4 z-10 flex space-x-2 items-center">
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
        <ThemeToggle />
      </div>
      <h1 className="text-4xl font-bold text-center mb-10 text-foreground">Available Courses</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Link to={`/course-player/${encodeURIComponent(course.title)}`} key={course._id}>
            <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <CardTitle>{course.title}</CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                {/* You can add more course details here if available */}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Index;
