import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, Home } from 'lucide-react';
import { API_BASE_URL } from '@/config';
import ThemeToggle from './ThemeToggle';
import axios from 'axios';

const Header: React.FC = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await axios.get(`${API_BASE_URL}/api/auth`, {
            headers: { 'x-auth-token': token },
          });
          setUserRole(res.data.role);
        } catch (err) {
          console.error('Failed to fetch user data:', err);
          setUserRole(null);
        }
      } else {
        setUserRole(null);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await axios.post(`${API_BASE_URL}/api/auth/signout`, {}, {
          headers: { 'x-auth-token': token },
        });
      } catch (err) {
        console.error('Failed to sign out:', err);
      } finally {
        localStorage.removeItem('token');
        setUserRole(null);
        navigate('/signin');
      }
    }
  };

  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isAuthenticated && (
              <Button asChild variant="ghost" size="sm">
                <Link to="/">
                  <Home className="w-4 h-4 mr-2" /> Home
                </Link>
              </Button>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {userRole === 'admin' && isAuthenticated && (
              <Button asChild variant="default" size="sm">
                <Link to="/admin">Admin Dashboard</Link>
              </Button>
            )}
            {userRole !== 'admin' && isAuthenticated && (
              <Button asChild variant="default" size="sm">
                <Link to="/dashboard">My Progress Dashboard</Link>
              </Button>
            )}
            {isAuthenticated && (
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </Button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

