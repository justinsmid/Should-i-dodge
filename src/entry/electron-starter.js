const electron = require('electron');
const path = require('path');
const url = require('url');
const {ExpressServer, DEFAULT_EXPRESS_PORT} = require('./ExpressServer');
const {startServer: startOpggApiServer} = require('../../op.gg-api/server');
const {Tray, Menu} = require('electron');
const Settings = require('../Settings');
const {get} = require('../Api');
const {ChampSelectChecker} = require('../ChampSelectChecker');
const OPGGClient = require('../../op.gg-api/client');

const {app, BrowserWindow} = electron;

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

let mainWindow;
let expressServer;
let opggApiServer;
let tray;
let champSelectChecker;
let champSelectInterval;

const baseUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '/../build/index.html'),
    protocol: 'file:',
    slashes: true
});

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 768,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false
        }
    });

    mainWindow.loadURL(baseUrl);

    mainWindow.webContents.openDevTools();

    mainWindow.on('closed', function () {
        mainWindow = null
    });

    mainWindow.hide();

    return mainWindow;
};

const startExpressServer = (port = DEFAULT_EXPRESS_PORT) => {
    const expressServer = new ExpressServer(port);
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
        {
            label: 'settings', type: 'normal', click: () => {
                console.log(`Opening settings...`);

                settingsWindow = new BrowserWindow({
                    width: 1024,
                    height: 768,
                    webPreferences: {
                        nodeIntegration: true,
                        enableRemoteModule: true,
                        contextIsolation: false
                    }
                });

                const settingsUrl = (baseUrl + (baseUrl.endsWith('/') ? '' : '/') + 'settings');
                settingsWindow.loadURL(settingsUrl);

                settingsWindow.webContents.openDevTools();

                settingsWindow.on('closed', function () {
                    settingsWindow = null
                });
            }
        },
        {
            label: 'exit', type: 'normal', click: () => {
                console.log(`Exiting...`);
                exit();
            }
        },
    ]);

    tray.addListener('double-click', () => {
        if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
        } else {
            mainWindow = createMainWindow();
        }
    });

    tray.setContextMenu(contextMenu);
    return tray;
};

app.on('ready', async () => {
    global.settings = Settings.fromStorageOrNew();

    mainWindow = createMainWindow();
    expressServer = await startExpressServer(global.settings.expressServerPort);
    opggApiServer = await startOpggApiServer(global.settings.opggApiServerPort);
    tray = createTray();

    champSelectChecker = new ChampSelectChecker();
    champSelectChecker.on('champSelectFound', checkChampSelectLobby);
    champSelectInterval = champSelectChecker.startChampSelectInterval();

});

app.on('window-all-closed', () => {
    // Do nothing.
});

app.on('activate', function () {
    if (mainWindow === null) {
        createMainWindow()
    }
});

const checkChampSelectLobby = async champSelectData => {
    const opggClient = new OPGGClient({opggApiServerPort: global.settings.opggApiServerPort});

    const userSummonerId = champSelectData.myTeam.find(playerData => playerData.cellId === champSelectData.localPlayerCellId).summonerId;

    let summoners = await Promise.all(champSelectData.myTeam.map(async playerData => {
        return await get(`/lol-summoner/v1/summoners/${playerData.summonerId}`);
    }));

    // Remove user's summoner name if settings say not to check the user's summoner
    if (global.settings.checkSelf === false) {
        summoners = summoners.filter(summoner => summoner.summonerId !== userSummonerId);
    }

    summoners.forEach(({displayName: name}) => {
        const settings = global.settings;

        const showDodgeWarning = (text) => {
            return electron.dialog.showMessageBox({
                title: 'You should consider dodging',
                type: 'warning',
                message: text,
                buttons: [
                    `View ${name}'s OP.GG`,
                    'Dismiss'
                ],
                cancelId: 1,
                noLink: true
            })
                .then(({response: clickedBtnIndex}) => {
                    if (clickedBtnIndex === 0) {
                        // TODO: Un-hardcode server 'na'
                        electron.shell.openExternal(`https://na.op.gg/summoner/userName=${name}`);
                    }
                });
        };

        // TODO: Un-hardcode server 'na'
        opggClient.SummonerStats('na', name)
            .then(stats => {
                // TODO: Handle `stats` having null values, due to someone being unranked, or not having any recent games 
                if (stats.winRatio <= settings.dodgeBoundaries.maxWinratio) {
                    showDodgeWarning(`${name} has a winrate of ${stats.winRatio}%.`);
                } else if (stats.streakType === "LOSS_STREAK" && stats.streak >= settings.dodgeBoundaries.minStreak) {
                    showDodgeWarning(`${name} is on a ${stats.streak} game loss-streak.`);
                } else if (stats.gameCount >= settings.dodgeBoundaries.minGameCount) {
                    showDodgeWarning(`${name} has over 1000 games played this season.`);
                }
            });
    });
};

const exit = () => {
    expressServer?.close();
    opggApiServer?.close();
    tray?.destroy();
    app.quit();
    clearInterval(champSelectInterval);
    process.exit(0);
};
