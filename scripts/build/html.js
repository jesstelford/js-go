const {readFile, writeFile} = require('fs');
/* eslint-disable import/no-extraneous-dependencies, import/newline-after-import */
const cheerio = require('cheerio');
const upath = require('upath');
/* eslint-enable import/no-extraneous-dependencies, import/newline-after-import */

const outDir = 'lib';

module.exports = function injectJSCacheBust() {

  return new Promise((resolve, reject) => {

    readFile(upath.join(process.cwd(), 'src', 'index.html'), (readError, indexHtml) => {

      if (readError) {
        reject(readError);
        return;
      }

      const $ = cheerio.load(indexHtml.toString());

      $('script[src="js/index.js"]').attr('src', `js/index.js?v${+new Date()}`);
      $('script[src="js/service-worker-registration.js"]').attr('src', `js/service-worker-registration.js?v${+new Date()}`);

      writeFile(upath.join(process.cwd(), outDir, 'index.html'), $.html(), writeError => {
        if (writeError) {
          reject(writeError);
          return;
        }

        resolve();

      });

    });
  }).then(_ => {
    // eslint-disable-next-line no-console
    console.log('index.html written with cache-busted JS');
  });

};
