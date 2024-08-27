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
      //replace or add room;
      //replace or add device;
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
      console.log(state);

      const room = state.find(({id}) => id == action.payload.roomId);

      console.log(room, action.payload.roomId);

      const swapDevices = action.payload.swapDevices;

      const devices = room.devices;
      console.log(devices.indexOf(swapDevices[0]), devices.indexOf(swapDevices[1])); 

      devices[devices.indexOf(swapDevices[0])] = devices.splice(devices.indexOf(swapDevices[1]), 1, devices[devices.indexOf(swapDevices[0])])[0];
      
      console.log(devices);

      room.devices = devices;
    }
  },
});

export const { roomAdd, roomRefresh, swapDeviceOrder } = roomsSlice.actions;
export default roomsSlice.reducer;
