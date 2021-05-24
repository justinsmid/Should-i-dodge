const {useEffect, useState} = require('react');
const url = require('url');
const path = require('path');
const electron = window.require('electron');

const {getGlobal, BrowserWindow, ipcMain} = electron.remote || electron;

const useForceUpdate = () => {
    const [, setValue] = useState(0);
    return () => setValue(value => value + 1);
}

const includesIgnoreCase = (target, string) => {
    if (typeof target !== "string" || typeof string !== "string") return false;

    return string.toLowerCase().includes(target.toLowerCase());
};

const equalsIgnoreCase = (target, string) => {
    if (typeof target !== "string" || typeof string !== "string") return false;

    return string.toLowerCase() === target.toLowerCase();
};

const splitFirst = (string, separator) => {
    if (!string || !separator) return null;

    const parts = string.split(separator);
    return [parts.shift(), parts.join(separator)];
};

const useEffectOnce = (callback) => {
    // eslint-disable-next-line
    return useEffect(callback, []);
};

const jsonResponse = res => res.json();

const multiPrompt = (options, parentWindow) => {
    return new Promise((resolve, reject) => {
        const id = `${new Date().getTime()}-${Math.random()}`;

        const opts = Object.assign({
            title: 'Prompt',
            label: 'Please input a value:',
            alwaysOnTop: false,
            value: null,
            type: 'input',
            selectOptions: null,
            inputArray: null,
            buttonsStyle: null,
            width: 580,
            height: 300,
            resizable: false,
            disableInitialLabel: false,
            openPrompt: false
        }, options || {});

        if (opts.type === 'select' && (opts.selectOptions === null || typeof (opts.selectOptions) !== 'object')) {
            return reject(new Error('"selectOptions" must be an object'));
        }

        let promptWindow = new BrowserWindow({
            width: opts.width, height: opts.height,
            resizable: opts.resizable,
            parent: parentWindow ? (parentWindow instanceof BrowserWindow) : null,
            skipTaskbar: true,
            alwaysOnTop: opts.alwaysOnTop,
            useContentSize: true,
            modal: parentWindow ? true : false,
            title: opts.title,
            webPreferences: {
                nodeIntegration: true,
                enableRemoteModule: true,
                contextIsolation: false
            }
        });

        if (opts.openPrompt) {
            promptWindow.webContents.openDevTools();
        }
        promptWindow.setMenu(null);

        const getOptionsListener = (event) => {
            event.returnValue = JSON.stringify(opts);
        };

        const postDataListener = (event, value) => {
            resolve(value);
            event.returnValue = null;
            cleanup();
        };

        const unresponsiveListener = () => {
            reject(new Error('Window was unresponsive'));
            cleanup();
        };

        const errorListener = (event, message) => {
            reject(new Error(message));
            event.returnValue = null;
            cleanup();
        };

        const cleanup = () => {
            if (promptWindow) {
                promptWindow.close();
                promptWindow = null;
            }
        };

        ipcMain.on('prompt-get-options:' + id, getOptionsListener);
        ipcMain.on('prompt-post-data:' + id, postDataListener);
        ipcMain.on('prompt-error:' + id, errorListener);
        promptWindow.on('unresponsive', unresponsiveListener);

        promptWindow.on('closed', () => {
            ipcMain.removeListener('prompt-get-options:' + id, getOptionsListener);
            ipcMain.removeListener('prompt-post-data:' + id, postDataListener);
            ipcMain.removeListener('prompt-error:' + id, postDataListener);
            resolve(null);
        });

        const promptUrl = url.format({
            protocol: 'file',
            slashes: true,
            pathname: path.join(__dirname, '../prompt', 'prompt.html'),
            hash: id
        });

        promptWindow.loadURL(promptUrl);
    });
}

module.exports = {
    getGlobal,
    useForceUpdate,
    includesIgnoreCase,
    equalsIgnoreCase,
    splitFirst,
    useEffectOnce,
    jsonResponse,
    multiPrompt
};