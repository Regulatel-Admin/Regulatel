# Scraper: Buenas Prácticas Regulatorias (REGULATEL)

Extrae toda la información de la sección oficial de REGULATEL (listado + detalle por país) y genera un JSON para la página del proyecto.

## Requisitos

- Node.js 18+
- Dependencia: `playwright` (ya en el proyecto). Navegador: Chromium (`npx playwright install chromium`).

## Uso

```bash
# Desde la raíz del proyecto
npm run scrape:mejores-practicas
```

Con navegador visible (por si el sitio bloquea headless):

```bash
npm run scrape:mejores-practicas:headed
```

O directamente:

```bash
node scripts/scrape-mejores-practicas.mjs
node scripts/scrape-mejores-practicas.mjs --headed
node scripts/scrape-mejores-practicas.mjs --output public/mejoresPracticasRegulatel.json
```

## Salida

- **Por defecto:** `public/mejoresPracticasRegulatel.json`
- La página **Buenas Prácticas Regulatorias** (`/micrositio-buenas-practicas`) carga este JSON al montar. Si existe, lo usa; si no, usa los datos estáticos de `src/data/buenasPracticas/`.

## Resumen en consola

Al finalizar, el script imprime:

- Total de países/entradas
- Total de categorías
- Total de enlaces extraídos
- Ruta del archivo guardado

## Estructura del JSON

```json
[
  {
    "country": "Argentina",
    "entity": "Ente Nacional de Comunicaciones",
    "acronym": "ENACOM",
    "detailUrl": "https://regulatel.indotel.gob.do/pagina/detalle?id=174",
    "categories": [
      {
        "name": "Espectro radioeléctrico",
        "links": [
          { "title": "CABFRA", "url": "https://..." }
        ]
      }
    ]
  }
]
```

## Errores

Si un país falla (timeout, error de red), el script lo registra y sigue con el siguiente. No se aborta todo el proceso.
