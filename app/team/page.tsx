"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { useProjects } from "@/context/ProjectContext";
import Link from "next/link";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Assignment {
  id: string;
  memberName: string;
  projectTitle: string;
  taskTitle: string;
  assignedAt: string;
}

export default function TeamPage() {
  const { user, loading: authLoading } = useAuth();
  const { projects, loading: projectsLoading } = useProjects();

  // Local state for mock database persistence (localStorage)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  // Form states
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("Developer");

  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [taskTitle, setTaskTitle] = useState("");

  const [formError, setFormError] = useState("");
  const [assignError, setAssignError] = useState("");

  // Seed default data if localStorage is empty
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedMembers = localStorage.getItem("pt_team_members");
      const storedAssignments = localStorage.getItem("pt_assignments");

      if (storedMembers) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTeamMembers(JSON.parse(storedMembers));
      } else {
        const seedMembers = [
          { id: "1", name: "Alice Vance", email: "alice@p-tracker.com", role: "Frontend Lead" },
          { id: "2", name: "Bob Miller", email: "bob@p-tracker.com", role: "Backend Developer" },
          { id: "3", name: "Sarah Connor", email: "sarah@p-tracker.com", role: "QA Engineer" },
        ];
        setTeamMembers(seedMembers);
        localStorage.setItem("pt_team_members", JSON.stringify(seedMembers));
      }

      if (storedAssignments) {
        setAssignments(JSON.parse(storedAssignments));
      } else {
        const seedAssignments = [
          {
            id: "1",
            memberName: "Alice Vance",
            projectTitle: "Create Auth System",
            taskTitle: "Design login and registration inputs",
            assignedAt: new Date().toLocaleDateString(),
          },
        ];
        setAssignments(seedAssignments);
        localStorage.setItem("pt_assignments", JSON.stringify(seedAssignments));
      }
    }
  }, []);

  const saveMembers = (updated: TeamMember[]) => {
    setTeamMembers(updated);
    localStorage.setItem("pt_team_members", JSON.stringify(updated));
  };

  const saveAssignments = (updated: Assignment[]) => {
    setAssignments(updated);
    localStorage.setItem("pt_assignments", JSON.stringify(updated));
  };

  // Add a new team member
  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!newMemberName.trim() || !newMemberEmail.trim()) {
      setFormError("All fields are required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newMemberEmail)) {
      setFormError("Please enter a valid email address.");
      return;
    }

    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: newMemberName.trim(),
      email: newMemberEmail.trim(),
      role: newMemberRole,
    };

    const updated = [...teamMembers, newMember];
    saveMembers(updated);

    setNewMemberName("");
    setNewMemberEmail("");
    setNewMemberRole("Developer");
  };

  // Assign project/task to a team member
  const handleAssignTask = (e: React.FormEvent) => {
    e.preventDefault();
    setAssignError("");

    if (!selectedMemberId || !selectedProjectId || !taskTitle.trim()) {
      setAssignError("Please choose a member, project, and write a task description.");
      return;
    }

    const member = teamMembers.find((m) => m.id === selectedMemberId);
    const project = projects.find((p) => p._id === selectedProjectId);

    if (!member || !project) {
      setAssignError("Selected member or project is invalid.");
      return;
    }

    const newAssignment: Assignment = {
      id: Date.now().toString(),
      memberName: member.name,
      projectTitle: project.title,
      taskTitle: taskTitle.trim(),
      assignedAt: new Date().toLocaleDateString(),
    };

    const updated = [newAssignment, ...assignments];
    saveAssignments(updated);

    setSelectedMemberId("");
    setSelectedProjectId("");
    setTaskTitle("");
  };

  const handleDeleteMember = (id: string) => {
    const updated = teamMembers.filter((m) => m.id !== id);
    saveMembers(updated);
  };

  const handleDeleteAssignment = (id: string) => {
    const updated = assignments.filter((a) => a.id !== id);
    saveAssignments(updated);
  };

  if (authLoading || projectsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-100 border-t-violet-600"></div>
      </div>
    );
  }

  const isPro = user?.subscriptionPlan === "pro";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(139,92,246,0.15),_transparent_40%)]">
      <div className="flex min-h-screen">
        <Navbar />
        <main className="flex-1 p-6 lg:p-10">
          {/* LOCKED STATE FOR FREE USERS */}
          {!isPro ? (
            <div className="flex min-h-[80vh] items-center justify-center">
              <div className="max-w-md rounded-3xl border border-violet-200 bg-white/70 p-8 text-center shadow-[0_20px_50px_rgba(109,40,217,0.1)] backdrop-blur-md">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
                  <svg fill="none" viewBox="0 0 24 24" className="h-8 w-8" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                </div>
                <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
                  Unlock Team Collaboration
                </h1>
                <p className="mt-3 text-slate-600 text-sm leading-relaxed">
                  Ready to scale your project tracking? Upgrade to the Pro Plan to configure project teams, register collaborators, and assign specific tasks to your team members.
                </p>
                <div className="mt-8 space-y-3">
                  <Link
                    href="/pricing"
                    className="block w-full rounded-2xl bg-violet-600 py-3 text-sm font-semibold text-white shadow-md hover:bg-violet-700 transition"
                  >
                    View Pricing Plans
                  </Link>
                  <p className="text-xs text-slate-400">Upgrade once. Use forever.</p>
                </div>
              </div>
            </div>
          ) : (
            /* UNLOCKED STATE FOR PRO USERS */
            <div className="mx-auto max-w-6xl space-y-8">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-violet-500">
                  Pro Workspace
                </p>
                <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                  Team Collaboration Dashboard
                </h1>
                <p className="mt-2 text-slate-600">
                  Welcome to your unified workspace. Add team members, select your active projects, and assign tasks.
                </p>
              </div>

              <div className="grid gap-8 lg:grid-cols-3">
                {/* Add member & Assign task inputs column */}
                <div className="space-y-6 lg:col-span-1">
                  {/* Card: Add Member */}
                  <div className="rounded-3xl border border-violet-100 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-900">Add Team Member</h2>
                    <p className="text-xs text-slate-500 mt-1">Register a new collaborator</p>

                    <form onSubmit={handleAddMember} className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="m-name" className="text-xs font-semibold text-slate-600">Full Name</label>
                        <input
                          id="m-name"
                          type="text"
                          value={newMemberName}
                          onChange={(e) => setNewMemberName(e.target.value)}
                          placeholder="e.g. Jane Doe"
                          className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label htmlFor="m-email" className="text-xs font-semibold text-slate-600">Email Address</label>
                        <input
                          id="m-email"
                          type="email"
                          value={newMemberEmail}
                          onChange={(e) => setNewMemberEmail(e.target.value)}
                          placeholder="jane@company.com"
                          className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label htmlFor="m-role" className="text-xs font-semibold text-slate-600">Role</label>
                        <select
                          id="m-role"
                          value={newMemberRole}
                          onChange={(e) => setNewMemberRole(e.target.value)}
                          className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none bg-white"
                        >
                          <option value="Project Manager">Project Manager</option>
                          <option value="Developer">Developer</option>
                          <option value="Designer">Designer</option>
                          <option value="QA Engineer">QA Engineer</option>
                          <option value="Product Owner">Product Owner</option>
                        </select>
                      </div>

                      {formError && (
                        <p className="text-xs text-rose-600 font-semibold">{formError}</p>
                      )}

                      <button
                        type="submit"
                        className="w-full rounded-xl bg-violet-600 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-violet-700"
                      >
                        Add Member
                      </button>
                    </form>
                  </div>

                  {/* Card: Assign Tasks */}
                  <div className="rounded-3xl border border-violet-100 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-900">Assign Project & Task</h2>
                    <p className="text-xs text-slate-500 mt-1">Assign work to active team members</p>

                    <form onSubmit={handleAssignTask} className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="select-m" className="text-xs font-semibold text-slate-600">Choose Member</label>
                        <select
                          id="select-m"
                          value={selectedMemberId}
                          onChange={(e) => setSelectedMemberId(e.target.value)}
                          className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none bg-white"
                        >
                          <option value="">-- Choose Member --</option>
                          {teamMembers.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name} ({m.role})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="select-p" className="text-xs font-semibold text-slate-600">Choose Project</label>
                        <select
                          id="select-p"
                          value={selectedProjectId}
                          onChange={(e) => setSelectedProjectId(e.target.value)}
                          className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none bg-white"
                        >
                          <option value="">-- Choose Project --</option>
                          {projects.map((p) => (
                            <option key={p._id} value={p._id}>
                              {p.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="task-desc" className="text-xs font-semibold text-slate-600">Task Description</label>
                        <textarea
                          id="task-desc"
                          value={taskTitle}
                          onChange={(e) => setTaskTitle(e.target.value)}
                          placeholder="e.g. Write Tailwind utility layouts"
                          className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none"
                          rows={3}
                        />
                      </div>

                      {assignError && (
                        <p className="text-xs text-rose-600 font-semibold">{assignError}</p>
                      )}

                      <button
                        type="submit"
                        className="w-full rounded-xl bg-violet-600 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-violet-700"
                      >
                        Assign Task
                      </button>
                    </form>
                  </div>
                </div>

                {/* Team & active assignments columns */}
                <div className="space-y-6 lg:col-span-2">
                  {/* Card: Team Members Directory */}
                  <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-900">Team Directory</h2>
                    <p className="text-xs text-slate-500 mt-1">Manage active workspace users</p>

                    <div className="mt-4 overflow-hidden rounded-2xl border border-slate-150">
                      {teamMembers.length === 0 ? (
                        <p className="p-6 text-center text-sm text-slate-500">No team members registered yet.</p>
                      ) : (
                        <table className="min-w-full divide-y divide-slate-100 text-left">
                          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                            <tr>
                              <th className="px-4 py-3">Collaborator</th>
                              <th className="px-4 py-3">Role</th>
                              <th className="px-4 py-3">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                            {teamMembers.map((member) => (
                              <tr key={member.id} className="hover:bg-slate-50/50">
                                <td className="px-4 py-4">
                                  <p className="font-semibold text-slate-900">{member.name}</p>
                                  <p className="text-xs text-slate-400">{member.email}</p>
                                </td>
                                <td className="px-4 py-4">
                                  <span className="inline-flex rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-700">
                                    {member.role}
                                  </span>
                                </td>
                                <td className="px-4 py-4">
                                  <button
                                    onClick={() => handleDeleteMember(member.id)}
                                    className="text-xs font-semibold text-rose-500 hover:text-rose-700 transition"
                                  >
                                    Remove
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>

                  {/* Card: Active Assignments */}
                  <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-900">Active Task Assignments</h2>
                    <p className="text-xs text-slate-500 mt-1">Live tracking of distributed tasks</p>

                    <div className="mt-4 space-y-4">
                      {assignments.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                          No tasks have been assigned yet. Use the assignment panel to allocate work.
                        </div>
                      ) : (
                        assignments.map((assignment) => (
                          <div
                            key={assignment.id}
                            className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-5 sm:flex-row sm:items-center sm:justify-between hover:border-violet-100 hover:bg-violet-50/10 transition"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-violet-600 uppercase tracking-wider">
                                  {assignment.projectTitle}
                                </span>
                                <span className="text-[10px] text-slate-400">{assignment.assignedAt}</span>
                              </div>
                              <p className="text-sm font-semibold text-slate-900">{assignment.taskTitle}</p>
                              <p className="text-xs text-slate-500">
                                Assigned to: <span className="font-medium text-slate-700">{assignment.memberName}</span>
                              </p>
                            </div>
                            <div>
                              <button
                                onClick={() => handleDeleteAssignment(assignment.id)}
                                className="rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:border-rose-100 hover:bg-rose-50 hover:text-rose-600 transition shadow-sm"
                              >
                                Complete Task
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
