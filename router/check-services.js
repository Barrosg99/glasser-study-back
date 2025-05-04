const http = require('http');

const checkService = (port) => {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://localhost:${port}/health`, (res) => {
      if (res.statusCode === 200) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
    req.on('error', () => resolve(false));
  });
};

const waitForServices = async () => {
  console.log('Waiting for services to be ready...');

  while (true) {
    const userServiceReady = await checkService(4001);
    const postServiceReady = await checkService(4002);

    if (userServiceReady && postServiceReady) {
      console.log('All services are ready!');
      process.exit(0);
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
};

waitForServices();
