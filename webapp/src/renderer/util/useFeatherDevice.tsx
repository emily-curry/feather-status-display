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
const { ipcRenderer } = require('electron');

export interface FeatherContextControl {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
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

  const value = useMemo(() => {
    return {
      state: btState,
      connect,
      disconnect,
    };
  }, [btState, connect, disconnect]);

  return (
    <FeatherContext.Provider value={value}>
      {props.children}
    </FeatherContext.Provider>
  );
};

export const useFeatherControl = (): FeatherContextControl => {
  return useContext(FeatherContext);
};
