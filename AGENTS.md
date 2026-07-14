# p-tracker Agent Instructions

## Project Overview
**p-tracker** is a Next.js 16 + React 19 project tracker application in early development. It uses TypeScript (strict mode), Tailwind CSS 4, and ESLint 9 with flat config.

## Critical: Breaking Changes in Next.js 16 & React 19

⚠️ **This version has breaking changes** — APIs, conventions, and file structure may differ from your training data.

- **Next.js 16**: Read docs in `node_modules/next/dist/docs/` before writing API routes, middleware, or config code
- **React 19**: Server Components behavior changed; hooks have new patterns; deprecation notices are strict
- **Tailwind CSS 4**: PostCSS plugins and import syntax differ from v3
- **ESLint 9**: Uses flat config format (FlatConfig) — no `.eslintrc.json`

When in doubt, consult the docs in `node_modules/` rather than relying on training data.

## Getting Started

### Commands
```bash
npm run dev      # Development server at http://localhost:3000
npm run build    # Production build
npm start        # Run production build (requires npm run build first)
npm run lint     # Check code with ESLint
```

### Project Structure
```
app/               # App Router (Next.js 16)
  layout.tsx       # Root layout with fonts & metadata
  page.tsx         # Home page
  globals.css      # Global Tailwind styles
public/            # Static assets
.github/           # (Reserved for CI/CD and issue templates)
eslint.config.mjs  # ESLint flat config
tsconfig.json      # TypeScript config with @ alias → root
```

## Key Conventions

### TypeScript
- **Strict mode enabled** — no `any` types without justification
- **Path alias**: `@/` refers to project root (e.g., `@/app/components`)
- **Exports**: Prefer named exports for components; default only for pages

### React 19
- Server Components are the default in `app/`; add `"use client"` at the top of files that need interactivity
- Hooks (useState, useEffect) only work in client components
- Props are passed as React Props type; async components are allowed
- **Avoid**: Class components, deprecated lifecycle methods

### Styling
- **Tailwind CSS 4** via PostCSS; import `@tailwind` directives in `globals.css`
- Dark mode via `dark:` prefix (e.g., `dark:bg-black`)
- Responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`

### File Naming
- Components: PascalCase (e.g., `Button.tsx`)
- Utilities/hooks: camelCase (e.g., `useForm.ts`)
- Layouts/pages: lowercase (e.g., `app/page.tsx`)

## Development Workflow

1. **Start dev server**: `npm run dev`
2. **Make changes**: Files in `app/` auto-reload
3. **Type-check**: Run `npm run lint` to catch TypeScript & ESLint issues
4. **Test locally**: Open http://localhost:3000
5. **Build for production**: `npm run build` then `npm start`

## Common Pitfalls

| Issue | Cause | Fix |
|-------|-------|-----|
| "Cannot use hooks in Server Component" | Missing `"use client"` | Add `"use client"` at top of file |
| ESLint errors on config format | Using old `.eslintrc.json` | Use `eslint.config.mjs` (flat config only) |
| Tailwind classes not applied | PostCSS not configured | Check `postcss.config.mjs` — should use Tailwind 4 plugin |
| Path alias `@/` not resolving | TypeScript not updated | Run `npm run build` or restart LSP |
| Styles bleed between routes | Missing encapsulation | Use CSS Modules or scoped Tailwind classes |
| npm start fails | Missing build step | Run `npm run build` first |

## When to Consult Docs
- Writing API routes → check `next/app/api-routes` docs
- Adding middleware → read Next.js middleware guide
- Configuring fonts/metadata → see `next/font` docs
- Using advanced Tailwind → consult Tailwind 4 plugin docs

## Notes for Future Development
- Keep components small and testable
- Use TypeScript generics for reusable component patterns
- Prefer composition over inheritance
- Document non-obvious component props in JSDoc comments


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

