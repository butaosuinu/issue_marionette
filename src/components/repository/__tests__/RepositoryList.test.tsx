import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider, createStore, atom } from "jotai";
import type { Repository } from "../../../types/repository";

const { mockAsk } = vi.hoisted(() => ({
  mockAsk: vi.fn(),
}));

vi.mock("@tauri-apps/plugin-dialog", () => ({
  ask: mockAsk,
}));

const mockRepositories = vi.hoisted(() => ({
  value: [] as Repository[],
}));

vi.mock("../../../stores/repositoryAtoms", async () => {
  const original = await vi.importActual("../../../stores/repositoryAtoms");
  return {
    ...original,
    repositoriesSuspenseAtom: atom(() => mockRepositories.value),
  };
});

// eslint-disable-next-line import/first -- vi.mock must be called before importing mocked modules
import { RepositoryList } from "../RepositoryList";
// eslint-disable-next-line import/first -- vi.mock must be called before importing mocked modules
import { selectedRepositoryIdAtom } from "../../../stores/repositoryAtoms";

const createMockRepository = (
  overrides: Partial<Repository> = {}
): Repository => ({
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

const renderWithProviders = (ui: React.ReactElement, store = createStore()) =>
  render(
    <Provider store={store}>{ui}</Provider>
  );

describe("RepositoryList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAsk.mockResolvedValue(false);
    mockRepositories.value = [];
  });

  it("空の場合「リポジトリがありません」が表示される", () => {
    mockRepositories.value = [];

    renderWithProviders(<RepositoryList />);

    expect(screen.getByText("リポジトリがありません")).toBeInTheDocument();
  });

  it("リポジトリ一覧が正しく表示される", () => {
    mockRepositories.value = [
      createMockRepository({ id: "repo-1", full_name: "owner/repo1" }),
      createMockRepository({ id: "repo-2", full_name: "owner/repo2" }),
    ];

    renderWithProviders(<RepositoryList />);

    expect(screen.getByText("owner/repo1")).toBeInTheDocument();
    expect(screen.getByText("owner/repo2")).toBeInTheDocument();
  });

  it("リポジトリをクリックすると選択される", async () => {
    const user = userEvent.setup();
    mockRepositories.value = [
      createMockRepository({ id: "repo-1", full_name: "owner/repo1" }),
    ];

    const store = createStore();

    renderWithProviders(<RepositoryList />, store);

    await user.click(screen.getByText("owner/repo1"));

    expect(store.get(selectedRepositoryIdAtom)).toBe("repo-1");
  });

  it("削除ボタンをクリックすると確認ダイアログが表示される", async () => {
    const user = userEvent.setup();
    mockRepositories.value = [
      createMockRepository({
        id: "repo-1",
        owner: "test-owner",
        name: "test-repo",
        full_name: "test-owner/test-repo",
      }),
    ];

    mockAsk.mockResolvedValue(false);

    renderWithProviders(<RepositoryList />);

    const deleteButton = screen.getByTitle("削除");
    await user.click(deleteButton);

    expect(mockAsk).toHaveBeenCalledWith(
      "リポジトリ「test-owner/test-repo」を削除しますか？",
      { title: "削除確認", kind: "warning" }
    );
  });

  it("選択されたリポジトリがハイライトされる", () => {
    mockRepositories.value = [
      createMockRepository({ id: "repo-1", full_name: "owner/repo1" }),
      createMockRepository({ id: "repo-2", full_name: "owner/repo2" }),
    ];

    const store = createStore();
    store.set(selectedRepositoryIdAtom, "repo-1");

    renderWithProviders(<RepositoryList />, store);

    const repo1Text = screen.getByText("owner/repo1");
    const repo2Text = screen.getByText("owner/repo2");

    // DOM構造: div.flex.items-center > button > div.font-medium(テキスト)
    const repo1Container = repo1Text.parentElement?.parentElement;
    const repo2Container = repo2Text.parentElement?.parentElement;

    expect(repo1Container).toHaveClass("bg-gray-700");
    expect(repo2Container).not.toHaveClass("bg-gray-700");
  });
});
