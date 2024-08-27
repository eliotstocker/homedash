import { createSlice } from '@reduxjs/toolkit'
import Home from "../models/home";

const ACTION_INIT_HOME = "INIT_HOME";

const initialState: Home = {
    name: 'Loading...',
    baseUrl: '',
    tempScale: 'c',
    lastUpdate: Date.now(),
    location: {
        longitude: 0,
        latitude: 0,
    },
    sunrise: Date.now(),
    sunset: Date.now()
};

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {
    initHome(state, action: {payload: Home}) {
        Object.assign(state, action.payload);
    },
    homeUpdated(state) {
        state.lastUpdate = Date.now();
    }
  },
});

export const { initHome, homeUpdated } = homeSlice.actions;
export default homeSlice.reducer;