import { clsx } from "clsx";

type StatusDotProps = {
  color: string;
  title?: string;
  className?: string;
};

const BASE_STYLES = "h-2 w-2 shrink-0 rounded-full";

export const StatusDot = ({ color, title, className }: StatusDotProps) => (
  <div
    className={clsx(BASE_STYLES, className)}
    style={{ backgroundColor: color }}
    title={title}
  />
);
