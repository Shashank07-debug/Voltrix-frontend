import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileTabsProps {
  openTabs: string[];
  activeTab: string | null;
  onSelectTab: (path: string) => void;
  onCloseTab: (path: string) => void;
}

// Helper to get filename from path
const getFileName = (path: string) => path.split('/').pop() || path;

// Get file dot color based on extension / file type
const getFileDotColor = (path: string) => {
  const lower = path.toLowerCase();
  
  if (lower.includes('config') || lower.includes('package.json') || lower.includes('tsconfig')) {
    return 'bg-[#F59E0B]'; // Amber for config
  }
  if (lower.endsWith('.d.ts') || lower.includes('types.ts')) {
    return 'bg-[#60A5FA]'; // Soft blue for types
  }

  const ext = path.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'tsx':
    case 'ts':
      return 'bg-[#38BDF8]'; // Cyan-blue for React/TS
    case 'jsx':
    case 'js':
      return 'bg-[#FBBF24]';
    case 'css':
    case 'scss':
      return 'bg-[#F472B6]'; // Pink for CSS
    case 'json':
      return 'bg-[#F59E0B]';
    default:
      return 'bg-[#94A3B8]';
  }
};

export function FileTabs({ openTabs, activeTab, onSelectTab, onCloseTab }: FileTabsProps) {
  if (openTabs.length === 0) return null;

  return (
    <div className="relative flex-1 min-w-0 bg-[#060913] dark:bg-[#060913] light:bg-[#E2E8F0]">
      <div className="flex items-center border-b border-white/10 dark:border-white/10 light:border-black/10 bg-[#060913] dark:bg-[#060913] light:bg-[#E2E8F0] overflow-x-auto select-none no-scrollbar touch-pan-x pr-8">
        {openTabs.map((path) => {
          const isActive = activeTab === path;
          return (
            <div
              key={path}
              className={cn(
                "group relative flex items-center gap-2 px-3 py-2 text-xs border-r border-white/5 dark:border-white/5 light:border-black/5 cursor-pointer transition-all duration-150 shrink-0 motion-reduce:transition-none min-w-[100px] max-w-[160px]",
                isActive
                  ? "bg-[#0F172A] dark:bg-[#0F172A] light:bg-[#FFFFFF] text-[#F8FAFC] dark:text-[#F8FAFC] light:text-[#0F172A] font-semibold border-t-2 border-t-[#4F8CFF] shadow-sm"
                  : "bg-[#04060E] dark:bg-[#04060E] light:bg-[#F1F5F9] text-[#64748B] dark:text-[#64748B] light:text-[#64748B] hover:text-[#CBD5E1] dark:hover:text-[#CBD5E1] light:hover:text-[#0F172A] hover:bg-white/[0.04] dark:hover:bg-white/[0.04] light:hover:bg-black/[0.04] border-t-2 border-t-transparent"
              )}
              onClick={() => onSelectTab(path)}
              title={path}
            >
              <span className={cn("shrink-0 w-2 h-2 rounded-full", getFileDotColor(path))} />
              <span className="truncate flex-1 font-mono text-[12px]">{getFileName(path)}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(path);
                }}
                className={cn(
                  "shrink-0 p-1 rounded-full hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-black/10 text-[#94A3B8] dark:text-[#94A3B8] light:text-[#64748B] hover:text-white dark:hover:text-white light:hover:text-[#0F172A] transition-all duration-150 cursor-pointer motion-reduce:transition-none",
                  isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}
                title="Close tab"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>
      {/* Right Edge Gradient Fade Hint for Overflow Scrolling */}
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#060913] dark:from-[#060913] light:from-[#E2E8F0] via-[#060913]/80 dark:via-[#060913]/80 light:via-[#E2E8F0]/80 to-transparent z-10" />
    </div>
  );
}
