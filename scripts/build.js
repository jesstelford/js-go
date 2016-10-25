const {readFileSync, writeFileSync} = require('fs');
// eslint-disable-next-line import/no-extraneous-dependencies
const cheerio = require('cheerio');
// eslint-disable-next-line import/no-extraneous-dependencies
const upath = require('upath');

const indexHtml = readFileSync(upath.join(process.cwd(), 'src', 'index.html'));

const $ = cheerio.load(indexHtml.toString());

$('script[src="js/index.js"]').attr('src', `js/index.js?v${+new Date()}`);

writeFileSync(upath.join(process.cwd(), 'lib', 'index.html'), $.html());
