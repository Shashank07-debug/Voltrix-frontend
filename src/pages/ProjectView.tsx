import { useState, useCallback, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Code, Sparkles, LogOut, RotateCcw, Maximize2, RefreshCw, MoreVertical, Trash, Download, Edit } from "lucide-react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ChatPanel, ChatMessage } from "@/components/ChatPanel";
import { CodePanel } from "@/components/CodePanel";
import { PreviewPanel } from "@/components/PreviewPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { api, isAuthenticated, removeAuthToken, getUserInfo, removeUserInfo } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { RuntimeErrorAlert, RuntimeError } from "@/components/RuntimeErrorAlert";
import { generateGradient, cn } from "@/lib/utils";
import { ProjectResponse } from "@/lib/types";
import { ShareDialog } from "@/components/ShareDialog";
import { ThemeToggle } from "@/components/ThemeToggle";

type ViewMode = "code" | "preview";

export function ProjectView() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("preview");
  const [updatedFiles, setUpdatedFiles] = useState<Map<string, string>>(new Map());
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [runtimeError, setRuntimeError] = useState<RuntimeError | null>(null);
  const [project, setProject] = useState<ProjectResponse | null>(null);

  // Rename state
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [renameName, setRenameName] = useState("");

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Track edited files for current streaming response
  const currentEditedFilesRef = useRef<string[]>([]);
  const abortRef = useRef<(() => void) | null>(null);

  // Abort ongoing stream on unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current();
      }
    };
  }, []);

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
    }
  }, [navigate]);

  // Load chat history on mount
  useEffect(() => {
    if (!projectId) return;

    const loadData = async () => {
      setIsLoadingHistory(true);
      try {
        const [history, projectData] = await Promise.all([
          api.getChatHistory(projectId),
          api.getProject(projectId)
        ]);

        const formattedMessages: ChatMessage[] = history.map((msg) => ({
          id: msg.id.toString(),
          role: msg.role === "USER" ? "user" : "assistant",
          content: msg.content,
          createdAt: msg.createdAt,
          events: msg.events,
        }));
        setMessages(formattedMessages);
        setProject(projectData);
      } catch (error) {
        console.error("Failed to load project data:", error);
        toast({
          title: "Error",
          description: "Failed to load project data",
          variant: "destructive"
        });
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadData();
  }, [projectId, toast]);

  const handleLogout = () => {
    removeAuthToken();
    removeUserInfo();
    navigate("/login");
  };

  const handleSendMessage = useCallback((content: string) => {
    if (!projectId) return;

    // Abort active stream if sending another message
    if (abortRef.current) {
      abortRef.current();
      abortRef.current = null;
    }

    // Reset edited files tracker
    currentEditedFilesRef.current = [];

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content,
      createdAt: new Date().toISOString(),
      events: [],
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsStreaming(true);

    const abort = api.streamChat(
      projectId,
      content,
      (chunk) => {
        setMessages((prev) => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg && lastMsg.role === "assistant") {
            const updatedEvents = [...lastMsg.events];

            const thoughtEventIndex = updatedEvents.findIndex(
              (e) => e.type === "THOUGHT"
            );
            if (thoughtEventIndex !== -1) {
              updatedEvents[thoughtEventIndex] = {
                ...updatedEvents[thoughtEventIndex],
                content: updatedEvents[thoughtEventIndex].content + chunk,
              };
            } else {
              updatedEvents.push({
                type: "THOUGHT" as any,
                content: chunk,
              });
            }

            return [
              ...prev.slice(0, -1),
              {
                ...lastMsg,
                events: updatedEvents,
              },
            ];
          } else {
            return [
              ...prev,
              {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                events: [
                  {
                    type: "THOUGHT" as any,
                    content: chunk,
                  },
                ],
                createdAt: new Date().toISOString(),
              },
            ];
          }
        });
      },
      (filePath, fileContent) => {
        currentEditedFilesRef.current.push(filePath);

        setMessages((prev) => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg && lastMsg.role === "assistant") {
            return [
              ...prev.slice(0, -1),
              {
                ...lastMsg,
                events: [
                  ...lastMsg.events,
                  {
                    type: "FILE_EDIT" as any,
                    content: fileContent,
                    filePath: filePath,
                  },
                ],
              },
            ];
          }
          return prev;
        });

        setUpdatedFiles((prev) => {
          const next = new Map(prev);
          next.set(filePath, fileContent);
          return next;
        });
      },
      () => {
        setIsStreaming(false);
        abortRef.current = null;

        if (currentEditedFilesRef.current.length > 0) {
          const editedFilesList = [...currentEditedFilesRef.current];

          api.getFiles(projectId).then(() => {
            setUpdatedFiles((prev) => {
              const next = new Map(prev);
              editedFilesList.forEach((path) => {
                if (!next.has(path)) {
                  next.set(path, "");
                }
              });
              return next;
            });
          }).catch(err => console.error("Failed to refresh file tree:", err));
        }
      },
      (error) => {
        setIsStreaming(false);
        abortRef.current = null;

        const errorMessage = error.message || "Failed to send message";
        if (errorMessage.includes("Compilation Failed") || errorMessage.includes("Error:")) {
          setRuntimeError({
            message: errorMessage,
            stack: error.stack,
          });
        }

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    );

    abortRef.current = abort;
    return abort;
  }, [projectId, toast]);

  // Listen for runtime errors from the preview iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Security check: ensure message is from our expected source if possible
      // In local dev, origins might be localhost:5173 or localhost:8082

      const data = event.data;
      if (data?.type === 'PreviewError') {
        const error = data.payload;
        console.log("Caught runtime error:", error);
        setRuntimeError({
          message: error.message,
          source: data.subType,
          stack: error.stack,
          filename: error.source, // Map filename from payload source
          lineno: error.lineno,
          colno: error.colno,
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleFixError = () => {
    if (!runtimeError) return;
    const fixPrompt = `Fix this runtime error:\n${runtimeError.message}`;
    setRuntimeError(null);
    handleSendMessage(fixPrompt);
  };

  const openRenameDialog = () => {
    setRenameName(project?.name || "");
    setIsRenameDialogOpen(true);
  };

  const handleRenameSubmit = async () => {
    if (!projectId || !renameName.trim()) return;

    try {
      const updated = await api.updateProject(projectId, renameName.trim());
      setProject(updated);
      toast({
        title: "Success",
        description: "Project renamed successfully",
      });
      setIsRenameDialogOpen(false);
    } catch (error) {
      console.error("Failed to rename project:", error);
      toast({
        title: "Error",
        description: "Failed to rename project",
        variant: "destructive",
      });
    }
  };

  const handleDownloadProject = async () => {
    if (!projectId || !project) return;

    try {
      toast({
        title: "Preparing download...",
        description: "Zipping project files",
      });

      const blob = await api.downloadProjectZip(projectId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Project downloaded successfully",
      });
    } catch (error) {
      console.error("Failed to download project:", error);
      toast({
        title: "Error",
        description: "Failed to download project zip",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProject = async () => {
    if (!projectId || !project) return;

    if (!confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.deleteProject(projectId);
      toast({
        title: "Project deleted",
        description: `"${project.name}" has been deleted.`,
      });
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to delete project:", error);
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    }
  };

  if (!projectId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Invalid project ID</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="min-h-12 py-1 shrink-0 border-b border-white/10 dark:border-white/10 light:border-black/10 bg-[#060913] dark:bg-[#060913] light:bg-[#FFFFFF] flex flex-wrap sm:flex-nowrap items-center justify-between px-2 sm:px-3 gap-1.5 sm:gap-2 transition-colors duration-200">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          {project ? (
            <>
              <div className="w-7 h-7 rounded-xl font-black font-mono text-xs shrink-0 flex items-center justify-center shadow-md voltrix-avatar-dark-gradient text-white">
                {project.name ? project.name.charAt(0).toUpperCase() : "P"}
              </div>
              <span className="font-extrabold text-xs sm:text-sm text-[#F5F7FF] dark:text-[#F5F7FF] light:text-[#0F172A] truncate max-w-[100px] sm:max-w-[180px] md:max-w-none">{project.name}</span>
            </>
          ) : (
            <>
              <div className="w-7 h-7 rounded-xl bg-[#4F8CFF]/20 border border-[#4F8CFF]/40 flex items-center justify-center text-[#7CC7FF] dark:text-[#7CC7FF] light:text-[#0284C7]">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-xs sm:text-sm text-[#A7B0C5] dark:text-[#A7B0C5] light:text-[#475569]">Loading...</span>
            </>
          )}
          <span className="text-[#64748B] text-xs ml-1 font-mono hidden md:inline-block">Previewing last saved version</span>
          {project?.role !== 'VIEWER' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 ml-1 text-[#64748B] hover:text-[#F5F7FF] dark:hover:text-[#F5F7FF] light:hover:text-[#0F172A] hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-black/5 shrink-0">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="voltrix-glass-card border border-[#150160]/60 p-1.5 text-[#F5F7FF] dark:text-[#F5F7FF] light:text-[#0F172A] w-44 shadow-2xl">
                <DropdownMenuItem onClick={openRenameDialog} className="cursor-pointer text-xs font-semibold focus:bg-[#4F8CFF]/15 text-[#E8F4FF] dark:text-[#E8F4FF] light:text-[#0F172A] rounded-lg">
                  <Edit className="w-3.5 h-3.5 mr-2 text-[#7CC7FF] dark:text-[#7CC7FF] light:text-[#0284C7]" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadProject} className="cursor-pointer text-xs font-semibold focus:bg-[#4F8CFF]/15 text-[#E8F4FF] dark:text-[#E8F4FF] light:text-[#0F172A] rounded-lg">
                  <Download className="w-3.5 h-3.5 mr-2 text-[#7CC7FF] dark:text-[#7CC7FF] light:text-[#0284C7]" />
                  Download ZIP
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10 dark:bg-white/10 light:bg-black/10" />
                <DropdownMenuItem className="text-red-400 focus:text-red-300 focus:bg-red-500/15 cursor-pointer text-xs font-semibold rounded-lg" onClick={handleDeleteProject}>
                  <Trash className="w-3.5 h-3.5 mr-2 text-red-400" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#0A0E1A] dark:bg-[#0A0E1A] light:bg-[#F1F5F9] rounded-lg p-0.5 border border-white/10 dark:border-white/10 light:border-black/10">
            <button
              onClick={() => setViewMode("preview")}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 text-xs font-bold transition-all rounded-md cursor-pointer ${
                viewMode === "preview"
                  ? "bg-gradient-to-r from-[#4F8CFF] to-[#38BDF8] text-white shadow-[0_0_12px_rgba(79,140,255,0.35)] border border-[#7CC7FF]/40"
                  : "text-[#94A3B8] dark:text-[#94A3B8] light:text-[#64748B] hover:text-[#F5F7FF] dark:hover:text-[#F5F7FF] light:hover:text-[#0F172A] hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-black/5"
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Preview</span>
            </button>
            <button
              onClick={() => setViewMode("code")}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 text-xs font-bold transition-all rounded-md cursor-pointer ${
                viewMode === "code"
                  ? "bg-gradient-to-r from-[#4F8CFF] to-[#38BDF8] text-white shadow-[0_0_12px_rgba(79,140,255,0.35)] border border-[#7CC7FF]/40"
                  : "text-[#94A3B8] dark:text-[#94A3B8] light:text-[#64748B] hover:text-[#F5F7FF] dark:hover:text-[#F5F7FF] light:hover:text-[#0F172A] hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-black/5"
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Code</span>
            </button>
          </div>

          {project && (
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 bg-[#0A0E1A] dark:bg-[#0A0E1A] light:bg-[#F1F5F9] rounded-full border border-white/10 dark:border-white/10 light:border-black/10 shadow-sm">
              <Avatar className="h-5 w-5 sm:h-6 sm:w-6 border border-white/15 dark:border-white/15 light:border-black/10">
                <AvatarFallback className="text-[10px] voltrix-avatar-dark-gradient font-extrabold text-white">
                  {(() => {
                    const userInfo = getUserInfo();
                    if (userInfo?.name) {
                      return userInfo.name.charAt(0).toUpperCase();
                    }
                    return "U";
                  })()}
                </AvatarFallback>
              </Avatar>
              {project.role && (
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-lg border border-white/10 dark:border-white/10 light:border-black/10 bg-white/[0.06] dark:bg-white/[0.06] light:bg-black/[0.05] text-[#A7B0C5] dark:text-[#A7B0C5] light:text-[#334155] font-mono shadow-sm">
                  {project.role}
                </span>
              )}
            </div>
          )}

          <ShareDialog
            projectId={projectId}
            trigger={
              <Button variant="outline" size="sm" className="h-7 sm:h-8 px-2 sm:px-3 text-xs font-medium" disabled={project?.role === 'VIEWER'}>
                Share
              </Button>
            }
          />
          {project?.role !== 'VIEWER' && (
            <>
              <Button variant="outline" size="sm" className="h-7 sm:h-8 px-2 sm:px-3 text-xs hidden md:inline-flex">
                Upgrade
              </Button>
              <Button size="sm" className="h-7 sm:h-8 px-2 sm:px-3 text-xs bg-primary hover:bg-primary/90 hidden sm:inline-flex">
                Publish
              </Button>
            </>
          )}
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-foreground shrink-0"
          >
            <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction={isMobile ? "vertical" : "horizontal"} className="h-full">
          {/* Chat Panel */}
          <ResizablePanel defaultSize={isMobile ? 50 : 35} minSize={isMobile ? 30 : 25} maxSize={isMobile ? 70 : 50}>
            <div className="h-full border-b md:border-b-0 md:border-r border-border/50 bg-panel">
              <ChatPanel
                messages={messages}
                onSendMessage={handleSendMessage}
                isStreaming={isStreaming}
                isLoading={isLoadingHistory}
                readOnly={project?.role === 'VIEWER'}
              />
            </div>
          </ResizablePanel>

          <ResizableHandle className={cn(isMobile ? "h-px w-full" : "w-px h-full", "bg-border/50 hover:bg-primary/50 transition-colors")} />

          {/* Code/Preview Panel */}
          <ResizablePanel defaultSize={isMobile ? 50 : 65} minSize={isMobile ? 30 : 50} maxSize={isMobile ? 70 : 75}>
            <div className="h-full">
              <div className="h-full relative">
                <div className={cn("h-full absolute inset-0", viewMode !== "code" && "hidden")}>
                  <CodePanel projectId={projectId} updatedFiles={updatedFiles} />
                </div>
                <div className={cn("h-full absolute inset-0", viewMode !== "preview" && "hidden")}>
                  <PreviewPanel
                    projectId={projectId}
                    runtimeError={runtimeError}
                    onDismiss={() => setRuntimeError(null)}
                    onFix={handleFixError}
                  />
                </div>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Project</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={renameName}
              onChange={(e) => setRenameName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRenameSubmit()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleRenameSubmit} disabled={!renameName.trim() || renameName === project?.name}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  );
}
