import { Link as LinkIcon, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ResourcesSectionProps {
  notes?: string[]; // Changed to string[]
  lessonTitle: string;
}

export const ResourcesSection = ({ notes, lessonTitle }: ResourcesSectionProps) => {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-xl">Notes</CardTitle>
      </CardHeader>
      <CardContent>
        {notes && notes.length > 0 ? (
          <div className="space-y-3 mt-4">
            {notes.map((noteUrl, index) => (
              <a
                key={index}
                href={noteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary transition-colors bg-card hover:bg-accent/50"
              >
                <div className="text-primary"><LinkIcon className="w-4 h-4" /></div>
                <div className="flex-1">
                  <div className="font-medium text-sm">Note {index + 1}</div> {/* Generic title for notes */}
                  <div className="text-xs text-muted-foreground truncate">{noteUrl}</div>
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
