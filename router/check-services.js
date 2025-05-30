const http = require('http');

const checkService = (port, serviceName) => {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://localhost:${port}/health`, (res) => {
      if (res.statusCode === 200) {
        console.log(`${serviceName} is ready!`);
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
    const userServiceReady = await checkService(4001, 'users');
    const postServiceReady = await checkService(4002, 'posts');
    const messageServiceReady = await checkService(4003, 'messages');

    if (userServiceReady && postServiceReady && messageServiceReady) {
      console.log('All services are ready!');
      process.exit(0);
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
};

waitForServices();
