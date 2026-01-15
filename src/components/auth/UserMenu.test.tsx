import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider, createStore } from "jotai";
import { I18nProvider } from "@lingui/react";
import { UserMenu } from "./UserMenu";
import { authAtom } from "../../stores/authAtoms";
import { i18n } from "../../i18n/config";
import type { GitHubUser } from "../../types/auth";

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

const MOCK_USER_ID = 123;

const createMockUser = (): GitHubUser => ({
  id: MOCK_USER_ID,
  login: "testuser",
  avatar_url: "https://example.com/avatar.png",
  name: "Test User",
  email: "test@example.com",
});

describe("UserMenu", () => {
  const renderWithAuth = (user: GitHubUser = createMockUser()) => {
    const store = createStore();
    store.set(authAtom, {
      isAuthenticated: true,
      isLoading: false,
      user,
      error: undefined,
    });

    return {
      store,
      ...render(
        <I18nProvider i18n={i18n}>
          <Provider store={store}>
            <UserMenu />
          </Provider>
        </I18nProvider>
      ),
    };
  };

  const renderWithoutAuth = () => {
    const store = createStore();
    store.set(authAtom, {
      isAuthenticated: false,
      isLoading: false,
      user: undefined,
      error: undefined,
    });

    return {
      store,
      ...render(
        <I18nProvider i18n={i18n}>
          <Provider store={store}>
            <UserMenu />
          </Provider>
        </I18nProvider>
      ),
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("認証済みユーザーのアバターと名前を表示する", () => {
    renderWithAuth();
    expect(screen.getByAltText("Test User")).toBeInTheDocument();
    expect(screen.getByText("Test User")).toBeInTheDocument();
  });

  it("nameがundefinedの場合loginを表示する", () => {
    const userWithoutName = {
      ...createMockUser(),
      name: undefined,
    };
    renderWithAuth(userWithoutName);
    expect(screen.getByAltText("testuser")).toBeInTheDocument();
    expect(screen.getByText("testuser")).toBeInTheDocument();
  });

  it("未認証状態では何も表示しない", () => {
    const { container } = renderWithoutAuth();
    expect(container).toBeEmptyDOMElement();
  });

  it("クリックでドロップダウンメニューを表示する", async () => {
    renderWithAuth();
    const user = userEvent.setup();

    expect(screen.queryByTestId("logout-button")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button"));

    expect(screen.getByTestId("logout-button")).toBeInTheDocument();
    expect(screen.getByText("@testuser")).toBeInTheDocument();
  });

  it("メニュー外クリックでドロップダウンが閉じる", async () => {
    renderWithAuth();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button"));
    expect(screen.getByTestId("logout-button")).toBeInTheDocument();

    await user.click(document.body);
    expect(screen.queryByTestId("logout-button")).not.toBeInTheDocument();
  });

  it("ログアウトボタンクリックでメニューが閉じる", async () => {
    const { store } = renderWithAuth();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button"));
    await user.click(screen.getByTestId("logout-button"));

    expect(screen.queryByTestId("logout-button")).not.toBeInTheDocument();
    expect(store.get(authAtom).isAuthenticated).toBe(false);
  });

  it("Escキーでドロップダウンが閉じる", async () => {
    renderWithAuth();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button"));
    expect(screen.getByTestId("logout-button")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByTestId("logout-button")).not.toBeInTheDocument();
  });
});
