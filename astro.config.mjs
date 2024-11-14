import { defineConfig } from "astro/config";

import tailwind from "@astrojs/tailwind";
import path from "path";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind()],
});
