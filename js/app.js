// document.addEventListener("DOMContentLoaded", async () => {
//     // Carte choisie via l'URL : index.html?map=cantha (Tyrie par défaut)
//     const mapId = new URLSearchParams(location.search).get('map') || 'prophecies';

//     try {
//         const res = await fetch(`data/maps/${mapId}.json`);
//         if (!res.ok) throw new Error(`Carte introuvable : ${mapId}`);
//         const config = await res.json();

//         document.title = `Guild Wars Reborn - ${config.name}`;
//         const map = initMap(config);
//         addMarkers(map, config);
//     } catch (err) {
//         console.error(err);
//     }
// });

import { loadWorld } from './core/loader.js';
import { initMap } from './core/map.js';
import { addMarkers } from './core/markers.js';

try {
    const world = await loadWorld();
    const map = initMap(world);
    addMarkers(map, world);
} catch (err) {
    console.error(err);
}