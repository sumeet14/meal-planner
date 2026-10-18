import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Served from https://sumeet14.github.io/meal-planner/
  base: '/meal-planner/',
  plugins: [react()],
});
