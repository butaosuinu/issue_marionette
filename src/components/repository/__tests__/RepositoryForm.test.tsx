import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider, createStore } from "jotai";

const { mockInvoke, mockOpen } = vi.hoisted(() => ({
  mockInvoke: vi.fn(),
  mockOpen: vi.fn(),
}));

vi.mock("@tauri-apps/api/core", () => ({
  invoke: mockInvoke,
}));

vi.mock("@tauri-apps/plugin-dialog", () => ({
  open: mockOpen,
}));

// eslint-disable-next-line import/first -- vi.mock must be called before importing mocked modules
import { RepositoryForm } from "../RepositoryForm";

describe("RepositoryForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInvoke.mockResolvedValue(undefined);
    mockOpen.mockResolvedValue(undefined);
  });

  it("フォーム入力が正しく動作する", async () => {
    const user = userEvent.setup();
    const store = createStore();

    render(
      <Provider store={store}>
        <RepositoryForm />
      </Provider>
    );

    const ownerInput = screen.getByPlaceholderText("organization or username");
    const nameInput = screen.getByPlaceholderText("repository-name");

    await user.type(ownerInput, "test-owner");
    await user.type(nameInput, "test-repo");

    expect(ownerInput).toHaveValue("test-owner");
    expect(nameInput).toHaveValue("test-repo");
  });

  it("必須項目未入力時は送信ボタンが無効", () => {
    const store = createStore();

    render(
      <Provider store={store}>
        <RepositoryForm />
      </Provider>
    );

    const submitButton = screen.getByRole("button", { name: "リポジトリを追加" });
    expect(submitButton).toBeDisabled();
  });

  it("フォーム送信で保存処理が呼ばれる", async () => {
    const user = userEvent.setup();
    const store = createStore();
    mockOpen.mockResolvedValue("/path/to/repo");

    render(
      <Provider store={store}>
        <RepositoryForm />
      </Provider>
    );

    const ownerInput = screen.getByPlaceholderText("organization or username");
    const nameInput = screen.getByPlaceholderText("repository-name");
    const selectButton = screen.getByRole("button", { name: "選択" });

    await user.type(ownerInput, "test-owner");
    await user.type(nameInput, "test-repo");
    await user.click(selectButton);

    await waitFor(() => {
      expect(screen.getByDisplayValue("/path/to/repo")).toBeInTheDocument();
    });

    const submitButton = screen.getByRole("button", { name: "リポジトリを追加" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith(
        "save_repository",
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- expect.objectContaining returns any type
          repository: expect.objectContaining({
            owner: "test-owner",
            name: "test-repo",
            local_path: "/path/to/repo",
            default_branch: "main",
            is_private: false,
          }),
        })
      );
    });
  });

  it("プライベートリポジトリチェックボックスが機能する", async () => {
    const user = userEvent.setup();
    const store = createStore();
    mockOpen.mockResolvedValue("/path/to/repo");

    render(
      <Provider store={store}>
        <RepositoryForm />
      </Provider>
    );

    const ownerInput = screen.getByPlaceholderText("organization or username");
    const nameInput = screen.getByPlaceholderText("repository-name");
    const selectButton = screen.getByRole("button", { name: "選択" });
    const privateCheckbox = screen.getByLabelText("プライベートリポジトリ");

    await user.type(ownerInput, "test-owner");
    await user.type(nameInput, "test-repo");
    await user.click(selectButton);

    await waitFor(() => {
      expect(screen.getByDisplayValue("/path/to/repo")).toBeInTheDocument();
    });

    await user.click(privateCheckbox);
    expect(privateCheckbox).toBeChecked();

    const submitButton = screen.getByRole("button", { name: "リポジトリを追加" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith(
        "save_repository",
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- expect.objectContaining returns any type
          repository: expect.objectContaining({
            is_private: true,
          }),
        })
      );
    });
  });

  it("送信成功後にフォームがリセットされる", async () => {
    const user = userEvent.setup();
    const store = createStore();
    mockOpen.mockResolvedValue("/path/to/repo");

    render(
      <Provider store={store}>
        <RepositoryForm />
      </Provider>
    );

    const ownerInput = screen.getByPlaceholderText("organization or username");
    const nameInput = screen.getByPlaceholderText("repository-name");
    const selectButton = screen.getByRole("button", { name: "選択" });

    await user.type(ownerInput, "test-owner");
    await user.type(nameInput, "test-repo");
    await user.click(selectButton);

    await waitFor(() => {
      expect(screen.getByDisplayValue("/path/to/repo")).toBeInTheDocument();
    });

    const submitButton = screen.getByRole("button", { name: "リポジトリを追加" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(ownerInput).toHaveValue("");
      expect(nameInput).toHaveValue("");
    });
  });
});
