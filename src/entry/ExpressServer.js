const express = require('express');
const fetch = require('node-fetch');
const LCUConnector = require('lcu-connector');
const cors = require('cors');

Buffer = Buffer || require('buffer').Buffer;
const btoa = string => Buffer.from(string).toString('base64');

const jsonResponse = res => res.json();

class ExpressServer {
    constructor(port) {
        this.port = port;
        global.expressServerPort = port;
        this.lcuConnector = new LCUConnector();
    }

    start() {
        return new Promise((resolve, reject) => {
            try {
                const server = express();

                server.use(cors());
                server.use(express.json());

                server.get('/', (req, res) => {
                    res.send('Hello, world!');
                });

                server.get('/request', async (req, res) => {
                    this.handleRequest({req, res, method: 'GET'});
                });

                server.post('/request', (req, res) => {
                    this.handleRequest({req, res, method: 'POST', options: {body: JSON.stringify(req.body), headers: {'Content-Type': 'application/json'}}});
                });

                server.put('/request', (req, res) => {
                    this.handleRequest({req, res, method: 'PUT', options: {body: JSON.stringify(req.body), headers: {'Content-Type': 'application/json'}}});
                });

                server.patch('/request', (req, res) => {
                    this.handleRequest({req, res, method: 'PATCH', options: {body: JSON.stringify(req.body), headers: {'Content-Type': 'application/json'}}});
                });

                server.listen(this.port, async () => {
                    global.serverUrl = `http://localhost:${this.port}`;

                    this.lcuConnector.on('connect', data => {
                        console.log('LCU data: ', data);

                        global.LCU_data = data;
                        global.LCU_auth = `${btoa(`${global.LCU_data.username}:${global.LCU_data.password}`)}`;

                        resolve(true);
                    });

                    this.lcuConnector.on('disconnect', () => {
                        console.warn(`WARN: LCU connector disconnected.`);
                    });

                    this.lcuConnector.start();

                    setTimeout(() => {
                        reject(`[LCU_TIMEOUT]: Express server timed out while attempting to read LCU data. Probably because no running League Client was found.`);
                    }, 10000);
                });
            } catch (error) {
                reject(error);
            }
        });
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

module.exports = { ExpressServer };
