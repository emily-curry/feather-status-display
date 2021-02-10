import { BLE_SERVICE_STATUS } from './constants.js';
import { DeviceManager, deviceManager } from './device-manager.js';

class ControlPanel {
  /** @type {Promise<BluetoothRemoteGATTServer> | undefined} */
  #server = undefined;

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

  getServer() {
    if (this.#server === undefined) {
      this.#server = deviceManager.getGATTServer();
    }
    return this.#server;
  }

  getStatusService = async () => {
    const server = await this.getServer();
    return await server.getPrimaryService(BLE_SERVICE_STATUS);
  };

  #cleanup = () => {
    this.#server = undefined;
  };
}

export const controlPanel = new ControlPanel();
