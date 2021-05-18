const SERVER_URL = 'http://localhost:6969';

const jsonResponse = res => res.json();

export const get = endpoint => {
    const url = `${SERVER_URL}/request?endpoint=${endpoint}`;
    console.log(`[GET] Fetching '${url}'...`);

    return fetch(url).then(jsonResponse);
};

export const post = endpoint => {
    const url = `${SERVER_URL}/request?endpoint=${endpoint}`;
    console.log(`[POST] Fetching '${url}'...`);

    return fetch(url, {method: 'POST'});
}