import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Course, UserProgress } from '@/types/course';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { API_BASE_URL } from '@/config';
import Header from '../components/Header';
import CourseProgressDisplay from '../components/CourseProgressDisplay';
import { Button } from '@/components/ui/button';

const MyCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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

  const myEnrolledCourses = courses.filter(course => isCourseStarted(course._id));

  useEffect(() => {
    const fetchUserDataAndCourses = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/signin');
        return;
      }

      try {
        // Fetch user progress
        const progressRes = await axios.get<UserProgress[]>(`${API_BASE_URL}/api/progress`, {
          headers: { 'x-auth-token': token },
        });
        setUserProgress(progressRes.data);

        // Fetch all courses
        const coursesRes = await axios.get(`${API_BASE_URL}/api/course`);
        setCourses(coursesRes.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load your courses.');
        setLoading(false);
        localStorage.removeItem('token');
        navigate('/signin');
      }
    };

    fetchUserDataAndCourses();
  }, [navigate]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex justify-center items-center h-screen">Loading your courses...</div>
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
        <h1 className="text-4xl font-bold text-center mb-10 text-foreground">My Enrolled Courses</h1>
        {myEnrolledCourses.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            You are not enrolled in any courses yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myEnrolledCourses.map((course) => (
              <Link to={`/course/${course._id}`} key={course._id}>
                <Card className="h-full flex flex-col rounded-lg shadow-md overflow-hidden">
                  <CardHeader className="flex-grow">
                    <CardTitle className="text-2xl font-bold">{course.title}</CardTitle>
                    <CardDescription>{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <CourseProgressDisplay courseId={course._id} courses={courses} userProgress={userProgress} />
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-sm text-muted-foreground">{course.duration}</span>
                      <Button variant="default">
                        Continue
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default MyCourses;
