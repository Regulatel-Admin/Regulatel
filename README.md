# Portal REGULATEL

Sitio web del Foro Latinoamericano de Entes Reguladores de Telecomunicaciones (REGULATEL). React, TypeScript, Vite, Tailwind CSS.

---

## Portal REGULATEL – Entrega de código fuente

**Versión inicial desarrollada por:**  
**Diego Cuervo**  
Analista de Relaciones Internacionales – INDOTEL  
Correo institucional: dcuervo@indotel.gob.do  

**Alcance realizado:**
- Conceptualización de la propuesta web
- Estructura funcional y de navegación
- Diseño y organización de secciones
- Integración de contenidos institucionales
- Preparación de versión fuente para revisión y despliegue

**Pendiente por parte del equipo técnico:**
- Revisión técnica final
- Ajustes de infraestructura
- Integración institucional
- Publicación en dominio oficial

---

## Sección técnica

### Stack

- **React 18** – Interfaz de usuario
- **TypeScript** – Tipado estático
- **Vite** – Build y servidor de desarrollo
- **Tailwind CSS v4** – Estilos
- **React Router** – Navegación
- **Framer Motion** – Animaciones
- **Lucide React** – Iconografía
- **Neon Postgres** – Base de datos para el panel admin (noticias, eventos, documentos). La conexión se hace solo desde el servidor (API), usando la variable de entorno `DATABASE_URL`.
- **Vercel Blob** – Almacenamiento de archivos reales de producción (imágenes y PDFs). En Neon solo se guardan URL y metadata.

### Instalación

```bash
npm install
```

### Variables de entorno (Neon / API / Blob)

El panel admin persiste noticias, eventos y documentos en **Neon Postgres**. No se guardan credenciales en el código; todo se lee desde variables de entorno.

