/* eslint-disable import/no-extraneous-dependencies */
const cpr = require('cpr');
const rimraf = require('rimraf');
const promisify = require('es6-promisify');
/* eslint-enable import/no-extraneous-dependencies */

const cprPromise = promisify(cpr);

promisify(rimraf)('lib').then(_ => (
  Promise.all([
    cprPromise('src/server.js', 'lib/', {overwrite: true}),
    cprPromise('src/key.pem', 'lib/', {overwrite: true}),
    cprPromise('src/cert.pem', 'lib/', {overwrite: true}),
    cprPromise('src/css', 'lib/css/', {overwrite: true}),
    cprPromise('src/img', 'lib/img/', {overwrite: true}),
    cprPromise('src/js/service-worker-registration.js', 'lib/js/', {overwrite: true}),
  ])
)).catch(error => {
  // eslint-disable-next-line no-console
  console.error(error.message || error.toString());
  process.exit(1);
});
