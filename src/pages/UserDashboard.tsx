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

  useEffect(() => {
    fetchUserProgress();
    fetchCourses(); // Fetch all courses to get video durations
  }, []);

  const fetchUserProgress = async () => {
    try {
      // Assuming an API endpoint to fetch progress for the currently logged-in user
      const res = await api.get<UserProgress[]>('/api/progress'); // Corrected endpoint
      setUserProgress(res);
    } catch (err) {
      console.error('Failed to fetch user progress:', err);
    }
  };

  const fetchCourses = async () => {
    try {
      // Fetch all courses with modules populated to get all videos
      const res = await api.get<Course[]>('/api/course');
      setCourses(res);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    }
  };

  return (
    <>
      <Header />
      <div className="container mx-auto p-4 pt-24">
        <h1 className="text-2xl font-bold mb-4">My Progress Dashboard</h1>

      <div className="grid grid-cols-1 gap-4">
        {userProgress.length > 0 ? (
          userProgress.map((item) => {
            const lessonDuration = findVideoDuration(courses, item.lessonId) || 1;
            const videoDetails = findVideoDetails(courses, item.lessonId);

            if (!videoDetails) {
              return null; // Skip rendering if video details are not found
            }

            return (
              <Link key={item._id} to={`/course-player/${videoDetails.courseId}/${videoDetails.moduleId}/${item.lessonId}`}>
                <ProgressCard
                  lessonTitle={item.lessonTitle}
                  watchedSeconds={item.watchedSeconds}
                  lessonDuration={lessonDuration}
                  updatedAt={item.updatedAt}
                  completed={item.completed}
                />
              </Link>
            );
          })
        ) : (
          <p>No progress found yet. Start a course to see your progress here!</p>
        )}
      </div>
      </div>
    </>
  );
};

export default UserDashboard;
