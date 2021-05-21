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

    checkSelf = false;

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