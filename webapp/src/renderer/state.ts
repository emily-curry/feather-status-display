import { StatusCode } from './util/statusCode';

export interface BluetoothState {
  isLoading: boolean;
  device?: BluetoothDeviceState;
}

export interface BluetoothDeviceState {
  battery?: number;
  name: string;
  status?: StatusCode;
}

export interface GraphMeState {
  // TODO:
}

export interface GraphActivityState {
  // TODO:
}
