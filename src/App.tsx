import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Signup from "./pages/Signup";
import Signin from "./pages/Signin";
import AdminDashboard from "./pages/AdminDashboard";
import PrivateRoute from "./components/PrivateRoute";
// import CoursesPage from "./pages/Courses"; // Removed as Index.tsx now handles course listing

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          {/* Removed the /courses route as Index.tsx now handles course listing */}
          {/* <Route path="/courses" element={<CoursesPage />} /> */}
          
          {/* The /course-player/:courseId route might still be relevant if Index.tsx
              navigates to a specific course player view via URL parameter,
              but for now, Index.tsx handles the selection internally.
              If Index.tsx is the sole entry point, this route might be redundant
              or need to be handled by Index.tsx itself.
              For now, keeping it as a placeholder if direct access is needed. */}
          <Route path="/course-player/:courseId" element={<Index />} /> {/* Redirecting to Index for now */}

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
