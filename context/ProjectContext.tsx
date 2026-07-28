"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { useAuth } from "./AuthContext";

export interface ProjectType {
  _id: string;
  title: string;
  status: "todo" | "in-progress" | "completed";
  user: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectContextType {
  projects: ProjectType[];
  loading: boolean;
  addProject: (title: string) => Promise<void>;
  updateProject: (id: string, updates: { title?: string; status?: string }) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProjects = useCallback(async () => {
    if (!isAuthenticated) {
      setProjects([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects);
      }
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const addProject = async (title: string) => {
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (res.ok) {
        const data = await res.json();
        setProjects((prev) => [data.project, ...prev]);
      } else {
        const data = await res.json();
        throw new Error(data.error || "Failed to add project");
      }
    } catch (err) {
      console.error("Add project error:", err);
      throw err;
    }
  };

  const updateProject = async (id: string, updates: { title?: string; status?: string }) => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        setProjects((prev) =>
          prev.map((proj) => (proj._id === id ? data.project : proj))
        );
      } else {
        const data = await res.json();
        throw new Error(data.error || "Failed to update project");
      }
    } catch (err) {
      console.error("Update project error:", err);
      throw err;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setProjects((prev) => prev.filter((proj) => proj._id !== id));
      } else {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete project");
      }
    } catch (err) {
      console.error("Delete project error:", err);
      throw err;
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        loading,
        addProject,
        updateProject,
        deleteProject,
        refreshProjects: fetchProjects,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProjects must be used within a ProjectProvider");
  }
  return context;
}
