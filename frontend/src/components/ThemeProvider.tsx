"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
    theme: "dark",
    toggleTheme: () => { },
});

export function useTheme() {
    return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>("dark");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Read from localStorage or system preference
        const stored = localStorage.getItem("theme") as Theme | null;
        if (stored === "light" || stored === "dark") {
            setTheme(stored);
        } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
            setTheme("light");
        }
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        const root = document.documentElement;
        if (theme === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
        localStorage.setItem("theme", theme);
    }, [theme, mounted]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    };

    // Prevent flash: render children only after mount
    if (!mounted) {
        return <div style={{ visibility: "hidden" }}>{children}</div>;
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

/** A beautiful animated sun/moon toggle button */
export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";

    return (
        <button
            onClick={toggleTheme}
            className="relative flex items-center w-14 h-7 rounded-full p-0.5 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            style={{
                background: isDark
                    ? "linear-gradient(135deg, #1e293b, #0f172a)"
                    : "linear-gradient(135deg, #93c5fd, #60a5fa)",
            }}
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
            title={`Switch to ${isDark ? "light" : "dark"} mode`}
        >
            {/* Track decorations */}
            {isDark && (
                <>
                    <span className="absolute top-1.5 left-2 w-1 h-1 rounded-full bg-slate-400/40 animate-pulse" />
                    <span className="absolute top-3.5 left-4 w-0.5 h-0.5 rounded-full bg-slate-400/30" />
                    <span className="absolute top-1 left-6 w-0.5 h-0.5 rounded-full bg-slate-400/50" />
                </>
            )}
            {!isDark && (
                <>
                    <span className="absolute top-2 right-3 w-2 h-1.5 rounded-full bg-white/30" />
                    <span className="absolute bottom-1.5 right-5 w-1.5 h-1 rounded-full bg-white/20" />
                </>
            )}

            {/* Slider thumb */}
            <span
                className={`
          flex items-center justify-center w-6 h-6 rounded-full shadow-md
          transform transition-all duration-300 ease-in-out
          ${isDark ? "translate-x-0 bg-slate-700" : "translate-x-7 bg-white"}
        `}
            >
                {isDark ? (
                    /* Moon icon */
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                ) : (
                    /* Sun icon */
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                )}
            </span>
        </button>
    );
}
