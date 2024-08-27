import { createListenerMiddleware } from '@reduxjs/toolkit';
import { appStatePartial, infoType } from './app';


export const urlReflectorMiddleware = createListenerMiddleware();

urlReflectorMiddleware.startListening({
    actionCreator: 'app',
    effect: async (action) => {
        const currentState = parseQuery();
        switch(action.type) {
            case 'app/setRoom':
                currentState.room = action.payload as number;
                break;
            case 'app/setFullscreen':
                currentState.fullscreen = action.payload as boolean;
                break;
        }

        setQuery(currentState);
    }
});

export function parseQuery(): appStatePartial {
    const queryString = window.location.search.substring(1);

    if(queryString.length < 1) {
        return {};
    }

    var pairs = (queryString).split('&');

    if(pairs.length < 1) {
        return {};
    }

    return pairs.reduce((acc, kv) => {
        const [k, v] = kv.split('=');
        return {
            ...acc,
            [decodeURIComponent(k)]: typeValue(decodeURIComponent(v || ''))
        }
    }, {});
}

function typeValue(value) {
    if(isFinite(value)) {
        return parseInt(value);
    }

    const lc = value.toLowerCase();
    if(lc == 'true' || lc == 'false') {
        return lc == 'true';
    }

    if (infoType[value] != null) {
        return infoType[value];
    }

    return value;
}

function setQuery(state) {
    const url = window.location.pathname;
    window.history.pushState(null, 'Room', url + '?' + serialiseObject(state));
}

function serialiseObject(state) {
    return Object.entries(state).map(([key, value]) => {
        return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    }).join('&');
}

export default urlReflectorMiddleware;