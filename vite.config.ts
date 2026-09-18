/// <reference types="vitest/config" />
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { type Plugin, type ResolvedConfig, createServer, defineConfig } from 'vite'

function csp(): Plugin {
  let api = ''
  return {
    name: 'csp',
    apply: 'build',
    configResolved({ env }) {
      const url: string = env.VITE_API_URL
      if (!url || /^\/(?!\/)/.test(url)) return
      if (!URL.canParse(url) || !/^https:|^http:\/\/localhost\b/.test(url)) {
        throw new Error(`VITE_API_URL must be /path or https://host, got "${url}"`)
      }
      api = new URL(url).origin
    },
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        const inline = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(
          ([, body]) => `'sha256-${createHash('sha256').update(body).digest('base64')}'`,
        )
        const policy = [
          "default-src 'self'",
          `script-src 'self' ${inline.join(' ')}`,
          `connect-src 'self' ${api}`,
          "img-src 'self' https: data:",
          "style-src-attr 'unsafe-inline'",
          "object-src 'none'",
          "base-uri 'none'",
          "form-action 'none'",
        ].join('; ')
        return [{ tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: policy }, injectTo: 'head-prepend' }]
      },
    },
  }
}

function prerender(): Plugin {
  let config: ResolvedConfig
  return {
    name: 'prerender',
    apply: 'build',
    configResolved(resolved) {
      config = resolved
    },
    async closeBundle() {
      if (config.env.VITE_API_URL) return
      const server = await createServer({
        mode: config.mode,
        logLevel: 'error',
        server: { middlewareMode: true, watch: null, hmr: false },
        appType: 'custom',
      })
      try {
        const { render } = await server.ssrLoadModule('/src/prerender.tsx')
        const { html: rendered, cats } = await render()
        const html = rendered.replace(/^(?:<(?:link|meta)\b[^>]*>|<title>[^<]*<\/title>)+/, '')
        const data = JSON.stringify(cats).replaceAll('&', '&amp;').replaceAll('"', '&quot;')
        const file = path.resolve(config.root, config.build.outDir, 'index.html')
        const page = fs.readFileSync(file, 'utf8')
        if (!page.includes('<div id="root"></div>')) throw new Error('prerender: no empty #root in index.html')
        fs.writeFileSync(
          file,
          page.replace('<div id="root"></div>', `<div id="root" data-cats="${data}"><div data-prerendered>${html}</div></div>`),
        )
      } finally {
        await server.close()
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), csp(), prerender()],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    include: ['src/**/*.test.{ts,tsx}'],
    unstubEnvs: true,
    unstubGlobals: true,
    env: { VITE_API_URL: '' },
  },
})
