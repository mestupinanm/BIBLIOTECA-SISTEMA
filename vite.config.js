import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Este plugin hace dos cosas críticas para Chrome 44 en la tablet de Pepper:
 *
 * 1. Elimina el atributo `crossorigin` de todos los scripts y links del HTML.
 *    El servidor de NAO PackageManager no envía cabeceras Access-Control-Allow-Origin.
 *    Con `crossorigin`, Chrome 44 trata la petición como CORS y la bloquea
 *    silenciosamente si no hay esa cabecera — incluso para recursos del mismo origen.
 *
 * 2. Inlinea SystemJS (s.min.js, 8KB, ES5 puro) directamente en el HTML,
 *    ANTES de cualquier script de Vite. Con `externalSystemJS: true`, el bundle
 *    de polyfills ya no incluye SystemJS — nosotros lo aportamos inline.
 *    Esto elimina por completo la dependencia de red para que `System` esté definido:
 *    no importa si el archivo polyfills carga o no, SystemJS siempre estará disponible.
 */
function patchForPepperTablet() {
  const sysPath = path.resolve(__dirname, 'node_modules/systemjs/dist/s.min.js')
  const sysContent = fs.existsSync(sysPath) ? fs.readFileSync(sysPath, 'utf-8') : ''

  return {
    name: 'patch-for-pepper-tablet',
    enforce: 'post',
    transformIndexHtml(html) {
      let result = html

      // Paso 1: eliminar crossorigin de todo el HTML generado
      result = result.replace(/ crossorigin/g, '')

      // Paso 2: inyectar SystemJS inline antes del primer script de Vite
      // Con renderModernChunks:false + externalSystemJS:true, el primer script
      // de Vite es el polyfills (core-js). SystemJS va antes que él.
      if (sysContent) {
        const firstViteScript = '<script id="vite-legacy-polyfill"'
        const fallback = '<script id="vite-legacy-entry"'
        const insertBefore = result.includes(firstViteScript) ? firstViteScript : fallback

        result = result.replace(
          insertBefore,
          `<script>${sysContent}</script>\n    ${insertBefore}`
        )
      }

      return result
    }
  }
}

export default defineConfig({
  base: '/apps/robot-page/biblioteca/',
  plugins: [
    react(),
    legacy({
      targets: ['chrome >= 44'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      renderModernChunks: false,
      // Con externalSystemJS:true el bundle de polyfills NO incluye SystemJS.
      // Nosotros lo aportamos inline (patchForPepperTablet), eliminando
      // cualquier posible fallo de carga del archivo polyfills.
      externalSystemJS: true
    }),
    patchForPepperTablet()
  ],
  build: {
    minify: 'terser',
    terserOptions: {
      compress: { arrows: false },
      format: { ecma: 5 }
    }
  }
})
