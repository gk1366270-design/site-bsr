import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Dynamic configuration based on environment
const LOCAL_IP = '192.168.1.66';
const LOCAL_BACKEND_PORT = 8080;

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Set proxy target based on environment
  const proxyTarget = mode === 'development' 
    ? `http://${LOCAL_IP}:${LOCAL_BACKEND_PORT}`
    : 'http://localhost:8080';

  return {
    base: "/",
    server: {
      host: "0.0.0.0",
      port: mode === 'development' ? 3000 : Number(process.env.PORT || 8080),
      strictPort: false,
      allowedHosts: ["brasilsimracing.discloud.app", "localhost", "127.0.0.1", LOCAL_IP],
      // Proxy API calls to the backend server in development
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
        '/auth': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        }
      }
    },
    build: {
      outDir: "dist",
      sourcemap: false,
      minify: "esbuild",
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': ['react', 'react-dom', 'react-router-dom'],
          },
        },
      },
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
