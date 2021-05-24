const {useEffect, useState} = require('react');

const useForceUpdate = () => {
    const [, setValue] = useState(0);
    return () => setValue(value => value + 1);
};

const exists = (...values) => !values.some(x => x === undefined || x === null);

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

module.exports = {
    useForceUpdate,
    includesIgnoreCase,
    equalsIgnoreCase,
    splitFirst,
    useEffectOnce,
    jsonResponse,
    exists
};