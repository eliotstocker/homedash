import Home from "../models/home";
import {type Device} from "../models/device";
import {type Group} from "../models/group";
import {type Room} from "../models/room";
import {State} from "../models/state";
import iProvider, { homeData, providerEvents } from "./iProvider";
import Axios from 'axios';
import { RoomPrefs } from "../models/prefs";

type rawRoom = {
    name:    string;
    id:      number;
    devices: Device[];
    prefs:   RoomPrefs;
}

type hubitatData = {
    groupIds:  Map<number, string>;
    rooms: rawRoom[]
    home: Home;
    service: string;
    version: string;
}

const quickPollEnabled = false;

export default class Hubitat implements iProvider {
    private rawData:       hubitatData;
    private homeData:      homeData;
    private server:        string;
    private token:         string;
    private session:       string;
    private pollTimeout:   NodeJS.Timeout;
    private pollInterval:  number;
    private eventListeners: {deviceUpdates: ((devices: number[]) => void)[], roomRefresh: ((devices: Device[], room: Room) => void)[]} = {deviceUpdates: [], roomRefresh: []}

    constructor(server: string, token: string) {
        this.server = server;
        this.token = token;
        this.pollInterval = 10000;

        if(!this.server.endsWith('/')) {
            this.server += '/';
        }
    }

    public addEventListener(event: providerEvents, callback: (devices: number[]) => void): void {
        this.eventListeners[event].push(callback);
    }

    public setDeviceValue(deviceId: number, attribute: string, value: any): Promise<never> {
        return Axios.post(this.server + 'device/' + deviceId + '?access_token=' + this.token, {
            attribute,
            value
        })
            .then(this.quickPoll.bind(this));

    }

    public setGroupValue(group: Group, attribute: string, value: any): Promise<never> {
        return Axios.post(this.server + 'group/' + group.id + '?access_token=' + this.token, {
            devices: group.devices,
            attribute,
            value
        })
            .then(this.quickPoll.bind(this));
    }

    public setRoomPref(roomId: number, attribute: string, value):Promise<void> {
        return Axios.post(this.server + 'room/' + roomId + '?access_token=' + this.token, {
            attribute,
            value
        })
            .then(this.quickPoll.bind(this));
    }

    public init(): Promise<void> {
        return Axios.get(this.server + 'home' + '?access_token=' + this.token)
            .then(d => d.data as hubitatData)
            .then(data => this.rawData = data)
            .then(() => {
                this.homeData = this.formatDevices(this.filterUnknownDevices(this.rawData));
                return this.createSession();
            })
    }

    private createSession(): Promise<void> {
        return Axios.post(this.server + 'session' + '?access_token=' + this.token)
            .then(d => d.data)
            .then(({id}) => this.session = id)
            .then(() => {
                this.pollTimeout = setTimeout(this.pollSession.bind(this), this.pollInterval)
            });
    }

    private quickPoll() {
        if(quickPollEnabled) {
            clearTimeout(this.pollTimeout);
            this.pollTimeout = setTimeout(this.pollSession.bind(this), 200);
        }
    }

    private pollSession():  Promise<void> {
        clearTimeout(this.pollTimeout);
        
        return Axios.get(this.server + 'session/' + this.session + '?access_token=' + this.token)
            .then(d => d.data as {changes: [number: State]})
            .then(({changes}) => {
                if(Object.keys(changes).length > 0) {
                    Object.entries(changes).map(([id, state]) => this.setStateByDeviceId(parseInt(id), state));
                    this.eventListeners.deviceUpdates.forEach(callback => callback(Object.keys(changes).map(id => parseInt(id))))
                }
            })
            .then(() =>{
                this.pollTimeout = setTimeout(this.pollSession.bind(this), this.pollInterval)
            })
            .catch(() => 
                {this.pollTimeout = setTimeout(this.pollSession.bind(this), this.pollInterval)
            });
    }

    private setStateByDeviceId(id: number, state: State) : void {
        const device = this.getDeviceById(id);

        if(!device) {
            //ignore
            return;
        }

        Object.assign(device.state, state);
    }

    private getDeviceById(id: number): Device {
        const device = this.homeData.devices.find(item => {
            return item.id == id;
        });

        if(!device) {
            console.log('cant find device', id);
            return null;
        }

        return device;
    }

    private filterUnknownDevices(data:hubitatData) {
        return {
            ...data,
            rooms: data.rooms.map(room => ({
                ...room,
                devices: room.devices.filter(({type}) => type !== 'unknown')
            }))
        };
    }

