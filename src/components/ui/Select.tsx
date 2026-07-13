"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const selectClass = cn(
  "h-9 w-full appearance-none rounded-lg border border-gray-200 bg-gray-50",
  "pl-2.5 pr-8 text-sm font-medium text-gray-700",
  "focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
);

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  className?: string;
}

export function Select({ label, value, options, onChange, className }: SelectProps) {
  return (
    <label className={cn("flex flex-col gap-1 text-xs text-gray-500", className)}>
      {label}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={selectClass}
        >
          {options.map((opt) => (
            <option key={opt.value || "__empty"} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          aria-hidden
        />
      </div>
    </label>
  );
}
