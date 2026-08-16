# Migración a GitHub y Cloudflare

Esta carpeta contiene una exportación completa del código fuente del sitio
`desafio-flujo-indirecto`, preparada para el repositorio
`MBRENGI/desafio-flujo-efectivo`.

## Incluido

- Frontend y estilos en `app/`.
- Rutas de backend y autenticación en `app/api/`.
- Panel del profesor en `app/profesor/`.
- Acceso a Cloudflare D1 y seguridad en `app/lib/`.
- Esquema Drizzle en `db/`.
- Migración SQL y metadatos en `drizzle/`.
- Worker, configuración de compilación y scripts de validación.
- Dependencias reproducibles mediante `package-lock.json`.
- Archivo `.env.example` con nombres de variables, sin valores reales.

No se incluyen secretos, claves API, sesiones, datos de alumnos, la base de
datos D1 ni carpetas generadas como `node_modules`, `dist`, `.wrangler` y
`.sites-runtime`.

## 1. Publicar en el repositorio

Sube el contenido de esta carpeta a la rama principal del repositorio
`MBRENGI/desafio-flujo-efectivo`. No subas un archivo `.env` real.

## 2. Requisitos de compilación

- Node.js 22.13 o superior.
- Comando de instalación: `npm ci`.
- Comando de verificación: `npm run lint`.
- Comando de compilación: `npm run build`.

La compilación genera un Worker ESM en `dist/server/index.js` y conserva las
migraciones en `dist/.openai/drizzle/`.

## 3. Base de datos D1

Crea una base D1 para esta aplicación y configura el binding con el nombre
exacto `DB`. Aplica, en orden, los archivos SQL de `drizzle/` antes de abrir el
sitio a estudiantes. El código también verifica y crea las tablas de seguridad
si todavía no existen, pero la migración SQL es la fuente que debe conservarse
en el despliegue.

La exportación incluye el nombre lógico del binding en
`.openai/hosting.json`. El identificador real de la base D1 debe configurarse en
Cloudflare y no debe escribirse como secreto en el repositorio.

## 4. Variables y secretos

Configura en Cloudflare:

- `COOKIE_SECRET`: valor aleatorio de al menos 32 caracteres.
- `RESEND_API_KEY`: clave de Resend.
- `EMAIL_FROM`: remitente verificado en Resend.
- `PROFESSOR_EMAIL`: correo autorizado para el panel docente.
- `PROFESSOR_ACCESS_CODE`: PIN o código docente robusto.

El archivo `.env.example` documenta también los nombres alternativos que el
código actual acepta. Los valores reales deben permanecer únicamente en el
gestor de secretos de Cloudflare.

## 5. Comprobación previa al despliegue

Ejecuta:

```bash
npm ci
npm run lint
npm run build
npm run validate:artifact
```

Después verifica el ingreso por correo, el guardado del progreso, el límite de
tres intentos, el panel `/profesor` y la lectura de resultados desde D1.

## Seguridad conservada

La exportación mantiene las cookies `HttpOnly`, `Secure` y `SameSite=Strict`,
la firma HMAC de sesiones, el límite de solicitudes de códigos, el bloqueo de
intentos docentes fallidos, la validación de origen, los encabezados de
seguridad y la política CSP existentes.
