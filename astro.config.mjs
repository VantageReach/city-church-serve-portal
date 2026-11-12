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
  // Form posts to /kcbucks are relayed to the KC Bucks app, which checks their origin itself.
  security: { checkOrigin: false },
});
