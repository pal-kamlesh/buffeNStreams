import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      "/api/": {
        target: "http://localhost:5000",
        changeOrigin: true,
        // Add these configurations for SSE support
        // ws: true, // For WebSocket-like connections (SSE is similar)
        // // http-proxy-middleware options
        // proxyReqOpts: {
        //   buffer: {
        //     maxBufferSize: 1024 * 1024 * 10, // Increase buffer if needed
        //   },
        // },
      },
    },
    host: true,
  },
  plugins: [react(), tailwindcss()],
});
