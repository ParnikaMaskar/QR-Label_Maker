import { useState, useEffect } from "react";
import { Moon, Sun, Monitor, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type ThemeMode = "light" | "dark" | "system";

interface ThemeSwitcherProps {
  className?: string;
}

const themes: { id: ThemeMode; label: string; icon: React.ReactNode }[] = [
  { id: "light", label: "Light", icon: <Sun className="w-4 h-4" /> },
  { id: "dark", label: "Dark", icon: <Moon className="w-4 h-4" /> },
  { id: "system", label: "System", icon: <Monitor className="w-4 h-4" /> },
];

export const ThemeSwitcher = ({ className }: ThemeSwitcherProps) => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("theme") as ThemeMode) || "system";
    }
    return "system";
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") as ThemeMode;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    const isDark = theme === "dark" || (theme === "system" && systemDark);

    root.classList.toggle("dark", isDark);
    localStorage.setItem("theme", theme);
  }, [theme, mounted]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      const root = document.documentElement;
      root.classList.toggle("dark", e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const currentTheme = themes.find((t) => t.id === theme);

  if (!mounted) {
    return (
      <Button variant="outline" size="sm" className={cn("w-[120px]", className)}>
        <span className="w-4 h-4 mr-2" />
        Loading
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "min-w-[120px] gap-2 bg-background/80 backdrop-blur-sm",
            "hover:bg-secondary/80 transition-all duration-200",
            className
          )}
        >
          <motion.div
            key={theme}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="flex items-center justify-center"
          >
            {theme === "light" && <Sun className="w-4 h-4 text-amber-500" />}
            {theme === "dark" && <Moon className="w-4 h-4 text-blue-400" />}
            {theme === "system" && (
              <Monitor className="w-4 h-4 text-muted-foreground" />
            )}
          </motion.div>
          <span className="hidden sm:inline">{currentTheme?.label}</span>
          <ChevronDown className="w-3 h-3 ml-auto text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>

      <AnimatePresence>
        <DropdownMenuContent
          align="end"
          className="w-40 animate-theme-in origin-top-right"
        >
          {themes.map((t) => (
            <DropdownMenuItem
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={cn(
                "flex items-center gap-2 cursor-pointer transition-colors",
                theme === t.id && "bg-secondary text-secondary-foreground"
              )}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: theme === t.id ? 1.05 : 1 }}
                className="flex items-center gap-2"
              >
                {t.icon}
                <span>{t.label}</span>
              </motion.div>
              {theme === t.id && (
                <motion.div
                  className="ml-auto w-2 h-2 rounded-full bg-primary"
                  layoutId="active-dot"
                />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </AnimatePresence>
    </DropdownMenu>
  );
};

export default ThemeSwitcher;

