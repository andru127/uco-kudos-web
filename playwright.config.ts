import { defineConfig, devices } from '@playwright/test';

/**
 * Pruebas End-to-End contra el ambiente desplegado (o local).
 * E2E_BASE_URL=https://uco-kudos-web.onrender.com npx playwright test
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 120_000,
  retries: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  // 90 % de los usuarios usan móvil (DRV-001): la prueba E2E corre con viewport de celular.
  projects: [{ name: 'movil', use: { ...devices['Pixel 7'] } }],
});
