import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  first_name: '',
  last_name: '',
  email: '',
};

// ==============================|| SLICE - CALENDAR ||============================== //

const agent = createSlice({
  name: 'agent',
  initialState,
  reducers: {
    // update new cient
    updateAgent(state, action) {
      return {
        ...state,
        ...action.payload
      };
    },
    resetAgent(state) {
      return {
        ...initialState
      };
    }
  }
});

export default agent.reducer;

export const { updateAgent, resetAgent } = agent.actions;

export const selectAgent = (state) => state.agent;
