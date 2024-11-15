import { defineConfig } from "astro/config";

import tailwind from "@astrojs/tailwind";
import path from "path";

import icon from "astro-icon";

import sitemap from "@astrojs/sitemap";

import vercel from "@astrojs/vercel/serverless";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), icon(), sitemap()],
  site: "https://simple-image-compress.vercel.app/",
  output: "server",
  adapter: vercel(),
});