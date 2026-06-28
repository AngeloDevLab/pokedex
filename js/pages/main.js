import { initI18n } from '../core/i18n.js';
import { initNavShell } from '../core/nav.js';
import { bindOpenDialog, bindCloseDialog, bindDialogNavigation, bindLoadMore, bindLoadPrevious } from '../core/ui.js';
import { loadPokemon } from '../core/pagination.js';

// ===== INIT =====
init();

async function init() {
    initNavShell();
    await initI18n();
    bindOpenDialog();
    bindCloseDialog();
    bindDialogNavigation();
    bindLoadMore();
    bindLoadPrevious();
    loadPokemon();
}
