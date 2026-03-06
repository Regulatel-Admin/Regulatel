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

### Instalación

```bash
npm install
```

### Ejecución en local

```bash
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`.

### Build de producción

```bash
npm run build
```

La salida se genera en la carpeta `dist/`.

### Vista previa del build

```bash
npm run preview
```

---

## Estructura del proyecto

```
webage regulatel/
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
