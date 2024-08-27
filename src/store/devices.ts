import { createSlice } from '@reduxjs/toolkit'
import { Device } from '../models/device';

type SliceState = Device[];

const initialState: SliceState = [];

const devicesSlice = createSlice({
  name: 'devices',
  initialState,
  reducers: {
    deviceAdd(state, action: {payload:Device}) {
      state.push(structuredClone(action.payload));
    },
    deviceRefresh(state, action: {payload:Device}) {
      //replace or add device;
      const device = state.find(({id}) => id == action.payload.id);

      if(!device) {
        this.deviceAdd(state, action);
        return;
      }

      Object.entries(action.payload).forEach(([k,v]) => {
        device[k] = v;
      });
    },
    setDeviceState(state, action: {payload: {device: number, state: object}}) {
      let device = state.find(({id}) => id == action.payload.device);

      Object.assign(device.state, action.payload.state);
    },
    updateDeviceState(state, action: {payload: {device: number, state: object}}) {
      let device = state.find(({id}) => id == action.payload.device);
      
      if(!device) {
        return; //cant find device :(
      }
      
      Object.assign(device.state, action.payload.state);
    }
  },
});

export const { deviceAdd, deviceRefresh, setDeviceState, updateDeviceState } = devicesSlice.actions;
export default devicesSlice.reducer;
