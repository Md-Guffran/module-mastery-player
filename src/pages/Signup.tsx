import React, { useState } from 'react';
import api from '../apiClient';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { API_BASE_URL } from '@/config';

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',
    adminVerificationKey: ''
  });
  const navigate = useNavigate();

  const { username, email, password, role, adminVerificationKey } = formData;

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onRadioChange = (value: string) => {
    setFormData({ ...formData, role: value });
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { role, ...submissionData } = formData;
      const res = await api.post('/api/auth/signup', submissionData);
      console.log(res.data);
      navigate('/signin');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>Enter your details below to create your account</CardDescription>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Your Name"
                name="username"
                value={username}
                onChange={onChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                name="email"
                value={email}
                onChange={onChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                name="password"
                value={password}
                onChange={onChange}
                minLength={6}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>Role</Label>
              <RadioGroup
                defaultValue="user"
                className="flex"
                onValueChange={onRadioChange}
                name="role"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="user" id="user" />
                  <Label htmlFor="user">User</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="admin" id="admin" />
                  <Label htmlFor="admin">Admin</Label>
                </div>
              </RadioGroup>
            </div>
            {role === 'admin' && (
              <div className="grid gap-2">
                <Label htmlFor="adminVerificationKey">Admin Verification Key</Label>
                <Input
                  id="adminVerificationKey"
                  type="password"
                  name="adminVerificationKey"
                  value={adminVerificationKey}
                  onChange={onChange}
                  required
                />
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button className="w-full" type="submit">
              Sign Up
            </Button>
            <p className="mt-4 text-xs text-center text-gray-700">
              Already have an account?{' '}
              <Link to="/signin" className=" text-blue-600 hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Signup;
