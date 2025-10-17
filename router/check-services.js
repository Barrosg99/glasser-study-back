/* eslint-disable @typescript-eslint/no-var-requires */
const http = require('http');

const readyServices = new Set();

const checkService = (port, serviceName) => {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/health`, (res) => {
      if (res.statusCode === 200) {
        if (!readyServices.has(serviceName)) {
          console.log(`${serviceName} is ready!`);
          readyServices.add(serviceName);
        }
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
    const notificationServiceReady = await checkService(4004, 'notifications');
    const reportServiceReady = await checkService(4005, 'reports');

    if (
      userServiceReady &&
      postServiceReady &&
      messageServiceReady &&
      notificationServiceReady &&
      reportServiceReady
    ) {
      console.log('All services are ready!');
      process.exit(0);
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
};

waitForServices();
