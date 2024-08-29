import { configureStore, EnhancedStore } from '@reduxjs/toolkit';
import watch from 'redux-watch'
import appReducer, { setRoom as setRoomAction } from './store/app';
import homeReducer, { homeUpdated, initHome } from './store/home';
import roomReducer, { roomAdd, roomRefresh, swapDeviceOrder } from './store/rooms';
import devicesReducer, { deviceAdd, deviceRefresh, setDevicePrefs as setDevicePrefsAction, setDeviceState as setDeviceStateAction, updateDeviceState } from './store/devices';
import groupReducer, { groupAdd } from './store/groups';
import RoomModel, { type Room } from "./models/room";
import iProvider from "./providers/iProvider";
import DeviceModel, { Device } from "./models/device";
import changeListenerMiddleware from './store/changeListener';
import urlReflectorMiddleware from './store/urlReflector';
import GroupModel from './models/group';
import { group } from 'console';
import { State } from './models/state';

export const store = configureStore({
    reducer: {
        app: appReducer,
        home: homeReducer,
        rooms: roomReducer,
        devices: devicesReducer,
        groups: groupReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().prepend(changeListenerMiddleware.middleware, urlReflectorMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;

export function fromProvider(provider: iProvider) : EnhancedStore {
    store.dispatch(initHome(provider.getHome()));

    provider.getRooms().forEach(room => {
        store.dispatch(roomAdd(room));
    });

    provider.getDevices().forEach(device => {
        store.dispatch(deviceAdd(device));
    });

    provider.getGroups().forEach(group => {
        store.dispatch(groupAdd(group));
    });

    return store;
}

export function fromProviderUpdate(devicesUpdated: DeviceModel[]) {
    store.dispatch(homeUpdated());

    devicesUpdated.forEach(device => {
        if(shouldDispatchUpdate(getDevice(device.id), device.getState())) {
            store.dispatch(updateDeviceState({device: device.id, state: device.getState()}));
        }
    })
}

export function refreshDevices(devices: Device[]) {
    devices.forEach(device => {
        store.dispatch(deviceRefresh(device));
    });
}

export function refreshRoom(room: Room) {
    store.dispatch(roomRefresh(room));
}

export function setRoom(id: number) : void {
    store.dispatch(setRoomAction(id));
}

export function getRoom(id: Number) : RoomModel {
    const {rooms, devices, groups} = store.getState();
    return RoomModel.fromObject(rooms.find(room => room.id == id), devices, groups);
}

export function getGroup(id: number) : GroupModel {
    const {devices, groups} = store.getState();
    return GroupModel.fromObject(groups.find(group => group.id == id), devices);
}

export function swapDevicesInRoom(room: number, devices: number[]) {
    store.dispatch(swapDeviceOrder({roomId: room, swapDevices: devices}));
}

export function getDevice(id: Number) : DeviceModel {    
    return DeviceModel.fromObject(store.getState().devices.find((device => device.id == id)));
}

export function getDeviceRoom(id: Number) : Room {
    return store.getState().rooms.find(room => room.devices.find(device => device == id));
}

export function setDeviceState(deviceId: number, changes: Map<string, any>) {
    const devices = store.getState().devices;
    const device = devices.find(({id}) => id == deviceId);
    if(!device) {
        //probably a group update
        const groupDevices = devices.filter(({ingroup}) => {
          return ingroup == deviceId;
        });

        groupDevices.forEach(device => {
            store.dispatch(setDeviceStateAction({
                device: device.id,
                state: Object.fromEntries(changes)
            }));
        });

        return;
    }

    store.dispatch(setDeviceStateAction({
        device: deviceId,
        state: Object.fromEntries(changes)
    }));
}

export function setDevicePrefs(deviceId:number, prefs) {
    store.dispatch(setDevicePrefsAction({device: deviceId, prefs}));
}

function shouldDispatchUpdate(device: Device, state: State) {
    //dry run and do nothing if nothing has changed
    const newState = Object.assign({}, device.state, state);

    // console.log('update?', JSON.stringify(newState) !== JSON.stringify(device.state));

    return JSON.stringify(newState) !== JSON.stringify(device.state);
}

export function subscribeToChanges(path: string, callback: (newVal: any, oldVal: any, path: string) => void) {
    const w = watch(store.getState, path);

    store.subscribe(w((callback)));
}