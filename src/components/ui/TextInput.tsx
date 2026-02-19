import { clsx } from "clsx";
import { useCallback } from "react";

type TextInputProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  readOnly?: boolean;
  className?: string;
  inputClassName?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

const INPUT_STYLES =
  "w-full rounded border border-gray-600 bg-gray-900 px-3 py-2 text-sm text-gray-100 focus:border-blue-500 focus:outline-none";
const LABEL_STYLES = "block text-sm font-medium text-gray-300";

export const TextInput = ({
  label,
  value,
  onChange,
  placeholder,
  id,
  readOnly = false,
  className,
  inputClassName,
  onKeyDown,
}: TextInputProps) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange],
  );

  return (
    <div className={className}>
      {label !== undefined && (
        <label htmlFor={id} className={LABEL_STYLES}>
          {label}
        </label>
      )}
      <input
        id={id}
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        readOnly={readOnly}
        className={clsx(INPUT_STYLES, label !== undefined && "mt-1", inputClassName)}
        onKeyDown={onKeyDown}
      />
    </div>
  );
};
