import { BrowserWindow, ipcMain } from 'electron';
import { getAssetURL } from 'electron-snowpack';
import { IpcMainEvent } from 'electron/main';
import { IPC_CHANNEL } from '../renderer/channel';
import { BluetoothState } from '../renderer/state';
import { StatusCode } from '../renderer/util/statusCode';

const setLoading = (loading: boolean) =>
  ({ type: 'set loading', loading } as const);

const setDeviceName = (name?: string) =>
  ({ type: 'set device name', name } as const);

const setDeviceBattery = (battery?: number) =>
  ({ type: 'set device battery', battery } as const);

const setDeviceStatusCode = (statusCode?: StatusCode) =>
  ({ type: 'set device status code', statusCode } as const);

const reset = () => ({ type: 'reset' } as const);

type Action =
  | ReturnType<typeof setLoading>
  | ReturnType<typeof setDeviceName>
  | ReturnType<typeof setDeviceBattery>
  | ReturnType<typeof setDeviceStatusCode>
  | ReturnType<typeof reset>;

const initialState: BluetoothState = {
  isLoading: false,
};

const bluetoothReducer = (
  state: BluetoothState = initialState,
  action?: Action,
): BluetoothState => {
  if (!action) return state;
  switch (action.type) {
    case 'set loading': {
      return { ...state, isLoading: action.loading };
    }
    case 'set device name': {
      const device = state.device
        ? { ...state.device, name: action.name ?? 'unnamed' }
        : { name: action.name ?? 'unnamed' };
      return { ...state, device };
    }
    case 'set device battery': {
      if (!state.device) return state;
      const device = { ...state.device, battery: action.battery };
      return { ...state, device };
    }
    case 'set device status code': {
      if (!state.device) return state;
      const device = { ...state.device, status: action.statusCode };
      return { ...state, device };
    }
    case 'reset': {
      return { ...initialState };
    }
    default:
      return state;
  }
};

export class FeatherBluetoothService {
  public onStateChange?: (state: BluetoothState) => void;
  private state: BluetoothState = bluetoothReducer();
  private window: BrowserWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
    },
  });

  constructor() {
    // renderer
    ipcMain.on(IPC_CHANNEL.BluetoothStateUpdateRequest, this.onRequestUpdate);
    ipcMain.on(IPC_CHANNEL.BluetoothDeviceRequest, this.onRequestDevice);
    ipcMain.on(
      IPC_CHANNEL.BluetoothDisconnectRequest,
      this.onRequestDisconnect,
    );
    ipcMain.on(
      IPC_CHANNEL.BluetoothStatusCodeRefreshRequest,
      this.onRefreshStatusCode,
    );
    ipcMain.on(
      IPC_CHANNEL.BluetoothStatusCodeWriteRequest,
      this.onWriteStatusCode,
    );
    // worker
    ipcMain.on(IPC_CHANNEL.BluetoothWorkerNameUpdate, (e, name) =>
      this.dispatch(setDeviceName(name)),
    );
    ipcMain.on(IPC_CHANNEL.BluetoothWorkerBatteryUpdate, (e, batt) => {
      this.dispatch(setDeviceBattery(batt));
    });
    ipcMain.on(IPC_CHANNEL.BluetoothWorkerStatusUpdate, (e, code) => {
      this.dispatch(setDeviceStatusCode(code));
    });
    this.window.loadURL(getAssetURL('bt-worker.html'));
    this.window.webContents.on(
      'select-bluetooth-device',
      this.onSelectBluetoothDevice,
    );
  }

  private dispatch(action: Action) {
    this.state = bluetoothReducer(this.state, action);
    this.onStateChange?.(this.state);
    console.log(action);
  }

  private async reset() {
    this.window.webContents.send(IPC_CHANNEL.BluetoothWorkerReset);
    this.dispatch(reset());
  }

  private readonly onRequestUpdate = (event: IpcMainEvent) => {
    event.reply(IPC_CHANNEL.BluetoothStateUpdate, this.state);
  };

  private readonly onRequestDevice = async (event: IpcMainEvent) => {
    this.dispatch(setLoading(true));
    try {
      const p = new Promise<boolean>((r) => {
        ipcMain.once(
          IPC_CHANNEL.BluetoothWorkerConnectRequestComplete,
          (e, didConnect) => r(didConnect),
        );
      });
      // Can only be triggered by "user gesture"
      this.window.webContents.sendInputEvent({
        type: 'keyDown',
        keyCode: '49',
      });
    } finally {
      event.reply(IPC_CHANNEL.BluetoothDeviceRequestComplete);
      this.dispatch(setLoading(false));
    }
  };

  private readonly onRefreshStatusCode = async (event: IpcMainEvent) => {
    this.dispatch(setLoading(true));
    try {
      const p = new Promise((r) =>
        ipcMain.once(
          IPC_CHANNEL.BluetoothWorkerStatusRefreshRequestComplete,
          r,
        ),
      );
      this.window.webContents.send(
        IPC_CHANNEL.BluetoothWorkerStatusRefreshRequest,
      );
      await p;
    } finally {
      this.dispatch(setLoading(false));
    }
  };

  private readonly onWriteStatusCode = async (
    event: IpcMainEvent,
    code: StatusCode,
  ) => {
    this.dispatch(setLoading(true));
    try {
      const p = new Promise((r) =>
        ipcMain.once(IPC_CHANNEL.BluetoothWorkerStatusWriteRequestComplete, r),
      );
      this.window.webContents.send(
        IPC_CHANNEL.BluetoothWorkerStatusWriteRequest,
        code,
      );
      await p;
    } finally {
      this.dispatch(setLoading(false));
    }
  };

  private readonly onRequestDisconnect = async (event: IpcMainEvent) => {
    try {
      await this.reset();
    } finally {
      event.reply(IPC_CHANNEL.BluetoothDisconnectRequestComplete);
    }
  };

  private readonly onSelectBluetoothDevice = (
    event: Event,
    deviceList: Electron.BluetoothDevice[],
    callback: (deviceId: string) => void,
  ) => {
    event.preventDefault();
    const result = deviceList.find((device) => {
      return device.deviceName?.toLocaleLowerCase()?.includes('emily');
    });
    if (!result) {
      callback('');
    } else {
      callback(result.deviceId);
    }
  };
}
