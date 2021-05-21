const express = require('express');
const fetch = require('cross-fetch');
const LCUConnector = require('lcu-connector');
const cors = require('cors');

Buffer = Buffer || require('buffer').Buffer;
const btoa = string => Buffer.from(string).toString('base64');

const jsonResponse = res => res.json();

const DEFAULT_EXPRESS_SERVER_PORT = 6969;

class ExpressServer {
    port;
    server;

    constructor(port) {
        this.port = port;
        global.expressServerPort = port;
        this.lcuConnector = new LCUConnector();
    }

    start() {
        const self = this;
        return new Promise((resolve, reject) => {
            try {
                const app = express();

                app.use(cors());
                app.use(express.json());

                app.get('/', (req, res) => {
                    res.send('Hello, world!');
                });

                app.get('/request', async (req, res) => {
                    this.handleRequest({req, res, method: 'GET'});
                });

                app.post('/request', (req, res) => {
                    this.handleRequest({req, res, method: 'POST', options: {body: JSON.stringify(req.body), headers: {'Content-Type': 'application/json'}}});
                });

                app.put('/request', (req, res) => {
                    this.handleRequest({req, res, method: 'PUT', options: {body: JSON.stringify(req.body), headers: {'Content-Type': 'application/json'}}});
                });

                app.patch('/request', (req, res) => {
                    this.handleRequest({req, res, method: 'PATCH', options: {body: JSON.stringify(req.body), headers: {'Content-Type': 'application/json'}}});
                });

                self.server = app.listen(this.port, async () => {
                    global.serverUrl = `http://localhost:${this.port}`;

                    this.lcuConnector.on('connect', data => {
                        global.LCU_data = data;
                        global.LCU_auth = `${btoa(`${global.LCU_data.username}:${global.LCU_data.password}`)}`;
                    });

                    this.lcuConnector.on('disconnect', () => {
                        console.warn(`WARN: LCU connector disconnected.`);
                    });

                    this.lcuConnector.start();

                    setTimeout(() => {
                        reject(`[LCU_TIMEOUT]: Express server timed out while attempting to read LCU data. Probably because no running League Client was found.`);
                    }, 10000);

                    resolve(app);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    close() {
        this.server?.close();
    }

    async handleRequest({req, res, method = 'GET', options = {}}) {
        const {endpoint} = req.query;
        console.log(`Handling [${method}] request for endpoint '${endpoint}'...`);

        const response = await this.sendRequest(endpoint, {method: method, ...options});
        const status = (response && response.httpStatus) || 200;

        res.status(status).send(response);
    };

    sendRequest(endpoint, options) {
        const {protocol, address, port} = global.LCU_data;
        const url = `${protocol}://${address}:${port}${endpoint}`;

        options = {
            ...options,
            headers: {
                ...options.headers,
                Accept: 'application/json',
                Authorization: `Basic ${global.LCU_auth}`
            }
        };

        return fetch(url, options)
            .then(jsonResponse)
            .catch(err => console.log(`ERROR: `, err));
    };
}

module.exports = { ExpressServer, DEFAULT_EXPRESS_SERVER_PORT };
