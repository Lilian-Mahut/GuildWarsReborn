// Configuration dynamique de la carte du Zoom 0 au Zoom 4
function initMap() {
    
    // 1. Création de la carte en mode coordonnées plates
    const map = L.map('map', {
        crs: L.CRS.Simple,
        minZoom: 0,
        maxZoom: 4, // Débloque l'accès jusqu'au dossier /4
        noWrap: true
    });

    // 2. Calcul dynamique de l'espace de la carte au zoom maximum (Zoom 4)
    // Au zoom 0, vous avez 2 colonnes et 3 lignes de 256px.
    // Au zoom 4, la grille est multipliée par 2^4 (16).
    // Largeur max = 2 tuiles * 16 * 256px = 8192px
    // Hauteur max = 3 tuiles * 16 * 256px = 12288px
    const maxZoomFactor = Math.pow(2, 4); // 2^4 = 16
    const maxWidth = 2 * maxZoomFactor * 256;  // 8192
    const maxHeight = 3 * maxZoomFactor * 256; // 12288

    // 3. Traduction des pixels max en coordonnées Leaflet pour le Zoom 4
    const southWest = map.unproject([0, maxHeight], 4);
    const northEast = map.unproject([maxWidth, 0], 4);
    const globalBounds = L.latLngBounds(southWest, northEast);

    // On applique ces frontières maximales pour que la caméra puisse naviguer partout au zoom 4
    map.setMaxBounds(globalBounds);
    map.fitBounds(globalBounds);

    // 4. Chargement de vos dossiers de tuiles du zoom 0 à 4
    L.tileLayer('images/tyrie/{z}/{x}/{y}.jpg', {
        bounds: globalBounds,
        minZoom: 0,
        maxZoom: 4,
        tileSize: 256,
        attribution: '© ArenaNet - Guild Wars'
    }).addTo(map);

    // 5. Console de repérage pour l'architecte
    map.on('click', function(e) {
        // Affiche la position pixel exacte par rapport au zoom max (pratique pour la BDD globale)
        const coords = map.project(e.latlng, 4);
        console.log(`Clic position absolue (Zoom 4) -> X: ${Math.round(coords.x)}, Y: ${Math.round(coords.y)}`);
    });

    return map;
}
