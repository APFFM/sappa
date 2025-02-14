import { config } from 'dotenv';

config();

const requiredEnvVars = [
  'VITE_OPENAI_API_KEY',
  'VITE_ELEVEN_LABS_KEY'
];

const missing = requiredEnvVars.filter(key => !process.env[key]);

if (missing.length > 0) {
  console.error('❌ Missing required environment variables:');
  missing.forEach(key => console.error(`   - ${key}`));
  process.exit(1);
} else {
  console.log('✅ All required environment variables are set');
}
