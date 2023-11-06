import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';

const config = {
	plugins: [sveltekit()]
} satisfies UserConfig;

export default config;
