import { BLE_CHR_STATUS_CODE } from './constants.js';
import { controlPanel } from './control-panel.js';
import { DeviceManager, deviceManager } from './device-manager.js';
import { unwrap } from './util.js';

class ControlPanelUI {
  get controls() {
    return unwrap(document.getElementById('controls'));
  }
  get displayTitle() {
    return unwrap(document.getElementById('controls-title'));
  }
  get statusCodeInput() {
    return unwrap(document.getElementById('status-chr-code-input'));
  }
  get statusCodeButton() {
    return unwrap(document.getElementById('status-chr-code-button'));
  }

  init() {
    deviceManager.addEventListener(
      DeviceManager.EVENT_DEVICE_CONNECTED,
      this.#onDeviceConnected,
    );
    deviceManager.addEventListener(
      DeviceManager.EVENT_DEVICE_DISCONNECTED,
      this.#onDeviceDisconnected,
    );
    this.statusCodeButton.addEventListener('click', this.#writeStatusCode);
  }

  /**
   * @param {boolean} visible
   */
  #setVisibility = (visible) => {
    this.controls.hidden = !visible;
    if (visible) {
      const device = deviceManager.device;
      this.displayTitle.innerText = `Device: ${device.name}`;
    }
  };

  #onDeviceConnected = async () => {
    this.#setVisibility(true);
    this.#renderStatusCode();
  };

  #onDeviceDisconnected = async () => {
    this.#setVisibility(false);
  };

  #renderStatusCode = async () => {
    await controlPanel.getStatusService();
    //@ts-ignore
    this.statusCodeButton.disabled = false;
  };

  #writeStatusCode = async () => {
    const svc = await controlPanel.getStatusService();
    const chr = await svc.getCharacteristic(BLE_CHR_STATUS_CODE);
    //@ts-ignore
    const output = parseInt(this.statusCodeInput.value);
    console.log(output);
    Uint8Array.of();
    await chr.writeValueWithoutResponse(new Uint8Array([output]));
  };
}

export const controlPanelUI = new ControlPanelUI();
