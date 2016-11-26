const cpr = require('cpr');
const promisify = require('es6-promisify');

const cprPromise = promisify(cpr);

Promise.all([
  cprPromise('src/server.js', 'lib/', {overwrite: true}),
  cprPromise('src/key.pem', 'lib/', {overwrite: true}),
  cprPromise('src/cert.pem', 'lib/', {overwrite: true}),
  cprPromise('src/css', 'lib/css/', {overwrite: true}),
  cprPromise('src/img', 'lib/img/', {overwrite: true}),
  cprPromise('src/js/service-worker-registration.js', 'lib/js/', {overwrite: true}),
]).catch(error => {
  // eslint-disable-next-line no-console
  console.error(error.message || error.toString());
  process.exit(1);
});
