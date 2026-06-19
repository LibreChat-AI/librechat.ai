import { defineConfig, devices } from '@playwright/test'

const isCI = !!process.env.CI

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  // Concise console output in CI plus a non-blocking HTML report for the artifact.
  reporter: isCI ? [['github'], ['list'], ['html', { open: 'never' }]] : 'html',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: 'http://localhost:3333',
    trace: 'on-first-retry',
    navigationTimeout: 30_000,
    actionTimeout: 15_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    // Production build in CI for deterministic, pre-compiled pages; dev server locally.
    command: isCI ? 'pnpm start' : 'pnpm dev',
    url: 'http://localhost:3333',
    reuseExistingServer: !isCI,
    timeout: 180_000,
  },
})
