import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import path from "path";
import { fileURLToPath } from "url";
import { visualizer } from "rollup-plugin-visualizer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    // visualizer({
    //   open: true,
    //   filename: "stats.html",
    //   gzipSize: true,
    //   brotliSize: true,
    // }),
    svgr({
      svgrOptions: {
        icon: true,
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ],
  optimizeDeps: {
    exclude: ["exceljs"],
    esbuildOptions: {
      target: "es2022",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    minify: "terser",
    target: "es2022",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom"))
              return "react-core";
            if (id.includes("react-router")) return "router";
            if (id.includes("apexcharts")) return "charts";
            if (id.includes("framer-motion")) return "animations";
            if (id.includes("lucide-react")) return "icons";

            if (
              id.includes("jspdf") ||
              id.includes("xlsx") ||
              id.includes("exceljs")
            )
              return "export";

            if (id.includes("@tanstack")) return "query";
            if (id.includes("axios")) return "http";
            if (id.includes("@radix-ui")) return "ui";

            return "vendor";
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
      "/broadcasting": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
      "/storage": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
