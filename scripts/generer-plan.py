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

def reperer_redigees():
    """
    Toute DP dont le statut n'est plus « brouillon » est un texte d'auteur :
    son corps, son statut et ses sources survivent à la régénération. Le
    repérage se fait par (partie, ordre) lus dans le fichier lui-même —
    aucune liste à entretenir à la main.
    """
    redigees = {}
    for chemin in DOSSIER.glob('*.mdx'):
        brut = chemin.read_text(encoding='utf-8')
        m = re.match(r'^---\n(.*?)\n---', brut, re.S)
        if not m:
            continue
        tete = m.group(1)
        statut = re.search(r'^statut:\s*"([^"]+)"', tete, re.M)
        partie = re.search(r'^partie:\s*(\d+)', tete, re.M)
        ordre = re.search(r'^ordre:\s*(\d+)', tete, re.M)
        if statut and partie and ordre and statut.group(1) != 'brouillon':
            redigees[(int(partie.group(1)), int(ordre.group(1)))] = chemin.name
    return redigees


DEJA_ECRIT = reperer_redigees()


def slugifier(t: str) -> str:
    t = ''.join(c for c in unicodedata.normalize('NFD', t.lower())
                if unicodedata.category(c) != 'Mn')
    t = t.replace("'", '').replace('’', '')
    t = re.sub(r'[^a-z0-9]+', '-', t)
    return re.sub(r'-+', '-', t).strip('-')


def liste_yaml(tete: str, champ: str):
    """Les entrées du bloc « champ: » uniquement — pas celles des autres listes."""
    m = re.search(rf'^{champ}:\n((?:\s+-\s+"[^"\n]*"\n?)*)', tete, re.M)
    if not m:
        return []
    return re.findall(r'-\s+"([^"]+)"', m.group(1))


def corps_existant(nom: str):
    """Rend (corps, statut, sources, picto) d'une DP déjà rédigée."""
    chemin = DOSSIER / nom
    if not chemin.exists():
        return None
    brut = chemin.read_text(encoding='utf-8')
    m = re.match(r'^---\n(.*?)\n---\n(.*)$', brut, re.S)
    if not m:
        return None
    tete, corps = m.group(1), m.group(2).strip()
    statut = re.search(r'^statut:\s*"([^"]+)"', tete, re.M)
    return corps, (statut.group(1) if statut else 'ecrit'), liste_yaml(tete, 'sources'), liste_yaml(tete, 'picto')


def bloc_liste(champ, valeurs):
    if not valeurs:
        return f'{champ}: []'
    lignes = '\n'.join(f'  - "{v}"' for v in valeurs)
    return f'{champ}:\n{lignes}'


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
            corps, statut, sources, picto = existant
            compte['repris'] += 1
        else:
            statut = 'brouillon'
            sources = []
            picto = []
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
            f"{bloc_liste('sources', sources)}\n"
            f"{bloc_liste('picto', picto)}\n"
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
