import React, { createContext, useState, useEffect, ReactNode } from 'react';
import api from '../apiClient';

interface User {
  role: string;
  email?: string;
  // add more properties as needed
}

interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => void;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  logout: () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await api.get('/api/auth', {
          headers: { 'x-auth-token': token },
        });
        setUser(res.data);
      } catch (err) {
        localStorage.removeItem('token');
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const logout = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await api.post('/api/auth/signout', {}, {
        headers: { 'x-auth-token': token },
      });
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};
