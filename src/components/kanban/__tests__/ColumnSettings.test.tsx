import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "jotai";
import { describe, it, expect, vi } from "vitest";
import { ColumnSettings } from "../ColumnSettings";

const renderWithProvider = (onClose: () => void = vi.fn()) => render(
    <Provider>
      <ColumnSettings onClose={onClose} />
    </Provider>
  );

describe("ColumnSettings", () => {
  it("カラム設定タイトルが表示される", () => {
    renderWithProvider();
    expect(screen.getByText("カラム設定")).toBeInTheDocument();
  });

  it("デフォルトカラムが一覧に表示される", () => {
    renderWithProvider();
    expect(screen.getByDisplayValue("Backlog")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Todo")).toBeInTheDocument();
    expect(screen.getByDisplayValue("In Progress")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Review")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Done")).toBeInTheDocument();
  });

  it("デフォルトカラムにはデフォルトバッジが表示される", () => {
    renderWithProvider();
    const defaultBadges = screen.getAllByText("デフォルト");
    expect(defaultBadges.length).toBe(5);
  });

  it("閉じるボタンをクリックするとonCloseが呼ばれる", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithProvider(onClose);

    const closeButton = screen.getByText("✕");
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  it("新しいカラムを追加できる", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    const input = screen.getByPlaceholderText("カラム名を入力");
    await user.type(input, "新しいカラム");

    const addButton = screen.getByText("追加");
    await user.click(addButton);

    expect(screen.getByDisplayValue("新しいカラム")).toBeInTheDocument();
  });

  it("空のカラム名では追加できない", () => {
    renderWithProvider();

    const addButton = screen.getByText("追加");
    expect(addButton).toBeDisabled();
  });

  it("カラム名を編集できる", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    const backlogInput = screen.getByDisplayValue("Backlog");
    await user.clear(backlogInput);
    await user.type(backlogInput, "バックログ");

    expect(screen.getByDisplayValue("バックログ")).toBeInTheDocument();
  });

  it("追加したカラムには削除ボタンが表示される", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    const input = screen.getByPlaceholderText("カラム名を入力");
    await user.type(input, "削除可能なカラム");

    const addButton = screen.getByText("追加");
    await user.click(addButton);

    const deleteButtons = screen.getAllByText("削除");
    expect(deleteButtons.length).toBeGreaterThan(0);
  });

  it("Enterキーでカラムを追加できる", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    const input = screen.getByPlaceholderText("カラム名を入力");
    await user.type(input, "Enterで追加{enter}");

    expect(screen.getByDisplayValue("Enterで追加")).toBeInTheDocument();
  });
});
