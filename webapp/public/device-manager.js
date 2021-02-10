import { BLE_SERVICE_STATUS } from './constants.js';
import { unwrap } from './util.js';

export class DeviceManager extends EventTarget {
  static EVENT_DEVICE_CONNECTED = 'EVENT_DEVICE_CONNECTED';
  static EVENT_DEVICE_DISCONNECTED = 'EVENT_DEVICE_DISCONNECTED';

  /**
   * @type {BluetoothDevice | undefined}
   */
  _device = undefined;
  /**
   * @returns {BluetoothDevice} The currently connected bluetooth device
   * @throws if no device connected
   */
  get device() {
    return unwrap(this._device);
  }

  init() {}

  /**
   * Opens a connection to the GATT server of the connected device
   * @returns {Promise<BluetoothRemoteGATTServer>}
   *
   */
  getGATTServer = async () => {
    if (!this.device.gatt) {
      throw new Error('Could not get GATT server, device.gatt is undefined');
    }
    return await this.device.gatt.connect();
  };

  toggleConnect = async () => {
    if (this._device) {
      this.#setDevice(undefined);
      this.dispatchEvent(new Event(DeviceManager.EVENT_DEVICE_DISCONNECTED));
    } else {
      try {
        const device = await navigator.bluetooth.requestDevice({
          filters: [{ services: [BLE_SERVICE_STATUS] }],
          optionalServices: ['battery_service'],
        });
        this.#setDevice(device);
        this.dispatchEvent(new Event(DeviceManager.EVENT_DEVICE_CONNECTED));
      } catch (e) {
        console.error(e);
      }
    }
  };

  /**
   * @param {BluetoothDevice | undefined} device
   */
  #setDevice = (device) => {
    console.debug('device changed:', device);
    this._device = device;
  };
}

export const deviceManager = new DeviceManager();
