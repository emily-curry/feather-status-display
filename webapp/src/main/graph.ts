import { AuthenticationResult } from '@azure/msal-common';
import {
  AuthenticationProvider,
  AuthenticationProviderOptions,
  Client,
} from '@microsoft/microsoft-graph-client';
import { BrowserWindow, ipcMain } from 'electron';
import { IpcMainEvent } from 'electron';
import { IPC_CHANNEL } from '../renderer/channel';
import {
  GraphActivityState,
  GraphMeState,
  GraphState,
} from '../renderer/state';
import {
  getTokenInteractive,
  getTokenRefresh,
  logOut,
  TokenRequest,
} from './ms';
import { nativeIconSmall } from './util';

const setLoading = (isLoading: boolean) =>
  ({ type: 'set loading', payload: isLoading } as const);
const setMe = (me?: GraphMeState) => ({ type: 'set me', payload: me } as const);
const setActivity = (activity?: GraphActivityState) =>
  ({ type: 'set activity', payload: activity } as const);
const reset = () => ({ type: 'reset' } as const);

type Action =
  | ReturnType<typeof setLoading>
  | ReturnType<typeof setMe>
  | ReturnType<typeof setActivity>
  | ReturnType<typeof reset>;

const initialState: GraphState = { isLoading: false };

const graphReducer = (
  state: GraphState = initialState,
  action?: Action,
): GraphState => {
  if (!action) return state;
  switch (action.type) {
    case 'set loading': {
      return { ...state, isLoading: action.payload };
    }
    case 'set activity': {
      return { ...state, activity: action.payload };
    }
    case 'set me': {
      return { ...state, me: action.payload };
    }
    case 'reset': {
      return { ...initialState };
    }
    default: {
      return state;
    }
  }
};

class FeatherGraphProvider implements AuthenticationProvider {
  public authRequest?: AuthenticationResult;

  public async loginSilent(opts?: AuthenticationProviderOptions) {
    try {
      const tokenRequest = this.getRequest(opts);
      this.authRequest = await getTokenRefresh(tokenRequest);
    } catch (e) {
      // no-op
    }
  }

  public async getAccessToken(
    opts?: AuthenticationProviderOptions,
  ): Promise<string> {
    const tokenRequest = this.getRequest(opts);

    if (
      this.authRequest?.expiresOn &&
      this.authRequest.expiresOn < new Date()
    ) {
      return this.authRequest.accessToken;
    }

    await this.loginSilent(opts);

    if (!this.authRequest) {
      const w = new BrowserWindow({
        icon: nativeIconSmall,
        title: 'Authenticate',
      });
      this.authRequest = await getTokenInteractive(w, tokenRequest);
    }

    if (!this.authRequest) {
      throw new Error('Could not get access token');
    }
    return this.authRequest.accessToken;
  }

  private getRequest(opts?: AuthenticationProviderOptions): TokenRequest {
    const scopes = opts?.scopes ?? ['User.Read', 'Presence.Read'];
    const tokenRequest = { scopes };
    return tokenRequest;
  }
}

export class FeatherGraphService {
  private readonly provider = new FeatherGraphProvider();
  private readonly client = Client.initWithMiddleware({
    authProvider: this.provider,
  });
  private state: GraphState = graphReducer();
  private window?: BrowserWindow;
  private activityInterval?: NodeJS.Timer;

  constructor() {
    ipcMain.on(IPC_CHANNEL.MSALLogInRequest, this.onLogInRequest);
    ipcMain.on(IPC_CHANNEL.MSALLogOutRequest, this.onLogOutRequest);
    ipcMain.on(IPC_CHANNEL.GraphStateUpdateRequest, (e) =>
      e.reply(IPC_CHANNEL.GraphStateUpdate, this.state),
    );
    this.init();
  }

  public setWindow(window?: BrowserWindow) {
    this.window = window;
    this.window?.webContents.send(IPC_CHANNEL.GraphStateUpdate, this.state);
  }

  private async init() {
    await this.provider.loginSilent();
    if (this.provider.authRequest) {
      await this.onLogIn();
    }
  }

  private dispatch(action: Action) {
    this.state = graphReducer(this.state, action);
    this.window?.webContents.send(IPC_CHANNEL.GraphStateUpdate, this.state);
    console.log(action);
  }

  public async logOut() {
    if (this.provider.authRequest?.account) {
      await logOut(this.provider.authRequest.account);
    }
    this.provider.authRequest = undefined;
  }

  private async updateMe() {
    this.dispatch(setLoading(true));
    try {
      const res = await this.client.api('/me').get();
      this.dispatch(
        setMe({
          name: res.displayName,
          email: res.mail,
          username: res.userPrincipalName,
        }),
      );
    } catch {
      this.dispatch(setMe(undefined));
    } finally {
      this.dispatch(setLoading(false));
    }
  }

  private async updateActivity() {
    this.dispatch(setLoading(true));
    try {
      const res = await this.client.api('/me/presence').get();
      this.dispatch(setActivity({ current: res.activity }));
      ipcMain.emit(
        IPC_CHANNEL.GraphActivityChange,
        this.state.activity?.current,
      );
    } catch (e) {
      this.dispatch(setActivity(undefined));
      if (this.activityInterval) {
        clearInterval(this.activityInterval);
        this.activityInterval = undefined;
      }
    } finally {
      this.dispatch(setLoading(false));
    }
  }

  private async onLogIn() {
    await this.updateMe();
    this.activityInterval = setInterval(async () => {
      await this.updateActivity();
    }, 1000 * 60 * 2);
    await this.updateActivity();
  }

  private onLogInRequest = async (event: IpcMainEvent) => {
    try {
      this.dispatch(reset());
      await this.onLogIn();
    } finally {
      event.reply(IPC_CHANNEL.MSALLogInRequestComplete);
    }
  };

  private onLogOutRequest = async (event: IpcMainEvent) => {
    try {
      this.dispatch(setLoading(true));
      await this.logOut();
    } finally {
      this.dispatch(reset());
      event.reply(IPC_CHANNEL.MSALLogOutRequestComplete);
    }
  };
}
