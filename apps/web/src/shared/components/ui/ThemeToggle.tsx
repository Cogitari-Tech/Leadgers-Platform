import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export const ThemeToggle = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (
      storedTheme === "dark" ||
      (!storedTheme &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Alternar para modo ${theme === "light" ? "escuro" : "claro"}`}
      className="relative overflow-hidden rounded-full w-10 h-10 flex items-center justify-center transition-all duration-300 glass-panel hover:bg-foreground/5 cursor-pointer group"
    >
      {theme === "light" ? (
        <Moon className="w-5 h-5 text-foreground/70 group-hover:text-primary transition-colors" />
      ) : (
        <Sun className="w-5 h-5 text-foreground/70 group-hover:text-primary transition-colors" />
      )}
    </button>
  );
};
