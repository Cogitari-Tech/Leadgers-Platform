import * as React from "react";

import { cn } from "@/shared/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    const inputElement = (
      <input
        type={type}
        id={inputId}
        className={cn(
          "glass-input flex h-12 w-full rounded-xl px-4 py-2.5 text-base file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );

    if (label) {
      return (
        <div className="grid w-full items-center gap-1.5">
          <label
            htmlFor={inputId}
            className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1"
          >
            {label}
          </label>
          {inputElement}
        </div>
      );
    }

    return inputElement;
  },
);
Input.displayName = "Input";

export { Input };
