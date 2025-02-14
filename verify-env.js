const { config } = require('dotenv');
const path = require('path');

config();

const requiredEnvVars = [
  'VITE_OPENAI_API_KEY',
  'VITE_ELEVEN_LABS_KEY'
];

// In production, we'll check for GitHub secrets instead of .env
if (process.env.NODE_ENV === 'production') {
  console.log('✅ Production environment - skipping .env check');
  process.exit(0);
}

const missing = requiredEnvVars.filter(key => !process.env[key]);

if (missing.length > 0) {
  console.error('❌ Missing required environment variables:');
  missing.forEach(key => console.error(`   - ${key}`));
  process.exit(1);
} else {
  console.log('✅ All required environment variables are set');
  process.exit(0);
}
