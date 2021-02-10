import { BLE_SERVICE_STATUS } from './constants.js';
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
      this.#setButtonText,
    );
    this.#setButtonText();
  }

  #setButtonText = () => {
    if (deviceManager._device) {
      this.bleButton.innerText = 'Stop BLE';
    } else {
      this.bleButton.innerText = 'Start BLE';
    }
  };

  #onBleToggleClick = async () => {
    await deviceManager.toggleConnect();
  };
}

export const deviceManagerUI = new DeviceManagerUI();
