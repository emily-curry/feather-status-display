import { IPC_CHANNEL } from '../channel';
import { BLE_SERVICE_STATUS, UUID16_SVC_IMAGE } from '../constants';
const { ipcRenderer } = require('electron');

let device: BluetoothDevice | undefined;
let gatt: BluetoothRemoteGATTServer | undefined;

const reset = async () => {
  device?.removeEventListener(
    'gattserverdisconnected',
    onGattServerDisconnected,
  );
  await gatt?.disconnect();
  gatt = undefined;
  device = undefined;
};

const connectGatt = async (retryCount: number = 0) => {
  if (!device) return;
  if (retryCount >= 5) {
    ipcRenderer.send(IPC_CHANNEL.BluetoothDisconnectRequest);
    return;
  }
  let g: BluetoothRemoteGATTServer | undefined;
  try {
    g = await device.gatt?.connect();
  } finally {
    if (g) {
      await updateBattery(g);
      gatt = g;
    } else {
      await new Promise((r) => setTimeout(r, retryCount * 10000));
      await connectGatt(retryCount + 1);
    }
  }
};

const updateBattery = async (g: BluetoothRemoteGATTServer) => {
  const batteryService = await g.getPrimaryService('battery_service');
  const batteryLevel = await batteryService.getCharacteristic('battery_level');
  const setBattery = (value?: number) => {
    ipcRenderer.send(IPC_CHANNEL.BluetoothWorkerBatteryUpdate, value);
  };
  const callback = (ev: any) => {
    const value = ev.target.value.getUint8(0);
    if (typeof value === 'number') setBattery(value);
    else setBattery(undefined);
  };
  batteryLevel.addEventListener('characteristicvaluechanged', callback);
  await batteryLevel.readValue();
};

const onRequestDevice = async () => {
  try {
    await reset();
    const d = await navigator.bluetooth.requestDevice({
      filters: [{ services: [BLE_SERVICE_STATUS] }],
      optionalServices: ['battery_service', UUID16_SVC_IMAGE],
    });
    ipcRenderer.send(IPC_CHANNEL.BluetoothWorkerNameUpdate, d.name);
    d.addEventListener('gattserverdisconnected', onGattServerDisconnected);
    device = d;
    await connectGatt();
  } finally {
    ipcRenderer.send(IPC_CHANNEL.BluetoothWorkerConnectRequestComplete, !!gatt);
  }
};

const onGattServerDisconnected = (event: Event) => {
  connectGatt();
};

ipcRenderer.on(IPC_CHANNEL.BluetoothWorkerReset, reset);

// Can only be triggered by "user gesture"
window.addEventListener('keydown', onRequestDevice);
