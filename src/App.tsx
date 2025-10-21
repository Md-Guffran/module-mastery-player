import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./context/ThemeContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Signup from "./pages/Signup";
import Signin from "./pages/Signin";
import AdminDashboard from "./pages/AdminDashboard";
import PrivateRoute from "./components/PrivateRoute";
import CoursePlayer from "./pages/CoursePlayer"; // Import CoursePlayer
import CourseDescription from "./pages/CourseDescription";
// import CoursesPage from "./pages/Courses"; // Removed as Index.tsx now handles course listing

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />
          <Route
            path="/admin"
            element={
              <PrivateRoute requiredRole="admin">
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          {/* Removed the /courses route as Index.tsx now handles course listing */}
          {/* <Route path="/courses" element={<CoursesPage />} /> */}
          
          {/* Route for the Course Player page */}
          <Route path="/course-player/:courseId/:moduleId/:videoId" element={<PrivateRoute><CoursePlayer /></PrivateRoute>} />
          <Route path="/course/:courseId" element={<PrivateRoute><CourseDescription /></PrivateRoute>} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </ThemeProvider>
</QueryClientProvider>
);

export default App;
