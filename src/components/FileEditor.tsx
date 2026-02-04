import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import {
  Save,
  MessageSquare,
  Clock,
  Users,
  ChevronDown,
  Copy,
} from "lucide-react";

interface FileEditorProps {
  file: any;
  project: any;
}

export const FileEditor = ({ file, project }: FileEditorProps) => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [showVersions, setShowVersions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    loadContent();
    loadVersions();
    loadComments();
    loadMembers();
  }, [file.id]);

  const loadContent = async () => {
    try {
      const { data } = await supabase
        .from("file_versions")
        .select("*")
        .eq("file_id", file.id)
        .order("version_number", { ascending: false })
        .limit(1);

      if (data && data[0]) {
        setContent(data[0].content);
      }
    } catch (error) {
      console.error("Error loading content:", error);
    }
  };

  const loadVersions = async () => {
    try {
      const { data } = await supabase
        .from("file_versions")
        .select("*")
        .eq("file_id", file.id)
        .order("version_number", { ascending: false });

      setVersions(data || []);
    } catch (error) {
      console.error("Error loading versions:", error);
    }
  };

  const loadComments = async () => {
    try {
      const { data } = await supabase
        .from("comments")
        .select("*, author_id(*)")
        .eq("file_id", file.id)
        .order("created_at", { ascending: false });

      setComments(data || []);
    } catch (error) {
      console.error("Error loading comments:", error);
    }
  };

  const loadMembers = async () => {
    try {
      const { data } = await supabase
        .from("project_members")
        .select("*, user_id(*)")
        .eq("project_id", project.id);

      setMembers(data || []);
    } catch (error) {
      console.error("Error loading members:", error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const nextVersion = versions.length + 1;

      await supabase.from("file_versions").insert({
        file_id: file.id,
        version_number: nextVersion,
        content,
        created_by: user?.id,
      });

      await supabase
        .from("activity_log")
        .insert({
          project_id: project.id,
          user_id: user?.id,
          action: "updated",
          resource_type: "file",
          resource_id: file.id,
        });

      loadVersions();
    } catch (error) {
      console.error("Error saving file:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const { data } = await supabase
        .from("comments")
        .insert({
          file_id: file.id,
          author_id: user?.id,
          content: newComment,
        })
        .select()
        .single();

      if (data) {
        setComments([data, ...comments]);
        setNewComment("");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 bg-white p-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{file.name}</h1>
          <p className="text-xs text-slate-500 mt-1">{file.type}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowVersions(!showVersions)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Clock className="w-5 h-5 text-slate-600" />
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <MessageSquare className="w-5 h-5 text-slate-600" />
          </button>
          <button
            onClick={() => setShowVersions(!showVersions)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Users className="w-5 h-5 text-slate-600" />
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="ml-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 p-6 font-mono text-sm resize-none border-none focus:outline-none bg-white"
            placeholder="Start typing..."
          />
        </div>

        {showVersions && (
          <div className="w-72 border-l border-slate-200 bg-slate-50 flex flex-col">
            <div className="p-4 border-b border-slate-200 font-semibold text-slate-900">
              Version History
            </div>
            <div className="flex-1 overflow-y-auto">
              {versions.map((version) => (
                <button
                  key={version.id}
                  className="w-full text-left p-4 border-b border-slate-200 hover:bg-slate-100 transition-colors group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-900">
                      v{version.version_number}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setContent(version.content);
                        setShowVersions(false);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-blue-100 rounded"
                    >
                      <Copy className="w-3 h-3 text-blue-600" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">
                    {new Date(version.created_at).toLocaleString()}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {showComments && (
          <div className="w-72 border-l border-slate-200 bg-slate-50 flex flex-col">
            <div className="p-4 border-b border-slate-200 font-semibold text-slate-900">
              Comments
            </div>
            <div className="flex-1 overflow-y-auto">
              {comments.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-600">
                  No comments yet
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {comments.map((comment) => (
                    <div key={comment.id} className="p-4">
                      <p className="text-xs font-medium text-slate-900">
                        You
                      </p>
                      <p className="text-sm text-slate-700 mt-1">
                        {comment.content}
                      </p>
                      <p className="text-xs text-slate-500 mt-2">
                        {new Date(comment.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                />
                <button
                  onClick={handleAddComment}
                  className="px-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
