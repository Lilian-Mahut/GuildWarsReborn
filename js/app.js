import { loadWorld } from './core/loader.js';
import { initMap } from './core/map.js';
import { addMarkers } from './core/markers.js';

try {
    console.log("Initialisation de l'application Guild Wars 1 Map...");
    const world = await loadWorld();
    const map = initMap(world);
    addMarkers(map, world);
} catch (err) {
    console.error(err);
}