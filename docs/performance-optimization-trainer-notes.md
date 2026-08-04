# Interactive Trainer Notes: Performance Optimization & Best Practices

## Session Goal
This is a simple 2-hour lesson for beginners. The goal is not to teach every performance trick that exists. The goal is to teach students to **notice** performance problems and know the standard fix for each one.

We will not invent fake examples. We will open **our own project (p-tracker)** and find real performance issues that already exist in the code students wrote in earlier sessions. Every fix will be a small, focused change — following [Rules.md](../Rules.md): one issue at a time, explain before implementing.

---

## Real-World Story to Start With
Tell the class this story:

"Amazon found that every 100ms of extra load time cost them about 1% in sales. Pinterest rebuilt their site for speed and increased sign-ups by 15%. Performance is not a 'nice to have' — it is a business metric. But performance work is not magic. It is a checklist: don't do work you don't need to do, and don't do it more often than you need to."

This is the mental model for the whole session:
> **Performance optimization = doing less work, less often, at the right time.**

---

## Interactive Opening Questions
Ask students before touching code:
- When you click a button in an app, what work happens that the user *can't* see?
- If a webpage re-renders 10 times when only 1 render was needed, who pays the cost?
- Why would a shopping site like Amazon or Flipkart lazy-load images below the fold instead of loading everything at once?
- Have you ever seen a page freeze or lag while typing in a search box? Why does that happen?

Expected answers:
- work = re-rendering components, re-fetching data, recalculating values, downloading JS/images
- the browser (CPU) and the user (battery, data, time) pay the cost
- loading only what's visible saves bandwidth and speeds up first paint
- typing lag usually means a function runs on every keystroke without any limit

---

## Where Performance Problems Hide (Architecture Map)

Draw this on the board. Every performance topic today maps to one box.

```
┌─────────────────────────────────────────────────────────────────┐
│                         BROWSER (Client)                        │
│                                                                   │
│   ┌───────────────┐     ┌───────────────┐     ┌───────────────┐ │
│   │  1. RENDERING │     │ 2. EVENT WORK │     │ 3. NETWORK     │ │
│   │  React re-    │     │ scroll/resize │     │ fetch() calls  │ │
│   │  renders too  │────▶│ keystroke runs│────▶│ repeated/      │ │
│   │  often        │     │ too often     │     │ duplicate      │ │
│   └───────────────┘     └───────────────┘     └───────┬───────┘ │
└──────────────────────────────────────────────────────────┼───────┘
                                                            ▼
                                                  ┌───────────────┐
                                                  │   4. SERVER   │
                                                  │  extra load,  │
                                                  │  slow response│
                                                  └───────────────┘
```

Today we fix **Box 1, 2, and 3** using real bugs already sitting in p-tracker's code.

---

## Folder Structure for This Lesson
No new folders. We are only editing files that already exist:
- `context/AuthContext.tsx`
- `context/ProjectContext.tsx`
- `components/Navbar.tsx`
- `app/page.tsx`

This itself is a teaching point: **performance work is mostly editing existing code, not writing new features.**

---

## Topic 1 — Context Re-render Storm (the biggest bug in our app)

### Step 1: Explain the concept
When you write:
```tsx
<AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, refreshUser, logout }}>
```
That `value={{ ... }}` creates a **brand-new object** on every single render of `AuthProvider` — even if `user` never changed. React Context uses `Object.is()` to check if the value changed. A new object is *always* "different," so **every component using `useAuth()` anywhere in the app re-renders**, every time.

### Step 2: Why we need to fix it
Prompt to read:
"Right now, our whole app is wrapped in `AuthProvider` and `ProjectProvider`. If either context re-renders for no reason, every page, every navbar item, every stat card re-renders with it. In a small app you won't feel it. In a real SaaS app with hundreds of components, this is the #1 cause of 'why does my app feel sluggish' bug reports."

### Step 3: Where it's used
This exact pattern exists in **two files right now**:
- [context/AuthContext.tsx:93-101](../context/AuthContext.tsx)
- [context/ProjectContext.tsx:115-124](../context/ProjectContext.tsx)

### Real-world example
This is the exact bug class described in the official React docs and in Kent C. Dodds' well-known "How to optimize your context value" post. Apps like **Discord** and **Linear** explicitly split and memoize context values so that typing in a chat box doesn't re-render the entire sidebar.

### Step 4: Architecture (before vs after)

```
BEFORE (no memo)                      AFTER (useMemo)
──────────────────                    ─────────────────
state changes                          state changes
   │                                       │
   ▼                                       ▼
Provider re-renders                   Provider re-renders
   │                                       │
   ▼                                       ▼
NEW {} object every time     ──▶     useMemo checks deps
   │                                       │
   ▼                              ┌────────┴────────┐
ALL consumers re-render          same deps      deps changed
(Navbar, page.tsx, ...)             │                │
                                 SKIP re-render   only THEN
                                 (bail out)       re-render
```

