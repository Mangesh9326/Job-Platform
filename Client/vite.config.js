import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  
  // ==========================================
  // 🚀 BUILD OPTIMIZATION (CODE SPLITTING)
  // ==========================================
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // 1. Core React ecosystem
            if (id.includes("react") || id.includes("react-dom") || id.includes("react-router-dom")) {
              return "vendor-react";
            }
            // 2. Heavy Animation Libraries
            if (id.includes("framer-motion") || id.includes("motion")) {
              return "vendor-motion";
            }
            // 3. Heavy Charting Libraries
            if (id.includes("chart.js") || id.includes("react-chartjs-2")) {
              return "vendor-charts";
            }
            // 4. Icon Libraries
            if (id.includes("lucide-react") || id.includes("react-icons")) {
              return "vendor-icons";
            }
            // 5. Everything else (Axios, Toast, CountUp, etc.)
            return "vendor-core";
          }
        },
      },
    },
    // Optional: Increases the warning limit slightly since we know we have heavy libs like Chart.js
    chunkSizeWarningLimit: 600, 
  },

  server: {
    port: 5173,  
    open: false,
    middlewareMode: false,
    historyApiFallback: true,

    // PROXY for backend
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});