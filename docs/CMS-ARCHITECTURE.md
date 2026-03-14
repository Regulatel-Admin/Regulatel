# REGULATEL – Arquitectura CMS / Panel Administrable

## 1. Análisis del estado actual

### Backend y persistencia
- **API:** Vercel serverless en `api/` (news, events, documents, cifras, uploads, admin/session, admin/users, etc.).
- **Base de datos:** Neon Postgres. Conexión en `server/lib/db.ts`.
- **Tablas existentes:** `news`, `events`, `documents`, `cifras`, `admin_users`, `admin_sessions`, `admin_audit_log`, `document_access_*`.

### Contenido ya administrable desde el panel
| Módulo        | Ruta admin      | Almacenamiento | API        |
|---------------|-----------------|----------------|------------|
| Noticias      | /admin/noticias | DB `news`      | /api/news  |
| Eventos       | /admin/eventos  | DB `events`    | /api/events |
| REGULATEL cifras | /admin/cifras | DB `cifras`    | /api/cifras |
| Documentos (Gestión) | /admin/documentos | DB `documents` | /api/documents |
| Usuarios admin | /admin/usuarios | DB `admin_users` | /api/admin/users |
| Acceso actas  | /admin/acceso-actas | DB `document_access_users` | /api/admin/document-access-users |

### Contenido hoy hardcodeado (objetivo CMS)
| Contenido           | Archivo(s) actual           | Forma de datos                          |
|---------------------|----------------------------|-----------------------------------------|
| Home hero institucional | `src/data/home.ts`     | `heroInstitucional` (coverImageUrls, badge, title, CTAs) |
| Cumbres destacadas  | `src/data/home.ts`     | `featuredCarouselItems[]`               |
| Accesos principales / Quick links | `src/data/home.ts` | `quickLinks[]`, `accessMainItems[]`     |
| Navegación          | `src/data/navigation.ts`   | `navigationItems[]`                     |
| Galería álbumes     | `src/data/galeria.ts` + `galeriaImages.generated.ts` | `albumesGaleria[]` + imágenes por slug |
| Páginas institucionales | Varios en `src/pages/quienes-somos`, `src/data/` | Textos y bloques en código |

El frontend público usa `AdminDataContext` para noticias, eventos, documentos y cifras (fusiona DB + estático). El resto se importa desde `home.ts`, `navigation.ts`, `galeria.ts`, etc.

---

## 2. Arquitectura propuesta del CMS

### Almacenamiento de contenido “site-wide”
- **Tabla `site_settings`:** pares clave–valor (key TEXT PRIMARY KEY, value JSONB, updated_at).
  - Claves: `home_hero`, `featured_carousel`, `quick_links`, `navigation`.
  - Permite añadir más claves (footer, meta, etc.) sin nuevas migraciones.

### Galería
- **Opción A (recomendada para Fase 3):** Mantener álbumes en `src/data/galeria.ts` y `galeriaImages.generated.ts`; el admin edita vía API que escribe en DB una tabla `gallery_albums` / `gallery_images` y, opcionalmente, un job que sincroniza o genera el JSON. Para la primera versión administrable, el admin puede editar álbumes en una tabla `gallery_albums` (slug, title, date, sort_order) y `gallery_images` (album_id, file_path o blob_url, sort_order); el frontend lee de API cuando hay DB.
- **Opción B (más simple al inicio):** Guardar en `site_settings` la clave `gallery_albums` con un JSON que describa álbumes e imágenes (igual que ahora pero persistido). El admin sube imágenes a Blob o a `public/` y la lista de URLs se guarda en ese JSON.

Para no bloquear el resto del CMS, en la Fase 3 se implementa primero Home, Cumbres y Accesos con `site_settings`; Galería puede seguir leyendo de archivos estáticos y el admin solo “editar” los mismos datos que luego se persisten en `site_settings` (ej. clave `gallery_albums`) o en tablas propias en una fase siguiente.

### API de configuración
- **GET /api/settings?key=home_hero** (o sin query = todos los keys permitidos). Respuesta: `{ key: string, value: object }` o `{ [key: string]: object }`.
- **PUT /api/settings** body: `{ key: string, value: object }`. Solo claves permitidas (whitelist). Requiere sesión admin.
- El frontend público, si `contentSource === 'database'`, puede llamar a GET /api/settings al cargar (o en un contexto) y usar esos valores para hero, carousel, quick links, navegación. Si no hay DB o falla, se usa el estático.

### Panel de administración
- **Estructura de rutas:**
  - `/admin` — Dashboard (resumen, últimos cambios, estado del sitio).
  - Contenido: `/admin/content/home`, `/admin/content/cumbres`, `/admin/content/galeria`, `/admin/content/accesos` (y en el futuro noticias/eventos/documentos desde aquí o enlazados).
  - `/admin/media` — Media library (listado de imágenes/subidas, reutilizar en formularios).
  - `/admin/navigation` — Edición del menú (labels, links, orden).
  - Configuración y publicación en fases posteriores.

- **Experiencia por pantalla:**
  - Panel izquierdo: formulario o listado (campos del hero, ítems del carousel, accesos, etc.).
  - Panel derecho: **preview en vivo** del bloque correspondiente (mismo componente que la web pública, con estado del formulario como props). Opcional: toggle vista desktop / tablet / móvil (ancho del contenedor del preview).
  - Botón “Guardar”: PUT a /api/settings; mensaje de éxito/error. Sin “publicar” explícito en la primera versión: guardar = visible en sitio cuando el frontend lee de API.

