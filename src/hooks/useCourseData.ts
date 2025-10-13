import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Module } from '@/types/course';

export const useCourseData = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourseData();
  }, []);

  const fetchCourseData = async () => {
    try {
      // Fetch courses with modules, lessons, and resources
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          modules (
            id,
            title,
            order_index,
            lessons (
              id,
              title,
              duration,
              video_url,
              video_type,
              description,
              notes,
              order_index,
              resources (
                id,
                title,
                type,
                url
              )
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(1);

      if (coursesError) throw coursesError;

      if (courses && courses.length > 0) {
        const course = courses[0];
        const formattedModules: Module[] = (course.modules as any[])
          .sort((a, b) => a.order_index - b.order_index)
          .map((module) => ({
            id: module.id,
            title: module.title,
            lessons: (module.lessons as any[])
              .sort((a, b) => a.order_index - b.order_index)
              .map((lesson) => ({
                id: lesson.id,
                title: lesson.title,
                duration: lesson.duration || '',
                videoUrl: lesson.video_url || '',
                videoType: (lesson.video_type as any) || 'youtube',
                description: lesson.description || '',
                notes: lesson.notes || '',
                resources: lesson.resources || [],
              })),
          }));

        setModules(formattedModules);
      }

      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return { modules, loading, error, refetch: fetchCourseData };
};