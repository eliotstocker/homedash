import { Meta } from "./meta";
import { State } from "./state";
import { Prefs } from "./prefs";
import iItemModel from './iItem';

export enum deviceTypes {
    light = 'light',
    hvac = 'hvac',
    temp = 'temp',
    media = 'media',
    lock = 'lock',
    camera = 'camera',
    switch = 'switch',
    window = 'window',
    unknown = 'unknown'
}

export type Device = {
    type:deviceTypes,
    name:string,
    label:string,
    id:number,
    meta:Meta,
    state:State,
    prefs:Prefs,
    ingroup:number|null,
}

export default class DeviceModel implements iItemModel, Device {
    public type:deviceTypes;
    public name:string;
    public label:string;
    public id:number;
    public meta:Meta;
    public state:State;
    public prefs:Prefs;
    public ingroup:number|null;

    getState() {
        return this.state;
    }

    getMeta(): Meta {
        return this.meta;
    }

    getPrefs(): Prefs {
        return this.prefs;
    }

    setState(state: State) {
        Object.entries(state).forEach(([key, value]) => {
            this.state[key] = value
        });
    }

    setPrefs(prefs: Prefs) {
        Object.entries(prefs).forEach(([key, value]) => {
            this.prefs[key] = value
        });
    }

    static fromObject(obj: Device): DeviceModel {
        const device = Object.create(DeviceModel.prototype);
        return Object.assign(device, obj);
    }

    toObject(): Device {
        return {
            type: this.type,
            name: this.name,
            label: this.label,
            id: this.id,
            meta: this.meta,
            state: this.state,
            prefs: this.prefs,
            ingroup: this.ingroup
        }
    }
}