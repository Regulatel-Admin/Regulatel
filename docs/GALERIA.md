# Galería fotográfica

La galería es una página interna en `/galeria` con identidad REGULATEL: álbumes, grid de fotos y lightbox (anterior/siguiente, cerrar).

## Rutas

- **Galería principal:** `/galeria` — lista de álbumes.
- **Álbum:** `/galeria/:slug` — fotos del álbum y visor en lightbox.

## Álbumes y fotos

Los álbumes se definen en `src/data/galeria.ts`. Las imágenes de cada álbum se cargan desde `src/data/galeriaImages.generated.ts`, que se genera con el script de copia.

### Añadir fotos automáticamente

1. En la **raíz del proyecto**, crea las carpetas con exactamente estos nombres:
   - `Asamblea Plenaria de REGULATEL 12122025`
   - `Cumbre REGULATEL ASIET COMTELCA 11122025`

2. Coloca dentro todas las fotos (jpg, png, webp, gif).

3. Ejecuta:
   ```bash
   node scripts/copy-galeria-images.mjs
   ```
   El script copia las fotos a `public/images/galeria/<slug>/` con nombres `01.jpg`, `02.jpg`, etc., y actualiza `src/data/galeriaImages.generated.ts`.

### Añadir fotos manualmente

1. Copia las imágenes en:
   - `public/images/galeria/asamblea-plenaria-12122025/`
   - `public/images/galeria/cumbre-regulatel-asiet-comtelca-11122025/`

2. Edita `src/data/galeriaImages.generated.ts` y añade los nombres de archivo al array correspondiente a cada `slug`, por ejemplo:
   ```ts
   "asamblea-plenaria-12122025": ["01.jpg", "02.jpg", "03.png"],
   ```

## Nuevos álbumes

1. En `src/data/galeria.ts`: añade un objeto a `albumesBase` (slug, title, date, folder).
2. En `src/data/galeriaImages.generated.ts`: añade la clave del slug con un array de nombres de archivo (puede ser `[]`).
3. Opcional: en `scripts/copy-galeria-images.mjs` añade la carpeta origen y el slug en `SOURCE_FOLDERS` para poder usar el script de copia.

## Navegación

El ítem **«Galería fotográfica»** del menú CONOCIMIENTO apunta a `/galeria` (página interna). El enlace del home también va a `/galeria`.
