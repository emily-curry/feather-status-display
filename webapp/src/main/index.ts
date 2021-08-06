import { app, BrowserWindow, ipcMain, Menu, Tray } from 'electron';
import { getAssetURL } from 'electron-snowpack';
import { IPC_CHANNEL } from '../renderer/channel';
import { ElectronAuthenticationProvider } from './graph';
import { nativeIconLarge, nativeIconSmall } from './util';

app.commandLine.appendSwitch('enable-experimental-web-platform-features');

let mainWindow: BrowserWindow | null | undefined;
let tray: Tray | undefined;

app.dock.hide();

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

  window.on('closed', (): void => {
    mainWindow = null;
    app.dock.hide();
  });

  window.webContents.on('devtools-opened', (): void => {
    window.focus();
    setImmediate((): void => {
      window.focus();
    });
  });

  window.webContents.on(
    'select-bluetooth-device',
    (event, deviceList, callback) => {
      event.preventDefault();
      const result = deviceList.find((device) => {
        return device.deviceName?.toLocaleLowerCase()?.includes('emily');
      });
      if (!result) {
        callback('');
      } else {
        callback(result.deviceId);
      }
    },
  );

  app.dock.show();
  return window;
}

// create main BrowserWindow when electron is ready
app.on('ready', (): void => {
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
