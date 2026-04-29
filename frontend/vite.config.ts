import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isMockAuth = env.VITE_CLERK_PUBLISHABLE_KEY === 'pk_test_YOUR_KEY_HERE' || !env.VITE_CLERK_PUBLISHABLE_KEY;

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './'),
        ...(isMockAuth ? {
          '@clerk/clerk-react': path.resolve(__dirname, './src/shared/lib/clerk-mock.tsx'),
        } : {}),
      },
    },
  };
})
