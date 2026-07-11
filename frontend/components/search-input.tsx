import type { InputHTMLAttributes } from "react";

type SearchInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
};

export function SearchInput({ label, id, className = "", ...props }: SearchInputProps) {
  const inputId = id ?? props.name;

  return (
    <label htmlFor={inputId} className="text-sm text-slate-400">
      {label}
      <input
        {...props}
        id={inputId}
        type="search"
        className={`mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/20 ${className}`}
      />
    </label>
  );
}
