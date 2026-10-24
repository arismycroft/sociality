import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import auth, { clearSession } from "./auth-slice";
import { configureApi } from "@/lib/api";

export const store = configureStore({ reducer: { auth } });

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

// Hubungkan API client dengan store: token otomatis dipasang, 401 → logout.
configureApi({
  getToken: () => store.getState().auth.token,
  onUnauthorized: () => store.dispatch(clearSession()),
});
