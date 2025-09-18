import React, { InputHTMLAttributes, SelectHTMLAttributes, forwardRef } from "react";

interface BaseInputProps {
  label?: string;
  error?: string;
}

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement>, BaseInputProps {
  as?: "input";
}

interface SelectInputProps extends SelectHTMLAttributes<HTMLSelectElement>, BaseInputProps {
  as: "select";
}

type InputProps = TextInputProps | SelectInputProps;

export const Input = forwardRef<HTMLInputElement | HTMLSelectElement, InputProps>(
  ({ label, error, className = "", as = "input", ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && <label className="label">{label}</label>}
        {as === "input" ? (
          <input
            ref={ref as React.RefObject<HTMLInputElement>}
            className={`input ${className}`}
            {...(props as TextInputProps)}
          />
        ) : (
          <select
            ref={ref as React.RefObject<HTMLSelectElement>}
            className={`input ${className}`}
            {...(props as SelectInputProps)}
          />
        )}
        {error && (
          <span className="text-sm text-[var(--danger)]">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";