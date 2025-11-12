import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_"); // load VITE_ vars

  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
        '/api': {
          target: mode === 'development'
            ? env.VITE_API_BASE_URL || 'http://localhost:5000'
            : env.VITE_API_BASE_URL,
          changeOrigin: true,
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
