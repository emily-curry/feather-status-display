import { app, BrowserWindow, ipcMain, Menu, Tray } from 'electron';
import { getAssetURL } from 'electron-snowpack';
import { IPC_CHANNEL } from '../renderer/channel';
import { FeatherBluetoothService } from './bt';
import { ElectronAuthenticationProvider } from './graph';
import { nativeIconSmall } from './util';

app.commandLine.appendSwitch('enable-experimental-web-platform-features');
app.commandLine.appendSwitch('no-user-gesture-required');

let mainWindow: BrowserWindow | null | undefined;
let tray: Tray | undefined;
let bt: FeatherBluetoothService | undefined;

app.dock?.hide();

function createMainWindow(): BrowserWindow {
  const window = new BrowserWindow({
    icon: nativeIconSmall,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (process.env.MODE !== 'production') {
    window.webContents.openDevTools();
  }

  window.loadURL(getAssetURL('index.html'));

  bt!.setOnStateChange((state) => {
    window.webContents.send(IPC_CHANNEL.BluetoothStateUpdate, state);
  });

  window.on('closed', (): void => {
    bt!.setOnStateChange(undefined);
    mainWindow = null;
    app.dock?.hide();
  });

  window.webContents.on('devtools-opened', (): void => {
    window.focus();
    setImmediate((): void => {
      window.focus();
    });
  });

  app.dock?.show();
  return window;
}

// create main BrowserWindow when electron is ready
app.on('ready', (): void => {
  bt = new FeatherBluetoothService();
  tray = new Tray(nativeIconSmall);

  const show = () => {
    if (mainWindow) mainWindow.show();
    else mainWindow = createMainWindow();
  };

  if (process.platform === 'win32') {
    tray.on('click' as any, show);
  }

  const menu = Menu.buildFromTemplate([
    {
      label: 'Show',
      click: show,
    },
    {
      label: 'Quit',
      click() {
        app.quit();
      },
    },
  ]);
  tray.setToolTip('Feather Status');
  tray.setContextMenu(menu);
});

app.on('window-all-closed', (): void => {
  mainWindow?.destroy();
  mainWindow = null;
});

const authProvider = new ElectronAuthenticationProvider();

ipcMain.on(IPC_CHANNEL.MSALLogInRequest, async (ev) => {
  let token: string | undefined;
  try {
    token = await authProvider.getAccessToken();
  } finally {
    ev.reply(IPC_CHANNEL.MSALLogInRequestComplete, token);
  }
});

ipcMain.on(IPC_CHANNEL.MSALLogOutRequest, async (ev) => {
  try {
    await authProvider.logOut();
  } finally {
    ev.reply(IPC_CHANNEL.MSALLogOutRequestComplete);
  }
});

ipcMain.on('log', (e, data) => {
  console.log(data);
});
