import DeviceModel, { Device } from './device';
import GroupModel, { Group } from './group';
import iItemModel, { iItem } from './iItem';
import { RoomPrefs } from './prefs';

export type Room = {
    name:    string,
    id:      number,
    devices: number[],
    prefs:   RoomPrefs
}

export default class RoomModel {
    public name:string;
    public id:number;
    public devices:iItemModel[];
    public prefs:RoomPrefs;

    static fromObject(obj: Room, devices: Device[], groups: Group[]): RoomModel {
        if(!obj) {
            return null;
        }

        let device = Object.create(RoomModel.prototype);
        return Object.assign(device, {
            ...obj,
            devices: obj.devices.map(dev => {
                const group = groups.find(({id}) => id == dev);
                if(group) {
                    return GroupModel.fromObject(group as Group, devices);
                }

                const device = devices.find(({id}) => id == dev);
                if(device) {
                    return DeviceModel.fromObject(device as Device);
                }

                throw new Error(`device: '${dev}' not found`);
            })
        });
    }

    toObject() : Room {
        return {
            name: this.name,
            id: this.id,
            devices: this.devices.map(item => item.id),
            prefs: this.prefs
        };
    }
}