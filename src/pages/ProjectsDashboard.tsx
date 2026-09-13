import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { 
  Plus, 
  LogOut, 
  Search, 
  Folder, 
  Loader2, 
  MoreVertical, 
  Trash, 
  Download, 
  Edit, 
  Sparkles, 
  Layers, 
  ArrowUpRight, 
  Terminal, 
  ShieldCheck, 
  Cpu, 
  Code2, 
  Clock,
  CheckCircle2,
  FileCode
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { api, removeAuthToken, removeUserInfo, getUserInfo } from "@/lib/api";
import { ProjectSummaryResponse } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ShareDialog } from "@/components/ShareDialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ThreeDCanvas } from "@/components/ThreeDCanvas";

export interface SnippetToken {
    text: string;
    type: 'keyword' | 'identifier' | 'string' | 'comment' | 'text';
}

export interface CardTheme {
    accent: string;
    accentGlow: string;
    stack: string;
    filename: string;
    fileExt: string;
    status: string;
    statusColor: string;
    snippetLines: SnippetToken[][];
}

export const CARD_THEMES: CardTheme[] = [
    {
        accent: "#4F8CFF",
        accentGlow: "rgba(79, 140, 255, 0.35)",
        stack: "Vite + React TS",
        filename: "App.tsx",
        fileExt: "TSX",
        status: "AI Agent Ready",
        statusColor: "#27C93F",
        snippetLines: [
            [
                { text: "import", type: "keyword" },
                { text: " { useState } ", type: "identifier" },
                { text: "from", type: "keyword" },
                { text: " 'react'", type: "string" },
                { text: ";", type: "text" }
            ],
            [
                { text: "const", type: "keyword" },
                { text: " [active, setActive] = ", type: "text" },
                { text: "useState", type: "identifier" },
                { text: "(true);", type: "text" }
            ],
            [
                { text: "// Vite HMR Runtime Ready", type: "comment" }
            ]
        ]
    },
    {
        accent: "#9B5CFF",
        accentGlow: "rgba(155, 92, 255, 0.35)",
        stack: "Vite + React TS",
        filename: "main.tsx",
        fileExt: "TSX",
        status: "Swarm Active",
        statusColor: "#A855F7",
        snippetLines: [
            [
                { text: "import", type: "keyword" },
                { text: " { createRoot } ", type: "identifier" },
                { text: "from", type: "keyword" },
                { text: " 'react-dom/client'", type: "string" },
                { text: ";", type: "text" }
            ],
            [
                { text: "createRoot", type: "identifier" },
                { text: "(document.getElementById('root')!).", type: "text" },
                { text: "render", type: "identifier" },
                { text: "(<App />);", type: "text" }
            ],
            [
                { text: "// React 18 Concurrent Root Initialized", type: "comment" }
            ]
        ]
    },
    {
        accent: "#10B981",
        accentGlow: "rgba(16, 185, 129, 0.35)",
        stack: "Vite + React TS",
        filename: "types.ts",
        fileExt: "TS",
        status: "Types Verified",
        statusColor: "#10B981",
        snippetLines: [
            [
                { text: "export interface", type: "keyword" },
                { text: " ProjectState ", type: "identifier" },
                { text: "{", type: "text" }
            ],
            [
                { text: "  id: string; status: ", type: "text" },
                { text: "'ready'", type: "string" },
                { text: " | ", type: "text" },
                { text: "'building'", type: "string" },
                { text: "; }", type: "text" }
            ],
            [
                { text: "// Strict TypeScript Environment", type: "comment" }
            ]
        ]
    },
    {
        accent: "#F59E0B",
        accentGlow: "rgba(245, 158, 11, 0.35)",
        stack: "Vite + React TS",
        filename: "useAgent.ts",
        fileExt: "TS",
        status: "Runtime Ready",
        statusColor: "#F59E0B",
        snippetLines: [
            [
                { text: "import", type: "keyword" },
                { text: " { useEffect, useState } ", type: "identifier" },
                { text: "from", type: "keyword" },
                { text: " 'react'", type: "string" },
                { text: ";", type: "text" }
            ],
            [
                { text: "export function", type: "keyword" },
                { text: " useAgent", type: "identifier" },
                { text: "() { return { status: ", type: "text" },
                { text: "'connected'", type: "string" },
                { text: " }; }", type: "text" }
            ],
            [
                { text: "// Custom React Hook Synchronized", type: "comment" }
            ]
        ]
    },
    {
        accent: "#EC4899",
        accentGlow: "rgba(236, 72, 153, 0.35)",
        stack: "Vite + React TS",
        filename: "Dashboard.tsx",
        fileExt: "TSX",
        status: "Sandbox Live",
        statusColor: "#EC4899",
        snippetLines: [
            [
                { text: "export default function", type: "keyword" },
                { text: " Dashboard", type: "identifier" },
                { text: "() {", type: "text" }
            ],
            [
                { text: "  return <", type: "text" },
                { text: "div", type: "keyword" },
                { text: " className=", type: "text" },
                { text: "\"p-6 bg-slate-900\"", type: "string" },
                { text: ">Voltrix UI</", type: "text" },
                { text: "div", type: "keyword" },
                { text: ">;", type: "text" }
            ],
            [
                { text: "// Tailwind CSS Component Rendered", type: "comment" }
            ]
        ]
    }
];

