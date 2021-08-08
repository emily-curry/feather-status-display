export interface BluetoothState {
  isLoading: boolean;
  device?: BluetoothDeviceState;
}

export interface BluetoothDeviceState {
  battery?: number;
  name: string;
}

export interface GraphMeState {
  // TODO:
}

export interface GraphActivityState {
  // TODO:
}
