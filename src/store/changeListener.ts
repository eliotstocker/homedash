import { createListenerMiddleware } from '@reduxjs/toolkit';

export enum deviceActionCallbacks {
    stateSet = 'stateSet',
    prefSet = 'prefSet'
}

const callbacks = {
    [deviceActionCallbacks.stateSet]: [],
    [deviceActionCallbacks.prefSet]: [],
};

export const changeListenerMiddleware = createListenerMiddleware();

export function addEventListener(type: deviceActionCallbacks, callback: (device: number, changes: object) => void) {
    callbacks[type].push(callback);
}

changeListenerMiddleware.startListening({
    actionCreator: 'devices',
    effect: async (action) => {
        switch(action.type) {
            case 'devices/setDeviceState':
                callbacks[deviceActionCallbacks.stateSet].forEach(callback => {
                    callback(action.payload.device, action.payload.state);
                });
                break;
            case 'devices/setDevicePrefs':
                callbacks[deviceActionCallbacks.prefSet].forEach(callback => {
                    callback(action.payload.device, action.payload.prefs);
                });
        }
    }
})

export default changeListenerMiddleware;