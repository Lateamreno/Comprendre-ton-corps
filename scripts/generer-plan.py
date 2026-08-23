# -*- coding: utf-8 -*-
"""
Écrit content/dp/ à partir du plan.

Les doubles pages déjà rédigées conservent leur texte et leur statut : seul
leur cadre (numéro, partie, ordre) est remis à jour. Les autres sont créées
au statut « brouillon », avec en tête la question à laquelle elles répondent
et les idées à y mettre.
"""
import pathlib, re, sys, unicodedata
sys.path.insert(0, 'scripts')
from plan import PLAN

DOSSIER = pathlib.Path('content/dp')

# Ce qui est déjà écrit, et où ça va dans le nouveau plan.
DEJA_ECRIT = {
    (0, 1): '00-01-avant-propos.mdx',
    (2, 1): '01-01-la-nourriture-est-une-information.mdx',
    (2, 11): '01-13bis-une-calorie-nest-pas-une-calorie.mdx',
}


def slugifier(t: str) -> str:
    t = ''.join(c for c in unicodedata.normalize('NFD', t.lower())
                if unicodedata.category(c) != 'Mn')
    t = t.replace("'", '').replace('’', '')
    t = re.sub(r'[^a-z0-9]+', '-', t)
    return re.sub(r'-+', '-', t).strip('-')


def corps_existant(nom: str):
    """Rend (corps, statut, sources) d'une DP déjà rédigée."""
    chemin = DOSSIER / nom
    if not chemin.exists():
        return None
    brut = chemin.read_text(encoding='utf-8')
    m = re.match(r'^---\n(.*?)\n---\n(.*)$', brut, re.S)
    if not m:
        return None
    tete, corps = m.group(1), m.group(2).strip()
    statut = re.search(r'^statut:\s*"([^"]+)"', tete, re.M)
    sources = re.findall(r'^\s+-\s+"([^"]+)"', tete, re.M)
    return corps, (statut.group(1) if statut else 'ecrit'), sources


def bloc_sources(sources):
    if not sources:
        return 'sources: []'
    lignes = '\n'.join(f'  - "{s}"' for s in sources)
    return f'sources:\n{lignes}'


anciens = {p.name for p in DOSSIER.glob('*.mdx')}
ecrits = set()
compte = {'repris': 0, 'cree': 0}

for partie, entrees in sorted(PLAN.items()):
    for ordre, titre, question, resume, idees in entrees:
        numero = f'{partie}.{ordre}'
        slug = slugifier(question)
        nom = f'{partie:02d}-{ordre:02d}-{slugifier(titre)[:44]}.mdx'

        existant = corps_existant(DEJA_ECRIT.get((partie, ordre), '')) if (partie, ordre) in DEJA_ECRIT else None

        if existant:
            corps, statut, sources = existant
            compte['repris'] += 1
        else:
            statut = 'brouillon'
            sources = []
            puces = '\n'.join(f'- {i}' for i in idees)
            corps = (
                f'> **Question** — {question}\n\n'
                f'{resume}\n\n'
                f'## Ce que la double page doit établir\n\n'
                f'{puces}\n\n'
                f'## Reste à faire\n\n'
                f'- Rédiger le texte\n'
                f'- Citer les sources, sans quoi la page ne peut pas être publiée\n'
                f'- Décrire la visualisation pour l’illustrateur\n'
            )

        tete = (
            '---\n'
            f'numero: "{numero}"\n'
            f'partie: {partie}\n'
            f'ordre: {ordre}\n'
            f'titre: "{titre}"\n'
            f'question: "{question}"\n'
            f'slug: "{slug}"\n'
            f'statut: "{statut}"\n'
            'extrait_ratio: 0.15\n'
            f'resume: "{resume}"\n'
            f'{bloc_sources(sources)}\n'
            'picto: []\n'
            '---\n\n'
        )
        (DOSSIER / nom).write_text(tete + corps + '\n', encoding='utf-8')
        ecrits.add(nom)
        if not existant:
            compte['cree'] += 1

for obsolete in anciens - ecrits:
    (DOSSIER / obsolete).unlink()

print(f"{len(ecrits)} doubles pages — {compte['repris']} reprises, {compte['cree']} créées, "
      f"{len(anciens - ecrits)} anciens fichiers retirés")
