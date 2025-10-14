import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Module, Video } from '../types/course'; // Import the new interfaces
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    userCount: 0,
    dailyCount: 0,
    mostWatchedVideos: [],
  });
  const [file, setFile] = useState<File | null>(null);

  const [newModule, setNewModule] = useState<Module>({ title: '', videos: [] });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/admin/stats', {
          headers: { 'x-auth-token': token },
        });
        setStats(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const onFileUpload = async () => {
    if (!file) {
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/admin/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-auth-token': token,
        },
      });
      alert('File uploaded successfully');
    } catch (err) {
      console.error(err);
      alert('File upload failed');
    }
  };

  const handleModuleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewModule({ ...newModule, title: e.target.value });
  };

  const handleVideoChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const updatedVideos = newModule.videos.map((video, i) =>
      i === index ? { ...video, [e.target.name]: e.target.value } : video
    );
    setNewModule({ ...newModule, videos: updatedVideos });
  };

  const addVideoField = () => {
    setNewModule({
      ...newModule,
      videos: [...newModule.videos, { title: '', url: '' }],
    });
  };

  const removeVideoField = (index: number) => {
    const updatedVideos = newModule.videos.filter((_, i) => i !== index);
    setNewModule({ ...newModule, videos: updatedVideos });
  };

  const handleSubmitModule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/admin', newModule, {
        headers: { 'x-auth-token': token },
      });
      alert('Module created successfully');
      setNewModule({ title: '', videos: [] }); // Reset form
    } catch (err) {
      console.error(err);
      alert('Failed to create module');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Daily Count</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl">{stats.dailyCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Most Watched Videos</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside">
              {stats.mostWatchedVideos &&
                stats.mostWatchedVideos.map((video, index) => (
                  <li key={index}>{video}</li>
                ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl">{stats.userCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Create New Module</h2>
        <form onSubmit={handleSubmitModule} className="space-y-4">
          <div>
            <Label htmlFor="moduleTitle">Module Title</Label>
            <Input
              id="moduleTitle"
              type="text"
              value={newModule.title}
              onChange={handleModuleChange}
              required
            />
          </div>

          <h3 className="text-md font-semibold mt-6 mb-2">Videos</h3>
          {newModule.videos.map((video, index) => (
            <Card key={index} className="mb-4 p-4">
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`videoTitle-${index}`}>Video Title</Label>
                    <Input
                      id={`videoTitle-${index}`}
                      type="text"
                      name="title"
                      value={video.title}
                      onChange={(e) => handleVideoChange(index, e)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor={`videoUrl-${index}`}>Video URL</Label>
                    <Input
                      id={`videoUrl-${index}`}
                      type="url"
                      name="url"
                      value={video.url}
                      onChange={(e) => handleVideoChange(index, e)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor={`resourcesUrl-${index}`}>
                      Resources URL (Optional)
                    </Label>
                    <Input
                      id={`resourcesUrl-${index}`}
                      type="url"
                      name="resourcesUrl"
                      value={video.resourcesUrl || ''}
                      onChange={(e) => handleVideoChange(index, e)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`notesUrl-${index}`}>
                      Notes URL (Optional)
                    </Label>
                    <Input
                      id={`notesUrl-${index}`}
                      type="url"
                      name="notesUrl"
                      value={video.notesUrl || ''}
                      onChange={(e) => handleVideoChange(index, e)}
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => removeVideoField(index)}
                  className="mt-4"
                >
                  Remove Video
                </Button>
              </CardContent>
            </Card>
          ))}
          <Button type="button" onClick={addVideoField} className="mr-2">
            Add Video
          </Button>
          <Button type="submit">Create Module</Button>
        </form>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold">Add Modules from CSV</h2>
        <div className="mt-4">
          <input type="file" accept=".csv,.xlsx,.xls" onChange={onFileChange} />
          <button
            onClick={onFileUpload}
            className="ml-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
