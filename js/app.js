// // Point d'entrée de notre application
// document.addEventListener("DOMContentLoaded", () => {
//     console.log("Initialisation de l'application Guild Wars 1 Map...");
    
//     // Lancement de la carte
//     const gameMap = initMap();
// });

document.addEventListener("DOMContentLoaded", async () => {
    // Carte choisie via l'URL : index.html?map=cantha (Tyrie par défaut)
    const mapId = new URLSearchParams(location.search).get('map') || 'prophecies';

    try {
        const res = await fetch(`data/maps/${mapId}.json`);
        if (!res.ok) throw new Error(`Carte introuvable : ${mapId}`);
        const config = await res.json();

        document.title = `Guild Wars 1 - ${config.name}`;
        const map = initMap(config);
        addMarkers(map, config);
    } catch (err) {
        console.error(err);
    }
});