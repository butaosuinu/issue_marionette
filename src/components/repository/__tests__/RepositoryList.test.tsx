import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider, createStore } from "jotai";
import type { Repository } from "../../../types";

const { mockInvoke } = vi.hoisted(() => ({
  mockInvoke: vi.fn(),
}));

vi.mock("@tauri-apps/api/core", () => ({
  invoke: mockInvoke,
}));

// eslint-disable-next-line import/first -- vi.mock must be called before importing mocked modules
import { RepositoryList } from "../RepositoryList";
// eslint-disable-next-line import/first -- vi.mock must be called before importing mocked modules
import {
  repositoriesAtom,
  selectedRepositoryIdAtom,
} from "../../../stores";

const createMockRepository = (overrides: Partial<Repository> = {}): Repository => ({
  id: "repo-1",
  owner: "test-owner",
  name: "test-repo",
  full_name: "test-owner/test-repo",
  local_path: "/path/to/repo",
  default_branch: "main",
  is_private: false,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  ...overrides,
});

describe("RepositoryList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInvoke.mockResolvedValue(undefined);
  });

  it("空の場合「リポジトリがありません」が表示される", () => {
    const store = createStore();
    store.set(repositoriesAtom, []);

    render(
      <Provider store={store}>
        <RepositoryList />
      </Provider>
    );

    expect(screen.getByText("リポジトリがありません")).toBeInTheDocument();
  });

  it("リポジトリ一覧が正しく表示される", () => {
    const store = createStore();
    const mockRepos = [
      createMockRepository({ id: "repo-1", full_name: "owner/repo1" }),
      createMockRepository({ id: "repo-2", full_name: "owner/repo2" }),
    ];
    store.set(repositoriesAtom, mockRepos);

    render(
      <Provider store={store}>
        <RepositoryList />
      </Provider>
    );

    expect(screen.getByText("owner/repo1")).toBeInTheDocument();
    expect(screen.getByText("owner/repo2")).toBeInTheDocument();
  });

  it("リポジトリをクリックすると選択される", async () => {
    const user = userEvent.setup();
    const store = createStore();
    const mockRepos = [
      createMockRepository({ id: "repo-1", full_name: "owner/repo1" }),
    ];
    store.set(repositoriesAtom, mockRepos);

    render(
      <Provider store={store}>
        <RepositoryList />
      </Provider>
    );

    await user.click(screen.getByText("owner/repo1"));

    expect(store.get(selectedRepositoryIdAtom)).toBe("repo-1");
  });

  it("削除確認でOKをクリックすると削除処理が呼ばれる", async () => {
    const user = userEvent.setup();
    const store = createStore();
    const mockRepos = [
      createMockRepository({
        id: "repo-1",
        owner: "test-owner",
        name: "test-repo",
        full_name: "test-owner/test-repo",
      }),
    ];
    store.set(repositoriesAtom, mockRepos);

    const mockConfirm = vi.fn().mockReturnValue(true);
    vi.stubGlobal("confirm", mockConfirm);

    render(
      <Provider store={store}>
        <RepositoryList />
      </Provider>
    );

    const deleteButton = screen.getByTitle("削除");
    await user.click(deleteButton);

    expect(mockConfirm).toHaveBeenCalledWith(
      "リポジトリ「test-owner/test-repo」を削除しますか？"
    );

    await waitFor(() => {
      expect(store.get(repositoriesAtom)).toHaveLength(0);
    });

    vi.unstubAllGlobals();
  });

  it("削除確認でキャンセルすると削除されない", async () => {
    const user = userEvent.setup();
    const store = createStore();
    const mockRepos = [
      createMockRepository({
        id: "repo-1",
        owner: "test-owner",
        name: "test-repo",
        full_name: "test-owner/test-repo",
      }),
    ];
    store.set(repositoriesAtom, mockRepos);

    const mockConfirm = vi.fn().mockReturnValue(false);
    vi.stubGlobal("confirm", mockConfirm);

    render(
      <Provider store={store}>
        <RepositoryList />
      </Provider>
    );

    const deleteButton = screen.getByTitle("削除");
    await user.click(deleteButton);

    expect(mockConfirm).toHaveBeenCalled();
    expect(store.get(repositoriesAtom)).toHaveLength(1);

    vi.unstubAllGlobals();
  });
});
