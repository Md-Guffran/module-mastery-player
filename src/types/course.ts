export interface Lesson {
  id: string;
  _id: string;
  title: string;
  duration: string;
  videoUrl: string;
  url: string;
  videoType: 'youtube' | 'vimeo' | 'file' | 'url';
  description?: string;
  resources?: Resource[];
  notes?: string;
  resourcesUrl?: string;
  notesUrl?: string;
}

export interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'article' | 'code' | 'link';
  url: string;
}

export interface Module {
  id: string;
  _id: string;
  title: string;
  lessons: Lesson[];
  videos: Lesson[];
}

export interface CourseProgress {
  lessonId: string;
  completed: boolean;
  watchedSeconds: number;
  totalDuration: number;
  unlockedSeek: boolean;
}
