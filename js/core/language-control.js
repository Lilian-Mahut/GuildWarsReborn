// Sélecteur de langue : un menu déroulant dans un coin de la carte
import { getLanguages, getCurrentLanguage, setLanguage, onLanguageChange, t } from './i18n.js';

function loadStylesheetOnce(href) {
    if (document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
}

export function addLanguageControl(map) {
    loadStylesheetOnce('css/ui.css');

    const LanguageControl = L.Control.extend({
        options: { position: 'topright' },

        onAdd() {
            const container = L.DomUtil.create('div', 'gw-lang');
            const select = L.DomUtil.create('select', 'gw-lang__select', container);

            getLanguages().forEach((lang) => {
                const option = L.DomUtil.create('option', '', select);
                option.value = lang.code;
                option.textContent = lang.label;   // chaque langue dans sa propre langue
            });

            const refresh = () => {
                select.value = getCurrentLanguage();
                select.setAttribute('aria-label', t('language'));
            };
            refresh();

            select.addEventListener('change', () => setLanguage(select.value));
            onLanguageChange(refresh);

            // Évite de déplacer ou zoomer la carte en utilisant le menu
            L.DomEvent.disableClickPropagation(container);
            L.DomEvent.disableScrollPropagation(container);
            return container;
        }
    });

    new LanguageControl().addTo(map);
}
