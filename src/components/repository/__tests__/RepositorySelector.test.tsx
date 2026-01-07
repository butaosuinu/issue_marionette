import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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
import { RepositorySelector } from "../RepositorySelector";
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

describe("RepositorySelector", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInvoke.mockResolvedValue(undefined);
  });

  it("未選択時は「リポジトリ未選択」が表示される", () => {
    const store = createStore();
    store.set(repositoriesAtom, []);

    render(
      <Provider store={store}>
        <RepositorySelector />
      </Provider>
    );

    expect(screen.getByText("リポジトリ未選択")).toBeInTheDocument();
  });

  it("クリックでドロップダウンが開く", async () => {
    const user = userEvent.setup();
    const store = createStore();
    const mockRepos = [
      createMockRepository({ id: "repo-1", full_name: "owner/repo1" }),
    ];
    store.set(repositoriesAtom, mockRepos);

    render(
      <Provider store={store}>
        <RepositorySelector />
      </Provider>
    );

    const button = screen.getByText("リポジトリ未選択");
    await user.click(button);

    expect(screen.getByText("owner/repo1")).toBeInTheDocument();
  });

  it("リポジトリ選択時にatomが更新される", async () => {
    const user = userEvent.setup();
    const store = createStore();
    const mockRepos = [
      createMockRepository({ id: "repo-1", full_name: "owner/repo1" }),
    ];
    store.set(repositoriesAtom, mockRepos);

    render(
      <Provider store={store}>
        <RepositorySelector />
      </Provider>
    );

    const button = screen.getByText("リポジトリ未選択");
    await user.click(button);

    const option = screen.getByText("owner/repo1");
    await user.click(option);

    expect(store.get(selectedRepositoryIdAtom)).toBe("repo-1");
  });

  it("選択後にドロップダウンが閉じる", async () => {
    const user = userEvent.setup();
    const store = createStore();
    const mockRepos = [
      createMockRepository({ id: "repo-1", full_name: "owner/repo1" }),
      createMockRepository({ id: "repo-2", full_name: "owner/repo2" }),
    ];
    store.set(repositoriesAtom, mockRepos);

    render(
      <Provider store={store}>
        <RepositorySelector />
      </Provider>
    );

    const button = screen.getByText("リポジトリ未選択");
    await user.click(button);

    expect(screen.getByText("owner/repo1")).toBeInTheDocument();
    expect(screen.getByText("owner/repo2")).toBeInTheDocument();

    await user.click(screen.getByText("owner/repo1"));

    expect(screen.queryByText("owner/repo2")).not.toBeInTheDocument();
  });

  it("外部クリックでドロップダウンが閉じる", async () => {
    const user = userEvent.setup();
    const store = createStore();
    const mockRepos = [
      createMockRepository({ id: "repo-1", full_name: "owner/repo1" }),
    ];
    store.set(repositoriesAtom, mockRepos);

    render(
      <div>
        <div data-testid="outside">外部要素</div>
        <Provider store={store}>
          <RepositorySelector />
        </Provider>
      </div>
    );

    const button = screen.getByText("リポジトリ未選択");
    await user.click(button);

    expect(screen.getByText("owner/repo1")).toBeInTheDocument();

    const outsideElement = screen.getByTestId("outside");
    await user.click(outsideElement);

    expect(screen.queryByText("owner/repo1")).not.toBeInTheDocument();
  });
});
