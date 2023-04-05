const { app, ipcMain, BrowserWindow, Menu } = require("electron")
require('electron-reload')(__dirname)
Menu.setApplicationMenu(false)
const { spawn } = require('child_process');

let mainWindow;
let menuWindow;

function createMainWindow() {
    const mainWindow = new BrowserWindow({
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
}

function createMenuWindow() {
    const menuWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        minWidth: 650,
        minHeight: 500,
        frame: false,
        titleBarStyle: "hidden",
        show: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    })

    menuWindow.loadFile('src/ui/menu.html')
    menuWindow.maximize()
    menuWindow.webContents.openDevTools()
    mainWindow.close()
}

ipcMain.on('menu-maximize-window', () => {
    if (createMenuWindow.isMaximized()) {
        createMenuWindow.unmaximize();
    }
    else {
        createMenuWindow.maximize();
    }
})

function validateLoginCredentials(username, password) {
    return new Promise((resolve, reject) => {
        // Call a Python script that validates the login credentials
        const script = spawn('python', ['backend/app.py', username, password]);
        let result = '';

        script.stdout.on('data', (data) => {
            result += data.toString();
        });

        script.stderr.on('data', (data) => {
            console.error(data.toString());
            reject(data.toString());
        });

        script.on('close', (code) => {
            if (code !== 0) {
                reject(`Validation script exited with code ${code}`);
            } else {
                resolve(result.trim());
            }
        });
    });
}

app.whenReady().then(() => {
    createMainWindow()
})

ipcMain.on('submit-login-form', async (event, data) => {
    const { username, password } = data;

    try {
        const result = await validateLoginCredentials(username, password);

        // If the login was successful, load the menu page and close the main window
        if (result === 'success') {
            createMenuWindow();
            event.sender.send('login-status', 'success');
        } else {
            event.sender.send('login-status', 'fail');
        }
    } catch (error) {
        console.error(error);
        event.sender.send('login-status', 'error');
    }
});

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