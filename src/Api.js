const fetch = require('cross-fetch');

const serverUrl = () => `http://localhost:${serverPort()}`;
const serverPort = () => {
    if (!!global && !!global.settings) {
        return global.settings.expressServerPort;
    } else {
        const electron = require('electron');
        const getGlobal = electron.getGlobal ?? electron.remote?.getGlobal;
        return getGlobal('settings').expressServerPort;
    }
}

const jsonResponse = res => res.json();

const get = endpoint => {
    const url = `${serverUrl()}/request?endpoint=${endpoint}`;
    console.log(`[GET] Fetching '${url}'...`);

    return fetch(url).then(jsonResponse);
};

const post = endpoint => {
    const url = `${serverUrl()}/request?endpoint=${endpoint}`;
    console.log(`[POST] Fetching '${url}'...`);

    return fetch(url, {method: 'POST'});
}

module.exports = {get, post};