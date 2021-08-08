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

  BluetoothStateUpdate = 'BluetoothStateUpdate',
  BluetoothStateUpdateRequest = 'BluetoothStateUpdateRequest',
  BluetoothDeviceRequest = 'BluetoothDeviceRequest',
  BluetoothDeviceRequestComplete = 'BluetoothDeviceRequestComplete',
  BluetoothDisconnectRequest = 'BluetoothDisconnectRequest',
  BluetoothDisconnectRequestComplete = 'BluetoothDisconnectRequestComplete',

  BluetoothWorkerConnectRequest = 'BluetoothWorkerConnectRequest',
  BluetoothWorkerConnectRequestComplete = 'BluetoothWorkerConnectRequestComplete',
  BluetoothWorkerNameUpdate = 'BluetoothWorkerNameUpdate',
  BluetoothWorkerBatteryUpdate = 'BluetoothWorkerBatteryUpdate',
  BluetoothWorkerReset = 'BluetoothWorkerReset',
}
