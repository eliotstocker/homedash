import { createSlice } from '@reduxjs/toolkit'
import { Group } from '../models/group';

type SliceState = Group[];

const initialState: SliceState = [];

const groupsSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    groupAdd(state, action: {payload: Group}) {
      state.push(structuredClone(action.payload));
    },
    setGroupState(state, action: {payload: {group: number, state: object}}) {
      let group = state.find(({id}) => id == action.payload.group);

      //TODO: do we need to store state for the gorup or just commit JIT from devices?
      //Object.assign(group.state, action.payload.state);
    }
  },
});

export const { groupAdd, setGroupState } = groupsSlice.actions;
export default groupsSlice.reducer;
