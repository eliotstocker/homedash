import DeviceModel, { deviceTypes, Device } from "./device";
import iItemModel, { iItem } from './iItem';
import { Meta } from "./meta";
import { State } from "./state";
import { Prefs } from "./prefs";

export type Group = {
    type:      deviceTypes,
    label:     string,
    id:        number,
    devices:   number[],
    persisted: boolean
}

export default class GroupModel implements iItemModel {
    public type:deviceTypes;
    public label:string;
    public id:number;
    public devices:Device[] = [];
    public persisted:boolean = false;

    constructor(name:string, type:deviceTypes, id?:number) {
        this.label = name;
        this.type = type;
        this.id = id ? id : Math.floor(Math.random() * 999);
        if(id) {
            this.persisted = true;
        }
    }
    
    getMeta(): Meta {
        return this.devices.reduce((acc, {meta}) => {
            return Object.entries(meta).reduce((inner, [k,v]) => {
                if(!(k in inner)) {
                    return {
                        ...inner,
                        [k]: v
                    }
                }
                if(v) {
                    return {
                        ...inner,
                        [k]: v
                    }
                }
                return inner;
            }, acc)
        }, {})
    }

    getState(): State {
        const vals = this.devices.reduce((acc, device) => {
            return Object.entries(device.state).reduce((inner, [stateKey, stateVal]) => {
                if(!inner[stateKey]) {
                    inner[stateKey] = [];
                }
                inner[stateKey].push(stateVal);

                return inner;
            }, acc);
        }, {});

        return Object.fromEntries(
            Object.entries(vals)
                .map(([key, vals]) => ([key, this.getStateValue(vals as any[])]))
        ) as State;
    }
    
    getPrefs(): Prefs {
        return {};
    }

    private getStateValue(vals: any[]) {
        if(typeof vals[0] == 'number') {
            return Math.round(vals.reduce((acc, val) => acc + val, 0) / vals.length);
        }

        if(typeof vals[0] == 'boolean') {
            return vals.reduce((acc, val) => acc || val, false)
        }

        if(typeof vals[0] == 'string') {
            return vals.reduce((acc, val) => acc == 'on' || val == 'on' ? 'on' : (val == 'off' ? acc : val), 'off')
        }
    }

    static fromObject(obj: Group, devices: Device[]): GroupModel {
        if(!obj) {
            return null;
        }

        const group = Object.create(GroupModel.prototype);
        return Object.assign(group, {
            ...obj,
            devices: obj.devices.map(dev => DeviceModel.fromObject(devices.find(({id}) => id == dev)))
        });
    }

    toObject(): Group {
        return {
            type: this.type,
            label: this.label,
            id: this.id,
            devices: this.devices.map(({id}) => id),
            persisted : this.persisted
        };
    }
}