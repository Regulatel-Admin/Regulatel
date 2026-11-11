# Observatorio Regulatorio (`/observatorio-regulatorio`)

Comparador visual de los 23 miembros de REGULATEL: dos países lado a lado, **8 temas × 5 indicadores = 40 indicadores** por país,
cada uno con estado (✓ Sí · ◐ En proceso · ✗ No · — Sin dato), nota breve, año y **fuente oficial**.

> Es distinto del catálogo **Mejores prácticas regulatorias** (`/micrositio-buenas-practicas`), que lista documentos por país.

## Vistas

| Vista | Qué muestra |
|-------|-------------|
| **Comparar dos países** | Paso 1: selector A vs B (con intercambio y pares sugeridos). Paso 2: resumen ejecutivo (% de prácticas en común, huella regulatoria en radar, barras enfrentadas por tema y fichas visuales "en común / solo A / solo B"). Paso 3: tablero de 8 temas con ✓/✗; cada fila abre un panel con detalle y fuente. Fichas de los reguladores. |
| **Mapa regional** | Mapa de puntos de Latinoamérica + recuadro Europa: elija tema e indicador y el mapa muestra quién lo tiene. Listas por estado, adopción regional y matriz 23 países × 8 temas. |
| **Informe** (`/observatorio-regulatorio/informe`, uso interno) | Qué estaba desactualizado en el Observatorio anterior y en los documentos del catálogo, con su reemplazo verificado. |

Extras: enlace compartible (`?a=do&b=cr`), descarga CSV (Excel) y versión de impresión/PDF con todo el detalle.

## Datos

- `src/data/observatorio/schema.ts` — temas, indicadores (definiciones en lenguaje sencillo) y tipos.
- `src/data/observatorio/paises/<iso>.json` — un perfil por país (se cargan automáticamente).
- `src/data/observatorio/auditoria/<iso>.json` — auditoría de documentos/enlaces (para el informe).
- `src/lib/observatorio.ts` — lógica de comparación.

### Reglas de los estados
- `si`: existe y está vigente (requiere `fuente`).
- `parcial`: limitado, piloto, en implementación o en consulta formal (requiere `fuente`).
- `no`: confirmado que no existe con fuente explícita (p. ej. listas oficiales de tratados).
- `sin_dato`: no se pudo confirmar con fuentes públicas. **Ante la duda, `sin_dato`.**

### Cómo se calcula "en común"
De las prácticas presentes (✓ o ◐) en al menos uno de los dos países, porcentaje que tienen ambos.
Las barras y el radar suman ✓ = 1 y ◐ = 0,5 por tema (máximo 5).

## Actualizar un país
1. Editar `src/data/observatorio/paises/<iso>.json` respetando el esquema (ver `GUIDE.md` del paquete de investigación).
2. Validar: `node output/observatorio-research/validate.mjs <archivo>`.
3. Actualizar `verificadoEn`.

La verificación de noviembre de 2026 se hizo con una investigación por país en fuentes oficiales y una segunda revisión
independiente, más una auditoría de consistencia de tratados (Budapest y Tampere) entre países.
