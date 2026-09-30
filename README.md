# IV Congreso Internacional de Investigación Científica

Sitio web y panel de gestión para el IV Congreso Internacional de Investigación Científica de la Facultad de Educación Primaria.

La aplicación presenta el programa académico, los ejes temáticos, las tarifas de participación y un formulario para registrar inscripciones o propuestas de ponencia.

## Vista general

- Landing pública con identidad visual institucional.
- Diseño adaptable para escritorio, tablet y móvil.
- Modal de inscripción y recepción de ponencias.
- Panel administrativo para consultar y actualizar solicitudes.
- Escudo institucional integrado desde `public/logosecu.png`.

## Tecnologías

- Next.js 16 con App Router y Turbopack.
- React 19 y TypeScript.
- Tailwind CSS 4 y `lucide-react`.
- Route Handlers para la API interna.
- Persistencia local en `data/requests.json`.

## Requisitos

- Node.js 20 o superior.
- npm 10 o superior.

## Instalación y desarrollo

```bash
npm install
npm run dev
```

La aplicación estará disponible en:

- Sitio público: <http://localhost:3000>
- Panel de gestión: <http://localhost:3000/admin>

Para acceder desde otro dispositivo de la red local:

```bash
npm run dev -- --hostname 0.0.0.0
```

El origen de desarrollo debe estar incluido en `allowedDevOrigins` dentro de `next.config.ts`.

## Comandos disponibles

```bash
npm run dev      # Inicia el servidor de desarrollo
npm run lint     # Ejecuta ESLint
npm run build    # Genera la versión de producción
npm run start    # Inicia la versión compilada
```

## API de solicitudes

La API interna se encuentra en `src/app/api/requests/route.ts`.

- `POST /api/requests`: registra una inscripción o propuesta de ponencia.
- `GET /api/requests`: consulta las solicitudes desde el panel.
- `PATCH /api/requests`: actualiza el estado de una solicitud.

Durante el desarrollo, los datos se guardan en `data/requests.json`. Este mecanismo es suficiente para una demostración local, pero no es recomendable para producción porque un entorno serverless puede ser efímero y no garantiza persistencia entre despliegues.

## Despliegue

El proyecto puede desplegarse en Vercel u otra plataforma compatible con Next.js.

Configuración recomendada:

1. Usar `npm run build` como comando de compilación.
2. Usar `npm run start` cuando la plataforma requiera un comando de inicio.
3. Configurar el directorio raíz en la carpeta del proyecto.
4. Migrar la persistencia de solicitudes a PostgreSQL, Supabase o un servicio equivalente.
5. Añadir autenticación y autorización para proteger `/admin`.

Si un despliegue aparece con una X roja en GitHub, el detalle exacto se encuentra en la pestaña **Deployments** del proveedor que creó ese estado, normalmente Vercel. El commit puede estar publicado correctamente aunque un despliegue externo haya fallado.

## Estructura principal

```text
src/app/page.tsx                 Página pública del congreso
src/app/admin/page.tsx           Panel de solicitudes
src/app/api/requests/route.ts    API de inscripciones y ponencias
src/app/globals.css              Sistema visual y diseño responsive
src/lib/requests.ts              Lectura y escritura de solicitudes
public/logosecu.png              Escudo institucional
data/requests.json               Datos locales del prototipo
```

## Estado del proyecto

El proyecto se encuentra preparado como prototipo funcional. Antes de utilizarlo en producción deben incorporarse una base de datos persistente, autenticación para el panel administrativo, validación reforzada y un sistema de respaldo para las solicitudes.