    private getGroupId(data:hubitatData, groupName:string): {id: number, new: boolean} {
        const found = parseInt(Object.entries(data.groupIds).find(([_, name]) => name === groupName)?.[0]);

        if(found) {
            return {id: found, new: false};
        }

        //generate unique id for new group start at 5000 to avoid device Ids
        let id = 5000;
        while(Object.keys(data.groupIds).includes(id.toString())) {
            id++;
        }


        data.groupIds[id] = groupName;
        return {id, new: true};
    }

    private formatDevices(data:hubitatData) : homeData {
        const groups = data.rooms.flatMap(room => this.generateGroupsForRoom(room.devices as Device[], data));
        const devices = this.assignDevicesToGroups(data.rooms.flatMap(({devices}) => devices) as Device[], groups);
        const rooms = data.rooms.map(room => this.generateRoomFromData(room, groups));

        return {
            ...data,
            devices,
            groups,
            rooms
        }
    }

    private generateGroupsForRoom(devices: Device[], data: hubitatData): Group[] {
        const groups = devices.reduce((acc, device) => {
            const possibleGroupName = device.label.replace(/\s([\d-_]+)$/, '');
            const group = acc.find(g => device.type === g.type && g.label === possibleGroupName) as Group;

            if(group) {
                device.ingroup = group.id;
                group.devices.push(device.id);
            }

            if(possibleGroupName != device.label && devices.some(otherDev => otherDev.label.match(RegExp(`${possibleGroupName}\\s([\\d\\-_]+)$`)))) {
                const groupId = this.getGroupId(data, possibleGroupName);
                
                const group: Group = {
                    label: possibleGroupName,
                    type: device.type,
                    id: groupId.id,
                    devices: [
                        device.id
                    ],
                    persisted: !groupId.new
                };

                device.ingroup = group.id;
                acc.push(group);
            }

            return acc;
        }, [])
        .filter(group => group.devices.length > 1);

        groups
            .filter(({persisted}) => !persisted)
            .map(this.persistGroup.bind(this))

        return groups;
    }

    private generateRoomFromData(room: rawRoom, groups: Group[]) : Room {
        const groupsForDevices = [...new Set(room.devices.map(device => groups.find(group => group.devices.includes(device.id))).filter(group => group))];
        const devicesExcludingGroups = room.devices.filter(device => !groups.find(group => group.devices.includes(device.id)));

        const devices = [
            ...devicesExcludingGroups,
            ...groupsForDevices
        ]
            .map(({id}) => id)
            .sort((a, b) => {
                if(room.prefs.order) {
                    const ia = room.prefs.order.indexOf(a);
                    const ib = room.prefs.order.indexOf(b);

                    if(ia < 0) return 1;
                    if(ib < 0) return -1;

                    return ia - ib;
                }

                return 0;
            });

        return {
            ...room,
            devices,
        }
    }

    private assignDevicesToGroups(devices: Device[], groups: Group[]) : Device[]{
        return devices.map(device => {
            const group = groups.find(({devices}) => devices.includes(device.id));
            if (group) {
                device.ingroup = group.id;
            }

            return device;
        });
    }

    private persistGroup(group:Group): Promise<void> {
        return Axios.post(this.server + 'group?access_token=' + this.token, {
            id: group.id,
            name: group.label
        })
    }

    private updateDevicesByRoom(roomId:number): Promise<void> {
        return Axios.get(this.server + `room/${roomId}?access_token=` + this.token)
            .then(d => d.data as rawRoom)
            .then(rawRoom => {
                const devices = rawRoom.devices;
                const room = this.generateRoomFromData(rawRoom, this.homeData.groups);

                //TODO: update homedata.rooms

                console.log('room updated');

                this.eventListeners.roomRefresh.forEach(callback => callback(devices, room));
            })
    }

    public getHome(): Home {
        if(!this.homeData) {
            throw new Error("Provided not initialised");
        }

        return this.homeData.home;
    }

    public getRooms(): Room[] {
        if(!this.homeData) {
            throw new Error("Provided not initialised");
        }
        return this.homeData.rooms;
    }

    public getDevices(): Device[] {
        return this.homeData.devices;
    }

    public getGroups(): Group[] {
        return this.homeData.groups;
    }

    public refreshRoom(id:number) {
        return this.updateDevicesByRoom(id);
    }
}