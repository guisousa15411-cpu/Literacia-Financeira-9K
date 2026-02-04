import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import {
  Plus,
  FileText,
  Trash2,
  Share2,
  ChevronDown,
  MessageSquare,
} from "lucide-react";
import { FileEditor } from "./FileEditor";
import { CreateFileModal } from "./CreateFileModal";

interface FileExplorerProps {
  project: any;
}

export const FileExplorer = ({ project }: FileExplorerProps) => {
  const { user } = useAuth();
  const [files, setFiles] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<any | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFiles();
  }, [project.id]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from("files")
        .select("*")
        .eq("project_id", project.id)
        .order("created_at", { ascending: false });

      setFiles(data || []);
    } catch (error) {
      console.error("Error loading files:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFile = async (name: string, type: string) => {
    try {
      const { data } = await supabase
        .from("files")
        .insert({
          project_id: project.id,
          name,
          type,
          created_by: user?.id,
        })
        .select()
        .single();

      if (data) {
        setFiles([data, ...files]);
        setSelectedFile(data);

        await supabase.from("file_versions").insert({
          file_id: data.id,
          version_number: 1,
          content: "",
          created_by: user?.id,
        });
      }
    } catch (error) {
      console.error("Error creating file:", error);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      await supabase.from("files").delete().eq("id", fileId);
      setFiles(files.filter((f) => f.id !== fileId));
      if (selectedFile?.id === fileId) {
        setSelectedFile(null);
      }
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  return (
    <div className="flex h-full">
      <div className="w-80 border-r border-slate-200 bg-white flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">
            {project.name}
          </h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            New File
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 bg-blue-200 rounded-full animate-pulse mx-auto mb-2"></div>
              <p className="text-sm text-slate-600">Loading files...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-600">No files yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {files.map((file) => (
                <button
                  key={file.id}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors group ${
                    selectedFile?.id === file.id
                      ? "bg-blue-100 text-blue-900"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileText className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate text-sm font-medium">
                        {file.name}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFile(file.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedFile ? (
          <FileEditor file={selectedFile} project={project} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">
            <FileText className="w-16 h-16 text-slate-300 mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              No file selected
            </h2>
            <p className="text-slate-600 mb-4">
              Create or select a file to get started
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create File
            </button>
          </div>
        )}
      </div>

      <CreateFileModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateFile}
      />
    </div>
  );
};
