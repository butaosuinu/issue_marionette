import { atom } from "jotai";
import type { AuthState, GitHubUser, AuthStatus } from "../types/auth";

const DEFAULT_AUTH_STATE: AuthState = {
  isAuthenticated: false,
  isLoading: false,
  user: undefined,
  error: undefined,
};

export const authAtom = atom<AuthState>(DEFAULT_AUTH_STATE);

export const authStatusAtom = atom<AuthStatus>((get) => {
  const auth = get(authAtom);
  if (auth.isLoading) return "authenticating";
  if (auth.error !== undefined) return "error";
  if (auth.isAuthenticated) return "authenticated";
  return "idle";
});

export const currentUserAtom = atom<GitHubUser | undefined>(
  (get) => get(authAtom).user
);

export const isAuthenticatedAtom = atom<boolean>(
  (get) => get(authAtom).isAuthenticated
);

export const setAuthLoadingAtom = atom(null, (get, set, isLoading: boolean) => {
  set(authAtom, { ...get(authAtom), isLoading, error: undefined });
});

export const setAuthSuccessAtom = atom(
  null,
  (
    get,
    set,
    payload: {
      user: GitHubUser;
    }
  ) => {
    set(authAtom, {
      ...get(authAtom),
      isAuthenticated: true,
      isLoading: false,
      user: payload.user,
      error: undefined,
    });
  }
);

export const setAuthErrorAtom = atom(null, (get, set, error: string) => {
  set(authAtom, {
    ...get(authAtom),
    isLoading: false,
    error,
  });
});

export const logoutAtom = atom(null, (_get, set) => {
  set(authAtom, DEFAULT_AUTH_STATE);
});
