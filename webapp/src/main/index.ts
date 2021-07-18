import { app, BrowserWindow } from 'electron';
import { getAssetURL } from 'electron-snowpack';

app.commandLine.appendSwitch('enable-experimental-web-platform-features');

let mainWindow: BrowserWindow | null | undefined;

function createMainWindow(): BrowserWindow {
  const window = new BrowserWindow();

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
        console.log(device);
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
  mainWindow = createMainWindow();
});

// quit application when all windows are closed
app.on('window-all-closed', (): void => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', (): void => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    mainWindow = createMainWindow();
  }
});
