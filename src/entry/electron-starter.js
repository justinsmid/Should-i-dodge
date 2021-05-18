const electron = require('electron');
const path = require('path');
const url = require('url');
const LCUConnector = require('lcu-connector');

const {app, BrowserWindow} = electron;

const btoa = string => Buffer.from(string).toString('base64');

let mainWindow;

function createWindow() {
    console.log('Creating electron window...');

    mainWindow = new BrowserWindow({
        width: 1024,
        height: 768,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        }
    });

    const startUrl = process.env.ELECTRON_START_URL || url.format({
        pathname: path.join(__dirname, '/../build/index.html'),
        protocol: 'file:',
        slashes: true
    });
    mainWindow.loadURL(startUrl);

    mainWindow.webContents.openDevTools();

    mainWindow.on('closed', function () {
        mainWindow = null
    });

    readLCUData()
        .then(data => {
            console.log('LCU data received: ', data);
            global.LCU_data = data;
            global.LCU_auth = `${btoa(`${global.LCU_data.username}:${global.LCU_data.password}`)}`;
        })
        .catch(err => {
            console.error(err);
            electron.dialog.showErrorBox(
                'LCU data reading timed out',
                'This is probably because no open League client could be found. Please make sure your League client is running and restart this app.'
            );
            mainWindow.close();
        });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow()
    }
});

const readLCUData = () => {
    return new Promise((resolve, reject) => {
        debugger;
        const lcuConnector = new LCUConnector();

        lcuConnector.on('connect', data => {
            resolve(data);
        });

        lcuConnector.on('disconnect', () => {
            console.warn(`WARN: LCU connector disconnected.`);
        });

        lcuConnector.start();

        setTimeout(() => {
            reject(`[LCU_TIMEOUT]: Express server timed out while attempting to read LCU data. Probably because no running League Client was found.`);
        }, 10000);
    });
};
