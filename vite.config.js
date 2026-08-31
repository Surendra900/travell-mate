import { existsSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

function applyServerEnv(env) {
  Object.entries(env).forEach(([key, value]) => {
    if (process.env[key] === undefined) process.env[key] = value
  })
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => {
      if (!chunks.length) return resolve(undefined)
      const text = Buffer.concat(chunks).toString('utf8')
      try { resolve(JSON.parse(text)) } catch { resolve(text) }
    })
    req.on('error', reject)
  })
}

function createLocalApiResponse(res) {
  let statusCode = 200
  return {
    status(code) { statusCode = code; return this },
    setHeader(name, value) { res.setHeader(name, value); return this },
    json(payload) {
      if (res.writableEnded) return
      res.statusCode = statusCode
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.end(JSON.stringify(payload))
    },
    send(payload) {
      if (res.writableEnded) return
      res.statusCode = statusCode
      if (typeof payload === 'object') {
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.end(JSON.stringify(payload))
      } else {
        res.end(String(payload ?? ''))
      }
    }
  }
}

function localServerlessApiPlugin() {
  return {
    name: 'travelmate-local-serverless-api',
    configureServer(server) {
      const apiRoot = path.resolve(server.config.root, 'api')
      server.middlewares.use('/api', async (req, res, next) => {
        try {
          const requestUrl = new URL(req.url || '/', 'http://travelmate.local')
          const apiPath = requestUrl.pathname.startsWith('/api/')
            ? requestUrl.pathname.slice('/api'.length)
            : requestUrl.pathname
          const cleanPath = apiPath.replace(/^\/+/, '')
          if (!cleanPath) return next()

          const apiFile = path.resolve(apiRoot, `${cleanPath}.js`)
          if (!apiFile.startsWith(`${apiRoot}${path.sep}`) || !existsSync(apiFile)) return next()

          const query = Object.fromEntries(requestUrl.searchParams.entries())
          const body = ['POST', 'PUT', 'PATCH'].includes(String(req.method || '').toUpperCase())
            ? await readRequestBody(req)
            : undefined
          const moduleUrl = `${pathToFileURL(apiFile).href}?dev=${Date.now()}`
          const mod = await import(moduleUrl)
          if (typeof mod.default !== 'function') throw new Error(`API file ${cleanPath}.js does not export a default handler.`)

          await mod.default({
            method: req.method,
            url: `/api/${cleanPath}${requestUrl.search}`,
            headers: req.headers,
            query,
            body,
            socket: req.socket
          }, createLocalApiResponse(res))
        } catch (error) {
          if (!res.writableEnded) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify({ ok: false, mode: 'error', message: error.message || 'Local API handler failed.' }))
          }
        }
      })
    }
  }
}

function splitVendorChunk(id) {
  if (!id.includes('node_modules')) return undefined
  if (id.includes('@clerk')) return 'vendor-auth'
  if (id.includes('leaflet')) return 'vendor-maps'
  if (id.includes('lucide-react')) return 'vendor-icons'
  if (id.includes('react-router')) return 'vendor-router'
  if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('scheduler')) return 'vendor-react'
  return 'vendor'
}

export default defineConfig(({ mode }) => {
  applyServerEnv(loadEnv(mode, process.cwd(), ''))
  return {
    plugins: [react(), localServerlessApiPlugin()],
    server: { host: '127.0.0.1' },
    preview: { host: '127.0.0.1' },
    build: {
      sourcemap: false,
      chunkSizeWarningLimit: 650,
      rollupOptions: { output: { manualChunks: splitVendorChunk } }
    }
  }
})
