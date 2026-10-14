async function fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Impossible de charger ${url} (${res.status})`);
    return res.json();
}

function loadStylesheet(href) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
}

async function loadRealm(id) {
    const base = `data/realms/${id}/`;
    const realm = await fetchJson(base + 'realm.json');

    realm.iconsPath = `assets/realms/${id}/icons/`;
    loadStylesheet(`css/realms/${id}.css`);

    // Charge le fichier de chaque catégorie
    await Promise.all(
        Object.values(realm.categories).map(async (def) => {
            def.items = await fetchJson(base + def.file);
        })
    );

    // Le nom du royaume est une catégorie "realm" avec un seul élément
    realm.categories.realm = {
        items: [{ name: realm.name, x: realm.title.x, y: realm.title.y }]
    };

    return realm;
}

export async function loadWorld() {
    const world = await fetchJson('data/world.json');
    const { layers, iconScales } = await fetchJson('data/layers.json');

    world.layers = layers;
    world.iconScales = iconScales;
    world.realms = await Promise.all(world.realms.map(loadRealm));

    return world;
}