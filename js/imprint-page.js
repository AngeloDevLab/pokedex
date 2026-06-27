import { initI18n } from './i18n.js';
import { initNavShell } from './nav.js';

// ===== INIT =====
init();

async function init() {
    initNavShell();
    await initI18n();
}
