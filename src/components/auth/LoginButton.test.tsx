import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider, createStore } from "jotai";
import { I18nProvider } from "@lingui/react";
import { LoginButton } from "./LoginButton";
import { authAtom } from "../../stores/authAtoms";
import { i18n } from "../../i18n/config";

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

vi.mock("@tauri-apps/plugin-opener", () => ({
  openUrl: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@tauri-apps/plugin-store", () => ({
  load: vi.fn().mockResolvedValue({
    get: vi.fn().mockResolvedValue(undefined),
    set: vi.fn().mockResolvedValue(undefined),
    save: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
  }),
}));

vi.mock("@tauri-apps/api/event", () => ({
  listen: vi.fn().mockResolvedValue(vi.fn()),
}));

describe("LoginButton", () => {
  const renderWithProvider = (initialAuthState = {}) => {
    const store = createStore();
    const defaultState = {
      isAuthenticated: false,
      isLoading: false,
      user: undefined,
      error: undefined,
    };
    store.set(authAtom, { ...defaultState, ...initialAuthState });

    return {
      store,
      ...render(
        <I18nProvider i18n={i18n}>
          <Provider store={store}>
            <LoginButton />
          </Provider>
        </I18nProvider>
      ),
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("未認証状態でログインボタンを表示する", () => {
    renderWithProvider();
    expect(screen.getByTestId("login-button-text")).toBeInTheDocument();
  });

  it("ローディング中はボタンを無効化する", () => {
    renderWithProvider({ isLoading: true });
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("クリックでinvokeが呼ばれる", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    vi.mocked(invoke).mockResolvedValue(
      "https://github.com/login/oauth/authorize"
    );

    renderWithProvider();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button"));

    expect(invoke).toHaveBeenCalledWith("start_oauth_flow");
  });

  it("ローディング中はクリックしてもinvokeが呼ばれない", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    vi.mocked(invoke).mockResolvedValue(
      "https://github.com/login/oauth/authorize"
    );

    renderWithProvider({ isLoading: true });
    const user = userEvent.setup();
    const button = screen.getByRole("button");

    await user.click(button);

    expect(invoke).not.toHaveBeenCalled();
  });
});
