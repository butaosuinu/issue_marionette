import { useCallback, useEffect, useRef } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { openUrl } from "@tauri-apps/plugin-opener";
import { load } from "@tauri-apps/plugin-store";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
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

type TauriStore = Awaited<ReturnType<typeof load>>;

const loadStore = async (): Promise<TauriStore | undefined> => {
  const result = await load(AUTH_STORE_PATH).catch((): undefined => undefined);
  return result;
};

const loadAuthFromStore = async (): Promise<GitHubUser | undefined> => {
  const store = await loadStore();
  if (store === undefined) return undefined;

  const user = await store.get<GitHubUser>(AUTH_STORE_KEY).catch(
    (): undefined => undefined
  );
  return user ?? undefined;
};

const saveAuthToStore = async (user: GitHubUser): Promise<void> => {
  const store = await loadStore();
  if (store === undefined) return;

  /* eslint-disable-next-line @typescript-eslint/no-empty-function -- catch pattern */
  await store.set(AUTH_STORE_KEY, user).catch((): void => {});
  /* eslint-disable-next-line @typescript-eslint/no-empty-function -- catch pattern */
  await store.save().catch((): void => {});
};

const clearAuthStore = async (): Promise<void> => {
  const store = await loadStore();
  if (store === undefined) return;

  /* eslint-disable-next-line @typescript-eslint/no-empty-function -- catch pattern */
  await store.delete(AUTH_STORE_KEY).catch((): void => {});
  /* eslint-disable-next-line @typescript-eslint/no-empty-function -- catch pattern */
  await store.save().catch((): void => {});
};

const useAuthRestore = (setSuccess: (payload: { user: GitHubUser }) => void) => {
  useEffect(() => {
    const restoreAuth = async () => {
      const storedUser = await loadAuthFromStore();
      if (storedUser !== undefined) {
        setSuccess({ user: storedUser });
      }
    };
    void restoreAuth();
  }, [setSuccess]);
};

const useDeepLinkListener = (
  setLoading: (loading: boolean) => void,
  setError: (error: string) => void,
  processOAuthCallback: (code: string, state: string) => Promise<void>
) => {
  const unlistenRef = useRef<UnlistenFn | undefined>(undefined);

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
      const unlisten: UnlistenFn | undefined = await listen<string>(
        "deep-link",
        (event) => {
          handleDeepLink(event.payload);
        }
      ).catch((): undefined => undefined);

      if (unlisten !== undefined) {
        unlistenRef.current = unlisten;
      }
    };

    void setupDeepLinkListener();

    return () => {
      unlistenRef.current?.();
    };
  }, [setLoading, setError, processOAuthCallback]);
};

const useOAuthCallback = (
  setError: (error: string) => void,
  setSuccess: (payload: { user: GitHubUser }) => void
) =>
  useCallback(
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

const useLogin = (
  setLoading: (loading: boolean) => void,
  setError: (error: string) => void
) =>
  useCallback(async () => {
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

const useLogout = (doLogout: () => void) =>
  useCallback(async () => {
    await clearAuthStore();
    doLogout();
  }, [doLogout]);

export const useGitHubAuth = (): UseGitHubAuthReturn => {
  const status = useAtomValue(authStatusAtom);
  const user = useAtomValue(currentUserAtom);
  const setLoading = useSetAtom(setAuthLoadingAtom);
  const setSuccess = useSetAtom(setAuthSuccessAtom);
  const setError = useSetAtom(setAuthErrorAtom);
  const doLogout = useSetAtom(logoutAtom);

  useAuthRestore(setSuccess);

  const processOAuthCallback = useOAuthCallback(setError, setSuccess);
  useDeepLinkListener(setLoading, setError, processOAuthCallback);

  const login = useLogin(setLoading, setError);
  const logout = useLogout(doLogout);

  return { status, user, login, logout };
};
