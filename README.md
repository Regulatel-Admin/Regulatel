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
  - Imágenes: JPG, PNG, WEBP hasta 8 MB.
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
