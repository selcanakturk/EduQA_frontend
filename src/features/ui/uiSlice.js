import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    authModalOpen: false,
    authModalMode: "login",
    authPromptDismissedPath: null,
};

const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        openAuthModal: (state, action) => {
            state.authModalOpen = true;
            state.authModalMode = action.payload || "login";
            state.authPromptDismissedPath = null;
        },
        closeAuthModal: (state) => {
            state.authModalOpen = false;
        },
        setAuthModalMode: (state, action) => {
            state.authModalMode = action.payload;
        },
        dismissAuthPrompt: (state, action) => {
            state.authPromptDismissedPath = action.payload || null;
        },
    },
});

export const {
    openAuthModal,
    closeAuthModal,
    setAuthModalMode,
    dismissAuthPrompt,
} = uiSlice.actions;

export const selectAuthModalOpen = (state) => state.ui.authModalOpen;
export const selectAuthModalMode = (state) => state.ui.authModalMode;
export const selectAuthPromptDismissedPath = (state) =>
    state.ui.authPromptDismissedPath;

export default uiSlice.reducer;

