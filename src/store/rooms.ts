import { createSlice } from '@reduxjs/toolkit'
import { Room } from '../models/room';

const initialState: Room[] = [];

const roomsSlice = createSlice({
  name: 'rooms',
  initialState,
  reducers: {
    roomAdd(state, action: {payload:Room}) {
        state.push(structuredClone(action.payload));
    },
    roomRefresh(state, action: {payload:Room}) {
      const room = state.find(({id}) => id == action.payload.id);

      if(!room) {
        this.roomAdd(state, action);
        return;
      }

      Object.entries(action.payload).forEach(([k,v]) => {
        room[k] = v;
      });
    },
    swapDeviceOrder(state, action: {payload: {roomId: number, swapDevices: number[]}}) {
      const room = state.find(({id}) => id == action.payload.roomId);
      const swapDevices = action.payload.swapDevices;

      const devices = room.devices;
      devices[devices.indexOf(swapDevices[0])] = devices.splice(devices.indexOf(swapDevices[1]), 1, devices[devices.indexOf(swapDevices[0])])[0];
      
      room.devices = devices;
    },
    setRoomPrefs(state, action: {payload: {room: number, prefs: {bgColor: string[], bgAngle: number}}}) {
      const room = state.find(({id}) => id == action.payload.room);

      room.prefs.bgColor = action.payload.prefs.bgColor;
      room.prefs.bgAngle = action.payload.prefs.bgAngle;
    }
  },
});

export const { roomAdd, roomRefresh, swapDeviceOrder, setRoomPrefs } = roomsSlice.actions;
export default roomsSlice.reducer;