### Preview en vivo
- No iframe: en el admin se importan los mismos componentes que la web (p. ej. el hero, la barra de accesos, la card de cumbre). Se alimentan con el estado local del formulario (draft). Así cada cambio en el formulario actualiza al instante el preview.
- Los componentes del sitio público deben poder recibir “override” de datos (props) cuando se usan en el admin; en la página pública los datos vienen del contexto o de `home.ts` estático.

---

## 3. Orden de implementación

1. **Base:** Migración `site_settings`, API GET/PUT /api/settings, librería `server/lib/siteSettings.ts`.
2. **Admin base:** Sidebar con secciones (Dashboard, Contenido > Home, Cumbres, Galería, Accesos; Media); layout con zona de preview a la derecha; estilos premium e institucionales.
3. **Módulos con preview en vivo:**
   - Home: hero (badge, título, descripción, CTAs, imágenes del slideshow) + quick links (orden, labels, hrefs). Preview: hero + barra de accesos.
   - Cumbres destacadas: listado de ítems (título, fecha, imagen, link, etc.), reordenar, activar/desactivar. Preview: carousel o cards.
   - Accesos principales: ítems (label, href, icon). Preview: barra de accesos.
   - Galería: listado de álbumes; editar nombre, fecha, portada; agregar/quitar/reordenar fotos. Preview: card de álbum o grid. Persistencia inicial en `site_settings` o en tablas según decisión arriba.
4. **Integración en sitio público:** Contexto o hook que lee `/api/settings` para `home_hero`, `featured_carousel`, `quick_links` (y luego `navigation`). Páginas Home (y donde aplique) consumen ese contexto; si no hay API o falla, usan `home.ts` / estático.
5. **Fases posteriores:** Media library completa, navegación editable, páginas institucionales, draft/published e historial.

---

## 4. Implementación realizada (Fase 1–3)

### Base
- **Migración:** `db/migrations/004_site_settings.sql` — tabla `site_settings` (key, value JSONB), tablas `gallery_albums` y `gallery_images` (para uso futuro), y ampliación del constraint de auditoría para `site_settings`.
- **API:** `api/settings.ts` — GET (todos o por `?key=`) y PUT (solo con sesión admin). Claves permitidas: `home_hero`, `featured_carousel`, `quick_links`, `navigation`.
- **Servidor:** `server/lib/siteSettings.ts` — `getSetting`, `getAllSettings`, `setSetting`.

### Panel admin
- **Layout:** Sidebar con sección "Contenido" (Home, Cumbres destacadas, Galería, Accesos principales) y "Gestión" (Noticias, Eventos, Cifras, Documentos, Revista). Dashboard con tarjetas a las nuevas secciones.
- **Componente compartido:** `AdminPreviewPanel` — layout en dos columnas (formulario izquierda, preview derecha) con selector de vista desktop/tablet/móvil.
- **Páginas con preview en vivo:**
  - **Admin Content Home** (`/admin/content/home`): formulario Hero (badge, título, descripción, CTAs, URLs del slideshow) y formulario Accesos principales (lista de ítems con etiqueta, enlace, icono, externo). Preview: mismo Hero + QuickLinksBar.
  - **Admin Content Cumbres** (`/admin/content/cumbres`): lista de ítems del carrusel (título, fecha, imagen, enlace, ubicación, texto del botón); añadir, editar, eliminar. Preview: FeaturedCarousel.
  - **Admin Content Accesos** (`/admin/content/accesos`): solo los 4 tiles (misma data que quick_links). Preview: QuickLinksBar.
  - **Admin Content Galería** (`/admin/content/galeria`): listado de álbumes actuales (lectura desde `galeria.ts`) y preview del grid; texto explicando que la edición vía CMS está prevista para una fase posterior.

### Sitio público
- **Contexto:** `SiteSettingsProvider` + `useHomeHero`, `useHomeQuickLinks`, `useFeaturedCarouselSettings` en `src/contexts/SiteSettingsContext.tsx`. Si la API devuelve datos, se usan; si no, se usan los estáticos de `home.ts`.
- **Home:** Consume los tres hooks y muestra hero, quick links y carousel con datos de API o estáticos.

### Tipos
- `src/types/siteSettings.ts`: `HomeHeroSetting`, `QuickLinkSettingItem`, `FeaturedCarouselItemSetting`.
- `src/lib/quickLinks.ts`: mapeo de nombre de icono (string) a LucideIcon para convertir ítems de API en props de `QuickLinksBar`.

---

## 5. Tipos e interfaces (resumen)

- **home_hero:** `{ coverImageUrls: string[]; badge: string; title: string; titleHighlight: string; description: string; primaryCta: { label, href }; secondaryCta: { label, href } }`
- **featured_carousel:** `Array<{ id; type?; date; title; imageUrl; href; ctaPrimaryLabel?; location?; imagePosition?; active?: boolean }>`
- **quick_links:** `Array<{ label: string; href: string; icon?: string; external?: boolean }>` (icon = nombre de icono Lucide para mapear en front).
- **navigation:** Estructura actual de `navigationItems` (anidada) en JSON.

Estos tipos se documentan y reutilizan en `api/settings`, en el admin y en el frontend público.
