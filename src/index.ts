import DeviceModel, {type Device} from "./models/device";
import iItemModel from "./models/iItem";
import { RoomPrefs } from "./models/prefs";
import { Room } from "./models/room";
import DeviceGrid from "./components/device-grid";
import PopoverGroup from "./components/popovers/popover-group";
import PopoverDevice from "./components/popovers/popover-device";
import PopoverRoomSettings from "./components/popovers/popover-room-settings";
import Hubitat from "./providers/hubitat";
import iProvider, { providerEvents } from "./providers/iProvider";

import store, {fromProvider, fromProviderUpdate, getRoom, refreshDevices, refreshRoom, setRoom, subscribeToChanges} from "./state";
import { addEventListener } from "./store/changeListener";

if(!window.__homedash_config || !window.__homedash_config.provider) {
    //TODO: show error about missing config
    throw new Error('Config not set!');
}

let provider: iProvider;
switch(window.__homedash_config.provider.type) {
    case 'hubitat':
        provider = new Hubitat(window.__homedash_config.provider.server, window.__homedash_config.provider.token);
        break;
    default:
        throw new Error(`Unknown Provider: '${window.__homedash_config.provider.type}'`);
}

provider.init()
    .then(() => {
        fromProvider(provider);

        subscribeToChanges('app.room', switchRoom);
        
        setName();
        setRooms();
        init();
        hideLoader();
    });

function setupEditMode() {
    const checkbox = document.querySelector('.edit-mode') as HTMLInputElement;
    const canvas = document.querySelector('.main-canvas') as DeviceGrid;
    checkbox.addEventListener('change', () => {
        canvas.editing = checkbox.checked;
    });

    const settingsButton = document.querySelector('.room-settings-button');
    settingsButton.addEventListener('click', () => {
        openRoomSettings(getCurrentRoom());
    });
}

function setName() {
    const name = document.querySelector('.sidebar .name') as HTMLDivElement;
    name.innerText = store.getState().home.name;
}

function setRooms() {
    const roomMenu = document.querySelector('.sidebar .menu') as HTMLUListElement;

    const menuItems = store.getState().rooms.map(room => {
        const item = document.createElement('li') as HTMLLIElement;
        item.innerText = room.name;
        item.id = `room-${room.id}`;
        item.addEventListener('click', setRoom.bind(this, room.id));

        return item;
    });

    menuItems.forEach(item => roomMenu.appendChild(item));
}

function switchRoom(roomId: number, refreshRoom = true) {
    const room = getRoom(roomId);
    
    const canvas = document.querySelector('.main-canvas') as DeviceGrid;
    const roomName = document.querySelector('.room') as HTMLHeadingElement;

    canvas.room = room.name;
    canvas.gridId = room.id;

    canvas.onLongClickItem = openPopup;
    canvas.onOrderChange = roomOrderChange;

    roomName.innerText = room.name;

    setBackground(room.prefs);

    const roomMenu = document.querySelector('.sidebar .menu') as HTMLUListElement;
    roomMenu.querySelector('.selected')?.classList.remove('selected');
    roomMenu.querySelector(`#room-${room.id}`).classList.add('selected');

    if(refreshRoom) {
        provider.refreshRoom(roomId);
    }
}

function roomOrderChange(roomId: number, order: number[]) {
    return provider.setRoomPref(roomId, 'order', order);
}

function roomPrefChange(roomId: number, pref: string, value: any) {
    return provider.setRoomPref(roomId, pref, value);
}

function closePopup() {
    const popoverContainer = document.querySelector('.popover-container');

    const elements = Array.from(popoverContainer?.children);

    elements?.forEach(element => {
        popoverContainer?.removeChild(element);
    });
}

function openPopup(device: iItemModel) {
    closePopup();

    const popoverContainer = document.querySelector('.popover-container');
    
    let popover;
    if('devices' in device) {
        popover = document.createElement('popover-group') as PopoverGroup;
        popover.devices = device.devices;
    } else {
        popover = document.createElement('popover-device') as PopoverDevice;
    }

    popover.title = device.label;
    popover.type = device.type;
    popover.item = device;
    popover.meta = device.getMeta();
    popover.onClose = closePopup;

    popoverContainer.appendChild(popover);
}

function openRoomSettings(roomId: number) {
    const room = getRoom(roomId);

    closePopup();
    const popoverContainer = document.querySelector('.popover-container');
    
    const popover = document.createElement('popover-room-settings') as PopoverRoomSettings;

    popover.title = room.name;
    popover.room = room;
    popover.onPrefChange = roomPrefChange;
    popover.setBackground = setBackground;
    popover.onClose = closePopup;

    popoverContainer.appendChild(popover);
}

function init() {
    switchRoom(getCurrentRoom(), false);
    setStateClasses();
    setupMobileMenu();
    setupEditMode();

    addEventListener((device, changes) => {
        Object.entries(changes).forEach(([attribute, value]) => {
            provider.setDeviceValue(device, attribute, value)
        })
    });

    provider.addEventListener(providerEvents.roomRefresh, pushStateForProviderRoomRefresh);
    provider.addEventListener(providerEvents.deviceUpdates, pushStateForProviderUpdate);
}

function pushStateForProviderUpdate(ids: number[]): void {
    const devicesChanged = provider.getDevices().filter(device => ids.includes(device.id)).map(DeviceModel.fromObject);

    fromProviderUpdate(devicesChanged);
}

function pushStateForProviderRoomRefresh(devices: Device[], room: Room) {
    refreshDevices(devices);
    refreshRoom(room);
}

function hideLoader() {
    const loading = document.querySelector('.loading');
    document.body.removeChild(loading);
}

function getCurrentRoom(): number {
    const appState = store.getState().app;

    return appState.room || provider.getRooms()[0].id;
}

function setBackground(prefs: RoomPrefs): void {
    const rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(prefs?.bgColor?.[0] ?? '#1a50e2');
    const tileActive = rgb ? `${parseInt(rgb[1], 16) + 25}, ${parseInt(rgb[2], 16) + 25}, ${parseInt(rgb[3], 16) + 25}` : '';

    document.body.style = `--bg-grad-1: ${prefs?.bgColor?.[0] ?? '#1a50e2'}; --bg-grad-2: ${prefs?.bgColor?.[1] ?? '#1096b1'}; --bg-grad-angle: ${prefs.bgAngle ?? 328}deg; --tile-default-active-color: ${tileActive}`;
}

function setStateClasses() {
    const appState = store.getState().app;

    if(appState.fullscreen) {
        document.body.classList.add('fullscreen');
    } else {
        document.body.classList.remove('fullscreen');
    }

    if(appState.infobar != undefined) {
        document.body.classList.add('infobar');
    } else {
        document.body.classList.remove('infobar');
    }
}

function setupMobileMenu() {
    const toggle = document.querySelector(".mobile-sidebar-toggle");
    const sidebar = document.querySelector('.sidebar');

    toggle.addEventListener('click', () => {
        sidebar.classList.toggle('show');
    });
}

import "./components/tiles";
import "./components/device-grid";
import "./components/info-bar";
import "./components/popovers";

