import React, { createContext, useContext, useCallback } from 'react';
import {
  AuthenticationProvider,
  AuthenticationProviderOptions,
  ClientOptions,
  Client,
} from '@microsoft/microsoft-graph-client';
const { ipcRenderer } = require('electron');
import { IPC_CHANNEL } from '../channel';

class FeatherAuthProvider implements AuthenticationProvider {
  public async getAccessToken(
    authenticationProviderOptions?: AuthenticationProviderOptions | undefined,
  ): Promise<string> {
    const res = new Promise<string>((r) =>
      ipcRenderer.once(IPC_CHANNEL.MSALResAccessToken, (e, a1) => r(a1)),
    );
    ipcRenderer.send(IPC_CHANNEL.MSALReqAccessToken);
    const token = await res;
    return token;
  }
}

let clientOptions: ClientOptions = {
  authProvider: new FeatherAuthProvider(),
};

const graphClient = Client.initWithMiddleware(clientOptions);

const context = createContext(graphClient);

export const GraphClientProvider: React.FC = ({ children }) => {
  return <context.Provider value={graphClient}>{children}</context.Provider>;
};

export const useGraphClient = () => {
  return useContext(context);
};

export const useGraphClientLogOut = () => {
  return useCallback(async () => {
    const res = new Promise<void>((r) =>
      ipcRenderer.once(IPC_CHANNEL.MSALResLogOut, () => r()),
    );
    ipcRenderer.send(IPC_CHANNEL.MSALReqLogOut);
    await res;
  }, []);
};
