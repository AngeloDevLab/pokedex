import { initI18n } from '../core/i18n.js';
import { initNavShell } from '../core/nav.js';

// ===== INIT =====
init();

async function init() {
    initNavShell();
    await initI18n();
}
