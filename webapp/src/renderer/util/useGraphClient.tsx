import React, {
  createContext,
  useCallback,
  useMemo,
  useContext,
  useState,
  useEffect,
} from 'react';
import { IPC_CHANNEL } from '../channel';
import { GraphActivityState, GraphMeState } from '../state';
const { ipcRenderer } = require('electron');

interface GraphClientContext {
  logIn: () => Promise<unknown>;
  logOut: () => Promise<void>;
  me: GraphMeState;
  activity: GraphActivityState;
}

const context = createContext<GraphClientContext>(null!);

export const GraphClientProvider: React.FC = ({ children }) => {
  const [me, setMeState] = useState<GraphMeState>({});
  const [activity, setActivityState] = useState<GraphActivityState>({});

  useEffect(() => {
    const handleOnMe = (state: GraphMeState) => setMeState(state);
    const handleOnActivity = (state: GraphActivityState) =>
      setActivityState(state);
    ipcRenderer.on(IPC_CHANNEL.GraphGetMeUpdate, handleOnMe);
    ipcRenderer.on(IPC_CHANNEL.GraphGetActivityUpdate, handleOnActivity);

    return () => {
      ipcRenderer.off(IPC_CHANNEL.GraphGetMeUpdate, handleOnMe);
      ipcRenderer.off(IPC_CHANNEL.GraphGetActivityUpdate, handleOnActivity);
    };
  }, [setMeState, setActivityState]);

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
    () => ({ logIn, logOut, me, activity }),
    [logIn, logOut, me, activity],
  );

  return <context.Provider value={value}>{children}</context.Provider>;
};

export const useGraphClient = () => {
  return useContext(context);
};
