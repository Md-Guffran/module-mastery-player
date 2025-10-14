import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Module, Video } from '../types/course';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { PlusCircle, MinusCircle, Edit, Trash2, Save, Users, BarChart, VideoIcon } from 'lucide-react'; // Import icons
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion'; // Import Accordion components
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'; // Import Recharts components

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<{
    userCount: number;
    dailyCount: number;
    mostWatchedVideos: string[]; // Assuming video titles for now
  }>({
    userCount: 0,
    dailyCount: 0,
    mostWatchedVideos: [],
  });
  const [modules, setModules] = useState<Module[]>([]);
  const [newModule, setNewModule] = useState<Module>({ title: '', videos: [] });
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editedModule, setEditedModule] = useState<Module | null>(null);

  useEffect(() => {
    fetchStats();
    fetchModules();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/admin/stats', {
        headers: { 'x-auth-token': token },
      });
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchModules = async () => {
    try {
      const res = await axios.get('/api/course'); // Using the public API
      setModules(res.data);
    } catch (err) {
      console.error('Failed to fetch modules:', err);
    }
  };

  const handleNewModuleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewModule({ ...newModule, title: e.target.value });
  };

  const handleNewVideoChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const updatedVideos = newModule.videos.map((video, i) =>
      i === index ? { ...video, [e.target.name]: e.target.value } : video
    );
    setNewModule({ ...newModule, videos: updatedVideos });
  };

  const addNewVideoField = () => {
    setNewModule({
      ...newModule,
      videos: [...newModule.videos, { title: '', url: '' }],
    });
  };

  const removeNewVideoField = (index: number) => {
    const updatedVideos = newModule.videos.filter((_, i) => i !== index);
    setNewModule({ ...newModule, videos: updatedVideos });
  };

  const handleSubmitNewModule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // No token needed as authorization is removed
      await axios.post('/api/admin', newModule);
      alert('Module created successfully');
      setNewModule({ title: '', videos: [] }); // Reset form
      fetchModules(); // Refresh modules list
    } catch (err) {
      console.error('Failed to create module:', err);
      alert('Failed to create module');
    }
  };

  const handleEditModule = (module: Module) => {
    setEditingModuleId(module._id || module.id || null);
    setEditedModule({ ...module });
  };

  const handleEditedModuleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editedModule) {
      setEditedModule({ ...editedModule, title: e.target.value });
    }
  };

  const handleEditedVideoChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (editedModule) {
      const updatedVideos = editedModule.videos.map((video, i) =>
        i === index ? { ...video, [e.target.name]: e.target.value } : video
      );
      setEditedModule({ ...editedModule, videos: updatedVideos });
    }
  };

  const addEditedVideoField = () => {
    if (editedModule) {
      setEditedModule({
        ...editedModule,
        videos: [...editedModule.videos, { title: '', url: '' }],
      });
    }
  };

  const removeEditedVideoField = (index: number) => {
    if (editedModule) {
      const updatedVideos = editedModule.videos.filter((_, i) => i !== index);
      setEditedModule({ ...editedModule, videos: updatedVideos });
    }
  };

  const handleUpdateModule = async () => {
    if (editedModule && editedModule._id) {
      try {
        // No token needed as authorization is removed
        await axios.put(`/api/admin/modules/${editedModule._id}`, editedModule);
        alert('Module updated successfully');
        setEditingModuleId(null);
        setEditedModule(null);
        fetchModules(); // Refresh modules list
      } catch (err) {
        console.error('Failed to update module:', err);
        alert('Failed to update module');
      }
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (window.confirm('Are you sure you want to delete this module?')) {
      try {
        // No token needed as authorization is removed
        await axios.delete(`/api/admin/modules/${moduleId}`);
        alert('Module deleted successfully');
        fetchModules(); // Refresh modules list
      } catch (err) {
        console.error('Failed to delete module:', err);
        alert('Failed to delete module');
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-blue-100 dark:bg-blue-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.userCount}</div>
            <p className="text-xs text-muted-foreground">Total registered users</p>
          </CardContent>
        </Card>
        <Card className="bg-green-100 dark:bg-green-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Activity</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.dailyCount}</div>
            <p className="text-xs text-muted-foreground">Users active today (placeholder)</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-100 dark:bg-purple-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Watched Videos</CardTitle>
            <VideoIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside text-sm">
              {stats.mostWatchedVideos && stats.mostWatchedVideos.length > 0 ? (
                stats.mostWatchedVideos.map((video, index) => (
                  <li key={index}>{video}</li>
                ))
              ) : (
                <li>No data available</li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Manage Modules</h2>
        <Accordion type="single" collapsible className="w-full">
          {modules.map((moduleItem) => (
            <AccordionItem key={moduleItem._id || moduleItem.id} value={moduleItem._id || moduleItem.id || ''}>
              <AccordionTrigger>
                {editingModuleId === (moduleItem._id || moduleItem.id) ? (
                  <Input
                    type="text"
                    value={editedModule?.title || ''}
                    onChange={handleEditedModuleChange}
                    onClick={(e) => e.stopPropagation()} // Prevent accordion from toggling
                    className="w-full"
                  />
                ) : (
                  moduleItem.title
                )}
              </AccordionTrigger>
              <AccordionContent>
                {editingModuleId === (moduleItem._id || moduleItem.id) ? (
                  <div className="space-y-4 p-4">
                    <h3 className="text-md font-semibold mt-6 mb-2">Videos</h3>
                    {editedModule?.videos.map((video, index) => (
                      <Card key={index} className="mb-4 p-4">
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`editedVideoTitle-${index}`}>Video Title</Label>
                              <Input
                                id={`editedVideoTitle-${index}`}
                                type="text"
                                name="title"
                                value={video.title}
                                onChange={(e) => handleEditedVideoChange(index, e)}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor={`editedVideoUrl-${index}`}>Video URL</Label>
                              <Input
                                id={`editedVideoUrl-${index}`}
                                type="url"
                                name="url"
                                value={video.url}
                                onChange={(e) => handleEditedVideoChange(index, e)}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor={`editedResourcesUrl-${index}`}>
                                Resources URL (Optional)
                              </Label>
                              <Input
                                id={`editedResourcesUrl-${index}`}
                                type="url"
                                name="resourcesUrl"
                                value={video.resourcesUrl || ''}
                                onChange={(e) => handleEditedVideoChange(index, e)}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`editedNotesUrl-${index}`}>
                                Notes URL (Optional)
                              </Label>
                              <Input
                                id={`editedNotesUrl-${index}`}
                                type="url"
                                name="notesUrl"
                                value={video.notesUrl || ''}
                                onChange={(e) => handleEditedVideoChange(index, e)}
                              />
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={() => removeEditedVideoField(index)}
                            className="mt-4"
                          >
                            Remove Video
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                    <Button type="button" onClick={addEditedVideoField} className="mr-2">
                      <PlusCircle className="w-4 h-4 mr-2" /> Add Video
                    </Button>
                    <Button onClick={handleUpdateModule} className="mr-2">
                      <Save className="w-4 h-4 mr-2" /> Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setEditingModuleId(null)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex justify-end space-x-2 p-4">
                    <Button variant="outline" size="sm" onClick={() => handleEditModule(moduleItem)}>
                      <Edit className="w-4 h-4 mr-2" /> Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteModule(moduleItem._id || moduleItem.id || '')}>
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </Button>
                  </div>
                )}
                <div className="space-y-2 p-4">
                  {moduleItem.videos.map((video) => (
                    <div key={video._id} className="border p-2 rounded">
                      <p className="font-semibold">{video.title}</p>
                      <p className="text-sm text-muted-foreground">{video.url}</p>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Create New Module</h2>
        <form onSubmit={handleSubmitNewModule} className="space-y-4">
          <div>
            <Label htmlFor="moduleTitle">Module Title</Label>
            <Input
              id="moduleTitle"
              type="text"
              value={newModule.title}
              onChange={handleNewModuleChange}
              required
            />
          </div>

          <h3 className="text-md font-semibold mt-6 mb-2">Videos</h3>
          {newModule.videos.map((video, index) => (
            <Card key={index} className="mb-4 p-4">
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`newVideoTitle-${index}`}>Video Title</Label>
                    <Input
                      id={`newVideoTitle-${index}`}
                      type="text"
                      name="title"
                      value={video.title}
                      onChange={(e) => handleNewVideoChange(index, e)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor={`newVideoUrl-${index}`}>Video URL</Label>
                    <Input
                      id={`newVideoUrl-${index}`}
                      type="url"
                      name="url"
                      value={video.url}
                      onChange={(e) => handleNewVideoChange(index, e)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor={`newResourcesUrl-${index}`}>
                      Resources URL (Optional)
                    </Label>
                    <Input
                      id={`newResourcesUrl-${index}`}
                      type="url"
                      name="resourcesUrl"
                      value={video.resourcesUrl || ''}
                      onChange={(e) => handleNewVideoChange(index, e)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`newNotesUrl-${index}`}>
                      Notes URL (Optional)
                    </Label>
                    <Input
                      id={`newNotesUrl-${index}`}
                      type="url"
                      name="notesUrl"
                      value={video.notesUrl || ''}
                      onChange={(e) => handleNewVideoChange(index, e)}
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => removeNewVideoField(index)}
                  className="mt-4"
                >
                  Remove Video
                </Button>
              </CardContent>
            </Card>
          ))}
          <Button type="button" onClick={addNewVideoField} className="mr-2">
            Add Video
          </Button>
          <Button type="submit">Create Module</Button>
        </form>
      </div>

    </div>
  );
};

export default AdminDashboard;
