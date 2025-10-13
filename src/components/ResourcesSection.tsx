import { FileText, Link as LinkIcon, Code, Download } from 'lucide-react';
import { Resource } from '@/types/course';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ResourcesSectionProps {
  resources?: Resource[];
  notes?: string;
  lessonTitle: string;
}

export const ResourcesSection = ({ resources, notes, lessonTitle }: ResourcesSectionProps) => {
  const getResourceIcon = (type: Resource['type']) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-4 h-4" />;
      case 'code':
        return <Code className="w-4 h-4" />;
      case 'article':
      case 'link':
        return <LinkIcon className="w-4 h-4" />;
    }
  };

  const downloadNotes = () => {
    const element = document.createElement('a');
    const file = new Blob([notes || ''], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${lessonTitle}-notes.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

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
              resources.map((resource) => (
                <a
                  key={resource.id}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary transition-colors bg-card hover:bg-accent/50"
                >
                  <div className="text-primary">{getResourceIcon(resource.type)}</div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{resource.title}</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {resource.type}
                    </div>
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
            {notes ? (
              <div className="space-y-4">
                <div className="prose prose-sm max-w-none p-4 rounded-lg bg-muted/50">
                  <p className="whitespace-pre-wrap text-foreground">{notes}</p>
                </div>
                <Button onClick={downloadNotes} variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download Notes as TXT
                </Button>
              </div>
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
