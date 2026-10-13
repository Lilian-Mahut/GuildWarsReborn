// Configuration de la carte Leaflet pour un jeu vidéo
function initMap() {
    // Crée la carte en mode "coordonnées plates"
    const map = L.map('map', {
        crs: L.CRS.Simple,
        minZoom: -2,
        maxZoom: 4,
    });

    // Définir les dimensions de notre image de carte (on ajustera les valeurs exactes plus tard)
    const bounds = [[0, 0], [1000, 1000]];
    map.fitBounds(bounds);

    // Pour l'instant, on met une grille de test en attendant les tuiles de GW1
    L.GridLayer.DebugCoords = L.GridLayer.extend({
        createTile: function (coords) {
            const tile = document.createElement('div');
            tile.style.outline = '1px solid #333';
            tile.style.color = '#666';
            tile.innerHTML = `x: ${coords.x}, y: ${coords.y}, z: ${coords.z}`;
            return tile;
        }
    });
    
    new L.GridLayer.DebugCoords().addTo(map);

    // Exemple de marqueur de test
    const marker = L.marker([500, 500]).addTo(map);
    marker.bindPopup("<b>Point de test</b><br>Futur emplacement d'un avant-poste.");

    return map;
}
