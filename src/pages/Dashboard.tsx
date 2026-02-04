import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { Plus, LogOut, Menu, X, FileText, Users, Clock } from "lucide-react";
import { ProjectCard } from "../components/ProjectCard";
import { FileExplorer } from "../components/FileExplorer";
import { CreateProjectModal } from "../components/CreateProjectModal";

export const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"projects" | "shared" | "recent">(
    "projects"
  );

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from("projects")
        .select("*")
        .eq("owner_id", user?.id)
        .order("created_at", { ascending: false });

      setProjects(data || []);
      if (data && data.length > 0) {
        setSelectedProject(data[0]);
      }
    } catch (error) {
      console.error("Error loading projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (name: string, description: string) => {
    try {
      const { data } = await supabase
        .from("projects")
        .insert({
          owner_id: user?.id,
          name,
          description,
        })
        .select()
        .single();

      if (data) {
        setProjects([data, ...projects]);
        setSelectedProject(data);
      }
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } bg-white border-r border-slate-200 transition-all duration-300 overflow-hidden flex flex-col`}
      >
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-slate-900">CollaboFlow</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1 mb-6">
            <button
              onClick={() => setActiveTab("projects")}
              className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors ${
                activeTab === "projects"
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              My Projects
            </button>
            <button
              onClick={() => setActiveTab("shared")}
              className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors ${
                activeTab === "shared"
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Shared with me
            </button>
            <button
              onClick={() => setActiveTab("recent")}
              className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors ${
                activeTab === "recent"
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Clock className="w-4 h-4 inline mr-2" />
              Recent
            </button>
          </div>

          <div className="space-y-2">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors ${
                  selectedProject?.id === project.id
                    ? "bg-blue-100 text-blue-900"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span className="text-xl mr-2">{project.icon || "📁"}</span>
                <span className="truncate">{project.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-200 p-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
          <button
            onClick={handleSignOut}
            className="w-full mt-2 text-slate-600 hover:text-slate-900 font-medium py-2.5 rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <div className="border-b border-slate-200 bg-white p-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-600 hover:text-slate-900"
          >
            {sidebarOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{user?.email}</span>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-blue-900">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-200 rounded-full animate-pulse mx-auto mb-4"></div>
                <p className="text-slate-600">Loading projects...</p>
              </div>
            </div>
          ) : selectedProject ? (
            <FileExplorer project={selectedProject} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center">
              <FileText className="w-16 h-16 text-slate-300 mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                No projects yet
              </h2>
              <p className="text-slate-600 mb-4">Create your first project to get started</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Project
              </button>
            </div>
          )}
        </div>
      </main>

      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateProject}
      />
    </div>
  );
};
