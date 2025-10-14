import { Link as LinkIcon, Download } from 'lucide-react'; // Removed FileText, Code
import { Resource } from '@/types/course'; // Using the simplified Resource type
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ResourcesSectionProps {
  resources?: Resource[];
  notes?: Resource[]; // Changed to Resource[]
  lessonTitle: string;
}

export const ResourcesSection = ({ resources, notes, lessonTitle }: ResourcesSectionProps) => {
  // Removed getResourceIcon as 'type' is no longer available in simplified Resource

  // Removed downloadNotes as 'notes' is now an array of Resource objects

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-xl">Resources & Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="resources" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="resources" className="space-y-3 mt-4">
            {resources && resources.length > 0 ? (
              resources.map((resource, index) => (
                <a
                  key={index} // Using index as key since _id is not available for Resource
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary transition-colors bg-card hover:bg-accent/50"
                >
                  <div className="text-primary"><LinkIcon className="w-4 h-4" /></div> {/* Generic link icon */}
                  <div className="flex-1">
                    <div className="font-medium text-sm">{resource.title}</div>
                    {/* Removed resource.type display */}
                  </div>
                  <Download className="w-4 h-4 text-muted-foreground" />
                </a>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No resources available for this lesson
              </div>
            )}
          </TabsContent>

          <TabsContent value="notes" className="mt-4">
            {notes && notes.length > 0 ? (
              notes.map((note, index) => (
                <a
                  key={index} // Using index as key
                  href={note.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary transition-colors bg-card hover:bg-accent/50"
                >
                  <div className="text-primary"><LinkIcon className="w-4 h-4" /></div> {/* Generic link icon */}
                  <div className="flex-1">
                    <div className="font-medium text-sm">{note.title}</div>
                  </div>
                  <Download className="w-4 h-4 text-muted-foreground" />
                </a>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No notes available for this lesson
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
