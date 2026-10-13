// Configuration de l'assemblage par tuiles (Grille de 2 colonnes x 3 lignes)
function initMap() {
    
    // 1. Création de la carte en mode coordonnées plates
    const map = L.map('map', {
        crs: L.CRS.Simple,
        minZoom: 0,
        maxZoom: 1, // Limité à vos deux dossiers de zoom actuels (0 et 1)
        noWrap: true
    });

    // 2. Définition des dimensions de la grille de jeu au zoom 0
    // Une tuile standard fait 256 pixels.
    // 2 colonnes (X) = 512 pixels de large. 3 lignes (Y) = 768 pixels de haut.
    // En CRS.Simple, l'origine [0,0] de Leaflet est en BAS à gauche.
    const bounds = [[0, 0], [-768, 512]]; 
    
    // On cadre la caméra sur notre zone d'images
    map.fitBounds(bounds);

    // 3. Chargement automatique des tuiles selon l'arborescence de vos dossiers
    L.tileLayer('images/tyrie/{z}/{x}/{y}.jpg', {
        bounds: bounds,
        minZoom: 0,
        maxZoom: 1,
        tileSize: 256, // Indique à Leaflet la taille de vos carrés jpg
        attribution: 'Données Cartographiques © ArenaNet - Guild Wars'
    }).addTo(map);

    // 4. Console de l'architecte pour valider les coordonnées
    map.on('click', function(e) {
        const x = Math.round(e.latlng.lng);
        const y = Math.round(e.latlng.lat);
        console.log(`Clic -> X: ${x}, Y: ${y}`);
    });

    return map;
}
