import { DeviceManager, deviceManager } from './device-manager.js';
import { unwrap } from './util.js';

class ControlPanel {
  _controls = document.getElementById('controls');
  get controls() {
    return unwrap(this._controls);
  }
  _displayTitle = document.getElementById('controls-title');
  get displayTitle() {
    return unwrap(this._displayTitle);
  }

  init() {
    this.controls.hidden = true;
    deviceManager.addEventListener(
      DeviceManager.EVENT_DEVICE_CONNECTED,
      this.#onDeviceConnected,
    );
    deviceManager.addEventListener(
      DeviceManager.EVENT_DEVICE_DISCONNECTED,
      this.#onDeviceDisconnected,
    );
  }

  #onDeviceConnected = async () => {
    this.controls.hidden = false;
    const device = deviceManager.device;
    this.displayTitle.innerText = `Device: ${device.name}`;
  };

  #onDeviceDisconnected = async () => {
    this.controls.hidden = true;
  };
}

export const controlPanel = new ControlPanel();
