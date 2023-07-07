const { app, ipcMain, BrowserWindow, Menu} = require("electron")
require('electron-reload')(__dirname)
Menu.setApplicationMenu(false)

let mainWindow;
var menuWindow = null;

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        minWidth: 700,
        minHeight: 550,
        resizable: false,
        frame: false,
        maximizable: false,
        titleBarStyle: "hidden",
        show: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    })

    mainWindow.loadFile('src/ui/login.html')
    mainWindow.webContents.openDevTools()
    mainWindow.once('ready-to-show', function () {
        mainWindow.show()
    })
})

ipcMain.on('submit-login', (event, data) => {
    console.log('Received login data:', data);

    const parsedData = JSON.parse(data);
    console.log(parsedData)

    if (parsedData.success == true) {
        event.sender.send('login-status', 'success');

        menuWindow = new BrowserWindow({
            width: 1000,
            height: 630,
            minWidth: 1200,
            minHeight: 650,
            frame: false,
            titleBarStyle: "hidden",
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                enableRemoteModule: true
            }
        })

        menuWindow.on('error', (error) => {
            console.error('An error occurred while creating the menu window:', error);
        });
        
        console.log('Loading menu.html...');
        menuWindow.loadFile('src/ui/menu.html')
        menuWindow.maximize()
        menuWindow.webContents.openDevTools()
        menuWindow.once('ready-to-show', function () { // show menu window when ready
            console.log('Showing menu window...');
            menuWindow.show();
        });

        mainWindow.close();

    } else {
        event.sender.send('login-status', 'fail');
    }
})

ipcMain.on('menu-maximize-window', () => {
    if (menuWindow.isMaximized()) {
        menuWindow.unmaximize();
    }
    else {
        menuWindow.maximize();
    }
})

app.on('window-all-closed', () => {
    if (process.platform != 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow()
    }
})

ipcMain.on('minimize-window', () => {
    BrowserWindow.getFocusedWindow().minimize();
});

ipcMain.on('close-window', () => {
    BrowserWindow.getFocusedWindow().close();
});