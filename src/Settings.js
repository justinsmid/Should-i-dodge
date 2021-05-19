class Settings {
    expressServerPort = 6969;
    opggApiServerPort = 2424;

    dodgeBoundaries = {
        maxWinratio: 46,
        minStreak: 4,
        minGameCount: 1000
    }

    // TODO: Actually use settings when checking op.gg's

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
        // TODO: Attempt to get settings from storage
        return new Settings();
    }
}

module.exports = Settings;