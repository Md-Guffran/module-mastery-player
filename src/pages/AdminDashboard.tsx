import React, { useState, useEffect } from 'react';
import api from '../api';
import { Module, Video, UserProgress, Course } from '../types/course'; // Assuming Course type exists or will be defined
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { PlusCircle, MinusCircle, Edit, Trash2, Save, Users, BarChart, VideoIcon, Clock, CheckCircle } from 'lucide-react'; // Import icons
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion'; // Import Accordion components
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'; // Import Recharts components

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
}

interface DailyActivity {
  username: string;
  email: string;
  loginTime: string;
  logoutTime: string;
}


type ViewMode = 'overview' | 'users' | 'activity' | 'modules' | 'progress' | 'student-progress' | 'create-course' | 'manage-course'; // Added 'manage-course' view mode

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<{
    userCount: number;
    dailyCount: number;
    mostWatchedVideos: string[];
  }>({
    userCount: 0,
    dailyCount: 0,
    mostWatchedVideos: [],
  });
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [modules, setModules] = useState<Module[]>([]); // This will now represent modules within a selected course
  const [courses, setCourses] = useState<Course[]>([]); // State to hold all courses
  const [newModule, setNewModule] = useState<Module>({ title: '', videos: [{ title: '', url: '', duration: 0 }] });
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editedModule, setEditedModule] = useState<Module | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [dailyActivity, setDailyActivity] = useState<DailyActivity[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('overview'); // New state for view mode

  // State for creating a new course
  const [newCourse, setNewCourse] = useState<Course>({
    title: '',
    description: '',
    modules: [],
    skills: '',
    tools: '',
    level: 'beginner',
    duration: '0',
    _id: '',
  });
  const [selectedCourseIdForModules, setSelectedCourseIdForModules] = useState<string | null>(null); // To track which course's modules are being managed

  // Fetch modules for a specific course
  const fetchModulesForCourse = async (courseId: string) => {
    try {
      const res = await api.get<Module[]>(`/api/admin/courses/${courseId}/modules`); // Assuming an endpoint to fetch modules for a specific course
      setModules(res);
    } catch (err) {
      console.error('Failed to fetch modules for course:', err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchCourses(); // Fetch courses when component mounts or viewMode changes
    // Fetch modules only when 'modules' view is active or when creating/editing a course
    if (viewMode === 'modules' && selectedCourseIdForModules) {
      fetchModulesForCourse(selectedCourseIdForModules);
    }
    if (viewMode === 'users') {
      fetchUsers();
    }
    if (viewMode === 'activity') {
      fetchDailyActivity();
    }
    if (viewMode === 'progress' || viewMode === 'student-progress') {
      fetchUserProgress();
    }
  }, [viewMode, selectedStudentId, selectedCourseIdForModules]); // Re-fetch when viewMode, selectedStudentId, or selectedCourseIdForModules changes

  // Initial fetch for overview
  useEffect(() => {
    fetchStats();
    fetchCourses(); // Fetch courses on initial load
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get<{ userCount: number; dailyCount: number; mostWatchedVideos: string[] }>('/api/admin/stats');
      setStats(res);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get<User[]>('/api/admin/users');
      setUsers(res);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const fetchDailyActivity = async () => {
    try {
      const res = await api.get<DailyActivity[]>('/api/admin/daily-activity');
      setDailyActivity(res);
    } catch (err) {
      console.error('Failed to fetch daily activity:', err);
    }
  };

  const fetchUserProgress = async () => {
    try {
      const res = await api.get<UserProgress[]>('/api/admin/progress');
      setProgress(res);
    } catch (err) {
      console.error('Failed to fetch user progress:', err);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get<Course[]>('/api/admin/courses'); // Assuming an endpoint to fetch all courses
      setCourses(res);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    }
  };

  // Handlers for new module creation (within a course context)
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
      videos: [...newModule.videos, { title: '', url: '', duration: 0, resourcesUrl: '', notesUrl: '' }],
    });
  };

  const removeNewVideoField = (index: number) => {
    const updatedVideos = newModule.videos.filter((_, i) => i !== index);
    setNewModule({ ...newModule, videos: updatedVideos });
  };

  // Handler for submitting a new module to the selected course
  const handleSubmitNewModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseIdForModules) {
      alert('Please select a course to add modules to.');
      return;
    }
    
    // Validate that all videos have valid duration (not zero)
    const invalidVideos = newModule.videos.filter(video => !video.duration || Number(video.duration) <= 0);
    if (invalidVideos.length > 0) {
      alert('Please ensure all videos have a video duration greater than zero (in minutes).');
      return;
    }
    
    try {
      // Convert minutes to seconds before sending
      const moduleToSubmit = {
        ...newModule,
        videos: newModule.videos.map(video => ({
          ...video,
          duration: Number(video.duration) * 60 // Convert minutes to seconds
        }))
      };
      
      // Assuming POST /api/admin/courses/:courseId/modules creates a new module for the specified course
      const res = await api.post<Module>(`/api/admin/courses/${selectedCourseIdForModules}/modules`, moduleToSubmit);
      alert('Module created successfully');
      setNewModule({ title: '', videos: [{ title: '', url: '', duration: 0 }] }); // Reset form
      fetchModulesForCourse(selectedCourseIdForModules); // Refresh modules list for the current course
    } catch (err) {
      console.error('Failed to create module:', err);
      alert('Failed to create module');
    }
  };

  // Handlers for editing an existing module
  const handleEditModule = (module: Module) => {
    setEditingModuleId(module._id || module.id || null);
    setEditedModule({
      ...module,
      videos: module.videos.map(video => ({
        ...video,
        duration: video.duration ? video.duration / 60 : 0, // Convert seconds to minutes for display
        resourcesUrl: video.resourcesUrl || '',
        notesUrl: video.notesUrl || '',
      }))
    });
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
        videos: [...editedModule.videos, { title: '', url: '', duration: 0, resourcesUrl: '', notesUrl: '' }],
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
      // Validate that all videos have valid duration (not zero)
      const invalidVideos = editedModule.videos.filter(video => !video.duration || Number(video.duration) <= 0);
      if (invalidVideos.length > 0) {
        alert('Please ensure all videos have a video duration greater than zero (in minutes).');
        return;
      }
      
      try {
        // Convert minutes to seconds before sending
        const moduleToUpdate = {
          ...editedModule,
          videos: editedModule.videos.map(video => ({
            ...video,
            duration: Number(video.duration) * 60 // Convert minutes to seconds
          }))
        };
        
        // Assuming PUT /api/admin/modules/:moduleId updates a module
        const res = await api.put<Module>(`/api/admin/modules/${editedModule._id}`, moduleToUpdate);
        alert('Module updated successfully');
        setEditingModuleId(null);
        setEditedModule(null);
        if (selectedCourseIdForModules) {
          fetchModulesForCourse(selectedCourseIdForModules); // Refresh modules list for the current course
        }
      } catch (err) {
        console.error('Failed to update module:', err);
        alert('Failed to update module');
      }
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (window.confirm('Are you sure you want to delete this module?')) {
      try {
        // Assuming DELETE /api/admin/modules/:moduleId deletes a module
        const res = await api.delete<void>(`/api/admin/modules/${moduleId}`);
        alert('Module deleted successfully');
        if (selectedCourseIdForModules) {
          fetchModulesForCourse(selectedCourseIdForModules); // Refresh modules list for the current course
        }
      } catch (err) {
        console.error('Failed to delete module:', err);
        alert('Failed to delete module');
      }
    }
  };

  // --- New Course Creation Handlers ---

  const handleNewCourseChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setNewCourse({ ...newCourse, [e.target.name]: e.target.value });
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post<Course>('/api/admin/courses', newCourse); // Assuming POST /api/admin/courses creates a new course
      alert('Course created successfully!');
      const newCourseReset = { title: '', description: '', modules: [], skills: '', tools: '', level: 'beginner' as 'beginner', duration: '0', _id: '' };
      if (response && response._id) {
        newCourseReset._id = response._id;
      }
      setNewCourse(newCourseReset); // Reset form
      fetchCourses(); // Refresh the list of courses
      setViewMode('modules'); // Navigate to module management view
      // Optionally, set the newly created course as the selected one for module management
      if (response && response._id) {
        setSelectedCourseIdForModules(response._id);
      }
    } catch (err) {
      console.error('Failed to create course:', err);
      alert('Failed to create course');
    }
  };

  // Handler to select a course for module management
  const handleSelectCourseForModules = (courseId: string) => {
    setSelectedCourseIdForModules(courseId);
    setViewMode('modules'); // Switch to modules view
    fetchModulesForCourse(courseId); // Fetch modules for the selected course
  };

  // --- Render Logic ---

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      <div className="flex space-x-4 mb-8 overflow-x-auto">
        <Button onClick={() => setViewMode('overview')} variant={viewMode === 'overview' ? 'default' : 'outline'}>Overview</Button>
        <Button onClick={() => setViewMode('users')} variant={viewMode === 'users' ? 'default' : 'outline'}>Users</Button>
        <Button onClick={() => setViewMode('activity')} variant={viewMode === 'activity' ? 'default' : 'outline'}>Daily Activity</Button>
        <Button onClick={() => setViewMode('progress')} variant={viewMode === 'progress' || viewMode === 'student-progress' ? 'default' : 'outline'}>Student Progress</Button>
        <Button onClick={() => setViewMode('modules')} variant={viewMode === 'modules' ? 'default' : 'outline'}>Manage Modules</Button>
        <Button onClick={() => { setViewMode('create-course'); }} variant={viewMode === 'create-course' ? 'default' : 'outline'}>Create Course</Button>
      </div>

      {viewMode === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="bg-blue-100 dark:bg-blue-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 text-foreground">
              <CardTitle className="text-sm font-medium">Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="text-foreground">
              <div className="text-2xl font-bold">{stats.userCount}</div>
              <p className="text-xs text-muted-foreground">Total registered users</p>
            </CardContent>
          </Card>
          <Card className="bg-green-100 dark:bg-green-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 text-foreground">
              <CardTitle className="text-sm font-medium">Daily Activity</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="text-foreground">
              <div className="text-2xl font-bold">{stats.dailyCount}</div>
              <p className="text-xs text-muted-foreground">Users active today (placeholder)</p>
            </CardContent>
          </Card>
          <Card className="bg-purple-100 dark:bg-purple-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 text-foreground">
              <CardTitle className="text-sm font-medium">Most Watched Videos</CardTitle>
              <VideoIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="text-foreground">
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
      )}

      {viewMode === 'users' && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">All Users</h2>
          <div className="grid grid-cols-1 gap-4">
            {users.length > 0 ? (
              users.map((user) => (
                <Card key={user._id} className="text-foreground">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{user.username}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <Button onClick={() => {
                      setSelectedStudentId(user._id);
                      setViewMode('student-progress');
                    }}>
                      View Progress
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p>No users found.</p>
            )}
          </div>
        </div>
      )}

      {viewMode === 'activity' && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Daily Activity</h2>
          <div className="grid grid-cols-1 gap-4">
            {dailyActivity.length > 0 ? (
              dailyActivity.map((activity, index) => (
                <Card key={index} className="text-foreground">
                  <CardContent className="p-4">
                    <p className="font-semibold">{activity.username}</p>
                    <p className="text-sm text-muted-foreground">Email: {activity.email}</p>
                    <p className="text-sm text-muted-foreground">Login Time: {activity.loginTime}</p>
                    <p className="text-sm text-muted-foreground">Logout Time: {activity.logoutTime}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p>No daily activity found for today.</p>
            )}
          </div>
        </div>
      )}

      {viewMode === 'modules' && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Manage Modules</h2>
          {/* Course selection for module management */}
          <div className="mb-4">
            <Label htmlFor="courseSelect" className="mr-2 dark:text-gray-200">Select Course:</Label>
            <select
              id="courseSelect"
              value={selectedCourseIdForModules || ''}
              onChange={(e) => handleSelectCourseForModules(e.target.value)}
              className="p-2 border rounded 
               bg-white text-gray-900 border-gray-300 
               focus:ring-indigo-500 focus:border-indigo-500
               dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600"
            >
              <option value="" disabled>--Select a Course--</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>{course.title}</option>
              ))}
            </select>
            {selectedCourseIdForModules && (
              <Button variant="outline" size="sm" onClick={() => setViewMode('manage-course')} className="ml-4">
                Manage Selected Course
              </Button>
            )}
          </div>

          {selectedCourseIdForModules && (
            <>
              <h3 className="text-md font-semibold mb-2">Modules for: {courses.find(c => c._id === selectedCourseIdForModules)?.title}</h3>
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
                            <Card key={index} className="mb-4 p-4 text-foreground">
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
                          <div>
                            <Label htmlFor={`editedDuration-${index}`}>
                              Video Duration (minutes) *
                            </Label>
                            <Input
                              id={`editedDuration-${index}`}
                              type="number"
                              name="duration"
                              min="1"
                              step="0.1"
                              value={video.duration || ''}
                              onChange={(e) => handleEditedVideoChange(index, e)}
                              required
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

              <div className="mt-8">
                <h2 className="text-lg font-semibold mb-4">Create New Module for {courses.find(c => c._id === selectedCourseIdForModules)?.title}</h2>
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
                    <Card key={index} className="mb-4 p-4 text-foreground">
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
                          <div>
                            <Label htmlFor={`newDuration-${index}`}>
                              Video Duration (minutes) *
                            </Label>
                            <Input
                              id={`newDuration-${index}`}
                              type="number"
                              name="duration"
                              min="1"
                              step="0.1"
                              value={video.duration || ''}
                              onChange={(e) => handleNewVideoChange(index, e)}
                              required
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
                  <Button type="button" onClick={addNewVideoField} className="mr-2">
                    Add Video
                  </Button>
                  <Button type="submit">Create Module</Button>
                </form>
              </div>
            </>
          )}
        </div>
      )}

      {viewMode === 'create-course' && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Create New Course</h2>
          <form onSubmit={handleCreateCourse} className="space-y-4">
            <div>
              <Label htmlFor="courseTitle">Course Title</Label>
              <Input
                id="courseTitle"
                type="text"
                name="title"
                value={newCourse.title}
                onChange={handleNewCourseChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="courseDescription">Course Description</Label>
              <textarea
                id="courseDescription"
                name="description"
                value={newCourse.description}
                onChange={handleNewCourseChange}
                className="mt-1 block w-full rounded-md shadow-sm sm:text-sm p-2 
             bg-white text-gray-900 placeholder-gray-500 
             border border-gray-300 
             focus:border-indigo-500 focus:ring-indigo-500 
             dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400"
                required
              />
            </div>
            <div>
              <Label htmlFor="courseSkills">Skills</Label>
              <Input
                id="courseSkills"
                type="text"
                name="skills"
                value={newCourse.skills}
                onChange={handleNewCourseChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="courseTools">Tools</Label>
              <Input
                id="courseTools"
                type="text"
                name="tools"
                value={newCourse.tools}
                onChange={handleNewCourseChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="courseLevel">Level</Label>
              <select
                id="courseLevel"
                name="level"
                value={newCourse.level}
                onChange={handleNewCourseChange}
                className="p-2 border rounded mt-1 block w-full shadow-sm sm:text-sm 
             bg-white text-gray-900 border-gray-300 
             focus:border-indigo-500 focus:ring-indigo-500 
             dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600"
                required
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <Label htmlFor="courseDuration">Total Course Duration (e.g., "10 hours", "5 weeks")</Label>
              <Input
                id="courseDuration"
                type="text"
                name="duration"
                value={newCourse.duration}
                onChange={handleNewCourseChange}
                placeholder="e.g., 10 hours"
                required
              />
            </div>
            <Button type="submit">Create Course</Button>
            <Button type="button" variant="outline" onClick={() => setViewMode('overview')}>Cancel</Button>
          </form>
        </div>
      )}

      {viewMode === 'manage-course' && selectedCourseIdForModules && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Manage Course: {courses.find(c => c._id === selectedCourseIdForModules)?.title}</h2>
          <Button variant="outline" onClick={() => setViewMode('modules')} className="mb-4">
            Back to Module List
          </Button>
          {/* This section could potentially show course details and allow editing them */}
          {/* For now, it just serves as a confirmation and a way to go back */}
        </div>
      )}

      {(viewMode === 'progress' || viewMode === 'student-progress') && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              {selectedStudentId ? `Progress for ${users.find(u => u._id === selectedStudentId)?.username || 'Unknown Student'}` : 'All Student Progress'}
            </h2>
            {selectedStudentId && (
              <Button onClick={() => { setSelectedStudentId(null); setViewMode('progress'); }} variant="outline">
                Back to All Students
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4">
            {progress.length > 0 ? (
              progress
                .filter(item => (selectedStudentId ? item.user._id === selectedStudentId : true))
                .map((item) => {
                  // Find the total duration for the lesson from the modules data
                  const lessonDuration = modules
                    .flatMap(m => m.videos)
                    .find(video => video._id === item.lessonId)?.duration || 1; // Default to 1 to avoid division by zero

                  return (
                    <Card key={item._id} className="relative text-foreground">
                      <CardContent className="p-4 text-foreground">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{item.lessonTitle}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.user.username} ({item.user.email})
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Watched: {item.watchedSeconds.toFixed(0)} seconds / {lessonDuration.toFixed(0)} seconds
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Last Updated: {new Date(item.updatedAt).toLocaleString()}
                            </p>
                          </div>
                          {item.completed ? (
                            <span className="text-green-500 flex items-center">
                              <CheckCircle className="w-5 h-5 mr-1" /> Completed
                            </span>
                          ) : (
                            <span className="text-yellow-500 flex items-center">
                              <Clock className="w-5 h-5 mr-1" /> In Progress
                            </span>
                          )}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${Math.min((item.watchedSeconds / lessonDuration) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
            ) : (
              <p>No student progress found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
