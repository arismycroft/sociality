import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { SessionUser } from "@/lib/types";

const STORAGE_KEY = "sociality_session";

interface AuthState {
  token: string | null;
  user: SessionUser | null;
  /** true setelah sesi dibaca dari localStorage (hindari flash redirect). */
  hydrated: boolean;
}

const initialState: AuthState = { token: null, user: null, hydrated: false };

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    hydrate(state) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const s = JSON.parse(raw) as { token: string; user: SessionUser };
          state.token = s.token;
          state.user = s.user;
        }
      } catch {
        /* abaikan data rusak */
      }
      state.hydrated = true;
    },
    setSession(state, action: PayloadAction<{ token: string; user: SessionUser }>) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.hydrated = true;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(action.payload));
      } catch {}
    },
    updateUser(state, action: PayloadAction<Partial<SessionUser>>) {
      if (!state.user) return;
      state.user = { ...state.user, ...action.payload };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: state.token, user: state.user }));
      } catch {}
    },
    clearSession(state) {
      state.token = null;
      state.user = null;
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
    },
  },
});

export const { hydrate, setSession, updateUser, clearSession } = slice.actions;
export default slice.reducer;
