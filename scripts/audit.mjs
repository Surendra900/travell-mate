import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const errors = []

function walk(directory) {
  const files = []
  for (const name of readdirSync(directory)) {
    if (['node_modules', 'dist', '.vercel', '.git'].includes(name)) continue
    const full = path.join(directory, name)
    if (statSync(full).isDirectory()) files.push(...walk(full))
    else files.push(full)
  }
  return files
}

const files = walk(root)
const sourceFiles = files.filter((file) => /\.(js|jsx|json|html|md|webmanifest)$/.test(file))
for (const file of sourceFiles) {
  const relative = path.relative(root, file)
  const text = readFileSync(file, 'utf8')
  if (text.includes('packages.applied-caas-gateway')) errors.push(`${relative}: private internal npm registry URL found`)
  if (/toISOString\(\)\.slice\(0,\s*10\)/.test(text)) errors.push(`${relative}: UTC date truncation found`)
  if (relative.startsWith(`api${path.sep}`) && /\b(?:raw|compactRaw)\s*:/.test(text)) errors.push(`${relative}: raw provider payload field found`)
}

const lock = readFileSync(path.join(root, 'package-lock.json'), 'utf8')
if (!lock.includes('https://registry.npmjs.org/')) errors.push('package-lock.json: public npm registry URLs were not found')

const sw = readFileSync(path.join(root, 'public/sw.js'), 'utf8')
if (!sw.includes("url.pathname.startsWith('/api/')") || !sw.includes("cache: 'no-store'")) errors.push('public/sw.js: API no-store bypass is missing')

for (const icon of ['icon-192.png', 'icon-512.png', 'icon-maskable-512.png']) {
  if (!existsSync(path.join(root, 'public/icons', icon))) errors.push(`public/icons/${icon}: missing PWA icon`)
}

for (const file of files.filter((item) => item.endsWith('.js') && (item.includes(`${path.sep}api${path.sep}`) || path.basename(item) === 'vite.config.js'))) {
  try { execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' }) }
  catch (error) { errors.push(`${path.relative(root, file)}: JavaScript syntax check failed\n${error.stderr?.toString() || error.message}`) }
}

if (errors.length) {
  console.error(`Audit failed with ${errors.length} problem(s):`)
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}
console.log(`Audit passed: ${files.length} project files checked.`)
