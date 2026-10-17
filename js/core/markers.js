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
