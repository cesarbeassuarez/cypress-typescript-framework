// ─────────────────────────────────────────────────────────
// Corre la suite y genera los dos reportes de una sola pasada.
//
// Por qué un script de Node y no un `&&` en package.json:
// `cypress run` devuelve exit code 1 cuando hay tests en rojo
// (tenemos 2 fallas intencionales documentadas). Con `&&` eso
// cortaría antes de generar Allure. Node nos deja correr los
// pasos igual, sin importar el exit code, y es cross-platform.
// ─────────────────────────────────────────────────────────
const { spawnSync } = require('node:child_process')
const { rmSync, existsSync, mkdirSync, copyFileSync } = require('node:fs')

// Limpieza tolerante: si un archivo está abierto/lockeado (típico en
// Windows), reintenta y no corta el flujo.
const clean = (dir) => {
  try {
    rmSync(dir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 })
  } catch (e) {
    console.warn(`No pude limpiar ${dir} (¿archivo abierto?): ${e.message}`)
  }
}

const run = (command) => spawnSync(command, { stdio: 'inherit', shell: true })

// 1. Limpio lo de esta corrida. OJO: NO borro allure-history.jsonl —
//    ese archivo es el que Allure 3 usa para acumular el Trend.
clean('allure-results')
clean('allure-report')
clean('cypress/reports')
clean('cypress/screenshots')

// 2. Corro la suite (Mochawesome se genera solo en after:run).
run('cypress run --browser edge')

// 3. Allure 3 genera el reporte según allurerc.mjs (single file + history).
run('npx allure generate allure-results')

// 4. Copio el HTML único de Allure a un nombre claro para compartir.
//    El plugin "awesome" puede dejarlo en allure-report/ o allure-report/awesome/.
const candidatos = ['allure-report/index.html', 'allure-report/awesome/index.html']
const single = candidatos.find(existsSync)
if (single) {
  mkdirSync('cypress/reports', { recursive: true })
  copyFileSync(single, 'cypress/reports/allure-single.html')
} else {
  console.warn('No encontré el HTML único de Allure en allure-report/. ¿Falló el generate?')
}

console.log('\n─────────────────────────────────────────')
console.log(' Reportes generados:')
console.log('  Mochawesome    : cypress/reports/mochawesome/index.html')
console.log('  Allure (1 file): cypress/reports/allure-single.html (doble clic)')
console.log('─────────────────────────────────────────')
