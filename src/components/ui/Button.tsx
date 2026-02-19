import { clsx } from "clsx";
import type { ReactNode } from "react";

type ButtonVariant = "primary" | "danger" | "success" | "secondary" | "ghost";
type ButtonSize = "sm" | "md";

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  className?: string;
} & Omit<React.ComponentPropsWithoutRef<"button">, "className">;

const VARIANT_STYLES: Readonly<Record<ButtonVariant, string>> = Object.freeze({
  primary: "bg-blue-600 font-medium text-white hover:bg-blue-700",
  danger: "bg-red-600 font-medium text-white hover:bg-red-700",
  success: "bg-green-600 font-medium text-white hover:bg-green-700",
  secondary: "bg-gray-700 text-gray-300 hover:bg-gray-600",
  ghost: "text-gray-400 hover:bg-gray-700 hover:text-gray-100",
});

const SIZE_STYLES: Readonly<Record<ButtonSize, string>> = Object.freeze({
  sm: "px-2 py-1 text-xs",
  md: "px-4 py-2 text-sm",
});

const GHOST_TEXT_SIZE: Readonly<Record<ButtonSize, string>> = Object.freeze({
  sm: "text-xs",
  md: "text-sm",
});

const BASE_STYLES = "rounded disabled:cursor-not-allowed disabled:opacity-50";

export const Button = ({
  variant = "primary",
  size = "md",
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) => (
  <button
    type={type}
    className={clsx(
      BASE_STYLES,
      VARIANT_STYLES[variant],
      variant === "ghost" ? GHOST_TEXT_SIZE[size] : SIZE_STYLES[size],
      className,
    )}
    {...rest}
  >
    {children}
  </button>
);
