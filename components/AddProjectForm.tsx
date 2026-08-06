"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddProjectForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsAdding(true);
    setError("");
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create project");
      }
      setTitle("");
      // Re-runs the Home Server Component's data fetch instead of holding
      // project state on the client.
      router.refresh();
    } catch (err) {
      const errorObj = err as Error;
      setError(errorObj.message || "Failed to create project");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
      <div className="flex-1">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Project title"
          className="w-full rounded-2xl border border-violet-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none ring-0 placeholder:text-slate-400"
          disabled={isAdding}
        />
        {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
      </div>
      <button
        type="submit"
        className="h-[46px] rounded-2xl bg-violet-600 px-6 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50"
        disabled={isAdding || !title.trim()}
      >
        {isAdding ? "Adding..." : "Add Project"}
      </button>
    </form>
  );
}
