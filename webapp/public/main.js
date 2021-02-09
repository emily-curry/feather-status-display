// @ts-nocheck
import { deviceManager } from './device-manager.js';
import { controlPanel } from './control-panel.js';

deviceManager.init();
controlPanel.init();

if (import.meta.hot) {
  let dirty = false;
  import.meta.hot.accept(() => {
    if (dirty === false) {
      dirty = true;
      document.getElementById('reload').hidden = false;
      document
        .getElementById('reload')
        .addEventListener('click', () => location.reload());
    }
  });
}
