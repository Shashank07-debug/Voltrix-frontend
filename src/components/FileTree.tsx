import { useState } from "react";
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, FileCode, FileJson, FileText, Image } from "lucide-react";
import { FileNode } from "@/lib/api";
import { cn } from "@/lib/utils";

interface FileTreeProps {
  files: FileNode[];
  selectedPath: string | null;
  onSelectFile: (path: string) => void;
  isLoading?: boolean;
}

const getFileIcon = (name: string) => {
  const ext = name.split(".").pop()?.toLowerCase();
  
  switch (ext) {
    case "ts":
    case "tsx":
    case "js":
    case "jsx":
      return FileCode;
    case "json":
      return FileJson;
    case "md":
    case "txt":
      return FileText;
    case "png":
    case "jpg":
    case "jpeg":
    case "svg":
    case "gif":
      return Image;
    default:
      return File;
  }
};

const getFileColor = (name: string) => {
  const lower = name.toLowerCase();
  
  // Config files get amber highlight
  if (lower.includes('config') || lower === 'package.json' || lower.includes('tsconfig')) {
    return "text-[#F59E0B]";
  }

  // Type definition files get soft blue
  if (lower.endsWith('.d.ts') || lower === 'types.ts') {
    return "text-[#60A5FA]";
  }

  const ext = name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "ts":
    case "tsx":
      return "text-[#38BDF8]"; // React/TS cyan-blue
    case "js":
    case "jsx":
      return "text-[#FBBF24]";
    case "json":
      return "text-[#F59E0B]";
    case "css":
    case "scss":
      return "text-[#F472B6]"; // Pink for styles
    case "html":
      return "text-[#FB923C]";
    default:
      return "text-[#94A3B8]";
  }
};

interface FileTreeItemProps {
  node: FileNode;
  depth: number;
  selectedPath: string | null;
  onSelectFile: (path: string) => void;
}

function FileTreeItem({ node, depth, selectedPath, onSelectFile }: FileTreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  
  const isDirectory = node.type === "directory";
  const isSelected = selectedPath === node.path;
  const FileIcon = isDirectory ? (isExpanded ? FolderOpen : Folder) : getFileIcon(node.name);
  const fileColor = isDirectory ? "text-[#F59E0B]" : getFileColor(node.name);

  const handleClick = () => {
    if (isDirectory) {
      setIsExpanded(!isExpanded);
    } else {
      onSelectFile(node.path);
    }
  };

  return (
    <div>
      <div
        className={cn(
          "group flex items-center gap-2 px-2.5 py-1.5 my-0.5 rounded-r-md text-xs cursor-pointer transition-all duration-150 select-none motion-reduce:transition-none",
          isDirectory
            ? "font-semibold text-[#F1F5F9] dark:text-[#F1F5F9] light:text-[#0F172A] hover:bg-white/[0.04] dark:hover:bg-white/[0.04] light:hover:bg-black/[0.04]"
            : isSelected
              ? "bg-[#1E293B] dark:bg-[#1E293B] light:bg-[#E2E8F0] text-[#F8FAFC] dark:text-[#F8FAFC] light:text-[#0F172A] font-medium border-l-2 border-l-[#4F8CFF]"
              : "text-[#94A3B8] dark:text-[#94A3B8] light:text-[#475569] hover:text-[#E2E8F0] dark:hover:text-[#E2E8F0] light:hover:text-[#0F172A] hover:bg-white/[0.04] dark:hover:bg-white/[0.04] light:hover:bg-black/[0.04]"
        )}
        style={{ paddingLeft: `${depth * 12 + 10}px` }}
        onClick={handleClick}
      >
        {isDirectory ? (
          <>
            <span className="shrink-0 text-[#64748B] dark:text-[#64748B] light:text-[#64748B] group-hover:text-[#94A3B8] dark:group-hover:text-[#94A3B8] light:group-hover:text-[#0F172A] transition-colors duration-150">
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </span>
            <FileIcon className={cn("w-4 h-4 shrink-0", fileColor)} />
            <span className="truncate font-semibold text-[#F1F5F9] dark:text-[#F1F5F9] light:text-[#0F172A] text-[13px]">{node.name}</span>
          </>
        ) : (
          <>
            <span className="w-3.5 shrink-0" />
            <FileIcon className={cn("w-4 h-4 shrink-0", fileColor)} />
            <span className={cn("truncate text-[13px]", isSelected ? "font-medium text-[#F8FAFC] dark:text-[#F8FAFC] light:text-[#0F172A]" : "text-[#94A3B8] dark:text-[#94A3B8] light:text-[#475569]")}>
              {node.name}
            </span>
          </>
        )}
      </div>
      
      {isDirectory && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeItem
              key={child.path}
              node={child}
              depth={depth + 1}
              selectedPath={selectedPath}
              onSelectFile={onSelectFile}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileTree({ files, selectedPath, onSelectFile, isLoading }: FileTreeProps) {
  if (isLoading) {
    return (
      <div className="p-4 space-y-2.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-2 animate-pulse">
            <div className="w-4 h-4 bg-white/10 rounded" />
            <div className="h-4 bg-white/10 rounded flex-1" style={{ width: `${50 + i * 10}%` }} />
          </div>
        ))}
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="p-4 text-center text-[#64748B] text-xs font-mono">
        No files yet
      </div>
    );
  }

  return (
    <div className="py-2 px-1">
      {files.map((node) => (
        <FileTreeItem
          key={node.path}
          node={node}
          depth={0}
          selectedPath={selectedPath}
          onSelectFile={onSelectFile}
        />
      ))}
    </div>
  );
}
