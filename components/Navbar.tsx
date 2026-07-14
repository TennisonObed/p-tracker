"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const navigation = [
  {
    name: "Home",
    href: "/",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5 12 3l9 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-4.5v-6h-6v6H4.5A1.5 1.5 0 0 1 3 19.5z" />
      </svg>
    ),
  },
  {
    name: "Projects",
    href: "/projects",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 6.75A2.25 2.25 0 0 1 6.75 4.5h2.25a2.25 2.25 0 0 1 2.25 2.25v2.25H4.5zM4.5 14.25A2.25 2.25 0 0 1 6.75 12h2.25a2.25 2.25 0 0 1 2.25 2.25v2.25H4.5zM13.5 6.75A2.25 2.25 0 0 1 15.75 4.5h2.25a2.25 2.25 0 0 1 2.25 2.25v2.25H13.5zM13.5 14.25A2.25 2.25 0 0 1 15.75 12h2.25a2.25 2.25 0 0 1 2.25 2.25v2.25H13.5z" />
      </svg>
    ),
  },
  {
    name: "Settings",
    href: "/settings",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 3.75a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75v1.44a7.5 7.5 0 0 1 1.56.75l1.02-1.02a.75.75 0 0 1 1.06 0l1.06 1.06a.75.75 0 0 1 0 1.06l-1.02 1.02c.3.5.54 1.03.75 1.56h1.44a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-.75.75h-1.44a7.5 7.5 0 0 1-.75 1.56l1.02 1.02a.75.75 0 0 1 0 1.06l-1.06 1.06a.75.75 0 0 1-1.06 0l-1.02-1.02a7.5 7.5 0 0 1-1.56.75v1.44a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1-.75-.75v-1.44a7.5 7.5 0 0 1-1.56-.75l-1.02 1.02a.75.75 0 0 1-1.06 0l-1.06-1.06a.75.75 0 0 1 0-1.06l1.02-1.02a7.5 7.5 0 0 1-.75-1.56H3.75a.75.75 0 0 1-.75-.75v-1.5a.75.75 0 0 1 .75-.75h1.44a7.5 7.5 0 0 1 .75-1.56l-1.02-1.02a.75.75 0 0 1 0-1.06l1.06-1.06a.75.75 0 0 1 1.06 0l1.02 1.02a7.5 7.5 0 0 1 1.56-.75z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    name: "Profile",
    href: "/profile",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 7.5a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 19.5a6.75 6.75 0 0 1 13.5 0" />
      </svg>
    ),
  },
];

export default function Navbar() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsMobileOpen(true)}
        className="fixed left-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-200/70 bg-white text-violet-700 shadow-lg md:hidden"
        aria-label="Open navigation"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {isMobile && (
        <button
          type="button"
          onClick={() => setIsMobileOpen(false)}
          className={`fixed inset-0 z-40 bg-slate-950/45 ${isMobileOpen ? "block" : "hidden"}`}
          aria-label="Close navigation"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen flex-col border-r border-violet-200/70 bg-gradient-to-b from-violet-950 via-violet-900 to-indigo-950 p-6 text-violet-50 shadow-[0_20px_60px_-20px_rgba(91,33,182,0.45)] transition-all duration-300 md:static md:translate-x-0 ${
          isMobile
            ? isMobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
            : isExpanded
              ? "w-72"
              : "w-24"
        }`}
      >
        <div className="mb-10 flex items-center gap-3">
          <button
            type="button"
            onClick={() => (isMobile ? setIsMobileOpen(false) : setIsExpanded((value) => !value))}
            className="ml-auto hidden rounded-xl bg-white/10 p-2 text-violet-100 transition hover:bg-white/20 md:flex"
            aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d={isExpanded ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
            </svg>
          </button>
        </div>

        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-400/20 ring-1 ring-violet-300/40">
            <span className="text-lg font-semibold">P</span>
          </div>
          <div className={`${isExpanded || isMobile ? "block" : "hidden"}`}>
            <p className="text-lg font-semibold tracking-wide">P-Tracker</p>
            <p className="text-sm text-violet-200/70">Project hub</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className="group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-violet-100/80 transition hover:bg-white/10 hover:text-white"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-violet-100">
                {item.icon}
              </span>
              <span className={`${isExpanded || isMobile ? "block" : "hidden"}`}>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className={`rounded-2xl border border-violet-400/20 bg-white/10 p-4 ${isExpanded || isMobile ? "block" : "hidden"}`}>
          <p className="text-sm font-semibold">Welcome back</p>
          <p className="mt-1 text-sm text-violet-100/70">
            Keep your projects moving with a calm, focused view.
          </p>
        </div>
      </aside>
    </>
  );
}
