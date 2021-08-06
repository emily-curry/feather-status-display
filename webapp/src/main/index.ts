import { app, BrowserWindow, ipcMain, Menu, Tray } from 'electron';
import { getAssetURL } from 'electron-snowpack';
import { IPC_CHANNEL } from '../renderer/channel';
import { ElectronAuthenticationProvider } from './graph';
import { nativeIcon } from './util';

app.commandLine.appendSwitch('enable-experimental-web-platform-features');

let mainWindow: BrowserWindow | null | undefined;
let tray: Tray | undefined;

function createMainWindow(): BrowserWindow {
  const window = new BrowserWindow({
    icon: nativeIcon,
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

  return window;
}

// create main BrowserWindow when electron is ready
app.on('ready', (): void => {
  tray = new Tray(nativeIcon);

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

app.on('activate', (): void => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    mainWindow = createMainWindow();
  }
});

const authProvider = new ElectronAuthenticationProvider();

ipcMain.on(IPC_CHANNEL.MSALReqAccessToken, async (ev) => {
  let token: string | undefined;
  try {
    token = await authProvider.getAccessToken();
  } finally {
 ev.reply(IPC_CHANNEL.MSALResAccessToken, token);
  }
});

ipcMain.on(IPC_CHANNEL.MSALReqLogOut, async (ev) => {
  try {
    await authProvider.logOut();
  } finally {
    ev.reply(IPC_CHANNEL.MSALResLogOut);
  }
});
