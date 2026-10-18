import { loadWorld } from './core/loader.js';
import { initMap } from './core/map.js';
import { addMarkers } from './core/markers.js';

try {
    console.log("Initialisation de l'application Guild Wars 1 Map...");
    const world = await loadWorld();
    const map = initMap(world);
    addMarkers(map, world);

    // Outil d'alignement : index.html?align=1
    if (new URLSearchParams(location.search).get('align') === '1') {
        const { enableAlignTool } = await import('./core/align-tool.js');
        enableAlignTool(map, world);
    }
} catch (err) {
    console.error(err);
}