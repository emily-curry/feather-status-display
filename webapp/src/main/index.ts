import { app, BrowserWindow, ipcMain, Menu, Tray } from 'electron';
import { getAssetURL } from 'electron-snowpack';
import { IPC_CHANNEL } from '../renderer/channel';
import { FeatherBluetoothService } from './bt';
import { FeatherGraphService } from './graph';
import { nativeIconSmall } from './util';
import fetch from 'node-fetch';
if (!globalThis.fetch) {
  globalThis.fetch = fetch as any;
}

app.commandLine.appendSwitch('enable-experimental-web-platform-features');
app.commandLine.appendSwitch('no-user-gesture-required');

let mainWindow: BrowserWindow | null | undefined;
let tray: Tray | undefined;
let bt: FeatherBluetoothService | undefined;
let graph: FeatherGraphService | undefined;

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
  graph!.setWindow(window);

  window.on('closed', (): void => {
    bt!.setOnStateChange(undefined);
    graph!.setWindow(undefined);
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

app.on('ready', async () => {
  bt = new FeatherBluetoothService();
  await bt.init();
  graph = new FeatherGraphService();
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

ipcMain.on('log', (e, data) => {
  console.log(data);
});