export function getStatusTheme(status: string) {
    const s = status.toLowerCase();
    if (s.includes("error") || s.includes("fail")) {
        return {
            statusColor: "#EF4444",
            accentGlow: "rgba(239, 68, 68, 0.35)",
            accent: "#EF4444"
        };
    }
    if (s.includes("building") || s.includes("swarm") || s.includes("progress")) {
        return {
            statusColor: "#F59E0B",
            accentGlow: "rgba(245, 158, 11, 0.35)",
            accent: "#F59E0B"
        };
    }
    if (s.includes("sandbox") || s.includes("live")) {
        return {
            statusColor: "#A855F7",
            accentGlow: "rgba(168, 85, 247, 0.35)",
            accent: "#A855F7"
        };
    }
    // Default Ready / Healthy state (Green/Teal)
    return {
        statusColor: "#10B981",
        accentGlow: "rgba(16, 185, 129, 0.35)",
        accent: "#10B981"
    };
}

export function ProjectPreviewCover({ project }: { project: ProjectSummaryResponse }) {
    if (project.thumbnailUrl) {
        return (
            <img
                src={project.thumbnailUrl}
                alt={project.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
        );
    }

    // Differentiating theme per project with systemized status mapping
    const themeIndex = Math.abs(project.id) % CARD_THEMES.length;
    const baseTheme = CARD_THEMES[themeIndex];
    const statusTheme = getStatusTheme(baseTheme.status);
    const theme = { ...baseTheme, ...statusTheme };
    const slug = project.name ? project.name.toLowerCase().replace(/[^a-z0-9]/g, "-") : "project";

    return (
        <div className="w-full h-full bg-[#060913] dark:bg-[#060913] light:bg-[#F1F5F9] relative p-3.5 flex flex-col justify-between overflow-hidden group-hover:brightness-105 transition-all duration-300">
            {/* Ambient Grid Texture & Soft Accent Spot Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] light:bg-[radial-gradient(rgba(0,0,0,0.04)_1px,transparent_1px)] opacity-40 pointer-events-none" />
            <div className="absolute -right-10 -bottom-10 w-36 h-36 rounded-full blur-3xl pointer-events-none transition-opacity duration-300 opacity-20 group-hover:opacity-35" style={{ backgroundColor: theme.accentGlow }} />

            {/* High-Tech File Header with Contrast Divider */}
            <div className="relative z-10 flex items-center justify-between border-b border-white/15 dark:border-white/15 light:border-black/10 pb-2">
                <div className="flex items-center gap-2">
                    <FileCode className="w-3.5 h-3.5 shrink-0 text-[#7CC7FF] dark:text-[#7CC7FF] light:text-[#0284C7]" />
                    <span className="text-[11px] font-mono font-bold text-[#E2E8F0] dark:text-[#E2E8F0] light:text-[#1E293B] truncate max-w-[150px]">
                        {slug}.{theme.fileExt.toLowerCase()}
                    </span>
                </div>
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-[#0D1424] dark:bg-[#0D1424] light:bg-[#E2E8F0] border border-white/15 dark:border-white/15 light:border-black/10 text-[#A7B0C5] dark:text-[#A7B0C5] light:text-[#334155] tracking-wider uppercase">
                    {theme.fileExt}
                </span>
            </div>

            {/* Syntax-Highlighted Code Editor Snippet with Strong Right Edge Fade */}
            <div className="relative z-10 my-auto py-1.5 space-y-1 font-mono text-[10px] leading-relaxed select-none opacity-90 group-hover:opacity-100 transition-opacity overflow-hidden">
                {theme.snippetLines.map((line, idx) => (
                    <div 
                        key={idx} 
                        className="relative flex items-center gap-0.5 whitespace-nowrap overflow-hidden"
                        style={{
                            WebkitMaskImage: "linear-gradient(to right, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 85%)",
                            maskImage: "linear-gradient(to right, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 85%)"
                        }}
                    >
                        {line.map((token, tIdx) => {
                            if (token.type === "comment") {
                                return <span key={tIdx} className="text-[#64748B] italic shrink-0">{token.text}</span>;
                            }
                            if (token.type === "keyword") {
                                return <span key={tIdx} className="font-semibold shrink-0" style={{ color: theme.accent }}>{token.text}</span>;
                            }
                            if (token.type === "identifier") {
                                return <span key={tIdx} className="text-[#7CC7FF] dark:text-[#7CC7FF] light:text-[#0284C7] shrink-0">{token.text}</span>;
                            }
                            if (token.type === "string") {
                                return <span key={tIdx} className="text-[#34D399] dark:text-[#34D399] light:text-[#059669] shrink-0">{token.text}</span>;
                            }
                            return <span key={tIdx} className="text-[#E2E8F0] dark:text-[#E2E8F0] light:text-[#334155] shrink-0">{token.text}</span>;
                        })}
                    </div>
                ))}

                {/* Wide Right Edge Fade Overlay Matching Cover Background */}
                <div className="absolute right-0 top-0 bottom-0 w-14 bg-gradient-to-l from-[#060913] via-[#060913]/90 dark:from-[#060913] dark:via-[#060913]/90 light:from-[#F1F5F9] light:via-[#F1F5F9]/90 to-transparent pointer-events-none z-20" />
            </div>

            {/* Bottom Vignette Overlay */}
            <div className="absolute inset-x-0 bottom-8 h-6 bg-gradient-to-t from-[#060913] via-[#060913]/70 dark:from-[#060913] dark:via-[#060913]/70 light:from-[#F1F5F9] light:via-[#F1F5F9]/70 to-transparent pointer-events-none z-20" />

            {/* Live Status Bar with Contrast Divider */}
            <div className="relative z-10 flex items-center justify-between pt-2 border-t border-white/15 dark:border-white/15 light:border-black/10 text-[10px] font-mono">
                <div className="flex items-center gap-2 px-2.5 py-0.5 rounded-full border border-white/15 dark:border-white/15 light:border-black/10 bg-[#0A0E1A]/90 dark:bg-[#0A0E1A]/90 light:bg-[#FFFFFF]/90 shadow-sm backdrop-blur-sm">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: theme.statusColor }} />
                        <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: theme.statusColor, boxShadow: `0 0 6px ${theme.statusColor}` }} />
                    </span>
                    <span className="font-bold tracking-wide text-[9.5px] text-[#F5F7FF] dark:text-[#F5F7FF] light:text-[#0F172A]">
                        {theme.status}
                    </span>
                </div>
                <span className="text-[#64748B] font-semibold text-[10px]">ID: #{project.id}</span>
            </div>
        </div>
    );
}

