import { expect, test } from '@playwright/test';

/**
 * Escenario completo (E2E): un docente inicia sesión desde un celular, publica un Kudo
 * para el Estudiante Demo y lo ve en el muro.
 * Variables: E2E_BASE_URL, E2E_PASSWORD (contraseña de los usuarios demo).
 */
const password = process.env.E2E_PASSWORD ?? 'UcoKudos2026*';

test('un docente publica un Kudo y aparece en el muro', async ({ page }) => {
  const mensaje = `Kudo E2E ${Date.now()}`;

  await page.goto('/');
  await page.getByLabel('Correo institucional').fill('docente@uco.edu.co');
  await page.getByLabel('Contraseña').fill(password);
  await page.getByRole('button', { name: 'Ingresar' }).click();

  await page.getByRole('button', { name: /Dar Kudo/ }).click();
  await page.getByLabel(/A quién/).selectOption({ label: 'Estudiante Demo — Estudiante' });
  await page.getByLabel('Categoría').selectOption({ label: 'Liderazgo' });
  await page.getByLabel('Mensaje').fill(mensaje);
  await page.getByRole('button', { name: 'Publicar Kudo' }).click();

  await expect(page.getByText('¡Kudo publicado!')).toBeVisible();
  await expect(page.getByTestId('kudo-card').filter({ hasText: mensaje })).toBeVisible();
});
