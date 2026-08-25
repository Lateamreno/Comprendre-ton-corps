/**
 * Vérifie qu'aucune double page ne déborde de son cadre.
 *
 * Le spread compose le texte en deux colonnes de hauteur fixe. Quand le
 * texte dépasse, il part dans une troisième colonne que `overflow: hidden`
 * masque : rien ne casse, mais une partie de la page devient invisible.
 * C'est indétectable à la lecture du fichier MDX, et facile à rater à
 * l'œil. Ce script mesure la largeur réelle du bloc de colonnes et signale
 * celles qui ont débordé.
 *
 * Usage : node scripts/verifier-cadres.mjs [http://localhost:3117]
 */
import { readdirSync, readFileSync } from 'node:fs'

const base = process.argv[2] ?? 'http://localhost:3117'
const cdp = process.env.CDP ?? 'http://127.0.0.1:9333'

const pages = readdirSync('content/dp')
  .filter((f) => f.endsWith('.mdx'))
  .map((f) => readFileSync(`content/dp/${f}`, 'utf8'))
  .filter((t) => !/^statut: "brouillon"$/m.test(t))
  .map((t) => ({
    numero: t.match(/^numero: "([^"]+)"/m)[1],
    titre: t.match(/^titre: "([^"]+)"/m)[1],
    slug: t.match(/^slug: "([^"]+)"/m)[1],
  }))
  .sort((a, b) => a.numero.localeCompare(b.numero, 'fr', { numeric: true }))

const onglets = await (await fetch(`${cdp}/json/list`)).json()
const ws = new WebSocket(onglets.find((c) => c.type === 'page').webSocketDebuggerUrl)
let n = 0
const envoyer = (method, params = {}) =>
  new Promise((res) => {
    const id = ++n
    const surMessage = (e) => {
      const m = JSON.parse(e.data)
      if (m.id === id) {
        ws.removeEventListener('message', surMessage)
        res(m.result)
      }
    }
    ws.addEventListener('message', surMessage)
    ws.send(JSON.stringify({ id, method, params }))
  })

await new Promise((r) => ws.addEventListener('open', r))
await envoyer('Emulation.setDeviceMetricsOverride', {
  width: 1500, height: 1200, deviceScaleFactor: 1, mobile: false,
})

const mesure = `(() => {
  const c = [...document.querySelectorAll('div')].find(
    (d) => getComputedStyle(d).columnCount === '2',
  )
  if (!c) return JSON.stringify({ erreur: 'colonnes introuvables' })
  return JSON.stringify({ vu: Math.round(c.clientWidth), total: Math.round(c.scrollWidth) })
})()`

let debordent = 0
for (const p of pages) {
  await envoyer('Page.navigate', { url: `${base}/atelier/${p.slug}` })
  await new Promise((r) => setTimeout(r, 900))
  const { result } = await envoyer('Runtime.evaluate', { expression: mesure, returnByValue: true })
  const m = JSON.parse(result.value)
  if (m.erreur) {
    console.log(`  ?  ${p.numero.padEnd(5)} ${p.titre} — ${m.erreur}`)
    continue
  }
  const exces = m.total - m.vu
  if (exces > 4) {
    debordent++
    console.log(`  ✗  ${p.numero.padEnd(5)} ${p.titre} — du texte sort du cadre`)
  }
}

console.log(
  debordent === 0
    ? `\n${pages.length} doubles pages vérifiées, aucune ne déborde.`
    : `\n${debordent} sur ${pages.length} débordent du cadre.`,
)
ws.close()
