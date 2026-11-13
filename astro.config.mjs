import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';
import { phrase } from './scripts/phrase.mjs';

export default defineConfig({
  site: 'https://baku-llc.co.jp',
  integrations: [{
    name: 'baku-phrase',
    hooks: {
      // 組み立てのあと、文節の切れ目だけで改行できる印を入れる（stera の LP は別に組んだ物なので触らない）
      'astro:build:done': ({ dir, logger }) => {
        const n = phrase(fileURLToPath(dir), ['stera']);
        logger.info(`文節の印を入れた要素: ${n}`);
      },
    },
  }],
});
