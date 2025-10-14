import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    userCount: 0,
    dailyCount: 0,
    mostWatchedVideos: [],
  });
  const [file, setFile] = useState<File | null>(null);

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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold">Daily Count</h2>
          <p className="text-3xl">{stats.dailyCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold">Most Watched Videos</h2>
          <ul className="list-disc list-inside">
            {stats.mostWatchedVideos && stats.mostWatchedVideos.map((video, index) => (
              <li key={index}>{video}</li>
            ))}
          </ul>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold">Users</h2>
          <p className="text-3xl">{stats.userCount}</p>
        </div>
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
