import React, { useState, useEffect } from 'react';
import api from '../api';
import { UserProgress, Course } from '../types/course';
import { ProgressCard } from '../components/ProgressCard';
import { findVideoDuration, findVideoDetails } from '../utils/videoUtils';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
}

const UserDashboard: React.FC = () => {
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [courses, setCourses] = useState<Course[]>([]); // To get all courses with modules and videos
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserProgress();
    fetchCourses(); // Fetch all courses to get video durations
  }, []);

  const fetchUserProgress = async () => {
    try {
      setLoading(true);
      setError(null);
      // Handle both array response and response with data property
      const res = await api.get<UserProgress[] | { data: UserProgress[] }>('/api/progress');
      const progressArray = Array.isArray(res) ? res : (res as any)?.data || [];
      setUserProgress(progressArray);
    } catch (err) {
      console.error('Failed to fetch user progress:', err);
      setError('Failed to load progress. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      // Fetch all courses with modules populated to get all videos
      const res = await api.get<Course[] | { data: Course[] }>('/api/course');
      const coursesArray = Array.isArray(res) ? res : (res as any)?.data || [];
      setCourses(coursesArray);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    }
  };

  return (
    <>
      <Header />
      <div className="container mx-auto p-4 pt-24">
        <h1 className="text-2xl font-bold mb-4">My Progress Dashboard</h1>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <p className="text-muted-foreground">Loading progress...</p>
          </div>
        ) : error ? (
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-4">
            <p>{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {userProgress.length > 0 ? (
              userProgress.map((item) => {
                const lessonDuration = findVideoDuration(courses, item.lessonId) || 1;
                const videoDetails = findVideoDetails(courses, item.lessonId);

                const progressCard = (
                  <ProgressCard
                    lessonTitle={item.lessonTitle}
                    watchedSeconds={item.watchedSeconds}
                    lessonDuration={lessonDuration}
                    updatedAt={item.updatedAt}
                    completed={item.completed}
                  />
                );

                // If video details are found, make it a link; otherwise just show the card
                if (videoDetails) {
                  return (
                    <Link key={item._id} to={`/course-player/${videoDetails.courseId}/${videoDetails.moduleId}/${item.lessonId}`}>
                      {progressCard}
                    </Link>
                  );
                }

                // Show progress even if video details aren't found
                return <div key={item._id}>{progressCard}</div>;
              })
            ) : (
              <p className="text-muted-foreground">No progress found yet. Start a course to see your progress here!</p>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default UserDashboard;
