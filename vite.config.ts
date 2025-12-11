import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  root: "frontend",
  plugins: [react()],
  build: {
    outDir: "dist", // Output to dist for standard builds
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
        },
      },
    },
  },
  server: {
    port: 3000,
    host: true,
    // 修復 SPA 路由重新整理問題：所有路由都返回 index.html
    middlewareMode: false,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  // 預覽模式也需要 SPA fallback
  preview: {
    port: 3000,
    host: true,
  },
});
