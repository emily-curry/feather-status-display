export enum IPC_CHANNEL {
  MSALLogInRequest = 'MSALLogInRequest',
  MSALLogInRequestComplete = 'MSALLogInRequestComplete',
  MSALLogOutRequest = 'MSALLogOutRequest',
  MSALLogOutRequestComplete = 'MSALResLogOut',
  GraphStateUpdate = 'GraphStateUpdate',
  GraphStateUpdateRequest = 'GraphStateUpdateRequest',

  /** Following block is main <-> renderer */
  BluetoothStateUpdate = 'BluetoothStateUpdate',
  BluetoothStateUpdateRequest = 'BluetoothStateUpdateRequest',
  BluetoothDeviceRequest = 'BluetoothDeviceRequest',
  BluetoothDeviceRequestComplete = 'BluetoothDeviceRequestComplete',
  BluetoothDisconnectRequest = 'BluetoothDisconnectRequest',
  BluetoothDisconnectRequestComplete = 'BluetoothDisconnectRequestComplete',
  BluetoothStatusCodeRefreshRequest = 'BluetoothStatusCodeRefreshRequest',
  BluetoothStatusCodeWriteRequest = 'BluetoothStatusCodeWriteRequest',
  BluetoothImageWriteRequest = 'BluetoothImageWriteRequest',

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
  BluetoothWorkerImageWriteRequest = 'BluetoothWorkerImageWriteRequest',
  BluetoothWorkerImageWriteRequestComplete = 'BluetoothWorkerImageWriteRequestComplete',
  BluetoothWorkerImageWriteRequestProgressUpdate = 'BluetoothWorkerImageWriteRequestProgressUpdate',
  BluetoothWorkerReset = 'BluetoothWorkerReset',

  /** main -> main */
  GraphActivityChange = 'GraphActivityChange',
}
