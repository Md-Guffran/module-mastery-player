import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Course } from '@/types/course';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { API_BASE_URL } from '@/config';
import CourseSearchBar from '../components/CourseSearchBar';
import { UserProgress } from '@/types/course';
import Header from '../components/Header';

const Index = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCourseSelect = (courseId: string) => {
    navigate(`/course/${courseId}`);
  };

  // Filter courses based on search term
  const filteredCourses = courses.filter((course) => {
    if (!searchTerm.trim()) {
      return true; // Show all courses if search is empty
    }
    const searchLower = searchTerm.toLowerCase();
    return (
      course.title.toLowerCase().includes(searchLower) ||
      course.description.toLowerCase().includes(searchLower)
    );
  });

  const isCourseStarted = (courseId: string): boolean => {
    return userProgress.some(progress =>
      courses.some(course =>
        course._id === courseId &&
        course.modules.some(module =>
          module.videos.some(video =>
            (video._id || video.id) === progress.lessonId
          )
        )
      )
    );
  };

  const myCourses = courses.filter(course => isCourseStarted(course._id));

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await axios.get(`${API_BASE_URL}/api/auth`, {
            headers: { 'x-auth-token': token },
          });
          setUserRole(res.data.role);
          // Fetch user progress if logged in
          const progressRes = await axios.get<UserProgress[]>(`${API_BASE_URL}/api/progress`, {
            headers: { 'x-auth-token': token },
          });
          setUserProgress(progressRes.data);
        } catch (err) {
          console.error('Failed to fetch user data or progress:', err);
          localStorage.removeItem('token');
          navigate('/signin');
        }
      }
    };

    const fetchCourses = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/course`);
        setCourses(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch courses:', err);
        setError('Failed to load courses.');
        setLoading(false);
      }
    };

    fetchUserData();
    fetchCourses();
  }, [navigate]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex justify-center items-center h-screen">Loading courses...</div>
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

  return (
    <>
      <Header />
      <div className="container mx-auto p-6 pt-24">
        <h1 className="text-4xl font-bold text-center mb-10 text-foreground">Course Catalog</h1>
      <div className="mb-8">
        <CourseSearchBar onCourseSelect={handleCourseSelect} onSearchChange={setSearchTerm} />
      </div>

      {myCourses.length > 0 && !searchTerm.trim() && (
        <div className="mb-10">
          <h2 className="text-3xl font-bold mb-6 text-foreground">My Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCourses.map((course) => (
              <Link to={`/course/${course._id}`} key={course._id}>
                <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
                  <CardHeader>
                    <CardTitle>{course.title}</CardTitle>
                    <CardDescription>{course.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
          <hr className="my-10 border-t border-gray-300 dark:border-gray-700" />
        </div>
      )}

      <h2 className="text-3xl font-bold mb-6 text-foreground">Available Courses</h2>
      {filteredCourses.length === 0 && searchTerm.trim() ? (
        <div className="text-center text-muted-foreground py-8">
          No courses found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Link to={`/course/${course._id}`} key={course._id}>
              <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <CardTitle>{course.title}</CardTitle>
                  <CardDescription>{course.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
      </div>
    </>
  );
};

export default Index;
