import { createBrowserRouter, RouterProvider, Route } from 'react-router-dom';

// Configure React Router to suppress future flags warnings
// These are just informational warnings and don't affect functionality
const routerConfig = {
  future: {
    // Opt-in to v7 behavior for startTransition
    v7_startTransition: true,
    // Opt-in to v7 behavior for relative splat path
    v7_relativeSplatPath: true,
  }
};

export { routerConfig };