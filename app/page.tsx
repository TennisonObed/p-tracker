import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import AddProjectForm from "@/components/AddProjectForm";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Project } from "@/lib/models/Project";
import { User } from "@/lib/models/User";

export default async function Home() {
  const token = (await cookies()).get("token")?.value;
  const payload = token ? verifyToken(token) : null;

  // Middleware only checks that a token cookie exists (it can't verify a JWT
  // signature in the Edge runtime), so this route must independently verify
  // it before touching the database. Reject expired/tampered tokens here.
  if (!payload) {
    redirect("/login");
  }

  await connectDB();

  const [user, projects] = await Promise.all([
    User.findById(payload.userId).select("name").lean(),
    Project.find({ user: payload.userId }).sort({ createdAt: -1 }).lean(),
  ]);

  if (!user) {
    redirect("/login");
  }

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
                  Welcome back, {user.name || "User"}
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
                <AddProjectForm />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
