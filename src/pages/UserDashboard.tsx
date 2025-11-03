import React, { useState, useEffect } from 'react';
import api from '../api';
import { UserProgress, Module } from '../types/course';
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
  const [modules, setModules] = useState<Module[]>([]); // To get video durations

  useEffect(() => {
    fetchUserProgress();
    fetchModules(); // Fetch all modules to get video durations
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

  const fetchModules = async () => {
    try {
      // Assuming an API endpoint to fetch all modules (or modules relevant to the user's courses)
      // For simplicity, fetching all modules for now. In a real app, this might be optimized.
      const res = await api.get<Module[]>('/api/course/modules'); // Corrected endpoint
      setModules(res);
    } catch (err) {
      console.error('Failed to fetch modules:', err);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Progress Dashboard</h1>

      <div className="grid grid-cols-1 gap-4">
        {userProgress.length > 0 ? (
          userProgress.map((item) => {
            // Find the total duration for the lesson from the modules data
            const lessonDuration = modules
              .flatMap(m => m.videos)
              .find(video => video._id === item.lessonId)?.duration || 1; // Default to 1 to avoid division by zero

            return (
              <Card key={item._id} className="relative text-foreground">
                <CardContent className="p-4 text-foreground">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{item.lessonTitle}</p>
                      <p className="text-sm text-muted-foreground">
                        Watched: {item.watchedSeconds.toFixed(0)} seconds / {lessonDuration.toFixed(0)} seconds
                      </p>
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
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${(item.watchedSeconds / lessonDuration) * 100}%` }}
                    ></div>
                  </div>
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
