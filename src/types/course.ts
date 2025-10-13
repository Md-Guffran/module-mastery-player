export interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  videoType: 'youtube' | 'vimeo' | 'file' | 'url';
  description?: string;
  resources?: Resource[];
  notes?: string;
}

export interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'article' | 'code' | 'link';
  url: string;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface CourseProgress {
  lessonId: string;
  completed: boolean;
  watchedSeconds: number;
  totalDuration: number;
  unlockedSeek: boolean;
}
