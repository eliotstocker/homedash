import { deviceTypes } from './device';
import { Meta } from './meta';
import { State } from './state';
import { Prefs } from './prefs';

export type iItem = {
    type:deviceTypes,
    label:string,
    id:number
}

export default interface iItemModel extends iItem {
    type:deviceTypes;
    label:string;
    id:number;
    
    getState(): State;
    getMeta(): Meta;
    getPrefs(): Prefs;
    toObject(): iItem;
}