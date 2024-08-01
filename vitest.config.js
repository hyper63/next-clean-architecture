/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    silent: true,
    coverage: {
      lines: 90,
      include: ['lib/domain/apis', 'lib/domain/models']
    }
  }
})
