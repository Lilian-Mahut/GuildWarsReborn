"""Génère, par royaume, la liste "id -> nom anglais" à donner au traducteur.

À lancer depuis la racine du projet :  python tools/export-names.py
Résultat : i18n/_template/names/<royaume>.json
"""
import glob
import json
import os

out_dir = os.path.join('i18n', '_template', 'names')
os.makedirs(out_dir, exist_ok=True)

for realm_dir in sorted(glob.glob('data/realms/*/')):
    realm_id = os.path.basename(os.path.normpath(realm_dir))
    with open(os.path.join(realm_dir, 'realm.json'), encoding='utf-8') as f:
        config = json.load(f)

    names = {'_realm': config['name']}
    missing = 0
    seen = set()

    for category in config['categories'].values():
        with open(os.path.join(realm_dir, category['file']), encoding='utf-8') as f:
            items = json.load(f)
        for item in items:
            if 'id' not in item:
                missing += 1
                continue
            if item['id'] in seen:
                print(f'  ATTENTION {realm_id} : id en double "{item["id"]}"')
            seen.add(item['id'])
            names[item['id']] = item['name']

    with open(os.path.join(out_dir, f'{realm_id}.json'), 'w', encoding='utf-8') as f:
        json.dump(names, f, ensure_ascii=False, indent=2)

    print(f'{realm_id} : {len(names)} noms' + (f' ({missing} lieux SANS id)' if missing else ''))