1. Crea un proyecto en [Neon](https://neon.tech) y un store en [Vercel Blob](https://vercel.com/docs/vercel-blob).
2. Crea un archivo `.env.local` en la raíz del proyecto (no lo subas a Git) con:

   ```env
   DATABASE_URL=postgresql://usuario:contraseña@host/neondb?sslmode=require
   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxx
   ```

   Usa los valores que te da Neon y Vercel. Si no defines `DATABASE_URL`, el portal entra en modo legacy de solo lectura para contenido principal. Si no defines `BLOB_READ_WRITE_TOKEN`, las subidas de archivos devolverán 503.

3. **Inicializar las tablas:** en el panel de Neon, abre **SQL Editor** y ejecuta el contenido del archivo `db/schema.sql` (crea las tablas `news`, `events`, `documents`). Solo hace falta una vez por proyecto.
4. Si ya habías ejecutado una versión anterior del esquema, ejecuta también:
   - `db/migrations/002_blob_support.sql`
   - `db/migrations/003_admin_auth.sql`

### Auth del admin

- El login del admin valida credenciales reales contra `admin_users` en Neon.
- Las contraseñas se guardan hasheadas con `bcryptjs`.
- Las sesiones se guardan en `admin_sessions`.
- La cookie de sesión es `HttpOnly`, `SameSite=Lax` y `Secure` en producción.
- Las rutas de escritura y uploads exigen sesión válida del admin.

**Tablas de auth**

- `admin_users`
- `admin_sessions`

**Crear el primer admin**

Después de inicializar el esquema y con `DATABASE_URL` configurada, ejecuta:

```bash
npm run admin:create -- --name "Nombre Apellido" --email "admin@regulatel.org" --password "tu-password-segura" --role admin
```

Opcional:

```bash
npm run admin:create -- --name "Nombre Apellido" --email "admin@regulatel.org" --username "admin" --password "tu-password-segura" --role admin
```

El script inserta el usuario en `admin_users` con `password_hash`; no guarda la contraseña en texto plano.

### Flujo de uploads

- El panel admin sube archivos a `Vercel Blob` mediante la ruta serverless `POST /api/uploads`.
- El backend valida tipo MIME y tamaño:
  - Imágenes: JPG, PNG, WEBP hasta 20 MB.
  - Documentos: PDF, DOC, DOCX hasta 20 MB.
- Cuando la subida termina, la app guarda en Neon:
  - la URL pública del archivo (`image_url` / `url`)
  - nombre, tipo MIME y tamaño cuando aplica.
- **No se guardan binarios en Postgres.**
- Por seguridad, la app **no borra automáticamente** el archivo viejo al reemplazarlo. Se prioriza estabilidad; la ruta `DELETE /api/uploads` queda disponible para limpiezas controladas.

### Flujo del admin

- El panel admin autentica contra `POST /api/admin/session`.
- La sesión se guarda en `admin_sessions` y la cookie solo contiene un token opaco.
- Las rutas de escritura (`POST`, `PATCH`, `DELETE`) para noticias, eventos, documentos y uploads exigen sesión válida.
- Los `GET` públicos siguen abiertos para que el portal renderice noticias, eventos y documentos.
- Neon queda como fuente activa de contenido estructurado.
- Blob queda como fuente activa de archivos.
- Los datos legacy del código solo se usan como fallback de lectura pública cuando la API no responde; no se usan como fuente de escritura.

### Ejecución en local

```bash
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`. Las rutas `/api/*` solo responden cuando despliegas en Vercel (o usas `vercel dev` con `DATABASE_URL` y `BLOB_READ_WRITE_TOKEN` en `.env.local`). En desarrollo solo con Vite, no tendrás API real; el portal puede caer al modo legacy de lectura pública, pero el admin productivo requiere las rutas server-side.

### Build de producción

```bash
npm run build
```

La salida se genera en la carpeta `dist/`.

### Vista previa del build

```bash
npm run preview
```

### Despliegue en Vercel

#### Protección de suscripciones y contacto

- Configurar `TURNSTILE_SITE_KEY` y `TURNSTILE_SECRET_KEY` en el entorno Production de Vercel. El widget gratuito de Cloudflare debe autorizar `regulatel.org` y `www.regulatel.org`. La clave secreta nunca se incluye en el navegador. Las claves de prueba se rechazan en producción.
- Ambos formularios requieren verificación de Turnstile en servidor, un formulario firmado vigente, un campo trampa vacío, JSON y origen autorizado. Las solicitudes sin prueba no guardan suscriptores ni envían correo.
- Los límites persisten en Neon: contacto permite tres envíos por IP cada 15 minutos y uno por correo cada 10 minutos; suscripción permite cinco por IP cada 15 minutos y uno por correo cada 10 minutos. Los alias de Gmail comparten el mismo límite. El mismo contacto no se repite en 24 horas. Los contadores almacenan hashes y caducan.
- Las nuevas suscripciones quedan pendientes hasta confirmar un enlace de un solo uso que vence en 24 horas. Abrir el enlace no activa el registro: se requiere pulsar el botón de confirmar. Solo entonces se avisa a Secretaría y se incluye en boletines. Los suscriptores anteriores y sus bajas se conservan.
- Los contactos se guardan antes de enviar. Los mensajes con numerosos enlaces o patrones aleatorios en nombre y asunto quedan en revisión. Un administrador puede revisarlos en **Mensajes de contacto**, aprobar/enviar o descartar conservando el historial. Los envíos fallidos o interrumpidos siguen visibles; compruebe la entrega con el proveedor antes de reenviar.
- El esquema se amplía de manera aditiva al primer uso; no se borran registros existentes. No se requiere un servicio antispam de pago. El uso de Vercel, Neon y Resend sigue sujeto a las cuotas de esos servicios.

Comprobaciones sin correos reales ni acceso a producción:

```powershell
node --test scripts/test-contact-antispam.mjs scripts/test-form-security.mjs
node scripts/test-frontend-antispam.cjs
npm run build
```

- **Base de datos:** en el proyecto de Vercel, en **Settings → Environment Variables**, añade `DATABASE_URL` con la connection string de Neon (por ejemplo la que incluye `?sslmode=require`). Así las funciones serverless en `api/` podrán conectarse a Postgres. Sin esta variable, las rutas `/api/news`, `/api/events`, `/api/documents` devolverán 503 y el frontend usará localStorage.
- **Archivos:** añade también `BLOB_READ_WRITE_TOKEN` para que `POST /api/uploads` pueda subir imágenes y PDFs a Vercel Blob. Las URLs resultantes se guardan en Neon.
- **Admin:** crea al menos un usuario en `admin_users` con `npm run admin:create ...` antes de intentar entrar al panel.
- **Video institucional:** el video de la página "Qué somos" está en Git LFS. Para que se vea en Vercel, activa **Git Large File Storage (LFS)** en **Settings → Git**. Sin esta opción, el deploy funciona pero el reproductor puede quedar en negro.

---

## Estructura del proyecto

```
webage regulatel/
├── api/                    # Rutas serverless (Vercel): CRUD noticias, eventos, documentos
│   ├── lib/                # Conexión DB (db.ts), repositorios (news, events, documents)
│   ├── uploads.ts          # POST upload a Blob, DELETE controlado
│   ├── news.ts             # GET list, POST create
│   ├── news/[id].ts        # GET one, PATCH, DELETE
│   ├── events.ts           # GET list, POST create
│   ├── events/[id].ts      # GET one, PATCH, DELETE
│   ├── documents.ts        # GET list, POST create
│   └── documents/[id].ts   # GET one, PATCH, DELETE
├── db/
│   ├── schema.sql          # Esquema inicial (tablas news, events, documents). Ejecutar en Neon SQL Editor.
│   └── migrations/         # Alter scripts incrementales (ej. Blob metadata)
├── public/                 # Assets estáticos (servidos en la raíz)
│   ├── images/             # Imágenes del portal
│   │   ├── logos/          # Logos de entes (INDOTEL, ANATEL, etc.)
│   │   ├── homepage/       # Imágenes del home y slideshow
│   │   ├── noticias/       # Imágenes de noticias
│   │   ├── comite-ejecutivo/
│   │   └── ...             # world-map-dots.jpg, foto-home-regulatel.png, etc.
│   ├── documents/          # PDFs y documentos (planes, actas, revistas, TdR)
│   │   ├── grupos-trabajo/ # Términos de referencia por grupo
│   │   ├── convenios/
│   │   └── cumbre-regulatel-asiet-comtelca/
│   ├── grupos-trabajo/     # Imágenes por grupo de trabajo
│   ├── flags/              # Banderas (buenas prácticas, etc.)
│   └── videos/             # Vídeos institucionales
├── src/
│   ├── components/         # Componentes reutilizables
│   │   ├── home/           # Secciones del home
│   │   ├── layout/         # Header, megamenú, footer
│   │   └── ui/             # Componentes base (Button, Card, etc.)
│   ├── pages/              # Páginas y rutas
│   │   ├── admin/          # Panel de administración
│   │   └── quienes-somos/
│   ├── data/               # Datos estáticos (navegación, noticias, eventos seed)
│   ├── config/             # Configuración (restrictedDocuments, projectInfo)
│   ├── contexts/           # AdminDataContext, AuthContext
│   ├── styles/             # tokens.css y estilos globales
│   ├── lib/                # Utilidades y búsqueda
│   ├── types/              # Tipos TypeScript (Event, etc.)
│   ├── App.tsx             # Rutas principales
│   ├── main.tsx            # Entrada de la aplicación
│   └── index.css           # Estilos globales y Tailwind
├── archive/                # Material de archivo (imágenes/PDFs sueltos de la raíz)
│   └── legacy-assets/      # Assets movidos desde la raíz; no referenciados en código.
│       # Si aún hay imágenes o PDFs en la raíz, moverlos aquí para mantener la raíz limpia.
├── docs/                   # Documentación adicional (opcional)
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

**Dónde está qué:**
- **Logos:** `public/images/logos/` y `public/images/comite-ejecutivo/`
- **Fondos del home / hero:** `public/images/foto-home-regulatel.png`, `public/images/world-map-dots.jpg`
- **Imágenes de cumbres/eventos:** `public/images/cumbre-berec-*.jpg`, `public/images/noticias/`
- **PDFs:** `public/documents/` (planes, actas, revistas, TdR en `documents/grupos-trabajo/`)
- **Metadata del proyecto (autoría):** `src/config/projectInfo.ts` y panel Admin → Información del proyecto

---

## Licencia

Proyecto desarrollado para REGULATEL.


### Formatos de las páginas de materiales de eventos

Admin → **Formato de eventos** (`/admin/content/formato-eventos`) permite comparar tres diseños con los mismos archivos y fotografías: Sencillo, Fotografías destacadas y Por secciones. Elegir una tarjeta solo cambia la vista previa. **Publicar formato** guarda la elección en `site_settings.event_materials_layout` y la aplica a los eventos del selector, sin otro despliegue. El formato inicial es Sencillo.

La vista a pantalla completa usa `eventFormatPreview` y requiere una sesión de administrador. Los visitantes sin sesión ven el formato publicado aunque reciban un enlace de previsualización. El guardado valida el formato, comprueba revisiones anteriores y registra el cambio en auditoría.

Validación aislada con PostgreSQL en memoria, sin credenciales ni escrituras de producción:

```sh
node scripts/test-event-layouts.mjs
```

Los materiales de estos encuentros proceden de https://www.aecidcf.org.uy/regulatel/index.php y https://www.aecidcf.org.uy/regulatel_comite/index.php. Las fotografías y PDF se sirven desde `public/eventos/semana-regulatel-2026/`; los cuatro documentos públicos de conclusiones se conservaron como PDF. También se incluye la presentación de Paridad proporcionada para la reunión de grupos de trabajo.

### Archivos privados en eventos

En la página del evento (modo edición), cada programa o documento tiene un candado: al activarlo, el archivo queda **Privado**. También está la casilla «Privado» al añadir o editar un archivo y en «Administrar archivos». Los visitantes ven el título, la descripción y un botón **Solicitar acceso**, que abre `/acceso-documentos` con el evento y el archivo indicados. Secretaría aprueba o deniega la solicitud por correo, como con las actas; el usuario aprobado inicia sesión y vuelve al evento con los enlaces visibles.

El servidor quita el enlace de los archivos privados en `GET /api/events` salvo para administradores o usuarios con sesión de acceso a documentos, y rechaza guardar una copia sin enlaces. Los archivos de Vercel Blob siguen siendo URLs públicas difíciles de adivinar: quien ya tenga el enlace podría abrirlo.

```sh
node scripts/test-event-publication.mjs
```
