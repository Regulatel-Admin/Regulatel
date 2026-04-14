# Base de datos REGULATEL (Neon)

## Poner el panel de admin en funcionamiento completo

1. Entra en [Neon](https://neon.tech) → tu proyecto → **SQL Editor**.
2. Abre el archivo **`init_all.sql`** de esta carpeta.
3. Copia **todo** su contenido y pégalo en el editor.
4. Ejecuta (Run). No debería dar error; las tablas e índices se crean con `IF NOT EXISTS`.

Con eso quedarán creadas o actualizadas todas las tablas que usa el panel de admin.

## Cargar los eventos “históricos” en el panel (una vez)

Los datos viven en **`db/seed/events-legacy.json`** (calendario que antes estaba solo en código).

**Opción A — desde el admin (recomendado):** entra en **Admin → Eventos**. Si la lista está vacía, verás el aviso **“Importar calendario por defecto”**; al pulsarlo se insertan en Neon los eventos cuyo `id` aún no exista (no pisa filas ya creadas).

**Opción B — desde la terminal** (misma lógica, requiere `DATABASE_URL`):
```bash
npm run db:seed-events
```

## Tablas que se crean

| Tabla | Uso |
|-------|-----|
| `news` | Noticias del sitio |
| `events` | Eventos |
| `documents` | Documentos/publicaciones |
| `site_settings` | Contenido global (hero, carousel, navegación, galería en JSON) |
| `subscribers` | Suscriptores a actualizaciones |
| `cifras` | REGULATEL en cifras (por año) |
| `admin_users` | Usuarios del panel admin |
| `admin_sessions` | Sesiones de admin |
| `admin_audit_log` | Historial de cambios (auditoría) |
| `gallery_albums` | Álbumes de la galería |
| `gallery_images` | Imágenes por álbum |
| `document_access_users` | Usuarios solo para documentos restringidos |
| `document_access_sessions` | Sesiones de esos usuarios |

## Otros archivos

- **`schema.sql`**: Esquema de referencia (mismo contenido que `init_all.sql` para tablas; sin ALTERs).
- **`fix_audit_constraint.sql`**: Solo corrige el constraint de `admin_audit_log` si aparece el error de `resource_type_check`.
- **`migrations/`**: Migraciones antiguas; con `init_all.sql` no hace falta ejecutarlas a mano.
