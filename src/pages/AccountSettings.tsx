import React, { useState, useEffect } from 'react';
import api from '../api';
import Header from '../components/Header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  // Assuming mobile number can be added here if needed
}

const AccountSettings: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState(''); // For password change
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const res = await api.get<User>('/api/auth');
        setUser(res);
        setUsername(res.username);
        setEmail(res.email);
      } catch (err) {
        console.error('Failed to fetch user details:', err);
        setError('Failed to load user details for editing.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/api/auth/profile', { username, email });
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (err) {
      console.error('Failed to update profile:', err);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/api/auth/password', { currentPassword, newPassword: password });
      toast({
        title: "Password Updated",
        description: "Your password has been updated successfully.",
      });
      setPassword('');
      setCurrentPassword('');
    } catch (err) {
      console.error('Failed to update password:', err);
      toast({
        title: "Error",
        description: "Failed to update password. Please check your current password and try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="container mx-auto p-4 pt-24">
          <p>Loading account settings...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="container mx-auto p-4 pt-24">
          <p className="text-red-500">{error}</p>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Header />
        <div className="container mx-auto p-4 pt-24">
          <p>No user data found. Please sign in to manage account settings.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto p-4 pt-24">
        <h1 className="text-2xl font-bold mb-4">Account Settings</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Profile Update Form */}
          <div className="bg-card p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {/* Add mobile number field if applicable */}
              <Button type="submit">Update Profile</Button>
            </form>
          </div>

          {/* Password Update Form */}
          <div className="bg-card p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Change Password</h2>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit">Change Password</Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountSettings;
