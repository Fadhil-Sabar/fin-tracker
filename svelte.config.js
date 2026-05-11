import adapter from '@sveltejs/adapter-cloudflare';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		runes: ({ filename }) => (filename.split(/[/\\\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		adapter: adapter(),
		// env dir for Cloudflare secrets loaded from .env
		env: {
			dir: '.'
		}
	}
};

export default config;
