import { initI18n } from './i18n.js';
import { initNavShell } from './nav.js';
import {
    bindOpenDialog,
    bindCloseDialog,
    bindDialogNavigation,
    bindLoadMore,
    bindLoadPrevious,
    bindSearchInputs
} from './ui.js';

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