### Step 5: Implement manually
Prompt to read to students:
"Let's fix `AuthContext.tsx` first. We wrap the value object in `useMemo` so it only changes when something inside it actually changes."

Ask students to change this:
```tsx
return (
  <AuthContext.Provider
    value={{
      user,
      loading,
      isAuthenticated: !!user,
      refreshUser: fetchUser,
      logout,
    }}
  >
    {children}
  </AuthContext.Provider>
);
```
into this:
```tsx
const value = useMemo(
  () => ({
    user,
    loading,
    isAuthenticated: !!user,
    refreshUser: fetchUser,
    logout,
  }),
  [user, loading, fetchUser]
);

return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
```
(Remember to add `useMemo` to the import line at the top.)

Ask:
- Why did we list `[user, loading, fetchUser]` as dependencies?
- What would happen if we forgot `loading` in the array?

Then ask students to apply the **same fix** themselves to `ProjectContext.tsx` (the `value` object at lines 115-124) — this is their hands-on practice, not something you do for them.

### Step 6: Test manually
1. Open React DevTools → Profiler tab.
2. Record a session, click around the sidebar, type in the "add project" input.
3. Before the fix: watch `Navbar` re-render on unrelated state changes.
4. After the fix: `Navbar` should stay quiet unless `user` actually changes.

