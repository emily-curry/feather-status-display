import { BluetoothState } from './state';

export enum IPC_CHANNEL {
  /** Indicates that the MSAL log in flow should be initiated. renderer -> main */
  MSALLogInRequest = 'MSALLogInRequest',
  /** Indicates thtat the MSAL log in flow has completed. This event contains the access token. main -> renderer */
  MSALLogInRequestComplete = 'MSALLogInRequestComplete',
  /** Indicates that the user should be logged out. renderer -> main */
  MSALLogOutRequest = 'MSALLogOutRequest',
  /** Indicates that the user has been logged out. main -> renderer */
  MSALLogOutRequestComplete = 'MSALResLogOut',
  /** Indicates the state of "me" from the graph client has changed. main -> renderer */
  GraphGetMeUpdate = 'GraphGetMeUpdate',
  /** Indicates the state of "activity" from the graph client has changed. main -> renderer */
  GraphGetActivityUpdate = 'GraphGetActivityUpdate',

  /** Following block is main <-> renderer */
  BluetoothStateUpdate = 'BluetoothStateUpdate',
  BluetoothStateUpdateRequest = 'BluetoothStateUpdateRequest',
  BluetoothDeviceRequest = 'BluetoothDeviceRequest',
  BluetoothDeviceRequestComplete = 'BluetoothDeviceRequestComplete',
  BluetoothDisconnectRequest = 'BluetoothDisconnectRequest',
  BluetoothDisconnectRequestComplete = 'BluetoothDisconnectRequestComplete',
  BluetoothStatusCodeRefreshRequest = 'BluetoothStatusCodeRefreshRequest',
  BluetoothStatusCodeWriteRequest = 'BluetoothStatusCodeWriteRequest',

  /** Following block is main <-> worker */
  BluetoothWorkerConnectRequest = 'BluetoothWorkerConnectRequest',
  BluetoothWorkerConnectRequestComplete = 'BluetoothWorkerConnectRequestComplete',
  BluetoothWorkerNameUpdate = 'BluetoothWorkerNameUpdate',
  BluetoothWorkerBatteryUpdate = 'BluetoothWorkerBatteryUpdate',
  BluetoothWorkerStatusWriteRequest = 'BluetoothWorkerStatusWriteRequest',
  BluetoothWorkerStatusWriteRequestComplete = 'BluetoothWorkerStatusWriteRequestComplete',
  BluetoothWorkerStatusRefreshRequest = 'BluetoothWorkerStatusRefreshRequest',
  BluetoothWorkerStatusRefreshRequestComplete = 'BluetoothWorkerStatusRefreshRequestComplete',
  BluetoothWorkerStatusUpdate = 'BluetoothWorkerStatusUpdate',
  BluetoothWorkerReset = 'BluetoothWorkerReset',
}
