import { DeviceManager, deviceManager } from './device-manager.js';
import { unwrap } from './util.js';

class DeviceManagerUI {
  #bleButton = document.getElementById('ble-toggle');
  get bleButton() {
    return unwrap(this.#bleButton);
  }

  init() {
    this.bleButton.addEventListener('click', this.#onBleToggleClick);
    deviceManager.addEventListener(
      DeviceManager.EVENT_DEVICE_CONNECTED,
      this.#setButtonText,
    );
    deviceManager.addEventListener(
      DeviceManager.EVENT_DEVICE_DISCONNECTED,
      this.#cleanup,
    );
  }

  #setButtonText = () => {
    try {
      const x = deviceManager.device;
      this.bleButton.innerText = 'Stop BLE';
    } catch (e) {
      this.bleButton.innerText = 'Start BLE';
    }
  };

  #onBleToggleClick = async () => {
    await deviceManager.toggleConnect();
  };

  #cleanup = () => {
    this.#setButtonText();
  };
}

export const deviceManagerUI = new DeviceManagerUI();
