export interface Video {
  _id: string; // Added for MongoDB documents
  title: string;
  url: string;
  resourcesUrl?: string;
  notesUrl?: string;
}

export interface Module {
  id?: string; // Optional for new modules
  _id?: string; // Optional for new modules
  title: string;
  videos: Video[];
}

export interface Resource {
  title: string;
  url: string;
}

export interface Lesson {
  id: string; // Mapped from video._id
  title: string;
  duration: string; // Placeholder, needs to be fetched or calculated
  videoUrl: string; // Mapped from video.url
  videoType?: 'youtube' | 'vimeo' | 'file' | 'url'; // Made optional
  description?: string;
  resources?: Resource[]; // Uses the simplified Resource interface
  notes?: Resource[]; // Uses the simplified Resource interface
}

export interface CourseProgress {
  lessonId: string;
  completed: boolean;
  watchedSeconds: number;
  totalDuration: number;
  unlockedSeek: boolean;
}
