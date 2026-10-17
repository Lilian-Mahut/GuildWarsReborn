// Création de la carte Leaflet à partir de data/world.json
export function initMap(world) {
    const maxZoom = world.maxZoom;
    const [cols, rows] = world.tilesAtZoom0;   // nombre de tuiles 256px au zoom 0

    const map = L.map('map', {
        crs: L.CRS.Simple,
        minZoom: 0,
        maxZoom: maxZoom,
        noWrap: true
    });

    // Taille de la carte en pixels au zoom maximum
    const factor = Math.pow(2, maxZoom);
    const maxWidth = cols * factor * 256;
    const maxHeight = rows * factor * 256;

    const bounds = L.latLngBounds(
        map.unproject([0, maxHeight], maxZoom),
        map.unproject([maxWidth, 0], maxZoom)
    );

    map.setMaxBounds(bounds);
    map.fitBounds(bounds);

    L.tileLayer(world.tiles, {
        bounds: bounds,
        minZoom: 0,
        maxZoom: maxZoom,
        tileSize: 256,
        errorTileUrl: 'images/blank.jpg',
        attribution: '© ArenaNet - Guild Wars'
    }).addTo(map);


    // Aide au débogage : liste les tuiles absentes
    tiles.on('tileerror', (e) => console.warn('Tuile manquante :', e.tile.src));

    // Repérage : un clic affiche les coordonnées à copier dans les JSON
    map.on('click', (e) => {
        const p = map.project(e.latlng, maxZoom);
        console.log(`{ "x": ${Math.round(p.x)}, "y": ${Math.round(p.y)} }`);
    });

    return map;
}
