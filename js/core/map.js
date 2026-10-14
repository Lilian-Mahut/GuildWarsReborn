function initMap(config) {
    const maxZoom = config.maxZoom;
    const [cols, rows] = config.tilesAtZoom0;
    const factor = Math.pow(2, maxZoom);
    const maxWidth  = cols * factor * 256;
    const maxHeight = rows * factor * 256;

    const map = L.map('map', {
        crs: L.CRS.Simple,
        minZoom: 0,
        maxZoom: maxZoom,
        noWrap: true
    });

    const bounds = L.latLngBounds(
        map.unproject([0, maxHeight], maxZoom),
        map.unproject([maxWidth, 0], maxZoom)
    );

    map.setMaxBounds(bounds);
    map.fitBounds(bounds);

    L.tileLayer(config.tiles, {
        bounds: bounds,
        minZoom: 0,
        maxZoom: maxZoom,
        tileSize: 256,
        attribution: '© ArenaNet - Guild Wars'
    }).addTo(map);

    // Repérage : clic = coordonnées à copier dans le JSON
    map.on('click', (e) => {
        const p = map.project(e.latlng, maxZoom);
        console.log(`{ "x": ${Math.round(p.x)}, "y": ${Math.round(p.y)} }`);
    });

    return map;
}