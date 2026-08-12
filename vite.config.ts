import { defineConfig, type Plugin, type ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import dotenv from 'dotenv'
import type { IncomingMessage, ServerResponse } from 'http'

function applyLocalEnv() {
  const root = process.cwd()
  dotenv.config({ path: path.resolve(root, '.env') })
  dotenv.config({ path: path.resolve(root, '.env.local'), override: true })
  const raw = process.env.DATABASE_URL ?? ''
  try {
    const host = raw ? new URL(raw).hostname : '(none)'
    console.log(`[local-api] DATABASE_URL host: ${host}`)
  } catch {
    console.log('[local-api] DATABASE_URL is set but not a valid URL')
  }
}

function rewriteApiUrl(url: string): string {
  const qIndex = url.indexOf('?')
  const pathname = qIndex >= 0 ? url.slice(0, qIndex) : url
  const search = qIndex >= 0 ? url.slice(qIndex + 1) : ''
  if (pathname === '/api/route' || pathname.startsWith('/api/route/')) return url
  const rest = pathname.replace(/^\/api\/?/, '')
  const params = new URLSearchParams(search)
  if (rest && !params.has('path')) params.set('path', rest)
  const q = params.toString()
  return q ? `/api/route?${q}` : '/api/route'
}

function localApiPlugin(): Plugin {
  return {
    name: 'regulatel-local-api',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? ''
        if (!url.startsWith('/api')) return next()
        try {
          req.url = rewriteApiUrl(url)
          const mod = await server.ssrLoadModule('/api/route.ts')
          await (mod.default as (req: IncomingMessage, res: ServerResponse) => Promise<void>)(
            req,
            res
          )
        } catch (err) {
          console.error('[local-api]', err)
          if (!res.headersSent) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(
              JSON.stringify({
                error: err instanceof Error ? err.message : 'Error en la API local',
              })
            )
          }
        }
      })
    },
  }
}

export default defineConfig(() => {
  applyLocalEnv()

  return {
    plugins: [react(), localApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    ssr: {
      external: ['bcryptjs', 'postgres', 'resend', '@vercel/blob'],
    },
  }
})
