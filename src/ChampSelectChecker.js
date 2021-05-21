const {get} = require("./Api");

const DEFAULT_CHAMP_SELECT_INTERVAL = 5000;

class ChampSelectChecker {
    listeners = {};
    champSelectId = null;
    champSelectData = null;

    startChampSelectInterval(interval = DEFAULT_CHAMP_SELECT_INTERVAL) {
        return setInterval(this.checkForActiveChampSelect.bind(this), interval);
    }

    async checkForActiveChampSelect() {
        const response = await get('/lol-champ-select/v1/session');

        const inChampSelect = ('gameId' in response);

        if (inChampSelect) {
            if (this.champSelectId !== response.gameId) {
                console.log(response);
                this.champSelectId = response.gameId;
                this.champSelectData = response;

                this._emitEvent('champSelectFound', response);
            }
        } else {
            this.champSelectId = null;
            this.champSelectData = null;
        }
    }

    on(eventName, callback) {
        if (!this.listeners[eventName]) {
            this.listeners[eventName] = [callback];
        } else {
            this.listeners[eventName].push(callback);
        }
    }

    _emitEvent(eventName, data) {
        const callbacks = this.listeners[eventName];
        if (callbacks) callbacks.forEach(c => c(data));
    }
}

module.exports = {ChampSelectChecker};