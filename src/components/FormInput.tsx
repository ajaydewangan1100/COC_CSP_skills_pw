import React, { InputHTMLAttributes } from "react";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  error?: string | null;
  readonly?: boolean;
}

export default function FormInput({
  label,
  required,
  error,
  readonly,
  className = "",
  id,
  ...rest
}: FormInputProps) {
  return (
    <div className="mb-4 last:mb-0">
      <label htmlFor={id} className="block text-[13px] font-semibold text-text mb-1.5">
        {label} {required && <span className="text-error ml-[2px]">*</span>}
      </label>
      <input
        id={id}
        className={`w-full p-[12px_14px] border-[1.5px] border-border rounded-sm font-sans text-[15px] text-text bg-surface transition-all duration-300 outline-none appearance-none hover:border-text-muted focus:border-border-focus focus:-translate-y-[1px] focus:shadow-[0_4px_12px_rgba(0,0,0,0.05),0_0_0_3px_rgba(79,70,229,0.1)] ${
          readonly
            ? "bg-[#F1F5F9] text-text-secondary cursor-not-allowed border-dashed hover:border-border focus:-translate-y-0 focus:shadow-none"
            : ""
        } ${className}`}
        readOnly={readonly}
        {...rest}
      />
      {error && (
        <div
          className="text-[12px] text-error mt-1 flex items-center gap-1"
          role="alert"
        >
          {error}
        </div>
      )}
    </div>
  );
}
