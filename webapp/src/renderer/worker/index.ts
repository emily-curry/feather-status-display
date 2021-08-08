import type { IpcRendererEvent } from 'electron/renderer';
import { IPC_CHANNEL } from '../channel';
import {
  BLE_SERVICE_STATUS,
  BLE_SERVICE_IMAGE,
  BLE_CHR_STATUS_CODE,
} from '../constants';
import { StatusCode } from '../util/statusCode';
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
      await updateStatusCode(g);
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

const updateStatusCode = async (g: BluetoothRemoteGATTServer) => {
  const svc = await g.getPrimaryService(BLE_SERVICE_STATUS);
  const chr = await svc.getCharacteristic(BLE_CHR_STATUS_CODE);
  const setCode = (value?: number) => {
    ipcRenderer.send('log', `notify status ${value}`);
    ipcRenderer.send(IPC_CHANNEL.BluetoothWorkerStatusUpdate, value);
  };
  const callback = (ev: any) => {
    const value = ev.target.value.getUint8(0);
    if (typeof value === 'number') setCode(value);
    else setCode(undefined);
  };
  chr.addEventListener('characteristicvaluechanged', callback);
  await chr.readValue();
};

const onRequestDevice = async () => {
  try {
    await reset();
    const d = await navigator.bluetooth.requestDevice({
      filters: [{ services: [BLE_SERVICE_STATUS] }],
      optionalServices: ['battery_service', BLE_SERVICE_IMAGE],
    });
    ipcRenderer.send(IPC_CHANNEL.BluetoothWorkerNameUpdate, d.name);
    d.addEventListener('gattserverdisconnected', onGattServerDisconnected);
    device = d;
    await connectGatt();
  } finally {
    ipcRenderer.send(IPC_CHANNEL.BluetoothWorkerConnectRequestComplete, !!gatt);
  }
};

const onGattServerDisconnected = async (event: Event) => await connectGatt();

const onRefreshStatusCode = async (e: IpcRendererEvent) => {
  try {
    if (!gatt) return;
    const svc = await gatt.getPrimaryService(BLE_SERVICE_STATUS);
    const chr = await svc.getCharacteristic(BLE_CHR_STATUS_CODE);
    await chr.readValue();
  } finally {
    ipcRenderer.send(IPC_CHANNEL.BluetoothWorkerStatusRefreshRequestComplete);
  }
};

const onWriteStatusCode = async (e: IpcRendererEvent, code: StatusCode) => {
  try {
    if (!gatt) return;
    const svc = await gatt.getPrimaryService(BLE_SERVICE_STATUS);
    const chr = await svc.getCharacteristic(BLE_CHR_STATUS_CODE);
    await chr.writeValueWithoutResponse(new Uint8Array([code]));
    await chr.readValue();
  } finally {
    ipcRenderer.send(IPC_CHANNEL.BluetoothWorkerStatusWriteRequestComplete);
  }
};

ipcRenderer.on(IPC_CHANNEL.BluetoothWorkerReset, reset);
ipcRenderer.on(
  IPC_CHANNEL.BluetoothWorkerStatusRefreshRequest,
  onRefreshStatusCode,
);
ipcRenderer.on(
  IPC_CHANNEL.BluetoothWorkerStatusWriteRequest,
  onWriteStatusCode,
);

// Can only be triggered by "user gesture"
window.addEventListener('keydown', onRequestDevice);
