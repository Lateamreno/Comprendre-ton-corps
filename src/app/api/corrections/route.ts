/**
 * Réception des corrections de relecture.
 *
 * Les corrections d'une page sont écrites telles quelles dans le repo, sur la
 * branche `corrections` — un fichier JSON par page. Pas de base de données :
 * Git est le stockage, comme pour tout le contenu (CLAUDE.md §2, règle 4), et
 * c'est là que Claude les lit pour les appliquer par lot.
 *
 * Deux variables d'environnement, côté Vercel uniquement :
 * - GITHUB_CORRECTIONS_TOKEN : jeton à portée « Contents » sur ce seul repo.
 *   Absent, la route répond 501 et le site bascule sur la copie manuelle.
 * - RELECTURE_CLE : clé partagée exigée dans l'en-tête x-relecture-cle, pour
 *   que la route publique n'écrive pas dans le repo pour n'importe qui.
 */

const DEPOT = 'Lateamreno/Comprendre-ton-corps'
const BRANCHE = 'corrections'
const API = `https://api.github.com/repos/${DEPOT}/contents`

type Correction = {
  id: string
  extrait: string
  avant: string
  apres: string
  note: string
  creeLe: string
}

function nomFichier(chemin: string): string {
  const sur = chemin.replace(/^\/+/, '').replace(/[^a-zA-Z0-9-]+/g, '_') || 'accueil'
  return `corrections/${sur.slice(0, 120)}.json`
}

function entetes(jeton: string) {
  return {
    authorization: `Bearer ${jeton}`,
    accept: 'application/vnd.github+json',
    'user-agent': 'comprendre-ton-corps-relecture',
  }
}

async function shaExistant(jeton: string, fichier: string): Promise<string | null> {
  const reponse = await fetch(`${API}/${fichier}?ref=${BRANCHE}`, {
    headers: entetes(jeton),
    cache: 'no-store',
  })
  if (reponse.status === 404) return null
  if (!reponse.ok) throw new Error(`GitHub ${reponse.status}`)
  const corps = (await reponse.json()) as { sha?: string }
  return corps.sha ?? null
}

export async function POST(req: Request) {
  const jeton = process.env.GITHUB_CORRECTIONS_TOKEN
  if (!jeton) {
    return Response.json({ github: false }, { status: 501 })
  }

  const cle = process.env.RELECTURE_CLE
  if (cle && req.headers.get('x-relecture-cle') !== cle) {
    return Response.json({ erreur: 'clé de relecture invalide' }, { status: 401 })
  }

  let corps: { chemin?: string; corrections?: Correction[] }
  try {
    corps = await req.json()
  } catch {
    return Response.json({ erreur: 'JSON invalide' }, { status: 400 })
  }
  const chemin = corps.chemin
  const corrections = corps.corrections
  if (typeof chemin !== 'string' || !chemin.startsWith('/') || !Array.isArray(corrections)) {
    return Response.json({ erreur: 'chemin ou corrections manquants' }, { status: 400 })
  }
  if (JSON.stringify(corrections).length > 200_000) {
    return Response.json({ erreur: 'trop volumineux' }, { status: 413 })
  }

  const fichier = nomFichier(chemin)

  // Un conflit de sha peut survenir entre la lecture et l'écriture : on refait
  // une passe avant d'abandonner.
  for (let essai = 0; essai < 2; essai++) {
    try {
      const sha = await shaExistant(jeton, fichier)

      if (corrections.length === 0) {
        if (sha === null) return Response.json({ ok: true })
        const suppression = await fetch(`${API}/${fichier}`, {
          method: 'DELETE',
          headers: entetes(jeton),
          body: JSON.stringify({
            message: `Relecture : plus de corrections sur ${chemin}`,
            sha,
            branch: BRANCHE,
          }),
        })
        if (suppression.ok) return Response.json({ ok: true })
        if (suppression.status === 409) continue
        throw new Error(`GitHub ${suppression.status}`)
      }

      const contenu = { chemin, majLe: new Date().toISOString(), corrections }
      const ecriture = await fetch(`${API}/${fichier}`, {
        method: 'PUT',
        headers: entetes(jeton),
        body: JSON.stringify({
          message: `Relecture : ${corrections.length} correction(s) sur ${chemin}`,
          content: Buffer.from(JSON.stringify(contenu, null, 2), 'utf8').toString('base64'),
          branch: BRANCHE,
          ...(sha ? { sha } : {}),
        }),
      })
      if (ecriture.ok) return Response.json({ ok: true })
      if (ecriture.status === 409) continue
      throw new Error(`GitHub ${ecriture.status}`)
    } catch {
      if (essai === 1) return Response.json({ erreur: 'écriture impossible' }, { status: 502 })
    }
  }
  return Response.json({ erreur: 'conflit persistant' }, { status: 502 })
}
