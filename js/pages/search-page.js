import { initI18n } from '../core/i18n.js';
import { initNavShell } from '../core/nav.js';
import {
    bindOpenDialog,
    bindCloseDialog,
    bindDialogNavigation,
    bindLoadMore,
    bindLoadPrevious,
    bindSearchInputs
} from '../core/ui.js';

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
    bindSearchInputs();
}
