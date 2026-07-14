import type { InputHTMLAttributes } from "react";

type SearchInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
};

export function SearchInput({ label, id, className = "", ...props }: SearchInputProps) {
  const inputId = id ?? props.name;

  return (
    <label htmlFor={inputId} className="text-sm text-[#565c62]">
      {label}
      <input
        {...props}
        id={inputId}
        type="search"
        className={`mt-2 w-full rounded-xl border border-[#d9dcde] bg-white px-4 py-3 text-sm text-[#17191c] outline-none placeholder:text-[#9aa0a5] focus:border-[#7894a6] focus:ring-2 focus:ring-[#7894a6]/20 ${className}`}
      />
    </label>
  );
}
