export type GitHubUser = {
  id: number;
  login: string;
  avatar_url: string;
  name: string | undefined;
  email: string | undefined;
};

export type AuthState = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: GitHubUser | undefined;
  error: string | undefined;
};

export type AuthStatus = "idle" | "authenticating" | "authenticated" | "error";
