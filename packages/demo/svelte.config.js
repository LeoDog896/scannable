import adapter from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';

// eslint-disable-next-line tsdoc/syntax
/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: [
		preprocess()
	],

	kit: {
		paths: {
			base: '/scannable'
		},
		adapter: adapter()
	}
};

export default config;
