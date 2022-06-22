const buble = require('rollup-plugin-buble');
const cjs = require('rollup-plugin-commonjs');
const node = require('rollup-plugin-node-resolve');

const uglify = require('rollup-plugin-uglify').uglify;

const version = process.env.VERSION || require('./package.json').version

const banner =
  '/*!\n' +
  ' * Projekt WSB - Geometria obliczeniowa\n' +
  ' - Tomasz Czermiński,\n- Grażyna Górka,\n- Tomasz Juszkiewicz' +
  ' */'
export default {
  input: 'index.js',
  plugins: [
		node(),
		cjs(),
		buble()
	],
  output: [{
      sourcemap: true,
      format: 'umd',
      name: 'isect',
      file: 'build/isect.js',
      banner
    },
    {
      sourcemap: true,
      format: 'umd',
      name: 'isect',
      file: 'build/isect.min.js',
      banner,
      plugins: [uglify()]
    },
    {
      format: 'es',
      file: 'build/isect.module.js'
    }
  ],
}
