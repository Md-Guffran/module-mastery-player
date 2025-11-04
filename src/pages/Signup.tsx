import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { API_BASE_URL } from '@/config';
import { toast } from '@/components/ui/sonner';

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

  const validateEmail = (email: string): boolean => {
    // Only allow emails with @mondee.com domain
    const emailRegex = /^[^\s@]+@mondee\.com$/i;
    return emailRegex.test(email);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Validate email format if it's the email field
    if (name === 'email' && value && !validateEmail(value)) {
      // Don't prevent typing, but we'll show error on submit
    }
    
    setFormData({ ...formData, [name]: value });
  };

  const onRadioChange = (value: string) => {
    setFormData({ ...formData, role: value });
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate email domain before submission
    if (!validateEmail(email)) {
      toast.error('Invalid Email', {
        description: 'Email must be from @mondee.com domain',
      });
      return;
    }
    
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { role, ...submissionData } = formData;
      const res = await axios.post(`${API_BASE_URL}/api/auth/signup`, submissionData);
      console.log(res.data);
      toast.success('Account created successfully!');
      navigate('/signin');
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.response?.data?.msg || err.response?.data?.message || 'Failed to create account. Please try again.';
      toast.error('Signup Failed', {
        description: errorMessage,
      });
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
                placeholder="user@mondee.com"
                name="email"
                value={email}
                onChange={onChange}
                required
                pattern="[^\s@]+@mondee\.com"
                title="Email must be from @mondee.com domain"
              />
              {email && !validateEmail(email) && (
                <p className="text-sm text-red-500">Email must be from @mondee.com domain</p>
              )}
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
