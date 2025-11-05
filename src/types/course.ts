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
  id?: any;
  title: string;
  description: string;
  modules: Module[];
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
