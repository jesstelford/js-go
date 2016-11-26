const {readFile, readFileSync, writeFile, renameSync} = require('fs');
/* eslint-disable import/no-extraneous-dependencies, import/newline-after-import */
const cheerio = require('cheerio');
const crypto = require('crypto');
const upath = require('upath');
const path = require('path');
/* eslint-enable import/no-extraneous-dependencies, import/newline-after-import */

const outDir = 'lib';

const fingerprintable = [
  'js/index.js',
  'js/service-worker-registration.js',
];

function fingerPrint(oldPath) {
  const pathParts = path.parse(oldPath);
  const hash = crypto
    .createHash('md5')
    .update(readFileSync(oldPath, {encoding: 'utf8'}))
    .digest('hex')
    .slice(0, 16);

  let insertIndex = pathParts.base.indexOf('.');

  if (insertIndex === -1) {
    insertIndex = pathParts.base.length;
  }

  const oldBase = pathParts.base;

  pathParts.base = `${oldBase.substr(0, insertIndex)}_${hash}${oldBase.substr(insertIndex)}`;

  return path.format(pathParts);
}

module.exports = function injectJSCacheBust() {

  return new Promise((resolve, reject) => {

    readFile(upath.join(process.cwd(), 'src', 'index.html'), (readError, indexHtml) => {

      if (readError) {
        reject(readError);
        return;
      }

      const $ = cheerio.load(indexHtml.toString());
      const basePath = upath.join(process.cwd(), outDir);

      fingerprintable.forEach(filePath => {
        const oldPath = upath.join(basePath, filePath);
        const newPath = fingerPrint(oldPath);
        renameSync(oldPath, newPath);

        const newURI = newPath.slice(basePath.length);
        $(`script[src="${filePath}"]`).attr('src', newURI);
      });

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
