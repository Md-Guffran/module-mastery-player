export interface Resource {
  title: string;
  url: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: number;
  resources: Resource[];
  notes: Resource[];
}

export interface Module {
  _id?: string;
  id?: string;
  title: string;
  videos: Video[];
  lessons?: Lesson[];
}

export interface Day {
  _id?: string; // Add _id to Day interface
  dayNumber: number;
  modules: Module[];
  assessment?: string;
  assessmentLink?: string;
}

export interface UserAssessmentProgress {
  _id: string;
  userId: string;
  courseId: string;
  dayId: string;
  assessmentTitle: string;
  assessmentLink: string;
  submittedLink: string;
  status: 'pending' | 'submitted' | 'waiting for review' | 'completed' | 'failed';
  submissionDate?: Date;
  reviewDate?: Date;
  reviewerId?: string;
  feedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Week {
  weekNumber: number;
  days: Day[];
}

export interface Video {
  _id?: string;
  id?: string;
  title: string;
  url: string;
  duration?: number; // Add duration
  resourcesUrl?: string;
  notesUrl?: string;
}

export interface Course {
  _id: string;
  id?: string;
  title: string;
  description: string;
  weeks: Week[]; // Changed from modules to weeks
  skills: string;
  tools: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  imageUrl?: string; // Add image URL for course card
  isBestseller?: boolean; // Add bestseller flag
  updatedDate?: string; // Add updated date
  totalHours?: number; // Add total hours
  features?: string[]; // Add features for bullet points
  views?: number; // Add number of views
}

export interface CourseProgress {
  lessonId: string;
  lessonTitle: string;
  completed: boolean;
  watchedSeconds: number;
  totalDuration: number;
  unlockedSeek: boolean;
  watched: boolean;
}

export interface UserProgressResponse {
  lessonId: string;
  lessonTitle: string;
  completed: boolean;
  watchedSeconds: number;
  totalDuration?: number; // Add totalDuration
}

export interface UserProgress {
  _id: string;
  user: {
    _id: string;
    username: string;
    email: string;
  };
  lessonId: string;
  lessonTitle: string;
  watchedSeconds: number;
  completed: boolean; // Ensure completed is present
  updatedAt: string;
}
