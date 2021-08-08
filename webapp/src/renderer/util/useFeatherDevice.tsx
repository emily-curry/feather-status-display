import { IpcRendererEvent } from 'electron/main';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { IPC_CHANNEL } from '../channel';
import { BluetoothState } from '../state';
import { StatusCode } from './statusCode';
const { ipcRenderer } = require('electron');

export interface FeatherContextControl {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  refreshStatusCode: () => Promise<void>;
  writeStatusCode: (code: StatusCode) => Promise<void>;
  state: BluetoothState;
}

const FeatherContext = React.createContext<FeatherContextControl>({} as any);

export const FeatherProvider: React.FC = (props) => {
  const [btState, setBtState] = useState<BluetoothState>({ isLoading: false });

  useEffect(() => {
    const handler = (event: IpcRendererEvent, data: BluetoothState) => {
      setBtState(data);
    };
    ipcRenderer.on(IPC_CHANNEL.BluetoothStateUpdate, handler);
    return () => {
      ipcRenderer.off(IPC_CHANNEL.BluetoothStateUpdate, handler);
    };
  }, []);

  const connect = useCallback(async () => {
    const p = new Promise((r) =>
      ipcRenderer.once(IPC_CHANNEL.BluetoothDeviceRequestComplete, r),
    );
    ipcRenderer.send(IPC_CHANNEL.BluetoothDeviceRequest);
    await p;
  }, []);

  const disconnect = useCallback(async () => {
    const p = new Promise((r) =>
      ipcRenderer.once(IPC_CHANNEL.BluetoothDisconnectRequestComplete, r),
    );
    ipcRenderer.send(IPC_CHANNEL.BluetoothDisconnectRequest);
    await p;
  }, []);

  const refreshStatusCode = useCallback(async () => {
    ipcRenderer.send(IPC_CHANNEL.BluetoothStatusCodeRefreshRequest);
  }, []);

  const writeStatusCode = useCallback(async (code: StatusCode) => {
    ipcRenderer.send(IPC_CHANNEL.BluetoothStatusCodeWriteRequest, code);
  }, []);

  const value = useMemo(() => {
    return {
      state: btState,
      connect,
      disconnect,
      refreshStatusCode,
      writeStatusCode,
    };
  }, [btState, connect, disconnect, refreshStatusCode, writeStatusCode]);

  return (
    <FeatherContext.Provider value={value}>
      {props.children}
    </FeatherContext.Provider>
  );
};

export const useFeatherControl = (): FeatherContextControl => {
  return useContext(FeatherContext);
};
