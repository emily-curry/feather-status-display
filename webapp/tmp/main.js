/// <reference path="types.d.ts" />

import { controlPanel } from './control-panel.js';
import { deviceManager } from './device-manager.js';
import { imagePanel } from './image-panel.js';
import { unwrap } from './util.js';

deviceManager.init();
controlPanel.init();
imagePanel.init();

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
