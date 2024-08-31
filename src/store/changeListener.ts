import { createListenerMiddleware, UnknownAction } from '@reduxjs/toolkit';

export enum actionCallbacks {
    deviceStateSet = 'deviceStateSet',
    devicePrefSet = 'devicePrefSet',
    roomPrefSet = 'roomPrefSet',
}

const callbacks = {
    [actionCallbacks.deviceStateSet]: [],
    [actionCallbacks.devicePrefSet]: [],
    [actionCallbacks.roomPrefSet]: []
};

export const changeListenerMiddleware = createListenerMiddleware();

export function addEventListener(type: actionCallbacks, callback: (device: number, changes: object) => void) {
    callbacks[type].push(callback);
}

changeListenerMiddleware.startListening({
    predicate: (action:UnknownAction) => {
        if(action.type.startsWith('devices/') || action.type.startsWith('rooms/')) {
            return true;
        }
        return false;
    },
    effect: async (action) => {
        switch(action.type) {
            case 'devices/setDeviceState':
                callbacks[actionCallbacks.deviceStateSet].forEach(callback => {
                    callback(action.payload.device, action.payload.state);
                });
                break;
            case 'devices/setDevicePrefs':
                callbacks[actionCallbacks.devicePrefSet].forEach(callback => {
                    callback(action.payload.device, action.payload.prefs);
                });
            case 'rooms/setRoomPrefs':
                callbacks[actionCallbacks.roomPrefSet].forEach(callback => {
                    callback(action.payload.room, action.payload.prefs);
            });
        }
    }
})

export default changeListenerMiddleware;