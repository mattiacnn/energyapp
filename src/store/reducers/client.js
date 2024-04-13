import { createSlice } from '@reduxjs/toolkit';

// project-imports
import axios from 'utils/axios';
import { dispatch } from 'store';

const initialState = {
  first_name: '',
  last_name: '',
  company_name: '',
  email: '',
};

// ==============================|| SLICE - CALENDAR ||============================== //

const client = createSlice({
  name: 'client',
  initialState,
  reducers: {
    // update new cient
    updateClient(state, action) {
      return {
        ...state,
        ...action.payload
      };
    },
    resetClient(state) {
      return {
        ...initialState
      };
    }
  }
});

export default client.reducer;

export const { updateClient, resetClient } = client.actions;

export const selectClient = (state) => state.client;
