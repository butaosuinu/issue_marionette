import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { TextInput } from "../TextInput";

describe("TextInput", () => {
  it("value が表示される", () => {
    render(<TextInput value="テスト値" onChange={vi.fn()} />);
    expect(screen.getByDisplayValue("テスト値")).toBeInTheDocument();
  });

  it("label が表示される", () => {
    render(
      <TextInput label="名前" value="" onChange={vi.fn()} id="name-input" />,
    );
    expect(screen.getByText("名前")).toBeInTheDocument();
  });

  it("label なしの場合は input のみ表示される", () => {
    render(<TextInput value="" onChange={vi.fn()} />);
    expect(screen.queryByRole("textbox")).toBeInTheDocument();
    expect(screen.queryByText("名前")).not.toBeInTheDocument();
  });

  it("入力時に onChange が value 文字列で呼ばれる", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<TextInput value="" onChange={handleChange} />);

    await user.type(screen.getByRole("textbox"), "a");

    expect(handleChange).toHaveBeenCalledWith("a");
  });

  it("placeholder が表示される", () => {
    render(
      <TextInput value="" onChange={vi.fn()} placeholder="入力してください" />,
    );
    expect(screen.getByPlaceholderText("入力してください")).toBeInTheDocument();
  });

  it("readOnly の場合は編集不可", () => {
    render(<TextInput value="固定値" onChange={vi.fn()} readOnly />);
    expect(screen.getByRole("textbox")).toHaveAttribute("readonly");
  });

  it("onKeyDown が呼ばれる", async () => {
    const user = userEvent.setup();
    const handleKeyDown = vi.fn();
    render(
      <TextInput value="" onChange={vi.fn()} onKeyDown={handleKeyDown} />,
    );

    await user.type(screen.getByRole("textbox"), "{enter}");

    expect(handleKeyDown).toHaveBeenCalled();
  });

  it("className でラッパー div に追加クラスが適用される", () => {
    const { container } = render(
      <TextInput value="" onChange={vi.fn()} className="flex-1" />,
    );
    expect(container.firstChild).toHaveClass("flex-1");
  });

  it("inputClassName で input に追加クラスが適用される", () => {
    render(
      <TextInput value="" onChange={vi.fn()} inputClassName="bg-gray-800" />,
    );
    expect(screen.getByRole("textbox")).toHaveClass("bg-gray-800");
  });

  it("className と inputClassName がそれぞれ正しい要素に適用される", () => {
    const { container } = render(
      <TextInput
        value=""
        onChange={vi.fn()}
        className="flex-1"
        inputClassName="bg-gray-800"
      />,
    );
    expect(container.firstChild).toHaveClass("flex-1");
    expect(screen.getByRole("textbox")).toHaveClass("bg-gray-800");
    expect(screen.getByRole("textbox")).not.toHaveClass("flex-1");
  });
});
