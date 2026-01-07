import { render, screen } from "@testing-library/react";
import { Provider } from "jotai";
import { DndContext } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { describe, it, expect } from "vitest";
import { IssueCard } from "../IssueCard";
import type { Issue } from "../../../types";

const mockIssue: Issue = {
  id: "issue-1",
  number: 42,
  title: "Test Issue Title",
  body: "Test body",
  state: "open",
  priority: "high",
  labels: [{ id: "label-1", name: "bug", color: "#d73a4a" }],
  assignee: "testuser",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  columnId: "todo",
};

const renderWithContext = (issue: Issue) => render(
    <Provider>
      <DndContext>
        <SortableContext items={[issue.id]}>
          <IssueCard issue={issue} columnId={issue.columnId} />
        </SortableContext>
      </DndContext>
    </Provider>
  );

describe("IssueCard", () => {
  it("Issue番号が表示される", () => {
    renderWithContext(mockIssue);
    expect(screen.getByText("#42")).toBeInTheDocument();
  });

  it("Issueタイトルが表示される", () => {
    renderWithContext(mockIssue);
    expect(screen.getByText("Test Issue Title")).toBeInTheDocument();
  });

  it("ラベルが表示される", () => {
    renderWithContext(mockIssue);
    expect(screen.getByText("bug")).toBeInTheDocument();
  });

  it("アサインユーザーが表示される", () => {
    renderWithContext(mockIssue);
    expect(screen.getByText("testuser")).toBeInTheDocument();
  });

  it("アサインユーザーがない場合は表示されない", () => {
    const issueWithoutAssignee: Issue = {
      ...mockIssue,
      assignee: undefined,
    };
    renderWithContext(issueWithoutAssignee);
    expect(screen.queryByText("testuser")).not.toBeInTheDocument();
  });

  it("ラベルがない場合はラベルセクションが表示されない", () => {
    const issueWithoutLabels: Issue = {
      ...mockIssue,
      labels: [],
    };
    renderWithContext(issueWithoutLabels);
    expect(screen.queryByText("bug")).not.toBeInTheDocument();
  });

  it("優先度に応じたインジケーターが表示される", () => {
    renderWithContext(mockIssue);
    const priorityIndicator = screen.getByTitle("high");
    expect(priorityIndicator).toBeInTheDocument();
  });
});
