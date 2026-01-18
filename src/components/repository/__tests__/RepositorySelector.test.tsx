import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider, createStore, atom } from "jotai";
import type { Repository } from "../../../types/repository";

const mockRepositories = vi.hoisted(() => ({
  value: [] as Repository[],
}));

const mockSelectedRepository = vi.hoisted(() => ({
  value: undefined as Repository | undefined,
}));

vi.mock("../../../stores/repositoryAtoms", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("../../../stores/repositoryAtoms")>();
  return {
    ...original,
    repositoriesSuspenseAtom: atom(() => mockRepositories.value),
    selectedRepositoryAtom: atom(() => mockSelectedRepository.value),
  };
});

// eslint-disable-next-line import/first -- vi.mock must be called before importing mocked modules
import { RepositorySelector } from "../RepositorySelector";
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
  render(<Provider store={store}>{ui}</Provider>);

describe("RepositorySelector", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRepositories.value = [];
    mockSelectedRepository.value = undefined;
  });

  it("未選択時は「リポジトリ未選択」が表示される", () => {
    mockRepositories.value = [];

    renderWithProviders(<RepositorySelector />);

    expect(screen.getByText("リポジトリ未選択")).toBeInTheDocument();
  });

  it("クリックでドロップダウンが開く", async () => {
    const user = userEvent.setup();
    mockRepositories.value = [
      createMockRepository({ id: "repo-1", full_name: "owner/repo1" }),
    ];

    renderWithProviders(<RepositorySelector />);

    const button = screen.getByText("リポジトリ未選択");
    await user.click(button);

    expect(screen.getByText("owner/repo1")).toBeInTheDocument();
  });

  it("リポジトリ選択時にatomが更新される", async () => {
    const user = userEvent.setup();
    mockRepositories.value = [
      createMockRepository({ id: "repo-1", full_name: "owner/repo1" }),
    ];

    const store = createStore();

    renderWithProviders(<RepositorySelector />, store);

    const button = screen.getByText("リポジトリ未選択");
    await user.click(button);

    const option = screen.getByText("owner/repo1");
    await user.click(option);

    expect(store.get(selectedRepositoryIdAtom)).toBe("repo-1");
  });

  it("選択後にドロップダウンが閉じる", async () => {
    const user = userEvent.setup();
    mockRepositories.value = [
      createMockRepository({ id: "repo-1", full_name: "owner/repo1" }),
      createMockRepository({ id: "repo-2", full_name: "owner/repo2" }),
    ];

    renderWithProviders(<RepositorySelector />);

    const button = screen.getByText("リポジトリ未選択");
    await user.click(button);

    expect(screen.getByText("owner/repo1")).toBeInTheDocument();
    expect(screen.getByText("owner/repo2")).toBeInTheDocument();

    await user.click(screen.getByText("owner/repo1"));

    expect(screen.queryByText("owner/repo2")).not.toBeInTheDocument();
  });

  it("外部クリックでドロップダウンが閉じる", async () => {
    const user = userEvent.setup();
    mockRepositories.value = [
      createMockRepository({ id: "repo-1", full_name: "owner/repo1" }),
    ];

    const store = createStore();

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
