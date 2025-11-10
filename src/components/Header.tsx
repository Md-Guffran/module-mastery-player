import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, Home, Search, ChevronDown, Globe, Menu } from 'lucide-react';
import { API_BASE_URL } from '@/config';
import ThemeToggle from './ThemeToggle';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onMenuClick?: () => void;
  isMobile?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, isMobile }) => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const navigate = useNavigate();
  const location = useLocation();
  
  // Sync search term with URL search params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('query') || '';
    setSearchTerm(query);
  }, [location.search]);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await axios.get(`${API_BASE_URL}/api/auth`, {
            headers: { 'x-auth-token': token },
          });
          setUserRole(res.data.role);
          setUsername(res.data.username); // Assuming username is returned
        } catch (err) {
          console.error('Failed to fetch user data:', err);
          setUserRole(null);
          setUsername(null);
        }
      } else {
        setUserRole(null);
        setUsername(null);
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
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left section: Mobile Menu, Logo and Navigation */}
        <div className="flex items-center space-x-4">
          {isMobile && onMenuClick && (
            <Button variant="ghost" size="icon" onClick={onMenuClick} className="md:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          )}
          <Link to="/" className="flex items-center space-x-1 max-w-[120px] flex-shrink-0 overflow-hidden">
            <img src="/images/font.png" alt="Company Name" className="h-6 ml-1 object-contain flex-shrink-0" />
          </Link>
          <nav className="hidden md:flex items-center space-x-4">
            <Link to="/" className="hover:text-primary transition-colors flex items-center">
              Home
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center hover:text-primary transition-colors">
                Learn <ChevronDown className="ml-1 h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => navigate('/')}>Courses</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/assessments')}>Assessments</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link to="/certification" className="hover:text-primary transition-colors">
              Certification
            </Link>
          </nav>
        </div>

        {/* Right section: Search, Dashboard, Language, User Profile */}
        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search courses..."
              className="pl-8 w-[200px] rounded-full"
              value={searchTerm}
              onChange={(e) => {
                const newSearchTerm = e.target.value;
                setSearchTerm(newSearchTerm);
                
                // If on home page, update URL with search param
                if (location.pathname === '/') {
                  const params = new URLSearchParams();
                  if (newSearchTerm.trim()) {
                    params.set('query', newSearchTerm.trim());
                    navigate(`/?${params.toString()}`, { replace: true });
                  } else {
                    navigate('/', { replace: true });
                  }
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchTerm.trim()) {
                  // If on home page, just update the URL (already handled in onChange)
                  // Otherwise, navigate to search page
                  if (location.pathname !== '/') {
                    navigate(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
                  }
                }
              }}
            />
          </div>
          {isAuthenticated && userRole === 'admin' && (
            <Button asChild variant="default" className="bg-purple-600 hover:bg-purple-700 text-white rounded-full hidden md:block">
              <Link to="/admin">Admin Dashboard</Link>
            </Button>
          )}
          {isAuthenticated && userRole !== 'admin' && (
            <Button asChild variant="default" className="bg-purple-600 hover:bg-purple-700 text-white rounded-full hidden md:block">
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          )}
          {isAuthenticated && (
            <Link to={userRole === 'admin' ? '/admin' : '/dashboard'} className="md:hidden hover:text-primary transition-colors">
              Dashboard
            </Link>
          )}

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center">
                <Avatar className="h-8 w-8 border-2 border-primary">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {username ? username.charAt(0).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="ml-1 h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/account-details')}>My Account</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/account-settings')}>Account Settings</DropdownMenuItem>
                <DropdownMenuItem>Support</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/my-courses')}>My Library</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link to="/signin">Sign In</Link>
            </Button>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
