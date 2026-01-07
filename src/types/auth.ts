// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- CLAUDE.mdでtypeを優先
export type GitHubUser = {
  id: number;
  login: string;
  avatar_url: string;
  name: string | undefined;
  email: string | undefined;
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- CLAUDE.mdでtypeを優先
export type AuthState = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: GitHubUser | undefined;
  error: string | undefined;
};

export type AuthStatus = "idle" | "authenticating" | "authenticated" | "error";
