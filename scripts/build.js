const {readFile, writeFile} = require('fs');
/* eslint-disable import/no-extraneous-dependencies, import/newline-after-import */
const findRoot = require('find-root');
const packageJson = require(`${findRoot(process.cwd())}/package.json`);
const swPrecache = require('sw-precache');
const cheerio = require('cheerio');
const upath = require('upath');
/* eslint-enable import/no-extraneous-dependencies, import/newline-after-import */

const outDir = 'lib';

function injectJSCacheBust() {

  return new Promise((resolve, reject) => {

    readFile(upath.join(process.cwd(), 'src', 'index.html'), (readError, indexHtml) => {

      if (readError) {
        reject(readError);
        return;
      }

      const $ = cheerio.load(indexHtml.toString());

      $('script[src="js/index.js"]').attr('src', `js/index.js?v${+new Date()}`);

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

}

function generateOfflineServiceWorker() {

  const fileName = `${outDir}/js/service-worker.js`;

  const options = {
    // Some unique cache id to protect against conflicts of multiple apps across
    // same domain.
    cacheId: `${packageJson.name}@${packageJson.version}`,

    // Don't cache in dev mode
    handleFetch: process.env.NODE_ENV === 'production',

    // Print out which files are cached at build time
    verbose: true,

    maximumFileSizeToCacheInBytes: 2.5 * 1024 * 1024,

    // Any query params to ignore when checking URL for cachability
    ignoreUrlParametersMatching: [/^utm_/],

    // The things to cache
    staticFileGlobs: [
      `${outDir}/css/**/*.css`,
      `${outDir}/js/**/*.js`,
    ],

    // The on-disk location of static assets vs the served location
    stripPrefixMulti: {
      [`${outDir}`]: '',
    },

    // sw-toolbox bridge
    /*
    runtimeCaching: [{

      urlPattern: /\/foursquare\//,
      // cacheFirst because we set hard expiry limits below.
      // If they've expired, hit the network.
      handler: 'cacheFirst',
      method: 'get',
      options: {
        debug: process.env.NODE_ENV !== 'production',
        cache: {
          // Only store the most recent 10 entries
          maxEntries: 10,

          // Foursquare has a limit on how long things can be cached for
          maxAgeSeconds: ?,
          name: 'foursquare-cache'
        }
      }
    }],
    */

    // Once all assets are cache-busted in their URL, enable this rule
    // dontCacheBustUrlsMatching: /./,

    // Enable for dynamically generated content
    // dynamicUrlToDependencies: {},

    // Maybe this is required when doing client-side routing? See: https://github.com/GoogleChrome/sw-precache/blob/master/GettingStarted.md#fallback-url
    // navigateFallback: '',

    // What regexes match URLs that are client-side routed?
    // navigateFallbackWhitelist: [],

    // enable if errors due to:
    // 1. Deploy a page with <img data-lazy-load-src="/public/img/foo.png" src="pixel.gif" />
    // 2. User loads page, /public/img/foo.png is pre-cached.
    // 3. Image is not yet lazy loaded
    // 4. Deploy the same page, but image has moved to /public/img/bar.png
    // 5. User now loads the same page in another tab. This triggers the new
    //    service worker to register and take over the exist one, flushing the
    //    cached version of /public/img/foo.png
    // 6. User triggers lazy load of /public/img/foo.png on original page, but
    //    it errors as that resource does not exist
    // This option stops the new version of the service worker from taking over
    // while the user is still navigating around. Can also happen with Browser
    // History API changes and fallback routes.
    // skipWaiting: false,
    //
  };

  return swPrecache.write(fileName, options)
    .then(_ => {
      // eslint-disable-next-line no-console
      console.log(`Service Worker generated and written to ${fileName}`);
    });
}

Promise.all([
  injectJSCacheBust(),
  generateOfflineServiceWorker(),
]).catch(error => {
  // eslint-disable-next-line no-console
  console.error(error.message || error.toString());
  // TODO: FIXME: process.exit(-1)?
});
