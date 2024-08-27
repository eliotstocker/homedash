import {Device} from "../models/device"
import {Group} from "../models/group"
import Home from "../models/home"
import {Room} from "../models/room"

export type homeData = {
    service: string,
    version: string,
    rooms:   Room[],
    devices: Device[],
    groups:  Group[],
    home:    Home,
    groupIds:  Map<number, string>
}

export default interface iProvider {
    init():Promise<void>
    refreshRoom(id:number):Promise<void>
    getHome():Home
    getRooms():Room[]
    getDevices():Device[]
    getGroups():Group[]
    setDeviceValue(deviceId:number, attribute: string, value: any):Promise<void>
    setGroupValue(group:Group, attribute: string, value: any):Promise<void>
    setRoomPref(roomId: number, attribute: string, value: any):Promise<void>
    addEventListener(event: String, callback: (...args: any) => void):void
}

export enum providerEvents {
    deviceUpdates = "deviceUpdates",
    roomRefresh = "roomRefresh"
}