import { createSlice } from '@reduxjs/toolkit';
import { parseQuery } from './urlReflector';

export enum infoType {
  dateTime,
  minimal,
  full,
  calendar
}

export type appStatePartial = {
  fullscreen?: boolean,
  room?: number,
  infoBar?: infoType
}

type appState = {
    fullscreen: boolean,
    room: number,
    infoBar?: infoType
}

const initialState: appState = {
    fullscreen: false,
    room: 0,
    ...parseQuery()
};

const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
      setRoom(state, action: {payload: number}) {
          state.room = action.payload;
      }
    },
  });

export const { setRoom } = appSlice.actions;
export default appSlice.reducer;