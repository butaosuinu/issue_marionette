import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Button } from "../Button";

describe("Button", () => {
  it("children がレンダリングされる", () => {
    render(<Button>テスト</Button>);
    expect(screen.getByRole("button", { name: "テスト" })).toBeInTheDocument();
  });

  it("デフォルトで type=button が設定される", () => {
    render(<Button>ボタン</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("type=submit を渡すと上書きされる", () => {
    render(<Button type="submit">送信</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });

  it("onClick ハンドラが呼ばれる", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>クリック</Button>);

    await user.click(screen.getByRole("button"));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("disabled の場合クリックしても onClick が呼ばれない", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <Button onClick={handleClick} disabled>
        無効
      </Button>,
    );

    await user.click(screen.getByRole("button"));

    expect(handleClick).not.toHaveBeenCalled();
  });

  it("disabled 時に disabled 属性が設定される", () => {
    render(<Button disabled>無効</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("primary バリアントのスタイルが適用される", () => {
    render(<Button variant="primary">プライマリ</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("bg-blue-600");
  });

  it("danger バリアントのスタイルが適用される", () => {
    render(<Button variant="danger">削除</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("bg-red-600");
  });

  it("success バリアントのスタイルが適用される", () => {
    render(<Button variant="success">成功</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("bg-green-600");
  });

  it("secondary バリアントのスタイルが適用される", () => {
    render(<Button variant="secondary">セカンダリ</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("bg-gray-700");
  });

  it("ghost バリアントのスタイルが適用される", () => {
    render(<Button variant="ghost">ゴースト</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("text-gray-400");
    expect(button.className).not.toContain("px-4");
  });

  it("sm サイズのスタイルが適用される", () => {
    render(<Button size="sm">小さい</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("text-xs");
  });

  it("className で追加クラスが適用される", () => {
    render(<Button className="w-full">フル幅</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("w-full");
  });

  it("aria-label などの追加属性が渡される", () => {
    render(<Button aria-label="閉じる">✕</Button>);
    expect(screen.getByRole("button", { name: "閉じる" })).toBeInTheDocument();
  });
});
