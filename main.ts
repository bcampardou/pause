import { app, BrowserWindow, screen, globalShortcut } from 'electron';
import * as path from 'path';
import * as url from 'url';
import * as aspect from './ratio-handler';
import { autoUpdater } from "electron-updater";

let win: BrowserWindow = null;
const args = process.argv.slice(1),
  serve = args.some(val => val === '--serve');

function createWindow(): BrowserWindow {
  autoUpdater.checkForUpdatesAndNotify();

  const electronScreen = screen;
  const size = { width: 800, height: 475 };
  let mainWindowHandler;

  // Create the browser window.
  win = new BrowserWindow({
    width: size.width,
    height: size.height,
    transparent: true,
    icon: './build/icon.ico',
    frame: false,
    show: true,
    maximizable: false,
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: (serve) ? true : false,
    },
  });
  win.webContents.session.webRequest.onBeforeRequest({ urls: ['devtools://devtools/remote/*'] }, (details, callback) => { callback({ redirectURL: details.url.replace('devtools://devtools/remote/', 'https://chrome-devtools-frontend.appspot.com/') }); });


  if (serve) {
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    win.loadURL('http://localhost:4200');
  } else {
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  if (serve) {
    // win.webContents.openDevTools();
  }
  mainWindowHandler = new aspect(win);
  const screenFactor =
    //define the ratio
    mainWindowHandler.setRatio(16, 9, 25, 100);


  // Emitted when the window is closed.
  win.on('closed', () => {
    mainWindowHandler.stop()
    mainWindowHandler = null
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  globalShortcut.register('CommandOrControl+Alt+P', () => {
    if (win.isMinimized()) {
      win.show();
    } else {
      win.minimize();
    }
  });

  return win;
}
app.commandLine.appendSwitch('high-dpi-support', 'true');

try {

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', createWindow);

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

} catch (e) {
  // Catch Error
  // throw e;
}
