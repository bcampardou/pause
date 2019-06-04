// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron')
let aspect = require('./ratio-handler')
const {autoUpdater} = require("electron-updater")


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow,
    mainWindowSize = [730, 415],
    mainWindowHandler

function createWindow() {
  // Check for updates
  autoUpdater.checkForUpdatesAndNotify()

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: mainWindowSize[0],
    height: mainWindowSize[1],
    transparent: true,
    frame: false,
    show: false,
    icon: './build/icon.ico'
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })
  
   //Create a new handler for the mainWindow
   mainWindowHandler = new aspect(mainWindow);
   
   //define the ratio
   mainWindowHandler.setRatio(16, 9, 10);

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindowHandler.stop()
    mainWindowHandler = null
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})
