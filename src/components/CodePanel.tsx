import { useState, useEffect, useCallback } from "react";
import { FileTree } from "./FileTree";
import { CodeEditor } from "./CodeEditor";
import { FileTabs } from "./FileTabs";
import { api, FileNode, OPEN_TABS_KEY, ACTIVE_TAB_KEY } from "@/lib/api";
import { FolderTree, X } from "lucide-react";
import { Button } from "./ui/button";

interface CodePanelProps {
  projectId: string;
  updatedFiles: Map<string, string>;
}

// Helper to find a file by path in the tree
function findFileInTree(files: FileNode[], targetPath: string): boolean {
  for (const node of files) {
    if (node.path === targetPath) return true;
    if (node.children && findFileInTree(node.children, targetPath)) return true;
  }
  return false;
}

// Storage key helpers
const getTabsKey = (projectId: string) => `${OPEN_TABS_KEY}_${projectId}`;
const getActiveTabKey = (projectId: string) => `${ACTIVE_TAB_KEY}_${projectId}`;

export function CodePanel({ projectId, updatedFiles }: CodePanelProps) {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [isLoadingTree, setIsLoadingTree] = useState(true);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Load tabs from localStorage
  useEffect(() => {
    const savedTabs = localStorage.getItem(getTabsKey(projectId));
    const savedActiveTab = localStorage.getItem(getActiveTabKey(projectId));
    
    if (savedTabs) {
      try {
        const tabs = JSON.parse(savedTabs);
        if (Array.isArray(tabs) && tabs.length > 0) {
          setOpenTabs(tabs);
          setActiveTab(savedActiveTab || tabs[0]);
          return;
        }
      } catch (e) {
        console.error("Failed to parse saved tabs:", e);
      }
    }
  }, [projectId]);

  // Save tabs to localStorage whenever they change
  useEffect(() => {
    if (openTabs.length > 0) {
      localStorage.setItem(getTabsKey(projectId), JSON.stringify(openTabs));
    } else {
      localStorage.removeItem(getTabsKey(projectId));
    }
  }, [openTabs, projectId]);

  // Save active tab to localStorage
  useEffect(() => {
    if (activeTab) {
      localStorage.setItem(getActiveTabKey(projectId), activeTab);
    } else {
      localStorage.removeItem(getActiveTabKey(projectId));
    }
  }, [activeTab, projectId]);

  // Load file tree
  useEffect(() => {
    const loadFiles = async () => {
      setIsLoadingTree(true);
      try {
        const fileTree = await api.getFiles(projectId);
        setFiles(fileTree);
        
        // If no tabs are open, default to pages/Index.tsx
        if (openTabs.length === 0) {
          const defaultPaths = ["src/pages/Index.tsx", "pages/Index.tsx"];
          for (const defaultPath of defaultPaths) {
            if (findFileInTree(fileTree, defaultPath)) {
              setOpenTabs([defaultPath]);
              setActiveTab(defaultPath);
              break;
            }
          }
        }
      } catch (error) {
        console.error("Failed to load files:", error);
      } finally {
        setIsLoadingTree(false);
      }
    };

    loadFiles();
  }, [projectId]);

  // Load file content when active tab changes
  useEffect(() => {
    if (!activeTab) {
      setFileContent("");
      return;
    }

    // Check if we have an updated version from streaming
    if (updatedFiles.has(activeTab)) {
      setFileContent(updatedFiles.get(activeTab)!);
      return;
    }

    const loadContent = async () => {
      setIsLoadingFile(true);
      try {
        const content = await api.getFileContent(projectId, activeTab);
        setFileContent(content);
      } catch (error) {
        console.error("Failed to load file:", error);
        setFileContent("// Error loading file");
      } finally {
        setIsLoadingFile(false);
      }
    };

    loadContent();
  }, [projectId, activeTab, updatedFiles]);

  // Update content when streaming updates arrive for active file
  useEffect(() => {
    if (activeTab && updatedFiles.has(activeTab)) {
      setFileContent(updatedFiles.get(activeTab)!);
    }
  }, [activeTab, updatedFiles]);

  const handleSelectFile = useCallback((path: string) => {
    // Add to tabs if not already open
    if (!openTabs.includes(path)) {
      setOpenTabs((prev) => [...prev, path]);
    }
    setActiveTab(path);
    // Auto-close sidebar on mobile after selecting a file
    setIsSidebarOpen(false);
  }, [openTabs]);

  const handleCloseTab = useCallback((path: string) => {
    setOpenTabs((prev) => {
      const newTabs = prev.filter((t) => t !== path);
      
      // If closing active tab, switch to another tab
      if (activeTab === path) {
        const closingIndex = prev.indexOf(path);
        const newActiveIndex = Math.min(closingIndex, newTabs.length - 1);
        setActiveTab(newTabs[newActiveIndex] || null);
      }
      
      return newTabs;
    });
  }, [activeTab]);

  const handleSelectTab = useCallback((path: string) => {
    setActiveTab(path);
  }, []);

  return (
    <div className="flex h-full bg-[#060913] dark:bg-[#060913] light:bg-[#F8FAFC] relative overflow-hidden">
      {/* Mobile Sidebar Overlay Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-20 md:hidden backdrop-blur-xs" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* File Tree Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-[#080C17] dark:bg-[#080C17] light:bg-[#F1F5F9] border-r border-white/10 dark:border-white/10 light:border-black/10 overflow-y-auto transition-transform duration-200 ease-in-out
        md:static md:translate-x-0 md:w-56 md:shrink-0 md:z-auto
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className="px-3.5 py-2.5 border-b border-white/10 dark:border-white/10 light:border-black/10 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] dark:text-[#94A3B8] light:text-[#475569]">Files</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-[#94A3B8] hover:text-white md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <FileTree
          files={files}
          selectedPath={activeTab}
          onSelectFile={handleSelectFile}
          isLoading={isLoadingTree}
        />
      </div>

      {/* Code Editor with Tabs */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#060913] dark:bg-[#060913] light:bg-[#F8FAFC]">
        <div className="flex items-center border-b border-white/10 dark:border-white/10 light:border-black/10 bg-[#04060E] dark:bg-[#04060E] light:bg-[#E2E8F0]">
          {/* Mobile File Tree Toggle Rail Icon */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-[#94A3B8] dark:text-[#94A3B8] light:text-[#475569] hover:text-[#F8FAFC] hover:bg-[#4F8CFF]/20 active:bg-[#4F8CFF]/30 active:scale-95 md:hidden shrink-0 border-r border-white/10 dark:border-white/10 light:border-black/10 rounded-none transition-all duration-150 motion-reduce:transition-none cursor-pointer group relative"
            onClick={() => setIsSidebarOpen(true)}
            title="Files — Toggle Directory Tree"
            aria-label="Toggle File Tree"
          >
            <FolderTree className="w-4 h-4 text-[#7CC7FF] dark:text-[#7CC7FF] light:text-[#0284C7] group-hover:scale-110 transition-transform duration-150 motion-reduce:transition-none" />
          </Button>

          {/* File Tabs */}
          <div className="flex-1 min-w-0">
            <FileTabs
              openTabs={openTabs}
              activeTab={activeTab}
              onSelectTab={handleSelectTab}
              onCloseTab={handleCloseTab}
            />
          </div>
        </div>
        
        {/* Editor */}
        <div className="flex-1 overflow-hidden">
          <CodeEditor
            content={fileContent}
            filePath={activeTab}
            isLoading={isLoadingFile}
          />
        </div>
      </div>
    </div>
  );
}
