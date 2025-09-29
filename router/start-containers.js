/* eslint-disable @typescript-eslint/no-var-requires */
const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Checking and starting Docker containers...');

try {
  // Check if Docker is running
  execSync('docker info', { stdio: 'pipe' });
  console.log('✅ Docker is running');
} catch (error) {
  console.error('❌ Docker is not running. Please start Docker Desktop first.');
  process.exit(1);
}

try {
  // Navigate to the directory with docker-compose.yml
  const dockerComposeDir = path.join(__dirname);
  process.chdir(dockerComposeDir);

  // Check if containers are already running
  const containersStatus = execSync('docker-compose ps --services', {
    encoding: 'utf8',
  });

  if (containersStatus.includes('Up')) {
    console.log('✅ Containers are already running');
  } else {
    console.log('🔄 Starting containers...');
    execSync('docker-compose up -d', { stdio: 'inherit' });
    console.log('✅ Containers started successfully');

    // Wait a bit for services to be ready
    console.log('⏳ Waiting for services to be ready...');
    setTimeout(() => {
      console.log('✅ All containers are ready!');
    }, 5000);
  }
} catch (error) {
  console.error('❌ Error starting containers:', error.message);
  process.exit(1);
}
