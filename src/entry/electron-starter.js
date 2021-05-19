const electron = require('electron');
const path = require('path');
const url = require('url');
const {ExpressServer} = require('./ExpressServer');
const {startServer: startOpggApiServer} = require('../../op.gg-api/server');
const {Tray, Menu} = require('electron');

const {app, BrowserWindow} = electron;

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

const EXPRESS_PORT = 6969;

let mainWindow;
let expressServer;
let opggApiServer;
let tray;

async function createMainWindow() {
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

    return mainWindow;
};

const startExpressServer = () => {
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

            mainWindow?.close();
        });
    return expressServer;
};

const createTray = () => {
    const tray = new Tray(path.join(__dirname, '../../public/favicon.ico'));
    tray.setToolTip('Should-i-dodge');

    const contextMenu = Menu.buildFromTemplate([
        {label: 'settings', type: 'normal', click: () => {
            console.log(`Opening settings...`);
            // TODO: Open settings window
        }},
        {label: 'exit', type: 'normal', click: () => {
            console.log(`Exiting...`);
            exit();
        }},
    ]);

    tray.setContextMenu(contextMenu);
    return tray;
};

app.on('ready', async () => {
    mainWindow = createMainWindow();
    expressServer = await startExpressServer();
    opggApiServer = await startOpggApiServer();
    tray = createTray();
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        exit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createMainWindow()
    }
});

const exit = () => {
    expressServer?.close();
    opggApiServer?.close();
    app.quit();
    process.exit(0);
}
