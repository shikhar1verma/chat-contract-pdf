import Link from "next/link";
import { useState, useEffect } from "react";
import { Bars3Icon, XMarkIcon, SunIcon, MoonIcon } from "@heroicons/react/24/solid";
import { useTheme } from "next-themes";
import clsx from "clsx";

const links = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
];

export default function Navbar() {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme, systemTheme } = useTheme();
    const currentTheme = theme === "system" ? systemTheme : theme;

    // avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    const renderToggle = () => {
        if (!mounted) return null;
        return (
            <button
                onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                aria-label="Toggle dark mode"
            >
                {currentTheme === "dark" ? (
                    <SunIcon className="h-5 w-5 text-yellow-400" />
                ) : (
                    <MoonIcon className="h-5 w-5 text-gray-800" />
                )}
            </button>
        );
    };

    const [open, setOpen] = useState(false);

    return (
        <header className="sticky top-0 z-20 border-b bg-white/90 dark:bg-gray-900/90 backdrop-blur">
            <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 md:px-8">
                <Link href="/" className="text-lg font-semibold text-primary dark:text-primary-light">
                    Document AI Chat
                </Link>

                {/* desktop */}
                <ul className="hidden items-center gap-6 md:flex">
                    {links.map((l) => (
                        <li key={l.href}>
                            <Link
                                href={l.href}
                                className="hover:text-primary dark:hover:text-primary-light"
                            >
                                {l.label}
                            </Link>
                        </li>
                    ))}
                    <li>
                        <a
                            href="https://github.com/shikhar1verma/document-ai-chat"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-md border border-primary px-3 py-1 text-primary hover:bg-primary hover:text-white dark:border-primary-light dark:text-primary-light dark:hover:bg-primary-light"
                        >
                            GitHub
                        </a>
                    </li>
                    <li>{renderToggle()}</li>
                </ul>

                {/* mobile burger */}
                <button
                    onClick={() => setOpen(!open)}
                    className="md:hidden"
                    aria-label="Toggle menu"
                >
                    {open ? (
                        <XMarkIcon className="h-6 w-6 text-gray-800 dark:text-gray-200" />
                    ) : (
                        <Bars3Icon className="h-6 w-6 text-gray-800 dark:text-gray-200" />
                    )}
                </button>
            </nav>

            {/* slide-down mobile menu */}
            <ul
                className={clsx(
                    "space-y-2 bg-white px-4 pb-4 dark:bg-gray-900 md:hidden",
                    open ? "block" : "hidden"
                )}
            >
                {links.map((l) => (
                    <li key={l.href}>
                        <Link
                            href={l.href}
                            onClick={() => setOpen(false)}
                            className="block py-1 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light"
                        >
                            {l.label}
                        </Link>
                    </li>
                ))}
                <li>
                    <a
                        href="https://github.com/shikhar1verma/document-ai-chat"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-md border border-primary px-3 py-1 text-center text-primary hover:bg-primary hover:text-white dark:border-primary-light dark:text-primary-light dark:hover:bg-primary-light"
                    >
                        GitHub
                    </a>
                </li>
                <li className="pt-2">{renderToggle()}</li>
            </ul>
        </header>
    );
}
