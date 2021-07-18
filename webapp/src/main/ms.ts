import {
  AuthorizationUrlRequest,
  Configuration,
  CryptoProvider,
  PublicClientApplication,
  SilentFlowRequest,
  AccountInfo,
} from '@azure/msal-node';
import { BrowserWindow, protocol } from 'electron';
import path from 'path';
import url from 'url';
import { ElectronCachePlugin } from './ms-persistence';

const redirectUri = 'feather://auth';

let _pca: PublicClientApplication | undefined;

async function getPca() {
  if (_pca) return _pca;

  const MSAL_CONFIG: Configuration = {
    auth: {
      clientId: '02539121-a477-4cba-98c2-116d0298a01d',
      authority: 'https://login.microsoftonline.com/common',
    },
    cache: {
      cachePlugin: await ElectronCachePlugin.create(),
    },
  };

  _pca = new PublicClientApplication(MSAL_CONFIG);
  return _pca;
}

const pkceCodes = {
  challengeMethod: 'S256', // Use SHA256 Algorithm
  verifier: '', // Generate a code verifier for the Auth Code Request first
  challenge: '', // Generate a code challenge from the previously generated code verifier
};

const cryptoProvider = new CryptoProvider();

export type TokenRequest = {
  scopes: Array<string>;
};

/**
 * Starts a silent token request.
 * @param tokenRequest token request object with scopes
 */
export async function getTokenRefresh(tokenRequest: TokenRequest) {
  const pca = await getPca();

  const accounts = await pca.getTokenCache().getAllAccounts();
  const account = accounts?.[0];
  console.log(account);

  if (!account) return undefined;

  const request: SilentFlowRequest = {
    scopes: tokenRequest.scopes,
    account,
  };

  return (await pca.acquireTokenSilent(request)) ?? undefined;
}

export async function logOut(account: AccountInfo) {
  const pca = await getPca();
  await pca.getTokenCache().removeAccount(account);
}

/**
 * Starts an interactive token request
 * @param authWindow: Electron window object
 * @param tokenRequest: token request object with scopes
 */
export async function getTokenInteractive(
  authWindow: BrowserWindow,
  tokenRequest: TokenRequest,
) {
  /**
   * Proof Key for Code Exchange (PKCE) Setup
   *
   * MSAL enables PKCE in the Authorization Code Grant Flow by including the codeChallenge and codeChallengeMethod
   * parameters in the request passed into getAuthCodeUrl() API, as well as the codeVerifier parameter in the
   * second leg (acquireTokenByCode() API).
   */

  const { verifier, challenge } = await cryptoProvider.generatePkceCodes();

  pkceCodes.verifier = verifier;
  pkceCodes.challenge = challenge;

  const authCodeUrlParams: AuthorizationUrlRequest = {
    redirectUri: redirectUri,
    scopes: tokenRequest.scopes,
    codeChallenge: pkceCodes.challenge, // PKCE Code Challenge
    codeChallengeMethod: pkceCodes.challengeMethod, // PKCE Code Challenge Method
    prompt: 'select_account',
  };

  const pca = await getPca();

  const authCodeUrl = await pca.getAuthCodeUrl(authCodeUrlParams);

  // register the custom file protocol in redirect URI
  protocol.registerFileProtocol(redirectUri.split(':')[0], (req, callback) => {
    const requestUrl = url.parse(req.url, true);
    callback(path.normalize(`${__dirname}/${requestUrl.path}`));
  });

  const authCode = await listenForAuthCode(authCodeUrl, authWindow); // see below

  if (!authCode) throw new Error('No auth code returned');

  const authResponse = await pca.acquireTokenByCode({
    redirectUri: redirectUri,
    scopes: tokenRequest.scopes,
    code: authCode,
    codeVerifier: pkceCodes.verifier, // PKCE Code Verifier
  });

  return authResponse ?? undefined;
}

/**
 * Listens for auth code response from Azure AD
 * @para navigateUrl: URL where auth code response is parsed
 * @param authWindow: Electron window object
 */
async function listenForAuthCode(
  navigateUrl: string,
  authWindow: BrowserWindow,
): Promise<string | null> {
  authWindow.loadURL(navigateUrl);

  return new Promise((resolve, reject) => {
    authWindow.webContents.on('will-redirect', (event, responseUrl) => {
      try {
        event.preventDefault();
        const parsedUrl = new URL(responseUrl);
        const authCode = parsedUrl.searchParams.get('code');
        resolve(authCode);
      } catch (err) {
        reject(err);
      } finally {
        authWindow.close();
      }
    });
  });
}
