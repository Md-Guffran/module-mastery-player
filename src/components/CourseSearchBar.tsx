/// <reference types="node" />
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { Course } from '@/types/course';
import { API_BASE_URL } from '@/config';
import axios from 'axios';

interface CourseSearchBarProps {
  onCourseSelect?: (courseId: string) => void;
  onSearchChange?: (searchTerm: string) => void;
}

const CourseSearchBar: React.FC<CourseSearchBarProps> = ({ onCourseSelect, onSearchChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(async (query: string) => {
    console.log('fetchSuggestions called with query:', query);
    if (!query.trim()) {
      setSuggestions([]);
      setLoading(false);
      setShowSuggestions(false); // Hide suggestions if query is empty
      console.log('Query empty, suggestions cleared, showSuggestions false');
      return;
    }
    setLoading(true);
    console.log('Loading set to true for query:', query);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/course/search?q=${query}`);
      console.log('API response data:', res.data);
      setSuggestions(res.data);
      setShowSuggestions(true); // Show suggestions after data is fetched
      console.log('Suggestions set, showSuggestions true');
    } catch (error) {
      console.error('Failed to fetch course suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(true); // Still show the box to display "No courses found" on error
      console.log('Error fetching suggestions, suggestions cleared, showSuggestions true');
    } finally {
      setLoading(false);
      console.log('Loading set to false');
    }
  }, []);

  useEffect(() => {
    console.log('useEffect for searchTerm triggered. Current searchTerm:', searchTerm);
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      console.log('Debounce timeout cleared.');
    }

    if (searchTerm) {
      debounceTimeoutRef.current = setTimeout(() => {
        console.log('Debounce finished, calling fetchSuggestions for:', searchTerm);
        fetchSuggestions(searchTerm);
      }, 500); // Debounce of 500ms
    } else {
      setSuggestions([]);
      setShowSuggestions(false); // Hide suggestions if search term is empty
      console.log('Search term empty, suggestions cleared, showSuggestions false');
    }

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        console.log('Cleanup: Debounce timeout cleared.');
      }
    };
  }, [searchTerm, fetchSuggestions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        console.log('Clicked outside, showSuggestions false');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    console.log('Input changed, new searchTerm:', newSearchTerm);
    // Notify parent component of search term change
    if (onSearchChange) {
      onSearchChange(newSearchTerm);
    }
  };

  const handleSuggestionClick = (courseId: string) => {
    if (onCourseSelect) {
      onCourseSelect(courseId);
    }
    setShowSuggestions(false);
    const clearedTerm = '';
    setSearchTerm(clearedTerm); // Clear search term after selection
    if (onSearchChange) {
      onSearchChange(clearedTerm);
    }
    console.log('Suggestion clicked, showSuggestions false, searchTerm cleared');
  };

  console.log('Rendering CourseSearchBar. State: showSuggestions:', showSuggestions, 'loading:', loading, 'searchTerm:', searchTerm, 'suggestions.length:', suggestions.length);

  return (
    <div className="relative w-full max-w-md mx-auto" ref={searchBarRef}>
      <Input
        type="text"
        placeholder="Search for courses..."
        value={searchTerm}
        onChange={handleInputChange}
        className="pr-10"
      />
      {loading && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full bg-popover border border-border rounded-md shadow-lg mt-1 max-h-60 overflow-auto">
          {loading ? (
            <div className="px-4 py-2 text-muted-foreground">Loading...</div>
          ) : (
            <ul className="p-0 m-0">
              {suggestions.map((course) => (
                <li
                  key={course._id}
                  className="px-4 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground"
                  onClick={() => handleSuggestionClick(course._id)}
                >
                  <Link to={`/course/${course._id}`} className="block">
                    {course.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseSearchBar;
