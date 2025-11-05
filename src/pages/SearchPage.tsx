import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api';
import Header from '../components/Header';
import { Course } from '../types/course';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const SearchPage: React.FC = () => {
  const [searchResults, setSearchResults] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const searchQuery = new URLSearchParams(location.search).get('query');

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchQuery) {
        setSearchResults([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        // Assuming an API endpoint for searching courses
        const res = await api.get<Course[]>(`/api/course/search?query=${encodeURIComponent(searchQuery)}`);
        setSearchResults(res);
      } catch (err) {
        console.error('Failed to fetch search results:', err);
        setError('Failed to load search results.');
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchQuery]);

  return (
    <>
      <Header />
      <div className="container mx-auto p-4 pt-24">
        <h1 className="text-2xl font-bold mb-4">Search Results for "{searchQuery}"</h1>

        {loading && <p>Loading search results...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && searchResults.length === 0 && (
          <p>No courses found matching your search query.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchResults.map((course) => (
            <Link to={`/course/${course._id}`} key={course._id}>
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle>{course.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground">{course.description}</p>
                  {/* Add more course details as needed */}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default SearchPage;
