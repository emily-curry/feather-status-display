import { controlPanelUI } from './control-panel-ui.js';
import { deviceManagerUI } from './device-manager-ui.js';
import { imagePanelUI } from './image-panel-ui.js';
import { unwrap } from './util.js';

deviceManagerUI.init();
controlPanelUI.init();
imagePanelUI.init();

if (import.meta.hot) {
  let dirty = false;
  import.meta.hot.accept(() => {
    if (dirty === false) {
      dirty = true;
      const reloadButton = unwrap(document.getElementById('reload'));
      reloadButton.hidden = false;
      reloadButton.addEventListener('click', () => location.reload());
    }
  });
}
