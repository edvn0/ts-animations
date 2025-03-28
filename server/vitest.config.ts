import { defineConfig } from 'vitest/config'

// Add path resolution for the server from tsconfig.json

export default defineConfig({
  test: {
    runner: 'node',
  },
})
