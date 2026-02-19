import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StatusDot } from "../StatusDot";

describe("StatusDot", () => {
  it("color が backgroundColor スタイルに適用される", () => {
    const { container } = render(<StatusDot color="#22c55e" />);
    const dot = container.firstChild;
    expect(dot).toHaveStyle({ backgroundColor: "#22c55e" });
  });

  it("title が設定される", () => {
    render(<StatusDot color="#ef4444" title="エラー" />);
    expect(screen.getByTitle("エラー")).toBeInTheDocument();
  });

  it("追加 className が適用される", () => {
    const { container } = render(<StatusDot color="#3b82f6" className="ml-2" />);
    const dot = container.firstChild;
    expect(dot).toHaveClass("ml-2");
  });

  it("基本スタイルが適用される", () => {
    const { container } = render(<StatusDot color="#000" />);
    const dot = container.firstChild;
    expect(dot).toHaveClass("h-2");
    expect(dot).toHaveClass("w-2");
    expect(dot).toHaveClass("rounded-full");
  });
});
