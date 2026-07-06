import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/shared/utils/cn";

interface Option {
  value: string;
  label: string;
}

interface ModernSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function ModernSelect({
  options,
  value,
  onChange,
  placeholder = "Selecione...",
  className,
  disabled,
}: ModernSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "flex w-full h-14 items-center justify-between rounded-2xl border border-border bg-card/60 px-5 text-sm transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none",
          isOpen && "border-primary ring-4 ring-primary/10",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        <span
          className={cn(
            "truncate",
            !selectedOption && "text-muted-foreground/40",
          )}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180 text-primary",
          )}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute left-0 right-0 z-[100] bg-card border border-border rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl p-1"
          >
            <div className="max-h-60 overflow-y-auto custom-scrollbar">
              {options.length === 0 ? (
                <div className="px-4 py-3 text-xs text-muted-foreground text-center italic">
                  Nenhuma opção disponível
                </div>
              ) : (
                options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center px-4 py-3 text-sm transition-all rounded-lg text-left",
                      value === opt.value
                        ? "bg-primary/20 text-primary font-bold"
                        : "hover:bg-primary/10 hover:text-primary text-muted-foreground",
                    )}
                  >
                    {opt.label}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
