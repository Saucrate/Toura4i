const cloudinary = require('cloudinary').v2;

// Validate required environment variables
const requiredEnvVars = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('Missing required Cloudinary environment variables:', missingEnvVars);
  throw new Error('Missing required Cloudinary environment variables');
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Enable video uploads
cloudinary.config({
  resource_type: 'auto'
});

// Test Cloudinary configuration
cloudinary.api.ping()
  .then(result => {
    console.log('Cloudinary configuration successful:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      status: result.status,
      resource_type: 'auto'
    });
  })
  .catch(error => {
    console.error('Cloudinary configuration failed:', error);
    throw error;
  });

module.exports = cloudinary; 