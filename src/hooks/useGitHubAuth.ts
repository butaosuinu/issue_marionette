import { useCallback, useEffect, useRef } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { openUrl } from "@tauri-apps/plugin-opener";
import { load } from "@tauri-apps/plugin-store";
import { listen } from "@tauri-apps/api/event";
import { invokeWithResult } from "../utils/invoke";
import {
  authStatusAtom,
  currentUserAtom,
  setAuthLoadingAtom,
  setAuthSuccessAtom,
  setAuthErrorAtom,
  logoutAtom,
} from "../stores";
import type { AuthStatus, GitHubUser } from "../types";

const AUTH_STORE_PATH = "auth.json";
const AUTH_STORE_KEY = "github_user";

 
type UseGitHubAuthReturn = {
  status: AuthStatus;
  user: GitHubUser | undefined;
  login: () => Promise<void>;
  logout: () => Promise<void>;
};

const loadAuthFromStore = async (): Promise<GitHubUser | undefined> => {
  const store = await load(AUTH_STORE_PATH).catch(() => undefined);
  if (store === undefined) return undefined;

  const user = await store.get<GitHubUser>(AUTH_STORE_KEY).catch(() => undefined);
  return user ?? undefined;
};

const saveAuthToStore = async (user: GitHubUser): Promise<void> => {
  const store = await load(AUTH_STORE_PATH).catch(() => undefined);
  if (store === undefined) return;

  await store.set(AUTH_STORE_KEY, user).catch(() => undefined);
  await store.save().catch(() => undefined);
};

const clearAuthStore = async (): Promise<void> => {
  const store = await load(AUTH_STORE_PATH).catch(() => undefined);
  if (store === undefined) return;

  await store.delete(AUTH_STORE_KEY).catch(() => undefined);
  await store.save().catch(() => undefined);
};

export const useGitHubAuth = (): UseGitHubAuthReturn => {
  const status = useAtomValue(authStatusAtom);
  const user = useAtomValue(currentUserAtom);
  const setLoading = useSetAtom(setAuthLoadingAtom);
  const setSuccess = useSetAtom(setAuthSuccessAtom);
  const setError = useSetAtom(setAuthErrorAtom);
  const doLogout = useSetAtom(logoutAtom);

  useEffect(() => {
    const restoreAuth = async () => {
      const storedUser = await loadAuthFromStore();
      if (storedUser !== undefined) {
        setSuccess({ user: storedUser });
      }
    };
    void restoreAuth();
  }, [setSuccess]);

  const unlistenRef = useRef<(() => void) | undefined>(undefined);

  const processOAuthCallback = useCallback(
    async (code: string, state: string) => {
      const tokenResult = await invokeWithResult<string>("exchange_oauth_code", {
        code,
        state,
      });

      if (!tokenResult.ok) {
        setError(tokenResult.error);
        return;
      }

      const userResult = await invokeWithResult<GitHubUser>(
        "get_authenticated_user",
        { token: tokenResult.data }
      );

      if (!userResult.ok) {
        setError(userResult.error);
        return;
      }

      await saveAuthToStore(userResult.data);
      setSuccess({ user: userResult.data });
    },
    [setError, setSuccess]
  );

  useEffect(() => {
    const handleDeepLink = (payload: string) => {
      const url = new URL(payload);
      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state");

      if (code === null || state === null) {
        setError("auth.error.codeNotFound");
        return;
      }

      setLoading(true);
      void processOAuthCallback(code, state);
    };

    const setupDeepLinkListener = async () => {
      const unlisten = await listen<string>("deep-link", (event) => {
        handleDeepLink(event.payload);
      }).catch(() => undefined);

      if (unlisten !== undefined) {
        unlistenRef.current = unlisten;
      }
    };

    void setupDeepLinkListener();

    return () => {
      unlistenRef.current?.();
    };
  }, [setLoading, setError, processOAuthCallback]);

  const login = useCallback(async () => {
    setLoading(true);

    const authUrlResult = await invokeWithResult<string>("start_oauth_flow");

    if (!authUrlResult.ok) {
      setError(authUrlResult.error);
      return;
    }

    const openResult = await openUrl(authUrlResult.data).catch(
      (error: unknown) => ({
        error: error instanceof Error ? error.message : String(error),
      })
    );

    if (openResult !== undefined && "error" in openResult) {
      setError(openResult.error);
    }
  }, [setLoading, setError]);

  const logout = useCallback(async () => {
    await clearAuthStore();
    doLogout();
  }, [doLogout]);

  return { status, user, login, logout };
};
