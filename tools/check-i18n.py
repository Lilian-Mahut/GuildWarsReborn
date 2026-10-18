"""Vérifie les fichiers de traduction (fr, es, de...).

À lancer depuis la racine du projet :  python tools/check-i18n.py
Contrôle : JSON valide, clés d'interface manquantes ou inconnues, id inconnus
(faute de frappe), valeurs vides, et avancement de la traduction par royaume.
"""
import glob
import json
import os
import sys

problems = 0


def load(path):
    """Lit un JSON ; renvoie None si absent, {} (et un problème) si invalide."""
    global problems
    if not os.path.exists(path):
        return None
    try:
        with open(path, encoding='utf-8') as f:
            text = f.read().strip()
        return json.loads(text) if text else {}
    except (ValueError, OSError) as err:
        print(f'  ERREUR {path} : {err}')
        problems += 1
        return {}


def report(message):
    global problems
    print(f'  {message}')
    problems += 1


with open('i18n/languages.json', encoding='utf-8') as f:
    languages = [lang['code'] for lang in json.load(f) if lang['code'] != 'en']

# Id valides par royaume, d'après les données
valid = {}
for realm_dir in sorted(glob.glob('data/realms/*/')):
    realm_id = os.path.basename(os.path.normpath(realm_dir))
    with open(os.path.join(realm_dir, 'realm.json'), encoding='utf-8') as f:
        config = json.load(f)
    ids = {'_realm'}
    for category in config['categories'].values():
        with open(os.path.join(realm_dir, category['file']), encoding='utf-8') as f:
            ids.update(item['id'] for item in json.load(f) if 'id' in item)
    valid[realm_id] = ids

en_ui = load('i18n/en/ui.json') or {}

for lang in languages:
    print(f'[{lang}]')

    # Textes d'interface
    ui = load(f'i18n/{lang}/ui.json')
    if ui is None:
        report('ui.json absent')
    else:
        for key in en_ui:
            if key not in ui:
                report(f'ui.json : clé manquante "{key}"')
        for key in ui:
            if key not in en_ui:
                report(f'ui.json : clé inconnue "{key}"')
        for key, value in ui.items():
            if not str(value).strip():
                report(f'ui.json : valeur vide pour "{key}"')

    # Noms des lieux
    for realm_id, ids in valid.items():
        names = load(f'i18n/{lang}/names/{realm_id}.json')
        if names is None:
            print(f'  {realm_id} : aucun fichier de noms (tout en anglais)')
            continue
        for key, value in names.items():
            if key not in ids:
                report(f'{realm_id} : id inconnu "{key}"')
            elif not str(value).strip():
                report(f'{realm_id} : valeur vide pour "{key}"')
        done = len([k for k, v in names.items() if k in ids and str(v).strip()])
        print(f'  {realm_id} : {done}/{len(ids)} noms traduits')

print(f'\n{problems} problème(s)' if problems else '\nAucun problème')
sys.exit(1 if problems else 0)
