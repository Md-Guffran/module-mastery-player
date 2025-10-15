import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Course, Module, Video } from '../types/course'; // Import Course type
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
  // Stats state
  const [stats, setStats] = useState<{
    userCount: number;
    dailyCount: number;
    mostWatchedVideos: string[]; // Assuming video titles for now
  }>({
    userCount: 0,
    dailyCount: 0,
    mostWatchedVideos: [],
  });

  // State for managing modules fetched from the API (for display/editing existing ones)
  const [modules, setModules] = useState<Module[]>([]);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editedModule, setEditedModule] = useState<Module | null>(null);

  // State for creating a new course with its modules and videos
  const [newCourse, setNewCourse] = useState<Course>({ name: '', modules: [] });
  const [currentModuleIndex, setCurrentModuleIndex] = useState<number>(0); // To track which module we are adding videos to

  // Handlers for new course name input
  const handleNewCourseNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCourse({ ...newCourse, name: e.target.value });
  };

  // Handlers for new module title input within course creation
  const handleNewModuleTitleChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const updatedModules = newCourse.modules.map((module, i) =>
      i === index ? { ...module, title: e.target.value } : module
    );
    setNewCourse({ ...newCourse, modules: updatedModules });
  };

  // Handlers for new video fields within a module during course creation
  const handleNewVideoChange = (
    moduleIndex: number,
    videoIndex: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const updatedModules = [...newCourse.modules];
    const updatedVideos = updatedModules[moduleIndex].videos.map((video, i) =>
      i === videoIndex ? { ...video, [e.target.name]: e.target.value } : video
    );
    updatedModules[moduleIndex].videos = updatedVideos;
    setNewCourse({ ...newCourse, modules: updatedModules });
  };

  // Add a new module to the course creation form
  const addNewModule = () => {
    setNewCourse({
      ...newCourse,
      modules: [...newCourse.modules, { title: '', videos: [] }],
    });
    setCurrentModuleIndex(newCourse.modules.length); // Set current module index to the newly added one
  };

  // Remove a module from the course creation form
  const removeModule = (moduleIndex: number) => {
    const updatedModules = newCourse.modules.filter((_, i) => i !== moduleIndex);
    setNewCourse({ ...newCourse, modules: updatedModules });
    // Adjust currentModuleIndex if the removed module was before or at the current index
    if (currentModuleIndex >= moduleIndex) {
      setCurrentModuleIndex(Math.max(0, currentModuleIndex - 1));
    }
  };

  // Add a new video field to the currently selected module in the course creation form
  const addNewVideoField = () => {
    const updatedModules = [...newCourse.modules];
    if (updatedModules[currentModuleIndex]) {
      updatedModules[currentModuleIndex].videos.push({ title: '', url: '' });
      setNewCourse({ ...newCourse, modules: updatedModules });
    }
  };

  // Remove a video field from the currently selected module in the course creation form
  const removeVideoField = (moduleIndex: number, videoIndex: number) => {
    const updatedModules = [...newCourse.modules];
    updatedModules[moduleIndex].videos = updatedModules[moduleIndex].videos.filter(
      (_, i) => i !== videoIndex
    );
    setNewCourse({ ...newCourse, modules: updatedModules });
  };

  // Handler for submitting a new course
  const handleSubmitNewCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Assuming a backend API endpoint for creating courses exists: /api/courses
      // This endpoint should be able to handle the nested structure of Course -> Modules -> Videos
      await axios.post('/api/courses', newCourse);
      alert('Course created successfully');
      setNewCourse({ name: '', modules: [] }); // Reset form
      setCurrentModuleIndex(0); // Reset current module index
      fetchModules(); // Refresh modules list (or fetch courses if a separate endpoint exists)
    } catch (err: any) {
      console.error('Failed to create course:', err);
      alert('Failed to create course');
    }
  };

  useEffect(() => {
    fetchStats();
    fetchModules(); // This fetches existing modules, not courses. Might need a separate fetchCourses()
  }, []);

  // Fetch stats (existing function)
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

  // Fetch modules (existing function, might need to be adapted or replaced by fetchCourses)
  const fetchModules = async () => {
    try {
      const res = await axios.get('/api/course'); // Using the public API
      setModules(res.data);
    } catch (err) {
      console.error('Failed to fetch modules:', err);
    }
  };

  // --- Existing Module Management Handlers (kept for reference, but not directly used in new course creation) ---
  // Removed: const [newModule, setNewModule] = useState<Module>({ title: '', videos: [] });
  // Removed: const handleNewModuleChange = ...
  // Removed: const handleNewVideoChange = ...
  // Removed: const addNewVideoField = ...
  // Removed: const removeNewVideoField = ...
  // Removed: const handleSubmitNewModule = ...

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

      {/* Existing "Manage Modules" section - kept for now, but might be refactored later */}
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
                    onClick={(e) => e.stopPropagation()} // Prevent accordion to toggle
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

      {/* New section for creating a Course with nested Modules and Videos */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Create New Course</h2>
        <form onSubmit={handleSubmitNewCourse} className="space-y-4">
          {/* Course Name Input */}
          <div>
            <Label htmlFor="courseName">Course Name</Label>
            <Input
              id="courseName"
              type="text"
              value={newCourse.name}
              onChange={handleNewCourseNameChange}
              required
            />
          </div>

          {/* Modules within the Course */}
          <h3 className="text-md font-semibold mt-6 mb-2">Modules</h3>
          {newCourse.modules.map((module, moduleIndex) => (
            <Card key={moduleIndex} className="mb-4 p-4">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <Label htmlFor={`moduleTitle-${moduleIndex}`}>Module Title</Label>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeModule(moduleIndex)}
                  >
                    Remove Module
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Input
                  id={`moduleTitle-${moduleIndex}`}
                  type="text"
                  value={module.title}
                  onChange={(e) => handleNewModuleTitleChange(moduleIndex, e)}
                  required
                  className="mb-4"
                />

                {/* Videos within this Module */}
                <h4 className="text-sm font-semibold mb-2">Videos</h4>
                {module.videos.map((video, videoIndex) => (
                  <Card key={videoIndex} className="mb-4 p-4 bg-gray-50 dark:bg-gray-800">
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`videoTitle-${moduleIndex}-${videoIndex}`}>Video Title</Label>
                          <Input
                            id={`videoTitle-${moduleIndex}-${videoIndex}`}
                            type="text"
                            name="title"
                            value={video.title}
                            onChange={(e) => handleNewVideoChange(moduleIndex, videoIndex, e)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor={`videoUrl-${moduleIndex}-${videoIndex}`}>Video URL</Label>
                          <Input
                            id={`videoUrl-${moduleIndex}-${videoIndex}`}
                            type="url"
                            name="url"
                            value={video.url}
                            onChange={(e) => handleNewVideoChange(moduleIndex, videoIndex, e)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor={`resourcesUrl-${moduleIndex}-${videoIndex}`}>
                            Resources URL (Optional)
                          </Label>
                          <Input
                            id={`resourcesUrl-${moduleIndex}-${videoIndex}`}
                            type="url"
                            name="resourcesUrl"
                            value={video.resourcesUrl || ''}
                            onChange={(e) => handleNewVideoChange(moduleIndex, videoIndex, e)}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`notesUrl-${moduleIndex}-${videoIndex}`}>
                            Notes URL (Optional)
                          </Label>
                          <Input
                            id={`notesUrl-${moduleIndex}-${videoIndex}`}
                            type="url"
                            name="notesUrl"
                            value={video.notesUrl || ''}
                            onChange={(e) => handleNewVideoChange(moduleIndex, videoIndex, e)}
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => removeVideoField(moduleIndex, videoIndex)}
                        className="mt-4"
                      >
                        Remove Video
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                <Button type="button" onClick={addNewVideoField} className="mr-2">
                  <PlusCircle className="w-4 h-4 mr-2" /> Add Video to this Module
                </Button>
              </CardContent>
            </Card>
          ))}

          <Button type="button" onClick={addNewModule} className="mr-2 mb-4">
            <PlusCircle className="w-4 h-4 mr-2" /> Add New Module
          </Button>

          <Button type="submit">Create Course</Button>
        </form>
      </div>

    </div>
  );
};

export default AdminDashboard;
