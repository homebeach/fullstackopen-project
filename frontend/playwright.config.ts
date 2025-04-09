import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './playwright', // you can change this folder name if you want
  timeout: 30000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:4200',
    browserName: 'chromium',
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
});
