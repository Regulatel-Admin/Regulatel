# API en Vercel – Una sola función

Para evitar 404 y el error "El servidor devolvió una página en lugar de datos":

1. **Router que sí funciona en Vercel (Vite)**  
   El frontend llama a **`/api/route/*`** (ej. `/api/route/admin/session`, `/api/route/news`). Esas peticiones las atiende **`api/route/[...path].ts`**. El handler en la raíz `api/[[...path]].ts` a menudo da 404 en proyectos Vite; por eso se usa la ruta explícita `/api/route/`.

2. **Handlers en `server/api-handlers/`**  
   La lógica está en `server/api-handlers/`. El router solo importa y despacha por el primer segmento del path.

3. **Root Directory en Vercel (muy importante)**  
   Si ves HTML en lugar de JSON o 404 en `/api/*`:
   - En Vercel: **Settings → General → Root Directory** debe estar **vacío** (raíz del repositorio).
   - Si Root Directory apunta a un subcarpeta (ej. `frontend`), la carpeta `api/` no se incluye en el despliegue y todas las peticiones /api/* devuelven el SPA (index.html).

4. **Comprobar en producción**  
   - Abre `https://tu-dominio.vercel.app/api/health`. Debe devolver JSON: `{ "ok": true, "api": true }`.  
   - Si devuelve HTML o 404, repasa el punto 3 y redeploya.

5. **Variables de entorno**  
   Configura en Vercel: `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`. Sin `DATABASE_URL`, el login y el admin responderán 503.

6. **Si ves 401 y "devolvió una página" o HTML**  
   La **Deployment Protection** (protección por contraseña o Vercel Authentication) intercepta las peticiones a `/api/*` y devuelve una página de login (401 + HTML).  
   **Solución:** En Vercel → **Settings → Deployment Protection** → desactiva la protección para el entorno que uses (Production/Preview) o configura una excepción para que las rutas `/api` no requieran contraseña. No puede configurarse por `vercel.json`; solo desde el dashboard.