### Step 7: Common mistakes
- Forgetting a dependency in the `useMemo` array → stale value bug (worse than the original problem).
- Wrapping every single function in `useCallback` "just in case" without checking if it's actually needed — that's over-engineering for a project this size (see [Rules.md](../Rules.md) rule #4).
- Memoizing the value but still passing new inline functions as props deeper in the tree.

### Mini exercise
Ask students: "Open React DevTools Profiler, record a click on a nav link, and count how many components re-render before vs after your fix. Report the number."

---

## Topic 2 — Memoizing Expensive Derived Values

### Step 1-2: Concept + Why
`app/page.tsx` recalculates the dashboard stats on **every render**:
```tsx
const totalProjects = projects.length;
const inProgressCount = projects.filter((p) => p.status === "in-progress").length;
const completedCount = projects.filter((p) => p.status === "completed").length;
const todoCount = projects.filter((p) => p.status === "todo").length;
```
This runs **4 full passes over the array** every time the component re-renders — even if `projects` didn't change (e.g. if the user just typed a character in the "new project" input box, which triggers a re-render via `newTitle` state).

### Real-world example
This is exactly how dashboards like **Notion's board view counts**, **Trello's list counters**, or **Jira's sprint burndown numbers** are computed — and why those apps memoize the calculation instead of recalculating on every keystroke elsewhere on the page.

### Step 3: Implement manually
Prompt to read:
"Let's wrap our stats calculation in `useMemo` so it only recalculates when `projects` actually changes — not when the user is just typing."

```tsx
const { totalProjects, inProgressCount, completedCount, todoCount } = useMemo(() => {
  return {
    totalProjects: projects.length,
    inProgressCount: projects.filter((p) => p.status === "in-progress").length,
    completedCount: projects.filter((p) => p.status === "completed").length,
    todoCount: projects.filter((p) => p.status === "todo").length,
  };
}, [projects]);
```

Ask:
- Why is `[projects]` the only dependency here?
- Bonus challenge for fast finishers: rewrite this as a single `for` loop or `reduce` that only passes over `projects` once instead of 4 times. (This teaches: memoization fixes *when* work runs, algorithm choice fixes *how much* work runs — two separate concepts.)

### Common mistakes
- Using `useMemo` for cheap calculations (like `a + b`) — the memoization overhead can cost more than the calculation itself. Only memoize work that is actually expensive or runs on a large list.

---

## Topic 3 — Debouncing/Throttling Expensive Event Listeners

### Step 1-2: Concept + Why
Look at `components/Navbar.tsx`:
```tsx
useEffect(() => {
  const handleResize = () => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    if (!mobile) setIsMobileOpen(false);
  };
  handleResize();
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);
```
The `resize` event can fire **dozens of times per second** while a user drags to resize their browser window. Each firing calls `setIsMobile`, which can trigger a re-render of `Navbar` every single time.

### Real-world example
Every major site with a search-as-you-type feature — **GitHub's code search**, **Algolia-powered search bars**, **Google's search suggestions** — debounces the input so the API is called once after the user pauses typing, not on every keystroke. Same idea applies to scroll and resize listeners on sites like **Airbnb's map view**, which recalculates visible listings only after scrolling stops.

### Step 3: Implement manually
Prompt to read:
"We won't add a new library for this — we can write a simple debounce ourselves, since the concept matters more than the tool."

```tsx
useEffect(() => {
  let timeoutId: ReturnType<typeof setTimeout>;

  const handleResize = () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsMobileOpen(false);
    }, 150);
  };

  handleResize();
  window.addEventListener("resize", handleResize);
  return () => {
    clearTimeout(timeoutId);
    window.removeEventListener("resize", handleResize);
  };
}, []);
```

Ask:
- Why do we call `clearTimeout` inside `handleResize` itself?
- What is the difference between **debounce** (wait until activity stops) and **throttle** (run at most once every N ms)? Which one fits a search box better? Which fits a scroll-position tracker better?

**Enterprise alternative (mention only, don't implement):** libraries like `lodash.debounce` or `use-debounce` exist for production apps with many debounce needs — but for one listener in a portfolio project, the hand-written version above is the simple, correct choice.

### Common mistakes
- Debouncing so aggressively (very long delay) that the UI feels unresponsive.
- Forgetting to clear the timeout in the cleanup function → memory leak / stale updates after unmount.

---

## Topic 4 — Awareness-Level Topics (concept only, not implemented today)

Per [Rules.md](../Rules.md) rule #6, we stay inside today's scope, but students should know these exist for later phases:

| Concept | Real-world example | One-line idea |
|---|---|---|
| **Avoiding duplicate network calls / caching** | Twitter/X caches your timeline so switching tabs doesn't re-fetch; libraries like SWR/React Query exist for this | Our `fetchProjects()` currently re-fetches from scratch every time `isAuthenticated` changes — fine for now, but a future phase could add caching |
| **Code splitting / lazy loading** | YouTube doesn't load the comments-section JS until you scroll to it; Next.js already does this automatically per route | `next/dynamic` lets you lazy-load a heavy component (e.g. a future charts library) only when needed |
| **Image optimization** | Instagram/Airbnb serve resized, compressed images per device | When we add project thumbnails/avatars later, use `next/image` instead of a plain `<img>` tag |
| **Removing dead code / debug logs** | Production console errors on big sites (e.g. leftover `console.log`) are a classic code-review flag | `context/AuthContext.tsx:29` still has `console.log("pathName ", pathName)` — flag this live as an example, remove it as a warm-up fix before the main lesson |

---

## Key Teaching Points
- Performance optimization = doing less work, less often, at the right time.
- A new object/array/function reference is treated as "changed" by React — even if the contents are identical.
- `useMemo` and `useCallback` are about **skipping unnecessary work**, not making individual operations faster.
- Debounce/throttle exist to control *how often* an event handler's expensive logic runs.
- Don't optimize what isn't slow — profile first (React DevTools Profiler), then fix.

---

## Common Mistakes to Mention (Recap)
- Passing a new inline object/array/function as a Context value or prop on every render.
- Memoizing cheap operations that don't need it (adds complexity without benefit).
- Debouncing/throttling with the wrong delay or forgetting cleanup.
- "Optimizing" by guessing instead of measuring with the Profiler.
- Leaving `console.log` statements and commented-out dead code in production files.

---

## Mini Assignment
Ask students to choose one:
1. Apply the `useMemo` context-value fix to `ProjectContext.tsx` (if not already done in class) and screenshot the Profiler before/after.
2. Remove the leftover `console.log` and the commented-out `checkAuth` block in `AuthContext.tsx`.
3. Convert the resize-listener debounce into a small reusable `useDebouncedValue` hook and use it for the "add project" input's title validation.
4. Rewrite the Topic 2 stats calculation as a single-pass `reduce` and compare readability vs the four `.filter()` calls.

---

## Short Wrap-Up
End the session by saying:
"Performance work isn't about clever tricks — it's about noticing waste. Today you fixed the exact same class of bug three different ways: a re-render storm, a repeated calculation, and an over-firing event handler. Every big app you use has hit these same three bugs at some point."

---

## Suggested 2-Hour Timing
- 10 min: Story, opening questions, architecture map
- 30 min: Topic 1 — Context re-render fix (biggest, most valuable)
- 25 min: Topic 2 — `useMemo` for derived stats
- 20 min: Topic 3 — Debounce the resize listener
- 15 min: Topic 4 — Awareness tour (caching, lazy loading, images, dead code)
- 15 min: Test everything together, discuss mistakes
- 5 min: Assignment + wrap-up

---

## Next Topic Preview
Next session will build on today's caching discussion: introducing a data-fetching library (SWR or React Query) as the "production best practice" alternative to manual `useEffect` + `fetch`, and comparing it against what we hand-built in `ProjectContext.tsx`.
