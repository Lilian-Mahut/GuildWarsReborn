"""Ajoute un "id" (tiré du nom anglais) aux lieux qui n'en ont pas.

À lancer depuis la racine du projet :  python tools/add-ids.py
Les lieux qui ont déjà un id ne sont pas modifiés.
Fais une copie ou un commit Git avant : les fichiers modifiés sont réécrits
(un lieu par ligne).
"""
import glob
import json
import os
import re
import unicodedata


def slugify(text):
    text = text.replace("'", '').replace('\u2019', '')      # apostrophes : Lion's -> lions
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')


for realm_dir in sorted(glob.glob('data/realms/*/')):
    realm_id = os.path.basename(os.path.normpath(realm_dir))
    with open(os.path.join(realm_dir, 'realm.json'), encoding='utf-8') as f:
        config = json.load(f)

    # Charge tous les fichiers de catégories du royaume
    data, used = {}, set()
    for category in config['categories'].values():
        path = os.path.join(realm_dir, category['file'])
        with open(path, encoding='utf-8') as f:
            data[path] = json.load(f)
        used.update(item['id'] for item in data[path] if 'id' in item)

    added = 0
    for path, items in data.items():
        changed = False
        for index, item in enumerate(items):
            if 'id' in item:
                continue
            base = slugify(item['name_en'])
            new_id, n = base, 2
            while new_id in used:                  # évite les doublons
                new_id, n = f'{base}-{n}', n + 1
            used.add(new_id)
            items[index] = {'id': new_id, **item}  # l'id en première position
            added += 1
            changed = True

        if changed:                                # un lieu par ligne
            with open(path, 'w', encoding='utf-8') as f:
                f.write('[\n' + ',\n'.join('  ' + json.dumps(i, ensure_ascii=False) for i in items) + '\n]\n')

    print(f'{realm_id} : {added} id ajoutés')
