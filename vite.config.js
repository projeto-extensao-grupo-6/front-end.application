import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), 
    tsconfigPaths(),
    tsconfigPaths(),
  ],
  
  
  optimizeDeps: {
    exclude: [
      "@radix-ui/react-slot",
      "@radix-ui/react-compose-refs",
    ],
  },

});