# UCO Kudos — Front-End

SPA *Mobile First* de la plataforma institucional de reconocimientos UCO Kudos.

| | |
|---|---|
| **URL pública** | `https://CAMBIAR.onrender.com` |
| **Back-End y documentación de arquitectura** | repositorio `uco-kudos-api` (carpeta `docs/`) |
| **Stack** | React 19 · TypeScript (estricto) · Vite · Vitest + Testing Library · Playwright |

## Funcionalidades

- Inicio de sesión con correo institucional.
- Muro de Kudos paginado con adjuntos descargables.
- Publicar Kudo: destinatario, categoría, mensaje sin límite y hasta 5 adjuntos (PNG, JPEG, WEBP, PDF de 5 MB).
- **Notificación push en tiempo real** (Server-Sent Events) con aviso en la app y notificación del sistema operativo.
- Perfil: actualizar correo y WhatsApp de notificación, activar notificaciones del navegador.

## Decisiones Mobile First (DRV-001)

- CSS diseñado para 360 px y ampliado con `@media (min-width)`.
- Navegación inferior al alcance del pulgar; objetivos táctiles ≥ 48 px; inputs de 16 px (sin zoom en iOS); `safe-area-inset` para equipos con notch.
- Bundle de ~73 KB gzip, sin librerías de UI ni router.
- Prueba E2E ejecutada con viewport de Pixel 7.

## Comandos

```bash
cp .env.example .env     # VITE_API_URL=http://localhost:8080
npm install
npm run dev              # desarrollo
npm run typecheck        # TypeScript estricto
npm test                 # unitarias y de componentes + cobertura (coverage/)
npm run build            # producción (dist/)
E2E_BASE_URL=https://... E2E_PASSWORD=... npm run test:e2e   # End-to-End
```

## Estructura

```text
src/
├── api/          Cliente HTTP (JWT, Problem Details) y tipos
├── auth/         Sesión
├── hooks/        useNotificationStream (SSE)
├── components/   Vistas: Login, Muro, Publicar, Perfil, navegación, toasts
└── utils/        Formato y validación de adjuntos
e2e/              Escenario End-to-End (Playwright)
```

## CI/CD

`.github/workflows/ci-cd.yml`: typecheck → pruebas con cobertura → build → SonarQube Cloud → Trivy → despliegue en Render (deploy hook) → pruebas E2E sobre la URL publicada.
