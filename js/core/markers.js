// // Échelle de l'icône pour un niveau de zoom, lue dans le JSON de la carte
// function getIconScale(zoom, config) {
//     return config.iconScales?.[zoom] ?? 1;
// }

// function addMarkers(map, config) {
//     const entries = [];
//     const startZoom = map.getZoom();
//     const startScale = getIconScale(startZoom, config);

//     for (const [type, list] of Object.entries(config.locations)) {
//         const def = config.iconTypes[type];

//         list.forEach((loc) => {
//             const minZoom = loc.minZoom ?? 0;
//             const hasLabel = loc.label === true;
//             const labelMinZoom = loc.labelMinZoom ?? config.labelMinZoom ?? 2;
//             const half = def.size[1] / 2;

//             // États de départ écrits directement dans le HTML (pas d'animation au chargement)
//             const hiddenClass = startZoom < minZoom ? ' is-hidden' : '';
//             const labelOffClass = startZoom < labelMinZoom ? ' is-off' : '';

//             const labelHtml = hasLabel
//                 ? `<span class="gw-label${labelOffClass}">${loc.name}</span>`
//                 : '';

//             const icon = L.divIcon({
//                 className: 'gw-marker',
//                 iconSize: def.size,
//                 iconAnchor: [def.size[0] / 2, half],
//                 html: `<div class="gw-item${hiddenClass}" style="--s:${startScale};--half:${half}px">
//                            <img class="gw-icon" src="${config.iconsPath}${def.file}"
//                                 alt="${loc.name}" draggable="false">
//                            ${labelHtml}
//                        </div>`
//             });

//             const marker = L.marker(
//                 map.unproject([loc.x, loc.y], config.maxZoom),
//                 { icon }
//             ).addTo(map);

//             const root = marker.getElement();
//             entries.push({
//                 marker, def, minZoom, hasLabel, labelMinZoom,
//                 name: loc.name,
//                 item: root.querySelector('.gw-item'),
//                 labelEl: root.querySelector('.gw-label')   // null si pas de nom affiché
//             });
//         });
//     }

//     // Applique échelle, visibilité, nom et tooltip pour un niveau de zoom
//     const apply = (zoom) => {
//         const scale = getIconScale(zoom, config);

//         entries.forEach((e) => {
//             e.item.style.setProperty('--s', scale);
//             e.item.classList.toggle('is-hidden', zoom < e.minZoom);

//             const labelShown = e.hasLabel && zoom >= e.labelMinZoom;
//             if (e.labelEl) e.labelEl.classList.toggle('is-off', !labelShown);

//             // Tooltip seulement si le nom n'est pas déjà affiché sous l'icône
//             if (labelShown) {
//                 if (e.marker.getTooltip()) e.marker.unbindTooltip();
//             } else {
//                 if (!e.marker.getTooltip()) {
//                     e.marker.bindTooltip(e.name, { direction: 'bottom' });
//                 }
//                 e.marker.getTooltip().options.offset =
//                     L.point(0, (e.def.size[1] * scale) / 2);
//             }
//         });
//     };

//     map.on('zoomanim', (ev) => apply(ev.zoom));
//     map.on('zoomend', () => apply(map.getZoom()));   // filet de sécurité
//     apply(startZoom);
// }

import { getIconScale, isVisible, hasLabel, isLabelVisible } from './zoom-rules.js';

function createEntry(map, world, realm, category, def, rule, item) {
    const zoom = map.getZoom();
    const isText = rule.kind === 'text';
    const size = isText ? [0, 0] : def.icon.size;
    const half = size[1] / 2;

    const classes = [
        'gw-item',
        `realm-${realm.id}`,
        `cat-${category}`,
        isText ? 'gw-item--text' : '',
        isVisible(zoom, rule, item) ? '' : 'is-hidden'
    ].join(' ');

    const imgHtml = isText ? '' : `
        <img class="gw-icon" src="${realm.iconsPath}${def.icon.file}"
             alt="${item.name}" draggable="false">`;

    const labelHtml = (isText || hasLabel(rule, item)) ? `
        <span class="gw-label${isText || isLabelVisible(zoom, rule, item) ? '' : ' is-off'}">
            ${item.name}
        </span>` : '';

    const icon = L.divIcon({
        className: 'gw-marker',
        iconSize: size,
        iconAnchor: [size[0] / 2, half],
        html: `<div class="${classes}" style="--s:${getIconScale(zoom, world)};--half:${half}px">
                   ${imgHtml}${labelHtml}
               </div>`
    });

    const marker = L.marker(
        map.unproject([item.x, item.y], world.maxZoom),
        { icon, interactive: !isText }
    ).addTo(map);

    const root = marker.getElement();
    return {
        marker, realm, def, rule, item, isText,
        el: root.querySelector('.gw-item'),
        labelEl: root.querySelector('.gw-label')
    };
}

// Met à jour toutes les entrées pour un niveau de zoom
function applyZoom(entries, world, zoom) {
    const scale = getIconScale(zoom, world);

    entries.forEach((e) => {
        e.el.style.setProperty('--s', scale);
        e.el.classList.toggle('is-hidden', !isVisible(zoom, e.rule, e.item));

        if (e.isText) return;   // pas d'icône ni de tooltip pour le texte seul

        const labelShown = isLabelVisible(zoom, e.rule, e.item);
        if (e.labelEl) e.labelEl.classList.toggle('is-off', !labelShown);

        // Tooltip seulement si le nom n'est pas déjà affiché sous l'icône
        if (labelShown) {
            if (e.marker.getTooltip()) e.marker.unbindTooltip();
        } else {
            if (!e.marker.getTooltip()) {
                e.marker.bindTooltip(e.item.name, {
                    direction: 'bottom',
                    className: `realm-${e.realm.id}`   // police du royaume
                });
            }
            e.marker.getTooltip().options.offset =
                L.point(0, (e.def.icon.size[1] * scale) / 2);
        }
    });
}

export function addMarkers(map, world) {
    const entries = [];

    world.realms.forEach((realm) => {
        Object.entries(realm.categories).forEach(([category, def]) => {
            const rule = world.layers[category];
            if (!rule) {
                console.warn(`Aucune règle de zoom pour la catégorie "${category}" (layers.json)`);
                return;
            }
            def.items.forEach((item) =>
                entries.push(createEntry(map, world, realm, category, def, rule, item))
            );
        });
    });

    map.on('zoomanim', (e) => applyZoom(entries, world, e.zoom));
    map.on('zoomend', () => applyZoom(entries, world, map.getZoom()));
    applyZoom(entries, world, map.getZoom());
}