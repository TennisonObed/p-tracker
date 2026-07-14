# Quick Reference for p-tracker

See [AGENTS.md](AGENTS.md) for full instructions, conventions, and development workflow.

## TL;DR
- **Stack**: Next.js 16 + React 19 + TypeScript (strict) + Tailwind CSS 4
- **Dev**: `npm run dev` → http://localhost:3000
- **Key files**: [app/page.tsx](app/page.tsx), [app/layout.tsx](app/layout.tsx), [app/globals.css](app/globals.css)
- **Critical**: Read [AGENTS.md](AGENTS.md#critical-breaking-changes-in-nextjs-16--react-19) — breaking changes in Next.js 16 & React 19
- **Client components**: Add `"use client"` at top of file to use hooks (useState, useEffect, etc.)
- **TypeScript**: Strict mode enabled; use `@/` alias for root imports
- **Styling**: Tailwind CSS 4 via PostCSS; dark mode available via `dark:` prefix


# Rules.md — Project Tracker Lite (Portfolio Learning Project)

## Purpose

This project exists to learn MERN/Next.js stack concepts step by step, with AI as a teacher — not as an autopilot. Every phase should leave me with a working feature AND an understanding of *why* it works.

This is a portfolio-scale project. Simplicity is a feature. Do not turn this into a production-grade system.

---

## Core Rules for the Coding Agent

### 1. Never make changes without my approval
- Do not create, edit, or delete files until I explicitly say "go ahead" / "implement this" / "yes".
- If you think a change is needed, describe the plan first and wait for confirmation.
- This applies to installing packages too — propose the package and why it's needed, then wait for my go-ahead before running install commands.

### 2. Explain before you implement
For every concept or feature, before writing any code, explain:
- **What** we're building (in plain terms)
- **Why** it's needed at this point in the app
- **Which concept** it teaches (e.g. "this introduces React `useState`", "this introduces Next.js dynamic routing")
- **How it fits** with what's already built

Only after I confirm I understand (or explicitly say to proceed) should code be written.

### 3. One feature/module at a time — never batch work
- Do not implement multiple phases or features together, even if it seems faster.
- Finish one small piece, explain it, let me test/confirm it, then move to the next.
- If a phase has multiple steps (e.g. Phase 5: create context file → add state → wrap provider → replace local state), each step should be its own explain → approve → implement cycle, not done in one shot.

### 4. Keep it simple — no over-engineering
- No premature abstractions, no extra libraries "just in case."
- No design patterns beyond what a beginner-to-intermediate MERN/Next.js learner needs.
- Prefer plain React/Next.js built-ins (`useState`, Context API, `next/link`, App Router) over external state managers, ORMs, or frameworks unless a phase specifically calls for it.
- No backend/database unless a phase explicitly introduces one.
- If there are two ways to do something — the simple way and the "correct enterprise way" — default to the simple way and mention the enterprise alternative only briefly, without implementing it.

### 5. Installing modules
- Only install a package when a phase genuinely requires it.
- Before installing, tell me: package name, what it does, why we need it here.
- Wait for approval before running the install command.

### 6. Stay inside the defined phases
- Follow the phase order from the assignment (Setup → Navbar/Layout → Pages → Add Project → Global State → Projects List → Project Detail → Status → AI Task Generator).
- Don't jump ahead to a later phase's feature while working on an earlier one, even if it seems related.
- If I ask for something out of order, flag it ("this belongs to Phase X, want me to do it now or stick to order?") before proceeding.

### 7. After each implementation
- Summarize what changed and which files were touched.
- Point out what to test manually to confirm it works (matching the "✔️ Confirm It Works" step for that phase).
- Suggest what the natural next small step is — but don't do it until approved.

