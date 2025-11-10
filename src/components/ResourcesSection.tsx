import { Link as LinkIcon, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
          const noteUrl = typeof note === 'string' ? note : note.url;
          const noteTitle = typeof note === 'string' ? undefined : note.title;
          return { noteUrl: noteUrl?.trim() || '', noteTitle };
        })
        .filter(({ noteUrl }) => {
          // Only include valid, non-empty note URLs
          const trimmed = noteUrl.trim();
          return trimmed.length > 0 && 
                 !trimmed.toLowerCase().includes('placeholder') &&
                 (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/'));
        })
        .map(({ noteUrl, noteTitle }) => {
          // Extract title from URL if not provided
          let title = noteTitle;
          if (!title) {
            let extractedTitle = noteUrl.substring(noteUrl.lastIndexOf('/') + 1);
            // If no filename found or it's empty, use the domain or a generic name
            if (!extractedTitle || extractedTitle.trim() === '' || extractedTitle === noteUrl) {
              try {
                const urlObj = new URL(noteUrl.startsWith('/') ? `http://localhost${noteUrl}` : noteUrl);
                extractedTitle = urlObj.hostname || 'Note';
              } catch {
                extractedTitle = 'Note';
              }
            }
            // Remove query parameters and fragments from title
            title = extractedTitle.split('?')[0].split('#')[0];
          }
          return { noteUrl, noteTitle: title };
        })
    : [];

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-xl">Notes</CardTitle>
      </CardHeader>
      <CardContent>
        {validNotes.length > 0 ? (
          <div className="space-y-3 mt-4">
            {validNotes.map((note, index) => (
              <a
                key={index}
                href={note.noteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary transition-colors bg-card hover:bg-accent/50"
              >
                <div className="text-primary"><LinkIcon className="w-4 h-4" /></div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{note.noteTitle}</div>
                  <div className="text-xs text-muted-foreground truncate">{note.noteUrl}</div>
                </div>
                <Download className="w-4 h-4 text-muted-foreground" />
              </a>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No notes available for this lesson
          </div>
        )}
      </CardContent>
    </Card>
  );
};
