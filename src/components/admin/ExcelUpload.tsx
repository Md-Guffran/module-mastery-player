import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { Upload } from 'lucide-react';

interface ExcelRow {
  'Module Title'?: string;
  'Lesson Title'?: string;
  'Duration'?: string;
  'Video URL'?: string;
  'Video Type'?: string;
  'Description'?: string;
  'Notes'?: string;
  'Resource Title'?: string;
  'Resource Type'?: string;
  'Resource URL'?: string;
}

export const ExcelUpload = () => {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json<ExcelRow>(worksheet);

      // Create course
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .insert({ title: 'Imported Course', description: 'Course imported from Excel' })
        .select()
        .single();

      if (courseError) throw courseError;

      let currentModule: any = null;
      let currentLesson: any = null;
      let moduleIndex = 0;
      let lessonIndex = 0;

      for (const row of jsonData) {
        // Create module if new module title found
        if (row['Module Title']) {
          const { data: module, error: moduleError } = await supabase
            .from('modules')
            .insert({
              course_id: course.id,
              title: row['Module Title'],
              order_index: moduleIndex++,
            })
            .select()
            .single();

          if (moduleError) throw moduleError;
          currentModule = module;
          lessonIndex = 0;
        }

        // Create lesson if lesson data found
        if (row['Lesson Title'] && currentModule) {
          const { data: lesson, error: lessonError } = await supabase
            .from('lessons')
            .insert({
              module_id: currentModule.id,
              title: row['Lesson Title'],
              duration: row['Duration'] || '',
              video_url: row['Video URL'] || '',
              video_type: row['Video Type'] || 'youtube',
              description: row['Description'] || '',
              notes: row['Notes'] || '',
              order_index: lessonIndex++,
            })
            .select()
            .single();

          if (lessonError) throw lessonError;
          currentLesson = lesson;

          // Add resource if resource data found
          if (row['Resource Title'] && row['Resource URL'] && currentLesson) {
            await supabase.from('resources').insert({
              lesson_id: currentLesson.id,
              title: row['Resource Title'],
              type: row['Resource Type'] || 'link',
              url: row['Resource URL'],
            });
          }
        }
      }

      toast.success('Course data uploaded successfully!');
      e.target.value = '';
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload course data');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="excel-file">Excel File</Label>
        <div className="flex gap-2">
          <Input
            id="excel-file"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            disabled={uploading}
          />
          <Button disabled={uploading} variant="outline" size="icon">
            <Upload className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {uploading && <p className="text-sm text-muted-foreground">Uploading and processing...</p>}
      <div className="text-sm text-muted-foreground space-y-1">
        <p className="font-medium">Expected Excel columns:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Module Title</li>
          <li>Lesson Title</li>
          <li>Duration</li>
          <li>Video URL</li>
          <li>Video Type (youtube/vimeo/file/url)</li>
          <li>Description</li>
          <li>Notes</li>
          <li>Resource Title</li>
          <li>Resource Type (pdf/article/code/link)</li>
          <li>Resource URL</li>
        </ul>
      </div>
    </div>
  );
};