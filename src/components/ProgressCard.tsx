import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Clock } from 'lucide-react';
import { formatDurationMinutes } from '@/utils/duration';

interface ProgressCardProps {
  lessonTitle: string;
  watchedSeconds: number;
  lessonDuration: number;
  updatedAt: string;
  completed: boolean;
  userInfo?: {
    username: string;
    email: string;
  };
}

export const ProgressCard: React.FC<ProgressCardProps> = ({
  lessonTitle,
  watchedSeconds,
  lessonDuration,
  updatedAt,
  completed,
  userInfo,
}) => {
  const hasValidDuration = lessonDuration > 1;
  const watchedMinutes = watchedSeconds / 60;
  const totalMinutes = lessonDuration / 60;

  return (
    <Card className="relative text-foreground">
      <CardContent className="p-4 text-foreground">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">{lessonTitle}</p>
            {userInfo && (
              <p className="text-sm text-muted-foreground">
                {userInfo.username} ({userInfo.email})
              </p>
            )}
            {hasValidDuration ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Video Duration: {formatDurationMinutes(lessonDuration)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Watched: {formatDurationMinutes(watchedSeconds)} / {formatDurationMinutes(lessonDuration)}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Video Duration: Not available
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Last Updated: {new Date(updatedAt).toLocaleString()}
            </p>
          </div>
          {completed ? (
            <span className="text-green-500 flex items-center">
              <CheckCircle className="w-5 h-5 mr-1" /> Completed
            </span>
          ) : (
            <span className="text-yellow-500 flex items-center">
              <Clock className="w-5 h-5 mr-1" /> In Progress
            </span>
          )}
        </div>
        {hasValidDuration && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${Math.min((watchedSeconds / lessonDuration) * 100, 100)}%` }}
            ></div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

