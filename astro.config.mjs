import { defineConfig } from 'astro/config';
import tailwindcss from '@astrojs/tailwind';
import react from '@astrojs/react';
import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  site: "https://opera-gala.cz",
  integrations: [tailwindcss(), react()],
  output: "server",
  adapter: netlify(),
});
