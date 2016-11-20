const buildJs = require('./build/js');
const buildHtml = require('./build/html');
const buildServiceWorker = require('./build/service-worker');

// Order is important
buildJs.build()
  .then(_ => buildServiceWorker())
  .then(_ => buildHtml())
  .catch(error => {
    // eslint-disable-next-line no-console
    console.error(error.message || error.toString());
    process.exit(1);
  });
