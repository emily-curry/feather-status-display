import { BLE_SERVICE_STATUS } from './constants.js';
import { DeviceManager, deviceManager } from './device-manager.js';

class ControlPanel {
  init() {
    deviceManager.addEventListener(
      DeviceManager.EVENT_DEVICE_CONNECTED,
      this.getStatusService,
    );
    deviceManager.addEventListener(
      DeviceManager.EVENT_DEVICE_DISCONNECTED,
      this.#cleanup,
    );
  }

  getStatusService = async () => {
    return await deviceManager.server.getPrimaryService(BLE_SERVICE_STATUS);
  };

  #cleanup = () => {};
}

export const controlPanel = new ControlPanel();
