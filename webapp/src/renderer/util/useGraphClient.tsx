import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { IPC_CHANNEL } from '../channel';
import { GraphState } from '../state';
const { ipcRenderer } = require('electron');

interface GraphClientContext {
  logIn: () => Promise<unknown>;
  logOut: () => Promise<void>;
  state: GraphState;
}

const context = createContext<GraphClientContext>(null!);

export const GraphClientProvider: React.FC = ({ children }) => {
  const [state, setState] = useState<GraphState>({ isLoading: false });

  useEffect(() => {
    const handleState = (ev: any, state: GraphState) => setState(state);
    ipcRenderer.on(IPC_CHANNEL.GraphStateUpdate, handleState);
    ipcRenderer.send(IPC_CHANNEL.GraphStateUpdateRequest);

    return () => {
      ipcRenderer.off(IPC_CHANNEL.GraphStateUpdate, handleState);
    };
  }, [setState]);

  const logIn = useCallback(async () => {
    const res = new Promise<unknown>((r) =>
      ipcRenderer.once(IPC_CHANNEL.MSALLogInRequestComplete, (data) => r(data)),
    );
    ipcRenderer.send(IPC_CHANNEL.MSALLogInRequest);
    await res;
  }, []);

  const logOut = useCallback(async () => {
    const res = new Promise<void>((r) =>
      ipcRenderer.once(IPC_CHANNEL.MSALLogOutRequestComplete, () => r()),
    );
    ipcRenderer.send(IPC_CHANNEL.MSALLogOutRequest);
    await res;
  }, []);

  const value = useMemo(
    () => ({ logIn, logOut, state }),
    [logIn, logOut, state],
  );

  return <context.Provider value={value}>{children}</context.Provider>;
};

export const useGraphClient = () => {
  return useContext(context);
};
