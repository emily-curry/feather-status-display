import { BLE_SERVICE_STATUS, UUID16_SVC_IMAGE } from './constants.js';
import { unwrap } from './util.js';

export class DeviceManager extends EventTarget {
  static EVENT_DEVICE_CONNECTED = 'EVENT_DEVICE_CONNECTED';
  static EVENT_DEVICE_DISCONNECTED = 'EVENT_DEVICE_DISCONNECTED';

  /**
   * @type {BluetoothDevice | undefined}
   */
  #device = undefined;
  /**
   * @returns {BluetoothDevice} The currently connected bluetooth device
   * @throws if no device connected
   */
  get device() {
    return unwrap(this.#device);
  }

  /**
   * @type {BluetoothRemoteGATTServer | undefined}
   */
  #server = undefined;
  get server() {
    return unwrap(this.#server);
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
    if (this.#device) {
      this.server.disconnect();
    } else {
      try {
        const device = await navigator.bluetooth.requestDevice({
          filters: [{ services: [BLE_SERVICE_STATUS] }],
          optionalServices: ['battery_service', UUID16_SVC_IMAGE],
        });
        this.#device = device;
        this.#server = await device.gatt?.connect();
        this.device.ongattserverdisconnected = this.#onDisconnected;
        this.dispatchEvent(new Event(DeviceManager.EVENT_DEVICE_CONNECTED));
      } catch (e) {
        console.error(e);
      }
    }
  };

  #onDisconnected = () => {
    this.#device = undefined;
    this.#server = undefined;
    this.dispatchEvent(new Event(DeviceManager.EVENT_DEVICE_DISCONNECTED));
  };
}

export const deviceManager = new DeviceManager();
