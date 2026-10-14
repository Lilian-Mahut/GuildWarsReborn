function buildIcons(config) {
    const icons = {};
    for (const [type, def] of Object.entries(config.iconTypes)) {
        icons[type] = L.icon({
            iconUrl: config.iconsPath + def.file,
            iconSize: def.size,
            iconAnchor: [def.size[0] / 2, def.size[1] / 2],
            tooltipAnchor: [0, def.size[1] / 2]
        });
    }
    return icons;
}

function addMarkers(map, config) {
    const icons = buildIcons(config);

    const entries = config.locations.map((loc) => {
        const marker = L.marker(
            map.unproject([loc.x, loc.y], config.maxZoom),
            { icon: icons[loc.type], title: loc.name }
        );
        marker.bindTooltip(loc.name, { direction: 'bottom' });
        return { marker, minZoom: loc.minZoom ?? 0 };
    });

    const refresh = () => {
        const zoom = map.getZoom();
        entries.forEach(({ marker, minZoom }) => {
            const show = zoom >= minZoom;
            if (show && !map.hasLayer(marker)) marker.addTo(map);
            if (!show && map.hasLayer(marker)) map.removeLayer(marker);
        });
    };

    map.on('zoomend', refresh);
    refresh();
}