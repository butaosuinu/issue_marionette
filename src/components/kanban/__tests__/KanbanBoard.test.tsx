import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "jotai";
import { describe, it, expect } from "vitest";
import { KanbanBoard } from "../KanbanBoard";

const renderWithProvider = (ui: React.ReactElement) => render(<Provider>{ui}</Provider>);

describe("KanbanBoard", () => {
  it("デフォルトカラムが表示される", () => {
    renderWithProvider(<KanbanBoard />);

    expect(screen.getByText("Backlog")).toBeInTheDocument();
    expect(screen.getByText("Todo")).toBeInTheDocument();
    expect(screen.getByText("In Progress")).toBeInTheDocument();
    expect(screen.getByText("Review")).toBeInTheDocument();
    expect(screen.getByText("Done")).toBeInTheDocument();
  });

  it("Kanban Boardタイトルが表示される", () => {
    renderWithProvider(<KanbanBoard />);

    expect(screen.getByText("Kanban Board")).toBeInTheDocument();
  });

  it("Settingsボタンが表示される", () => {
    renderWithProvider(<KanbanBoard />);

    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("Issueカードが表示される", async () => {
    renderWithProvider(<KanbanBoard />);

    await waitFor(() => {
      expect(
        screen.getByText("プロジェクト構造のセットアップ")
      ).toBeInTheDocument();
    });
    expect(screen.getByText("カンバンボードUIの実装")).toBeInTheDocument();
    expect(screen.getByText("GitHub API連携")).toBeInTheDocument();
  });

  it("Settingsボタンをクリックするとカラム設定モーダルが表示される", async () => {
    const user = userEvent.setup();
    renderWithProvider(<KanbanBoard />);

    const settingsButton = screen.getByText("Settings");
    await user.click(settingsButton);

    expect(screen.getByText("カラム設定")).toBeInTheDocument();
    expect(screen.getByText("新しいカラムを追加")).toBeInTheDocument();
  });

  it("カラム設定モーダルを閉じることができる", async () => {
    const user = userEvent.setup();
    renderWithProvider(<KanbanBoard />);

    const settingsButton = screen.getByText("Settings");
    await user.click(settingsButton);

    expect(screen.getByText("カラム設定")).toBeInTheDocument();

    const closeButton = screen.getByText("✕");
    await user.click(closeButton);

    expect(screen.queryByText("カラム設定")).not.toBeInTheDocument();
  });

  it("各カラムにカード数が表示される", () => {
    renderWithProvider(<KanbanBoard />);

    const countBadges = screen.getAllByText(/^\d+$/);
    expect(countBadges.length).toBeGreaterThan(0);
  });

  it("Issueカードにラベルが表示される", async () => {
    renderWithProvider(<KanbanBoard />);

    await waitFor(() => {
      expect(screen.getByText("setup")).toBeInTheDocument();
    });
    expect(screen.getAllByText("feature").length).toBeGreaterThan(0);
  });

  it("Issueカードにアサインユーザーが表示される", async () => {
    renderWithProvider(<KanbanBoard />);

    await waitFor(() => {
      expect(screen.getAllByText("developer1").length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText("developer2").length).toBeGreaterThan(0);
  });
});
