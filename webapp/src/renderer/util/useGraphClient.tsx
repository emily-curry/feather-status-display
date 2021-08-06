import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  useMemo,
} from 'react';
import {
  AuthenticationProvider,
  AuthenticationProviderOptions,
  ClientOptions,
  Client,
} from '@microsoft/microsoft-graph-client';
const { ipcRenderer } = require('electron');
import { IPC_CHANNEL } from '../channel';

interface GraphClientContext {
  graphClient: Client;
  token?: string;
  logOut: () => Promise<void>;
}

class FeatherAuthProvider implements AuthenticationProvider {
  constructor(private readonly onAuthTokenChange: (token?: string) => void) {}

  public async getAccessToken(
    authenticationProviderOptions?: AuthenticationProviderOptions | undefined,
  ): Promise<string> {
    const res = new Promise<string>((r) =>
      ipcRenderer.once(IPC_CHANNEL.MSALResAccessToken, (e, a1) => r(a1)),
    );
    ipcRenderer.send(IPC_CHANNEL.MSALReqAccessToken);
    const token = await res;
    this.onAuthTokenChange(token);
    return token;
  }
}

const context = createContext<GraphClientContext>(null!);

export const GraphClientProvider: React.FC = ({ children }) => {
  const [token, setToken] = useState<string>();

  const authProvider = useMemo(() => {
    return new FeatherAuthProvider(setToken);
  }, [setToken]);

  const graphClient = useMemo(() => {
    const clientOptions: ClientOptions = {
      authProvider,
    };

    return Client.initWithMiddleware(clientOptions);
  }, [authProvider]);

  const logOut = useCallback(async () => {
    const res = new Promise<void>((r) =>
      ipcRenderer.once(IPC_CHANNEL.MSALResLogOut, () => r()),
    );
    ipcRenderer.send(IPC_CHANNEL.MSALReqLogOut);
    await res;
    setToken(undefined);
  }, [setToken]);

  const value = useMemo(
    () => ({ token, graphClient, logOut }),
    [token, graphClient, logOut],
  );

  return <context.Provider value={value}>{children}</context.Provider>;
};

export const useGraphClient = (): Client => {
  return useContext(context).graphClient;
};

export const useGraphClientToken = (): string | undefined => {
  return useContext(context).token;
};

export const useGraphClientLogOut = () => {
  return useContext(context).logOut;
};
