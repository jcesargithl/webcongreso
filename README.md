# IV Congreso Internacional de Investigación Científica EPEP

Aplicación Next.js 16.3.6 con React 19, TypeScript, Tailwind CSS 4 y Supabase. Incluye inscripciones, comprobantes de Págalo.pe, revisión administrativa y recepción de investigaciones.

## Preparación de Supabase

Antes de usar el nuevo flujo, ejecuta en el SQL Editor del proyecto:

- supabase/migrations/202610140001_registration_payments_and_papers.sql

La migración es transaccional, conserva los registros existentes, agrega campos de pago y vínculos entre ponencias e inscripciones, e instala las reglas de validación. Crea el bucket privado congress-files; los PDFs se muestran mediante enlaces firmados que vencen en una hora. La base de datos y este bucket se utilizan desde la API del servidor, no directamente desde el navegador.

Las categorías anteriores que identifican inequívocamente una tarifa se migran. Registros con “Estudiante EPEP” o “Público General” sin rol se conservan sin categoría identificada: un administrador debe clasificarlos en el panel. No se asume que una inscripción de estudiante sea gratuita ni de ponente. Los pagos antiguos aprobados se conservan; no se inventan números de comprobante ni datos de auditoría.

Si falla cualquier instrucción, la transacción se revierte. Revisa el error del SQL Editor antes de habilitar el nuevo formulario. La aplicación no aplica migraciones automáticamente.

## Configuración local

Variables de .env.local:

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY (solo servidor)
- ADMIN_EMAILS (correos autorizados, separados por coma)
- GMAIL_USER y GMAIL_PASS (contraseña de aplicación, opcionales para enviar confirmaciones)
- PAPER_VERIFICATION_SECRET (opcional; usa una clave larga y aleatoria, solo servidor; de no existir se usa la clave de servicio para firmar la verificación)

No publiques claves ni este archivo.

## Inscripción y pagos

Las seis tarjetas tienen identificadores únicos. La API determina categoría, modalidad y tarifa desde el catálogo, sin confiar en el precio enviado por el navegador.

| Categoría | Tarifa | Cargo institucional | Total |
| --- | --- | --- | --- |
| Estudiante EPEP asistente | S/ 20 | S/ 1 | S/ 21 |
| Estudiante externo | S/ 30 | S/ 1 | S/ 31 |
| Ponente externo | S/ 100 | S/ 1 | S/ 101 |
| Asistente externo | S/ 70 | S/ 1 | S/ 71 |
| Docente EPEP ponente | Gratis | S/ 0 | S/ 0 |
| Estudiante EPEP ponente | Gratis | S/ 0 | S/ 0 |

El S/ 1 es el cargo institucional indicado por la organización, no una comisión adicional del Banco de la Nación. Instrucciones del evento: Págalo.pe, código 091, Tasas educativas UNA Puno, OTROS SERV. EDU. EDU. PRIMARIA.

Cada inscripción de pago exige confirmar Págalo.pe, documento del comprobante, secuencia de seis dígitos (conserva ceros), monto total, fecha y voucher PDF menor de 2 MB. La recepción del comprobante deja el pago pendiente; solo un administrador puede aprobarlo. Los ponentes internos no deben adjuntar comprobantes.

No se conecta a una API de verificación bancaria. La autenticidad de cada comprobante la revisa el administrador contra los registros institucionales.

## Recepción de investigaciones

Enviar investigación comienza por verificar el correo, tipo y número de documento de una inscripción. Solo son aptos ponentes externos con pago aprobado, docentes EPEP ponentes y estudiantes EPEP ponentes. Las inscripciones rechazadas o de asistentes no habilitan el envío.

Una verificación válida genera un permiso firmado de 15 minutos para esa inscripción. La API vuelve a consultar sus condiciones al recibir el PDF, y la base de datos impide crear una ponencia sin inscripción apta. La verificación es de la inscripción registrada; no sustituye la comprobación institucional de pertenencia a la EPEP.

Las ponencias se vinculan a la inscripción original, heredan sus datos, admiten PDF de hasta 10 MB y quedan en revisión académica. Aprobar el pago no acepta automáticamente la ponencia.

## Administración

/admin requiere Supabase Auth y un correo incluido en ADMIN_EMAILS. Muestra categoría, modalidad, documento, institución, tarifa, cargo institucional, secuencia, monto, fecha, comprobante, estado y auditoría del pago, observaciones e investigación vinculada.

Aprobar pago confirma la inscripción y habilita al ponente externo. El estado académico de una ponencia se gestiona por separado. Los errores de red o de base de datos se muestran en el panel.

## Desarrollo y validación

npm install
npm run dev
npm run lint
npm run build
npm run start
npm run test

Las pruebas del flujo utilizan datos ficticios y un cliente Supabase simulado. No crean inscripciones reales ni envían correos. La migración debe probarse y aplicarse en el proyecto Supabase configurado.

## Archivos principales

- src/lib/congress.ts: tarifas, roles, modalidades e instrucciones.
- src/lib/registration-rules.ts: requisitos de ponentes, importes y PDFs.
- src/components/request-modal.tsx: inscripción, comprobantes y envío de investigaciones.
- src/app/api/registrations/verify/route.ts: verificación de inscripción.
- src/app/api/requests/route.ts: recepción y revisión administrativa.
- src/app/admin/page.tsx: panel de gestión.
- supabase/migrations/: cambios de esquema y reglas de la base de datos.

data/requests.json y code.html son artefactos del prototipo anterior; no se usan para guardar solicitudes del flujo actual.
