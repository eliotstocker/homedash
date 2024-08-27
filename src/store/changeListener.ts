import { createListenerMiddleware } from '@reduxjs/toolkit';
import { setDeviceState } from './devices';

const callbacks = [];

export const changeListenerMiddleware = createListenerMiddleware();

export function addEventListener(callback: (device: number, stateChanges: object) => void) {
    callbacks.push(callback);
}

changeListenerMiddleware.startListening({
    actionCreator: setDeviceState,
    effect: async (action) => {
        callbacks.forEach(callback => {
            callback(action.payload.device, action.payload.state);
        });
    }
})

export default changeListenerMiddleware;