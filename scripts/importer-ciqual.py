#!/usr/bin/env python3
"""
Produit content/aliments/ciqual-2025.json à partir de la table officielle.

Source   : Table Ciqual 2025, ANSES — données au 2025-11-03
           https://ciqual.anses.fr/cms/telechargement
DOI      : 10.57745/XOJCLN
Licence  : Licence Ouverte / Open Licence (ETALAB) — réutilisation libre
           sous réserve de mentionner la source et la date de version.

Ciqual est la table de référence française : c'est elle qui fait foi pour
l'étiquetage nutritionnel en France. Aucune valeur de composition n'entre
dans le livre autrement que par ce fichier (CLAUDE.md §11).

Usage :
    curl -L -o /tmp/ciqual2025.xlsx \\
      "https://ciqual.anses.fr/cms/sites/default/files/inline-files/Table%20Ciqual%202025_FR_2025_11_03.xlsx"
    python3 scripts/importer-ciqual.py /tmp/ciqual2025.xlsx
"""
import json
import re
import sys
import unicodedata

import pandas as pd

VERSION = "Ciqual 2025 (ANSES), données au 2025-11-03"
DOI = "10.57745/XOJCLN"

# Les en-têtes changent de ponctuation d'une version à l'autre : Ciqual 2020
# écrit « kcal/100 g », Ciqual 2025 « kcal 100 g ». On normalise le texte pour
# l'affichage, et on compare sur une clé sans accents ni ponctuation, pour que
# l'import survive à la prochaine édition.
def normaliser(t: str) -> str:
    t = unicodedata.normalize("NFKC", str(t))
    return re.sub(r"\s+", " ", t).strip()


def cle(t: str) -> str:
    sans_accent = "".join(
        c for c in unicodedata.normalize("NFD", normaliser(t).lower())
        if unicodedata.category(c) != "Mn"
    )
    return re.sub(r"[^a-z0-9]", "", sans_accent)


# nom court -> fragments qui doivent tous apparaître dans l'en-tête
CHAMPS = {
    "kcal": ["energie", "1169", "kcal"],
    "proteines": ["proteines", "jones"],
    "lipides": ["lipides", "g100g"],
    "agSatures": ["agsatures", "g100g"],
    "glucides": ["glucides", "g100g"],
    "sucres": ["sucres", "g100g"],
    "fibres": ["fibresalimentaires"],
    "sel": ["selchlorure"],
    "eau": ["eau", "g100g"],
}


def trouver_colonne(colonnes, fragments):
    """Première colonne dont la clé contient tous les fragments demandés."""
    candidates = [brut for brut, k in colonnes if all(f in k for f in fragments)]
    if len(candidates) > 1:
        # Une correspondance ambiguë est un bug d'import, pas un détail :
        # elle ferait entrer la mauvaise donnée dans le livre.
        raise SystemExit(f"colonne ambiguë pour {fragments} : {candidates}")
    return candidates[0] if candidates else None


def valeur(brut):
    """
    Ciqual encode l'incertitude dans la valeur elle-même. On la conserve
    plutôt que de la lisser : « traces » n'est pas zéro, et « - » n'est pas
    zéro non plus — c'est une absence de mesure, qui doit rester visible.
    """
    if brut is None:
        return None
    t = normaliser(brut)
    if t in ("", "-"):
        return None                                  # non déterminé
    if t.lower() == "traces":
        return {"valeur": 0.0, "mention": "traces"}
    infexpr = re.fullmatch(r"<\s*([\d ,.]+)", t)
    if infexpr:
        return {"valeur": float(infexpr.group(1).replace(",", ".").replace(" ", "")),
                "mention": "inférieur à"}
    try:
        return {"valeur": float(t.replace(",", ".").replace(" ", "").replace(" ", ""))}
    except ValueError:
        return None


def main(chemin_xlsx: str) -> None:
    df = pd.read_excel(chemin_xlsx, dtype=str)
    colonnes = [(c, cle(c)) for c in df.columns]

    resolues = {}
    for court, fragments in CHAMPS.items():
        col = trouver_colonne(colonnes, fragments)
        if col is None:
            raise SystemExit(f"colonne introuvable pour « {court} » ({fragments})")
        resolues[court] = col

    aliments = {}
    for _, r in df.iterrows():
        code = normaliser(r["alim_code"])
        if not code:
            continue
        aliments[code] = {
            "nom": normaliser(r["alim_nom_fr"]),
            "groupe": normaliser(r["alim_grp_nom_fr"]),
            "sousGroupe": normaliser(r.get("alim_ssgrp_nom_fr", "")),
            **{court: valeur(r[col]) for court, col in resolues.items()},
        }

    sortie = {
        "source": VERSION,
        "doi": DOI,
        "licence": "Licence Ouverte / Open Licence (ETALAB)",
        "url": "https://ciqual.anses.fr/cms/telechargement",
        "aliments": aliments,
    }
    chemin = "content/aliments/ciqual-2025.json"
    with open(chemin, "w", encoding="utf-8") as f:
        json.dump(sortie, f, ensure_ascii=False, separators=(",", ":"))

    sans_energie = sum(1 for a in aliments.values() if a["kcal"] is None)
    print(f"{chemin} — {len(aliments)} aliments, {sans_energie} sans énergie")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "/tmp/ciqual2025.xlsx")
