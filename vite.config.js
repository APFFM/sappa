import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  return {
    plugins: [react()],
    base: '/sappa/',
    define: {
      'process.env.VITE_OPENAI_API_KEY': JSON.stringify(env.VITE_OPENAI_API_KEY),
      'process.env.VITE_ELEVEN_LABS_KEY': JSON.stringify(env.VITE_ELEVEN_LABS_KEY)
    }
  }
})
