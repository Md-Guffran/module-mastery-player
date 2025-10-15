import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation

// Define the expected structure for a course card item
interface CourseCardItem {
  id: string;
  title: string;
  lecture: string;
  progress: string;
  imageUrl: string;
  status: string;
  statusColor: string;
}

// Define the structure of a Module as returned by the API
interface ApiModule {
  _id?: string;
  id?: string;
  title: string;
  videos: { // Simplified Video structure for transformation
    title?: string;
    url?: string;
  }[];
}

const MyCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<CourseCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/course'); // Fetch from the backend API
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: ApiModule[] = await response.json();

        // Transform API data to match the CourseCardItem structure
        const transformedCourses: CourseCardItem[] = data.map((module) => ({
          id: module._id || module.id || `temp-id-${Math.random()}`, // Use _id or id, fallback to random
          title: module.title,
          lecture: module.videos && module.videos.length > 0 ? module.videos[0].title || 'Module Overview' : 'Module Overview', // Use first video title or default
          progress: '0/0 Modules Completed', // Placeholder, as API doesn't provide this
          imageUrl: '/path/to/default-course-image.jpg', // Placeholder image
          status: 'Start Learning', // Default status
          statusColor: 'border border-pink-500 text-pink-500 hover:bg-pink-50', // Default status color
        }));

        setCourses(transformedCourses);
      } catch (err: any) {
        console.error("Failed to fetch courses:", err);
        setError('Failed to load courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []); // Empty dependency array means this effect runs once on mount

  if (loading) {
    return <div className="container mx-auto p-4 text-center">Loading courses...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Courses</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.length > 0 ? (
          courses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow-md p-4 flex flex-col justify-between">
              <Link to={`/courses/${course.id}`} className="block"> {/* Link to course detail page */}
                <div className="flex items-center mb-2">
                  <div className="w-24 h-24 bg-gray-300 rounded mr-4 flex items-center justify-center">
                    {/* Placeholder for Course Image */}
                    <span className="text-gray-600">Course Image</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">{course.title}</h2>
                    <p className="text-sm text-gray-600">{course.lecture}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{course.progress}</p>
              </Link>
              <button className={`w-full py-2 px-4 rounded ${course.statusColor}`}>
                {course.status}
              </button>
            </div>
          ))
        ) : (
          // Display a message if no courses are found after loading
          <div className="col-span-full text-center text-gray-600">No courses available.</div>
        )}

        {/* Placeholder for "Something Cool is being prepared" card - this might be removed or handled differently */}
        {/* If you want to keep this, ensure it's conditionally rendered or managed */}
        {/* For now, let's assume it's a static element and not part of the dynamic course list */}
        <div className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center justify-center">
          <div className="w-24 h-24 bg-gray-300 rounded mb-4 flex items-center justify-center">
            {/* Placeholder for Coming Soon Image */}
            <span className="text-gray-600">Coming Soon</span>
          </div>
          <p className="text-sm text-gray-600 text-center">Something Cool is being prepared</p>
        </div>
      </div>
    </div>
  );
};

export default MyCoursesPage;
