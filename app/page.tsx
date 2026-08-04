"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { useProjects } from "@/context/ProjectContext";

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const { projects, loading: projectsLoading, addProject } = useProjects();
  const [newTitle, setNewTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");

  if (authLoading || projectsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-100 border-t-violet-600"></div>
      </div>
    );
  }

  // Calculate stats dynamically from context data
  const totalProjects = projects.length;
  const inProgressCount = projects.filter((p) => p.status === "in-progress").length;
  const completedCount = projects.filter((p) => p.status === "completed").length;
  const todoCount = projects.filter((p) => p.status === "todo").length;

  const stats = [
    { label: "Total Projects", value: totalProjects.toString(), accent: "bg-violet-50 text-violet-700" },
    { label: "In Progress", value: inProgressCount.toString(), accent: "bg-amber-50 text-amber-700" },
    { label: "Completed", value: completedCount.toString(), accent: "bg-emerald-50 text-emerald-700" },
    { label: "To Do", value: todoCount.toString(), accent: "bg-slate-100 text-slate-700" },
  ];

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsAdding(true);
    setError("");
    try {
      await addProject(newTitle);
      setNewTitle("");
    } catch (err) {
      const errorObj = err as Error;
      setError(errorObj.message || "Failed to create project");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(167,139,250,0.2),_transparent_35%)]">
      <div className="flex min-h-screen">
        <Navbar />
        <main className="flex-1 p-6 lg:p-10">
          <div className="rounded-[28px] border border-violet-100 bg-white p-8 shadow-[0_16px_45px_-25px_rgba(91,33,182,0.35)]">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-violet-500">
                  Overview
                </p>
                <h1 className="mt-3 text-3xl font-semibold text-slate-900">
                  Welcome back, {user?.name || "User"}
                </h1>
                <p className="mt-3 max-w-2xl text-lg text-slate-600">
                  Here is a quick snapshot of your project activity and priorities.
                </p>
              </div>
              <div className="rounded-2xl bg-violet-50 px-4 py-3 text-sm font-medium text-violet-700">
                {todoCount} tasks/projects to do
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm"
                >
                  <div className={`inline-flex rounded-xl px-3 py-2 text-sm font-semibold ${stat.accent}`}>
                    {stat.label}
                  </div>
                  <p className="mt-4 text-3xl font-semibold text-slate-900">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-[24px] border border-violet-100 bg-violet-50/70 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-600">
                    Quick action
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-900">
                    Add a new project
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Start a new project by entering a title below.
                  </p>
                </div>
                <form onSubmit={handleAddProject} className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Project title"
                      className="w-full rounded-2xl border border-violet-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none ring-0 placeholder:text-slate-400"
                      disabled={isAdding}
                    />
                    {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
                  </div>
                  <button
                    type="submit"
                    className="h-[46px] rounded-2xl bg-violet-600 px-6 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50"
                    disabled={isAdding || !newTitle.trim()}
                  >
                    {isAdding ? "Adding..." : "Add Project"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}