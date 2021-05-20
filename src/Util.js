import {useEffect, useState} from "react";

const electron = window.require('electron');

export const getGlobal = electron.remote.getGlobal;

export const useForceUpdate = () => {
    const [, setValue] = useState(0);
    return () => setValue(value => value + 1);
}

export const includesIgnoreCase = (target, string) => {
    if (typeof target !== "string" || typeof string !== "string") return false;

    return string.toLowerCase().includes(target.toLowerCase());
};

export const equalsIgnoreCase = (target, string) => {
    if (typeof target !== "string" || typeof string !== "string") return false;

    return string.toLowerCase() === target.toLowerCase();
};

export const splitFirst = (string, separator) => {
    if (!string || !separator) return null;

    const parts = string.split(separator);
    return [parts.shift(),  parts.join(separator)];
};

export const useEffectOnce = (callback) => {
    // eslint-disable-next-line
    return useEffect(callback, []);
};

export const jsonResponse = res => res.json();
