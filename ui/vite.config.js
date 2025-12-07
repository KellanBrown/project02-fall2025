import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "0.0.0.0",          // Allow external connections (useful in Docker)
    port: 5173,               // Port to serve frontend
    strictPort: true,         // Fail if port is already in use
    watch: {
      usePolling: true,       // Required for Docker file watching
      interval: 1000,         // Poll every second
    },
    hmr: {
      clientPort: 5173,       // Browser connects to this port (matches mapped Docker port)
    },
  },
  build: {
    outDir: "dist",           // Production build output
    sourcemap: false,         // No sourcemap in prod
    minify: "esbuild",        // Use esbuild for minification
  },
  envPrefix: "VITE_",         // Only environment variables starting with VITE_ are exposed
});
