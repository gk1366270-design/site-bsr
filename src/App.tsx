import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from 'react';
import LoadingFallback from './components/LoadingFallback';
import ErrorBoundary from './components/ErrorBoundary';
import AuthProvider from './context/AuthContext';
import MaintenanceModal from './components/MaintenanceModal';

// Lazy load routes for better performance
const Index = lazy(() => import('./pages/Index'));
const Login = lazy(() => import('./pages/Login'));
const Profile = lazy(() => import('./pages/profile/index'));
const RaceDetail = lazy(() => import('./pages/RaceDetail'));
const NewsDetail = lazy(() => import('./pages/NewsDetail'));
const Standings = lazy(() => import('./pages/Standings'));
const News = lazy(() => import('./pages/News'));
const Races = lazy(() => import('./pages/Races'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const LiveTiming = lazy(() => import('./pages/LiveTiming'));
const NotFound = lazy(() => import('./pages/NotFound'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback />}>
            <BrowserRouter>
              <AuthProvider>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/news" element={<News />} />
                  <Route path="/news/:id" element={<NewsDetail />} />
                  <Route path="/races" element={<Races />} />
                  <Route path="/race/:id" element={<RaceDetail />} />
                  <Route path="/standings" element={<Standings />} />
                  <Route path="/live-timing" element={<LiveTiming />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <MaintenanceModal />
              </AuthProvider>
            </BrowserRouter>
          </Suspense>
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
