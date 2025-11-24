import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  status: "checking",
  error: null,
  redirectPath: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const incomingUser = action.payload;

      if (!incomingUser) {
        state.user = null;
        state.status = "anonymous";
        state.error = null;
        return;
      }

      state.user = {
        ...(state.user || {}),
        ...incomingUser,
      };
      state.status = "authenticated";
      state.error = null;
    },

    clearCredentials: (state) => {
      state.user = null;
      state.status = "anonymous";
      state.error = null;
    },

    setAuthError: (state, action) => {
      state.error = action.payload;
      state.status = "error";
    },

    setAuthStatus: (state, action) => {
      state.status = action.payload;
    },

    setPostAuthRedirect: (state, action) => {
      state.redirectPath = action.payload;
    },

    clearPostAuthRedirect: (state) => {
      state.redirectPath = null;
    },
  },
});

export const {
  setCredentials,
  clearCredentials,
  setAuthError,
  setAuthStatus,
  setPostAuthRedirect,
  clearPostAuthRedirect,
} = authSlice.actions;

export const selectCurrentUser = (state) => state.auth.user;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;
export const selectPostAuthRedirect = (state) => state.auth.redirectPath;

export default authSlice.reducer;
