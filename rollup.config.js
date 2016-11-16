/* eslint-disable import/no-extraneous-dependencies */
import json from 'rollup-plugin-json';
import scss from 'rollup-plugin-scss';
import babel from 'rollup-plugin-babel';
import envify from 'envify';
import filesize from 'rollup-plugin-filesize';
import commonjs from 'rollup-plugin-commonjs';
import visualizer from 'rollup-plugin-visualizer';
import nodeResolve from 'rollup-plugin-node-resolve';
import nodeGlobals from 'rollup-plugin-node-globals';
import browserifyTransform from 'rollup-plugin-browserify-transform';
/* eslint-enable import/no-extraneous-dependencies */

export default {
  entry: 'src/js/index.js',
  format: 'iife',
  plugins: [

    json(),

    scss({
      output: 'lib/css/aframe.css',
    }),

    babel({
      runtimeHelpers: true,
      exclude: 'node_modules/**',
    }),

    browserifyTransform(envify),

    nodeResolve({
      jsnext: true,
      main: true,
      browser: true,
      extensions: ['.js', '.json'],
      preferBuiltins: false,
    }),

    commonjs({
      include: 'node_modules/**',
      extensions: ['.js', '.json'],
      namedExports: {
        // eslint-disable-next-line global-require
        'node_modules/react/react.js': Object.keys(require('react')),
      },
    }),

    nodeGlobals(),

    visualizer({filename: 'debug/build_rollup.html'}),

    filesize(),
  ],
  dest: 'lib/js/index.js',
};
