import { createSlice } from "@reduxjs/toolkit";
import { getLocgetlStorage } from "../utils/util";
import { authService } from "../service/auth.service";
const initialState = {
  token: getLocgetlStorage("token"),
  infoUser: getLocgetlStorage("user"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
    },
    getInfoUser: (state, action) => {
      state.infoUser = action.payload;
    },
    clearAuth: (state) => {
      state.token = null;
      state.infoUser = null;
    },
  },
});

export const { setToken, getInfoUser, clearAuth } = authSlice.actions;

export default authSlice.reducer;
