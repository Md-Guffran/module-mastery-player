import React, { useState, useEffect } from 'react';
import api from '../api';
import { UserProgress, Course } from '../types/course';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { CheckCircle, Clock } from 'lucide-react';

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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Progress Dashboard</h1>

      <div className="grid grid-cols-1 gap-4">
        {userProgress.length > 0 ? (
          userProgress.map((item) => {
            // Find the total duration for the lesson from all courses' modules and videos
            let lessonDuration = 0;
            const lessonIdStr = String(item.lessonId);
            
            for (const course of courses) {
              if (course.modules && Array.isArray(course.modules)) {
                for (const module of course.modules) {
                  if (module.videos && Array.isArray(module.videos)) {
                    const video = module.videos.find((v: any) => {
                      const videoId = v._id ? String(v._id) : (v.id ? String(v.id) : '');
                      return videoId === lessonIdStr;
                    });
                    if (video && video.duration && video.duration > 0) {
                      lessonDuration = video.duration;
                      break;
                    }
                  }
                }
              }
              if (lessonDuration > 0) break;
            }
            
            // If still not found, default to 1 to avoid division by zero
            if (lessonDuration === 0) {
              lessonDuration = 1;
            }

            return (
              <Card key={item._id} className="relative text-foreground">
                <CardContent className="p-4 text-foreground">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{item.lessonTitle}</p>
                      {lessonDuration > 1 ? (
                        <>
                          <p className="text-sm text-muted-foreground">
                            Video Duration: {(lessonDuration / 60).toFixed(1)} min
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Watched: {(item.watchedSeconds / 60).toFixed(1)} min / {(lessonDuration / 60).toFixed(1)} min
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Video Duration: Not available
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Last Updated: {new Date(item.updatedAt).toLocaleString()}
                      </p>
                    </div>
                    {item.completed ? (
                      <span className="text-green-500 flex items-center">
                        <CheckCircle className="w-5 h-5 mr-1" /> Completed
                      </span>
                    ) : (
                      <span className="text-yellow-500 flex items-center">
                        <Clock className="w-5 h-5 mr-1" /> In Progress
                      </span>
                    )}
                  </div>
                  {lessonDuration > 1 && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${Math.min((item.watchedSeconds / lessonDuration) * 100, 100)}%` }}
                      ></div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        ) : (
          <p>No progress found yet. Start a course to see your progress here!</p>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
