const electron = require('electron');
const path = require('path');
const url = require('url');
const {ExpressServer} = require('./ExpressServer');
const {startServer: startOpggApiServer} = require('../../op.gg-api/server');

const {app, BrowserWindow} = electron;

let mainWindow;

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

const EXPRESS_PORT = 6969;

async function createWindow() {
    console.log('Creating electron window...');

    mainWindow = new BrowserWindow({
        width: 1024,
        height: 768,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false
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

    const expressServer = new ExpressServer(EXPRESS_PORT);
    expressServer.start()
        .then(() => console.log(`Express server listening at 'http://localhost:${global.expressServerPort}'`))
        .catch(error => {
            console.error(`ERROR: Could not start express server`);
            console.error(error);

            if (error.startsWith('[LCU_TIMEOUT]')) {
                electron.dialog.showErrorBox(
                    'LCU data reading timed out',
                    'This is probably because no open League client could be found. Please make sure your League client is running and restart this app.'
                );
            }

            mainWindow.close();
        });

    const opggApiServer = await startOpggApiServer();
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
