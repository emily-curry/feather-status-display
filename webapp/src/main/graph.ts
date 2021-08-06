import { AuthenticationResult } from '@azure/msal-common';
import {
  AuthenticationProvider,
  AuthenticationProviderOptions,
} from '@microsoft/microsoft-graph-client';
import { BrowserWindow } from 'electron';
import { getTokenInteractive, getTokenRefresh, logOut } from './ms';
import { nativeIconSmall } from './util';

export class ElectronAuthenticationProvider implements AuthenticationProvider {
  private authRequest?: AuthenticationResult;

  public async getAccessToken(
    opts?: AuthenticationProviderOptions,
  ): Promise<string> {
    const scopes = opts?.scopes ?? ['User.Read', 'Presence.Read'];
    const tokenRequest = { scopes };

    if (
      this.authRequest?.expiresOn &&
      this.authRequest.expiresOn < new Date()
    ) {
      return this.authRequest.accessToken;
    }

    try {
      this.authRequest = await getTokenRefresh(tokenRequest);
    } catch (e) {
      // no-op
    }

    if (!this.authRequest) {
      const window = new BrowserWindow({
        icon: nativeIconSmall,
        title: 'Authenticate',
      });
      this.authRequest = await getTokenInteractive(window, tokenRequest);
    }

    if (!this.authRequest) {
      throw new Error('Could not get access token');
    }
    return this.authRequest.accessToken;
  }

  public async logOut() {
    if (this.authRequest?.account) {
      await logOut(this.authRequest.account);
    }
    this.authRequest = undefined;
  }
}