export function ProjectsDashboard() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const containerRef = useRef<HTMLDivElement>(null);

    const [projects, setProjects] = useState<ProjectSummaryResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterRole, setFilterRole] = useState<"ALL" | "OWNER" | "EDITOR">("ALL");
    const [isCreating, setIsCreating] = useState(false);
    const [newProjectName, setNewProjectName] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Rename state
    const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
    const [projectToRename, setProjectToRename] = useState<ProjectSummaryResponse | null>(null);
    const [renameName, setRenameName] = useState("");

    useEffect(() => {
        fetchProjects();
    }, []);

    // GSAP Card Stagger Entrance
    useEffect(() => {
        if (loading || projects.length === 0) return;

        const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (isReduced) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".gsap-project-card",
                { opacity: 0, y: 25, scale: 0.97 },
                { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.08, ease: "power3.out" }
            );
        }, containerRef);

        return () => ctx.revert();
    }, [loading, projects]);

    const fetchProjects = async () => {
        try {
            const data = await api.getProjects();
            setProjects(data);
        } catch (error) {
            console.error("Failed to fetch projects:", error);
            toast({
                title: "Error loading workspace",
                description: "Failed to load projects. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProject = async () => {
        if (!newProjectName.trim()) return;

        setIsCreating(true);
        try {
            const newProject = await api.createProject(newProjectName);
            setProjects([newProject, ...projects]);
            setNewProjectName("");
            setIsDialogOpen(false);
            toast({
                title: "Project Initialized",
                description: `Successfully created "${newProject.name}"`,
            });
        } catch (error) {
            console.error("Failed to create project:", error);
            toast({
                title: "Creation Failed",
                description: "Failed to create project. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteProject = async (e: React.MouseEvent, projectId: number) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) return;

        try {
            await api.deleteProject(projectId.toString());
            setProjects(projects.filter(p => p.id !== projectId));
            toast({ title: "Project Deleted", description: "Project has been removed from workspace." });
        } catch (error) {
            console.error("Failed to delete:", error);
            toast({ title: "Delete Failed", description: "Failed to delete project", variant: "destructive" });
        }
    };

    const handleDownloadProject = async (e: React.MouseEvent, projectId: number) => {
        e.stopPropagation();
        try {
            const blob = await api.downloadProjectZip(projectId.toString());
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `project-${projectId}.zip`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast({ title: "Export Started", description: "Project ZIP archive generated successfully." });
        } catch (error) {
            console.error("Failed to download:", error);
            toast({ title: "Export Failed", description: "Failed to download project package", variant: "destructive" });
        }
    };

    const handleRenameClick = (e: React.MouseEvent, project: ProjectSummaryResponse) => {
        e.stopPropagation();
        setProjectToRename(project);
        setRenameName(project.name);
        setIsRenameDialogOpen(true);
    };

    const handleRenameSubmit = async () => {
        if (!projectToRename || !renameName.trim()) return;

        try {
            await api.updateProject(projectToRename.id.toString(), renameName);
            setProjects(projects.map(p => p.id === projectToRename.id ? { ...p, name: renameName } : p));
            setIsRenameDialogOpen(false);
            setProjectToRename(null);
            toast({ title: "Renamed", description: "Project updated successfully." });
        } catch (error) {
            console.error("Failed to rename:", error);
            toast({ title: "Rename Failed", description: "Failed to rename project", variant: "destructive" });
        }
    };

    const handleLogout = () => {
        removeAuthToken();
        removeUserInfo();
        navigate("/login");
    };

    const filteredProjects = projects.filter((project) => {
        const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = filterRole === "ALL" || project.role === filterRole;
        return matchesSearch && matchesRole;
    });

    const userInfo = getUserInfo();
    const userInitial = userInfo?.name ? userInfo.name.charAt(0).toUpperCase() : "U";

    return (
        <div ref={containerRef} className="min-h-screen bg-[#03040B] dark:bg-[#03040B] light:bg-[#F8FAFC] text-[#F5F7FF] dark:text-[#F5F7FF] light:text-[#0F172A] font-sans selection:bg-[#4F8CFF]/30 selection:text-[#E8F4FF] relative overflow-x-hidden flex flex-col transition-colors duration-200">
            
            {/* Ambient Cosmic Canvas Backdrop (Carried from Sign In / Sign Up) */}
            <ThreeDCanvas mode="signin" />

            {/* Ambient Background Radial Spotlights */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div 
                    className="absolute inset-0"
                    style={{
                        background: `
                            radial-gradient(circle at 20% 20%, rgba(79, 140, 255, 0.14), transparent 45%),
                            radial-gradient(circle at 80% 80%, rgba(124, 60, 255, 0.12), transparent 45%)
                        `
                    }}
                />
            </div>

            {/* TOP NAVIGATION BAR */}
            <header className="relative z-30 border-b border-[#150160]/40 dark:border-[#150160]/40 light:border-black/10 bg-[#060914]/80 dark:bg-[#060914]/80 light:bg-[#FFFFFF]/90 backdrop-blur-xl sticky top-0 transition-colors duration-200">
                <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
                    
                    {/* Brand Emblem */}
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/projects")}>
                        <div className="relative w-9 h-9 rounded-full p-0.5 bg-[#080C1E] dark:bg-[#080C1E] light:bg-[#F1F5F9] border border-[#7CC7FF]/50 shadow-[0_0_20px_rgba(79,140,255,0.35)] flex items-center justify-center overflow-hidden">
                            <img src="/voltrix-logo.png" alt="Voltrix Logo" className="w-full h-full object-contain rounded-full voltrix-logo-glow" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-base font-black tracking-wider text-[#F5F7FF] dark:text-[#F5F7FF] light:text-[#0F172A] font-mono flex items-center gap-2">
                                VOLTRIX <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#4F8CFF]/20 border border-[#4F8CFF]/40 text-[#7CC7FF] dark:text-[#7CC7FF] light:text-[#0284C7] font-semibold">WORKSPACE v2.4</span>
                            </span>
                        </div>
                    </div>

                    {/* Right User Profile Navigation Menu */}
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full voltrix-glass-pill text-xs font-mono text-[#7CC7FF] dark:text-[#7CC7FF] light:text-[#0284C7] border border-[#4F8CFF]/30">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4F8CFF] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4F8CFF] shadow-[0_0_8px_#4F8CFF]"></span>
                            </span>
                            <span className="font-semibold tracking-wider text-[11px]">SYSTEM ONLINE</span>
                        </div>

                        <ThemeToggle />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full border-2 border-[#7CC7FF]/50 hover:border-[#4F8CFF] shadow-[0_0_15px_rgba(79,140,255,0.25)] transition-all p-0 overflow-hidden cursor-pointer">
                                    <Avatar className="h-full w-full">
                                        <AvatarFallback className="voltrix-avatar-gradient font-black text-sm text-white">
                                            {userInitial}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-64 voltrix-glass-card border border-[#150160]/60 p-2 text-[#F5F7FF] dark:text-[#F5F7FF] light:text-[#0F172A] shadow-2xl">
                                <div className="flex flex-col space-y-1 p-2.5 bg-[#080C1E]/90 dark:bg-[#080C1E]/90 light:bg-[#F1F5F9]/90 rounded-xl border border-white/5 dark:border-white/5 light:border-black/10 mb-1">
                                    <p className="text-sm font-extrabold text-[#F5F7FF] dark:text-[#F5F7FF] light:text-[#0F172A]">
                                        {userInfo?.name || "Developer"}
                                    </p>
                                    <p className="text-xs text-[#A7B0C5] dark:text-[#A7B0C5] light:text-[#64748B] truncate font-mono">
                                        {userInfo?.username || "user@voltrix.ai"}
                                    </p>
                                </div>
                                <DropdownMenuSeparator className="bg-white/10 dark:bg-white/10 light:bg-black/10" />
                                <DropdownMenuItem onClick={handleLogout} className="text-red-400 focus:text-red-300 focus:bg-red-500/15 cursor-pointer rounded-lg p-2.5 text-xs font-semibold flex items-center gap-2">
                                    <LogOut className="w-4 h-4 text-red-400" />
                                    <span>Sign Out of Portal</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            {/* MAIN DASHBOARD CONTENT */}
            <main className="relative z-10 max-w-7xl mx-auto w-full py-8 px-4 sm:px-8 flex-1">
                
                {/* HERO STATS BAR & TITLE */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="relative z-10 text-3xl sm:text-4xl md:text-5xl font-black tracking-tight voltrix-heading-main">
                            <span className="voltrix-heading-plain">Projects</span> <span className="gradient-text-voltrix">Portal</span>
                        </h1>
                        <p className="text-xs sm:text-sm text-[#A7B0C5] dark:text-[#A7B0C5] light:text-[#475569] mt-1.5 font-medium max-w-xl leading-relaxed">
                            Orchestrate natural prompts into production-grade React & Node applications.
                        </p>
                    </div>

                    {/* Coherent Stats Node Group & Primary CTA Button */}
                    <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                        {/* Cohesive Stats Pill */}
                        <div className="flex items-center gap-4 px-4 py-2.5 rounded-2xl voltrix-glass-pill border border-[#150160]/40 dark:border-[#150160]/40 light:border-black/10 text-xs shadow-md">
                            <div className="flex items-center gap-2">
                                <Folder className="w-4 h-4 text-[#7CC7FF] dark:text-[#7CC7FF] light:text-[#0284C7]" />
                                <span className="text-[#A7B0C5] dark:text-[#A7B0C5] light:text-[#475569] font-medium">Projects:</span>
                                <span className="font-bold text-[#F5F7FF] dark:text-[#F5F7FF] light:text-[#0F172A] font-mono">{projects.length}</span>
                            </div>
                            <div className="h-4 w-[1px] bg-white/10 dark:bg-white/10 light:bg-black/10" />
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-[#C56CFF]" />
                                <span className="text-[#A7B0C5] dark:text-[#A7B0C5] light:text-[#475569] font-medium">Vault:</span>
                                <span className="font-bold text-[#C56CFF] font-mono">SOC2</span>
                            </div>
                        </div>

                        {/* Primary Accent Action Button */}
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="h-11 voltrix-btn-primary px-5 rounded-xl text-xs font-extrabold tracking-wide flex items-center gap-2 shadow-lg cursor-pointer">
                                    <Plus className="w-4 h-4" />
                                    <span>New Project</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="voltrix-glass-card border border-[#7CC7FF]/30 p-6 sm:p-8 text-[#F5F7FF] dark:text-[#F5F7FF] light:text-[#0F172A] max-w-md">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-extrabold text-[#F5F7FF] dark:text-[#F5F7FF] light:text-[#0F172A] flex items-center gap-2">
                                        <Code2 className="w-5 h-5 text-[#7CC7FF] dark:text-[#7CC7FF] light:text-[#0284C7]" />
                                        <span>Create New AI Project</span>
                                    </DialogTitle>
                                    <DialogDescription className="text-xs text-[#A7B0C5] dark:text-[#A7B0C5] light:text-[#475569] pt-1">
                                        Give your project a title. Voltrix will automatically initialize cloud sandboxes and AI runtimes.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="py-4 space-y-2">
                                    <label htmlFor="projectName" className="text-xs font-semibold text-[#A7B0C5] dark:text-[#A7B0C5] light:text-[#475569]">
                                        Project Name
                                    </label>
                                    <Input
                                        id="projectName"
                                        placeholder="e.g. AI-Sales-Automation-Dashboard"
                                        value={newProjectName}
                                        onChange={(e) => setNewProjectName(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleCreateProject()}
                                        className="h-11 voltrix-input rounded-xl text-sm text-[#F5F7FF] dark:text-[#F5F7FF] light:text-[#0F172A] placeholder:text-[#5B657E]"
                                        autoFocus
                                    />
                                </div>

                                <DialogFooter className="gap-2 sm:gap-0">
                                    <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="h-10 border-white/10 dark:border-white/10 light:border-black/10 text-[#A7B0C5] dark:text-[#A7B0C5] light:text-[#475569] hover:text-white dark:hover:text-white light:hover:text-[#0F172A] bg-transparent">
                                        Cancel
                                    </Button>
                                    <Button onClick={handleCreateProject} disabled={isCreating || !newProjectName.trim()} className="h-10 voltrix-btn-primary px-4 font-semibold text-xs cursor-pointer">
                                        {isCreating ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                <span>Initializing...</span>
                                            </>
                                        ) : (
                                            <span>Initialize Project →</span>
                                        )}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* SEARCH & SEGMENTED FILTER CONTROL BAR */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-[#060914]/80 dark:bg-[#060914]/80 light:bg-[#FFFFFF] p-3 rounded-2xl border border-[#150160]/40 dark:border-[#150160]/40 light:border-black/10 shadow-sm backdrop-blur-md transition-colors duration-200">
                    {/* Search Input */}
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7CC7FF] dark:text-[#7CC7FF] light:text-[#0284C7]" />
                        <Input
                            placeholder="Filter projects by name..."
                            className="pl-10 h-10 voltrix-input rounded-xl text-xs text-[#F5F7FF] dark:text-[#F5F7FF] light:text-[#0F172A] placeholder:text-[#5B657E]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Segmented Control Filter Toggle */}
                    <div className="flex items-center p-1 rounded-xl bg-[#040714] dark:bg-[#040714] light:bg-[#F1F5F9] border border-white/10 dark:border-white/10 light:border-black/10 w-full sm:w-auto">
                        <button
                            onClick={() => setFilterRole("ALL")}
                            className={cn(
                                "px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex-1 sm:flex-initial text-center",
                                filterRole === "ALL"
                                    ? "bg-gradient-to-r from-[#4F8CFF]/40 to-[#7C3CFF]/40 border border-[#4F8CFF]/60 text-[#F5F7FF] dark:text-[#F5F7FF] light:text-[#0F172A] shadow-[0_0_15px_rgba(79,140,255,0.25)]"
                                    : "text-[#69738C] dark:text-[#69738C] light:text-[#475569] hover:text-[#A7B0C5] dark:hover:text-[#A7B0C5] light:hover:text-[#0F172A]"
                            )}
                        >
                            All ({projects.length})
                        </button>
                        <button
                            onClick={() => setFilterRole("OWNER")}
                            className={cn(
                                "px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex-1 sm:flex-initial text-center",
                                filterRole === "OWNER"
                                    ? "bg-gradient-to-r from-[#7C3CFF]/40 to-[#9B5CFF]/40 border border-[#7C3CFF]/60 text-[#F5F7FF] dark:text-[#F5F7FF] light:text-[#0F172A] shadow-[0_0_15px_rgba(124,60,255,0.25)]"
                                    : "text-[#69738C] dark:text-[#69738C] light:text-[#475569] hover:text-[#A7B0C5] dark:hover:text-[#A7B0C5] light:hover:text-[#0F172A]"
                            )}
                        >
                            Owned
                        </button>
                    </div>
                </div>

                {/* PROJECT GRID DISPLAY */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="relative w-12 h-12 mb-4">
                            <Loader2 className="w-12 h-12 animate-spin text-[#4F8CFF]" />
                        </div>
                        <p className="text-sm text-[#A7B0C5] dark:text-[#A7B0C5] light:text-[#475569] font-mono">Syncing AI projects vault...</p>
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div className="text-center py-20 px-4 voltrix-glass-card border border-dashed border-[#4F8CFF]/30 rounded-3xl max-w-lg mx-auto flex flex-col items-center justify-center">
                        <div className="w-14 h-14 rounded-2xl bg-[#4F8CFF]/15 border border-[#4F8CFF]/40 flex items-center justify-center text-[#7CC7FF] dark:text-[#7CC7FF] light:text-[#0284C7] mb-4 shadow-[0_0_30px_rgba(79,140,255,0.25)]">
                            <Folder className="w-7 h-7" />
                        </div>
                        <h3 className="text-lg font-bold text-[#F5F7FF] dark:text-[#F5F7FF] light:text-[#0F172A] mb-1">
                            {searchQuery ? "No matching projects found" : "Your workspace is empty"}
                        </h3>
                        <p className="text-xs text-[#A7B0C5] dark:text-[#A7B0C5] light:text-[#475569] mb-6 max-w-xs leading-relaxed font-medium">
                            {searchQuery ? "No project matched your filter query. Try searching for a different keyword." : "Initialize your first AI-powered project sandbox to start building."}
                        </p>
                        {!searchQuery && (
                            <Button onClick={() => setIsDialogOpen(true)} className="h-10 voltrix-btn-primary px-5 rounded-xl text-xs font-bold cursor-pointer">
                                <Plus className="w-4 h-4 mr-1.5" /> Initialize First Project
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {filteredProjects.map((project) => {
                            const themeIndex = Math.abs(project.id) % CARD_THEMES.length;
                            const baseTheme = CARD_THEMES[themeIndex];
                            const statusTheme = getStatusTheme(baseTheme.status);
                            const theme = { ...baseTheme, ...statusTheme };

                            return (
                                <Card
                                    key={project.id}
                                    className="gsap-project-card group cursor-pointer voltrix-glass-card border border-white/12 dark:border-white/12 light:border-black/10 transition-all duration-200 relative overflow-hidden flex flex-col justify-between shadow-[0_12px_35px_rgba(0,0,0,0.65)] light:shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 hover:border-white/25 dark:hover:border-white/25 light:hover:border-black/20 rounded-2xl bg-[#080C19] dark:bg-[#080C19] light:bg-[#FFFFFF]"
                                    onClick={() => navigate(`/projects/${project.id}`)}
                                >
                                    {/* Top Accent Sheen Line */}
                                    <div 
                                        className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"
                                        style={{ background: `linear-gradient(90deg, transparent, ${theme.accent}, transparent)` }}
                                    />

                                    <div>
                                        {/* Cover Header Preview */}
                                        <CardHeader className="p-0">
                                            <div className="aspect-video w-full relative overflow-hidden rounded-t-2xl bg-[#060913] dark:bg-[#060913] light:bg-[#F1F5F9]">
                                                <ProjectPreviewCover project={project} />
                                            </div>
                                        </CardHeader>

                                        {/* Card Body */}
                                        <CardContent className="p-5 flex flex-col gap-3">
                                            <div className="flex justify-between items-start gap-3">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    {/* Avatar Badge: Branded contrast gradient fill */}
                                                    <div className="w-9 h-9 rounded-xl font-black font-mono text-sm shrink-0 flex items-center justify-center shadow-md voltrix-avatar-dark-gradient text-white">
                                                        {project.name ? project.name.charAt(0).toUpperCase() : "P"}
                                                    </div>

                                                    <CardTitle className="text-base font-extrabold text-[#FFFFFF] dark:text-[#FFFFFF] light:text-[#0F172A] group-hover:text-white dark:group-hover:text-white light:group-hover:text-[#0284C7] transition-colors truncate">
                                                        {project.name}
                                                    </CardTitle>
                                                </div>

                                                {/* Dropdown Menu */}
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-[#64748B] hover:text-[#FFFFFF] dark:hover:text-[#FFFFFF] light:hover:text-[#0F172A] hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-black/5 rounded-lg p-0 shrink-0">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="voltrix-glass-card border border-[#150160]/60 p-1.5 text-[#F5F7FF] dark:text-[#F5F7FF] light:text-[#0F172A] w-44 shadow-2xl">
                                                        <DropdownMenuItem onClick={(e) => handleRenameClick(e, project)} className="cursor-pointer text-xs font-semibold focus:bg-[#4F8CFF]/15 text-[#E8F4FF] dark:text-[#E8F4FF] light:text-[#0F172A] rounded-lg">
                                                            <Edit className="w-3.5 h-3.5 mr-2 text-[#7CC7FF] dark:text-[#7CC7FF] light:text-[#0284C7]" />
                                                            Rename
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={(e) => handleDownloadProject(e, project.id)} className="cursor-pointer text-xs font-semibold focus:bg-[#4F8CFF]/15 text-[#E8F4FF] dark:text-[#E8F4FF] light:text-[#0F172A] rounded-lg">
                                                            <Download className="w-3.5 h-3.5 mr-2 text-[#7CC7FF] dark:text-[#7CC7FF] light:text-[#0284C7]" />
                                                            Download ZIP
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="bg-white/10 dark:bg-white/10 light:bg-black/10" />
                                                        <DropdownMenuItem className="text-red-400 focus:text-red-300 focus:bg-red-500/15 cursor-pointer text-xs font-semibold rounded-lg" onClick={(e) => handleDeleteProject(e, project.id)}>
                                                            <Trash className="w-3.5 h-3.5 mr-2 text-red-400" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>

                                            {/* Stack & Role Badges */}
                                            <div className="flex items-center gap-2 flex-wrap pt-0.5">
                                                {project.role && (
                                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border border-white/10 dark:border-white/10 light:border-black/10 bg-white/[0.06] dark:bg-white/[0.06] light:bg-black/[0.05] text-[#A7B0C5] dark:text-[#A7B0C5] light:text-[#334155] font-mono shadow-sm">
                                                        {project.role}
                                                    </span>
                                                )}
                                                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border border-white/10 dark:border-white/10 light:border-black/10 bg-white/[0.05] dark:bg-white/[0.05] light:bg-black/[0.04] text-[#94A3B8] dark:text-[#94A3B8] light:text-[#475569] shadow-sm">
                                                    {theme.stack}
                                                </span>
                                            </div>
                                        </CardContent>
                                    </div>

                                    {/* Footer Metadata & Secondary Launch CTA with Contrast Divider */}
                                    <CardFooter className="px-5 pb-4 pt-3 text-[11px] text-[#64748B] flex items-center justify-between border-t border-white/15 dark:border-white/15 light:border-black/10 font-mono">
                                        <div className="flex items-center gap-1.5 text-[#94A3B8] dark:text-[#94A3B8] light:text-[#64748B] font-medium">
                                            <Clock className="w-3.5 h-3.5 text-[#64748B]" />
                                            <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        
                                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-[#FFFFFF] dark:text-[#FFFFFF] light:text-[#0F172A] transition-colors duration-200 group-hover:text-[#38BDF8] light:group-hover:text-[#0284C7] cursor-pointer">
                                            <span>Launch App</span>
                                            <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-[#FFFFFF] dark:text-[#FFFFFF] light:text-[#0F172A] group-hover:text-[#38BDF8] light:group-hover:text-[#0284C7]" />
                                        </div>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* RENAME DIALOG */}
                <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
                    <DialogContent className="voltrix-glass-card border border-[#7CC7FF]/30 p-6 text-[#F5F7FF] dark:text-[#F5F7FF] light:text-[#0F172A] max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold text-[#F5F7FF] dark:text-[#F5F7FF] light:text-[#0F172A]">Rename Project</DialogTitle>
                        </DialogHeader>
                        <div className="py-4 space-y-2">
                            <Input
                                value={renameName}
                                onChange={(e) => setRenameName(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleRenameSubmit()}
                                className="h-11 voltrix-input rounded-xl text-sm text-[#F5F7FF] dark:text-[#F5F7FF] light:text-[#0F172A]"
                                autoFocus
                            />
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)} className="h-10 border-white/10 dark:border-white/10 light:border-black/10 text-[#A7B0C5] dark:text-[#A7B0C5] light:text-[#475569] bg-transparent">
                                Cancel
                            </Button>
                            <Button onClick={handleRenameSubmit} disabled={!renameName.trim() || renameName === projectToRename?.name} className="h-10 voltrix-btn-primary px-4 text-xs font-semibold cursor-pointer">
                                Save Name
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </main>

            {/* DASHBOARD FOOTER */}
            <footer className="relative z-20 border-t border-[#150160]/40 dark:border-[#150160]/40 light:border-black/10 bg-[#040714]/80 dark:bg-[#040714]/80 light:bg-[#F1F5F9]/80 py-4 px-6 text-center text-xs text-[#69738C] dark:text-[#69738C] light:text-[#64748B] transition-colors duration-200">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
                    <div>Voltrix AI Platform • Autonomous Developer Runtimes</div>
                    <div className="flex items-center gap-4 text-[11px]">
                        <span className="hover:text-[#A7B0C5] dark:hover:text-[#A7B0C5] light:hover:text-[#0F172A] cursor-pointer">SOC2 Encrypted</span>
                        <span>•</span>
                        <span className="hover:text-[#A7B0C5] dark:hover:text-[#A7B0C5] light:hover:text-[#0F172A] cursor-pointer">Sub-sec HMR</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
