import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://serve.citychurchlufkin.com',
  integrations: [
    tailwind(),
  ],
  adapter: vercel(),
  output: 'static',
  trailingSlash: 'always',
});
