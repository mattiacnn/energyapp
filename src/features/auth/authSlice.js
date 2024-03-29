import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: null,
    user: null,
    isLoggedIn: false,
    isInitialized: false
  },
  reducers: {
    setCredentials: (state, action) => {
      const { token, user, isLoggedIn, isInitialized } = action.payload
      state.token = token
      state.user = user
      state.isLoggedIn = isLoggedIn,
      state.isInitialized = isInitialized
    },
  },
});

export const { setCredentials } = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentToken = (state) => {
  return state.auth.token
};

export const selectCurrentUser = (state) => {
  return state.auth.user
};

export const selectIsLoggedIn = (state) => {
  return state.auth.isLoggedIn
};

export const selectIsInitialized = (state) => {
  return state.auth.isInitialized
};
