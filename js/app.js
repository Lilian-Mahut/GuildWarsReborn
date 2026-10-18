import { loadWorld } from './core/loader.js';
import { initI18n, onLanguageChange, t } from './core/i18n.js';
import { initMap } from './core/map.js';
import { addMarkers } from './core/markers.js';
import { addLanguageControl } from './core/language-control.js';

try {
    console.log("Initialisation de l'application Guild Wars 1 Map...");
    const world = await loadWorld();

    // La langue est choisie AVANT la création des marqueurs (noms traduits dès l'affichage)
    await initI18n(world.realms.map((r) => r.id));

    const map = initMap(world);
    addMarkers(map, world);
    addLanguageControl(map);

    const updateTitle = () => { document.title = t('app.title'); };
    updateTitle();
    onLanguageChange(updateTitle);

    // Outil d'alignement des cartes : index.html?align=1
    if (new URLSearchParams(location.search).get('align') === '1') {
        const { enableAlignTool } = await import('./core/align-tool.js');
        enableAlignTool(map, world);
    }
} catch (err) {
    console.error(err);
}
