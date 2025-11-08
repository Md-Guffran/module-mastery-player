import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Course } from '@/types/course';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { API_BASE_URL } from '@/config';
import { UserProgress } from '@/types/course';
import Header from '../components/Header';
import { Progress } from '@/components/ui/progress'; // Import Progress component
import { Button } from '@/components/ui/button'; // Import Button component
import { Star } from 'lucide-react'; // Import Star icon
import CourseProgressDisplay from '../components/CourseProgressDisplay'; // Import CourseProgressDisplay component

const Index = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Read search term from URL search params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('query') || '';
    setSearchTerm(query);
  }, [location.search]);

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
        course.weeks.some(week => // Changed from modules to weeks
          week.days.some(day => // Added days
            day.modules.some(module =>
              module.videos.some(video =>
                (video._id || video.id) === progress.lessonId
              )
            )
          )
        )
      )
    );
  };

  const [mostRecentCourse, setMostRecentCourse] = useState<Course | null>(null);

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
        const res = await axios.get(`${API_BASE_URL}/api/courses`);
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

  useEffect(() => {
    if (myCourses.length > 0) {
      // Assuming the most recent course is the one with the latest update or simply the first one in the filtered list
      setMostRecentCourse(myCourses[0]);
    }
  }, [myCourses]);

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
        {/* Most Recent Course Section */}
        {mostRecentCourse && !searchTerm.trim() && (
          <div className="mb-10">
            <h2 className="text-3xl font-bold mb-6 text-foreground">Continue Learning</h2>
            <Link to={`/course/${mostRecentCourse._id}`}>
              <Card className="flex flex-col md:flex-row rounded-lg shadow-lg overflow-hidden bg-card text-card-foreground">
                <img src={mostRecentCourse.imageUrl || "/placeholder.svg"} alt={mostRecentCourse.title} className="w-full md:w-1/3 h-48 object-cover" />
                <div className="p-6 flex flex-col justify-center flex-grow">
                  <p className="text-sm text-muted-foreground mb-1">COURSE</p>
                  <CardTitle className="text-3xl font-bold mb-2">{mostRecentCourse.title}</CardTitle>
                  <CardDescription className="text-muted-foreground mb-4">{mostRecentCourse.description}</CardDescription>
                  <div className="flex items-center mb-4">
                    <CourseProgressDisplay courseId={mostRecentCourse._id} courses={courses} userProgress={userProgress} />
                    <span className="ml-4 text-sm text-muted-foreground">{mostRecentCourse.duration}</span>
                  </div>
                  <Button variant="default" className="w-fit">
                    Continue
                  </Button>
                </div>
              </Card>
            </Link>
            <hr className="my-10 border-t border-gray-300 dark:border-gray-700" />
          </div>
        )}

        {/* Trending Courses Section */}
        <h2 className="text-3xl font-bold mb-6 text-foreground">Trending Courses</h2>
        {filteredCourses.length === 0 && searchTerm.trim() ? (
          <div className="text-center text-muted-foreground py-8">
            No courses found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCourses.map((course) => (
              <Link to={`/course/${course._id}`} key={course._id}>
                <Card className="h-full flex flex-col rounded-lg shadow-md overflow-hidden group relative">
                  <img src={course.imageUrl || "../genAi.png"} alt={course.title} className="w-full h-36 object-cover" />
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-center mb-1">
                      <CardTitle className="text-lg font-bold">{course.title}</CardTitle>
                      {course.isBestseller && (
                        <span className="bg-yellow-200 text-yellow-800 text-xs font-semibold px-2 py-0.5 rounded-full">Bestseller</span>
                      )}
                    </div>
                    <CardDescription className="text-xs text-muted-foreground">
                      {course.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center text-xs text-muted-foreground mb-2">
                      <span>{course.views || 0} views</span>
                    </div>
                  </CardContent>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-background/95 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-start p-4">
                    <CardTitle className="text-xl font-bold mb-2">{course.title}</CardTitle>
                    <p className="text-xs text-muted-foreground mb-2">
                      Skills: {course.skills}
                    </p>
                    <p className="text-xs text-muted-foreground mb-2">
                      Tools: {course.tools}
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Duration: {course.duration}
                    </p>
                  </div>
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
