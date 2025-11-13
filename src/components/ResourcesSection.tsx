import { Link as LinkIcon, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getNoteTitle, enrichNotesWithTitles } from '@/utils/noteTitles';

interface ResourceItem {
  title?: string;
  url: string;
}

interface ResourcesSectionProps {
  notes?: (string | ResourceItem)[]; // Allow array of strings or objects
  lessonTitle: string;
}

export const ResourcesSection = ({ notes, lessonTitle }: ResourcesSectionProps) => {
  // Filter and process valid notes
  const validNotes = notes
    ? notes
        .map((note) => {
          const rawNoteUrl = typeof note === 'string' ? note : note?.url;
          return typeof rawNoteUrl === 'string' ? rawNoteUrl.trim() : '';
        })
        .filter((noteUrl) => {
          // Only include valid, non-empty note URLs
          return noteUrl.length > 0 && 
                 !noteUrl.toLowerCase().includes('placeholder') &&
                 (noteUrl.startsWith('http://') || noteUrl.startsWith('https://') || noteUrl.startsWith('/'));
        })
        .map((noteUrl) => ({
          noteUrl,
          noteTitle: getNoteTitle(noteUrl) // Use utility function to get title
        }))
    : [];

  return (
    <Card className="shadow-md">
      <CardHeader className="p-3 md:p-6">
        <CardTitle className="text-lg md:text-xl">Notes</CardTitle>
      </CardHeader>
      <CardContent className="p-3 md:p-6 pt-0">
        {validNotes.length > 0 ? (
          <div className="space-y-2 md:space-y-3 mt-2 md:mt-4">
            {validNotes.map((note, index) => (
              <a
                key={index}
                href={note.noteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 md:gap-3 p-3 md:p-4 rounded-lg border border-border hover:border-primary transition-colors bg-card hover:bg-accent/50"
              >
                <div className="text-primary flex-shrink-0"><LinkIcon className="w-4 h-4" /></div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-xs md:text-sm truncate">{note.noteTitle}</div>
                  <div className="text-xs text-muted-foreground truncate">{note.noteUrl}</div>
                </div>
                <Download className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </a>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 md:py-8 text-muted-foreground text-sm md:text-base">
            No notes available for this lesson
          </div>
        )}
      </CardContent>
    </Card>
  );
};
