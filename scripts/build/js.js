/* eslint-disable import/no-extraneous-dependencies */
const browserify = require('browserify');
const watchify = require('watchify');
const envify = require('envify');
const mkdirp = require('mkdirp');
/* eslint-enable import/no-extraneous-dependencies */
const fs = require('fs');

const buildHtml = require('./html');
const buildServiceWorker = require('./service-worker');

const outDir = 'lib/js';
const entryFile = 'src/js/index.js';
const outFile = `${outDir}/index.js`;

function initBrowserify(opts) {

  const browserifyer = browserify(Object.assign(
    {},
    {
      entries: [entryFile],

      // Try to speed up development builds a bit
      //insertGlobals: process.env.NODE_ENV !== 'production',
      // Try to speed up development builds a bit
      //detectGlobals: process.env.NODE_ENV === 'production',
      debug: process.env.NODE_ENV !== 'production',
    },
    opts
  ));

  browserifyer.transform(
    envify,
    {
      global: true,
    }
  );

  browserifyer.transform('babelify');

  return browserifyer;
}

function browserifyBundle(browserifyer) {
  return new Promise((resolve, reject) => {

    browserifyer.bundle((error, bundleBuffer) => {

      if (error) {
        reject(error);
      }

      fs.writeFile(outFile, bundleBuffer, writeError => {
        if (writeError) {
          reject(writeError);
        }
        resolve(outFile);
      });
    });
  });
}

function watch() {

  mkdirp.sync(outDir);

  const browserifyer = initBrowserify({cache: {}, packageCache: {}});

  browserifyer.plugin(watchify);

  // listen for updates, and re-bundle then.
  browserifyer.on('update', () => {

    // rebundle
    browserifyBundle(browserifyer)
      .then(fileWrittenTo => {
        const dateTime = (new Date()).toLocaleTimeString();
        // eslint-disable-next-line no-console
        console.log(`[browserify][${dateTime}] Bundle written to ${fileWrittenTo}`);
      })
      // Then rebuild the service worker
      .then(() => buildServiceWorker())
      .then(() => buildHtml())
      .catch(bundleError => {
        // eslint-disable-next-line no-console
        console.error(bundleError.message || bundleError.toString());
      });

  });

  browserifyer.on('log', message => {
    // eslint-disable-next-line no-console
    console.log(`[watchify][${(new Date()).toLocaleTimeString()}] ${message}`);
  });

  // kick off an initial bundle
  browserifyBundle(browserifyer)
    .then(fileWrittenTo => {
      const dateTime = (new Date()).toLocaleTimeString();
      // eslint-disable-next-line no-console
      console.log(`[browserify][${dateTime}] Bundle written to ${fileWrittenTo}`);
    })
    .then(() => buildServiceWorker())
    .then(() => buildHtml());
}

function build() {

  mkdirp.sync(outDir);

  return new Promise((resolve, reject) => {
    const browserifyer = initBrowserify();
    browserifyer.on('error', error => {
      reject(error);
    });
    browserifyBundle(browserifyer)
      .then(fileWrittenTo => {
        const dateTime = (new Date()).toLocaleTimeString();
        // eslint-disable-next-line no-console
        console.log(`[browserify][${dateTime}] Bundle written to ${fileWrittenTo}`);
        resolve();
      })
      .catch(reject);
  });

}

module.exports = {
  watch,
  build,
};
