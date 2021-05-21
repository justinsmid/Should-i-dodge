const storage = require('electron-json-storage');
const {DEFAULT_OPGG_CLIENT_SERVER_PORT} = require('../op.gg-api/server');
const {DEFAULT_EXPRESS_SERVER_PORT} = require('./entry/ExpressServer');
global.storage = storage;

class Settings {
    expressServerPort = DEFAULT_EXPRESS_SERVER_PORT;
    opggApiServerPort = DEFAULT_OPGG_CLIENT_SERVER_PORT;

    dodgeBoundaries = {
        maxWinratio: 46,
        minStreak: 4,
        minGameCount: 1000
    }

    /* TODO: Add more settings
    *   checkSelf: boolean - Whether the app should check the user's op.gg
    *   champSelectInterval: number - interval for checking whether the user is in a champ select lobby
    *   ...
    */
    
    constructor(partialSettings) {
        if (!!partialSettings) {
            Object.assign(this, partialSettings);
        }
    }

    static fromStorageOrNew() {
        const data = storage.getSync('settings') ?? {};

        return new Settings(data);
    }
}

module.exports = Settings;