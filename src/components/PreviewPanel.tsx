import { useState, useEffect } from "react";
import { Play, Loader2, ExternalLink, RefreshCw, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api, PREVIEW_URL_KEY } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

import { RuntimeErrorAlert, RuntimeError } from "@/components/RuntimeErrorAlert";

interface PreviewPanelProps {
  projectId: string;
  runtimeError: RuntimeError | null;
  onDismiss: () => void;
  onFix: (error: RuntimeError) => void;
}

export function PreviewPanel({ projectId, runtimeError, onDismiss, onFix }: PreviewPanelProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(() => {
    // Load from localStorage on mount
    return localStorage.getItem(PREVIEW_URL_KEY);
  });
  const [isDeploying, setIsDeploying] = useState(false);
  const { toast } = useToast();

  // Store previewUrl in localStorage when it changes
  useEffect(() => {
    if (previewUrl) {
      localStorage.setItem(PREVIEW_URL_KEY, previewUrl);
    }
  }, [previewUrl]);

  const handleDeploy = async () => {
    setIsDeploying(true);

    try {
      const response = await api.deploy(projectId);
      setPreviewUrl(response.previewUrl);
      toast({
        title: "Deployment successful",
        description: "Your preview is now ready",
      });
    } catch (error) {
      toast({
        title: "Deployment failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const handleRefresh = () => {
    const iframe = document.querySelector("iframe");
    if (iframe) {
      iframe.src = iframe.src;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#060913] dark:bg-[#060913] light:bg-[#F8FAFC]">
      {/* URL Bar */}
      <div className="h-12 shrink-0 flex items-center gap-2 px-3 border-b border-white/10 dark:border-white/10 light:border-black/10 bg-[#060913] dark:bg-[#060913] light:bg-[#FFFFFF]">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={!previewUrl}
            className="h-7 w-7 text-[#64748B] hover:text-[#F5F7FF] dark:hover:text-[#F5F7FF] light:hover:text-[#0F172A] hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-black/5 disabled:opacity-40"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="flex-1 flex items-center h-8 px-3 rounded-lg bg-[#0A0E1A] dark:bg-[#0A0E1A] light:bg-[#F1F5F9] border border-white/10 dark:border-white/10 light:border-black/10 font-mono text-xs">
          <Globe className="w-3.5 h-3.5 mr-2 shrink-0 text-[#64748B] dark:text-[#64748B] light:text-[#64748B]" />
          <span className="truncate text-[#94A3B8] dark:text-[#94A3B8] light:text-[#334155]">
            {previewUrl || <span className="text-[#64748B] italic">Click 'Run Preview' to deploy sandbox URL</span>}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {previewUrl && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.open(previewUrl, "_blank")}
              className="h-7 w-7 text-[#64748B] hover:text-[#F5F7FF] dark:hover:text-[#F5F7FF] light:hover:text-[#0F172A] hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-black/5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          )}
          <Button
            onClick={handleDeploy}
            disabled={isDeploying}
            size="sm"
            className="h-8 px-4 voltrix-btn-primary rounded-lg text-xs font-extrabold shadow-[0_0_15px_rgba(79,140,255,0.3)] cursor-pointer"
          >
            {isDeploying ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin text-white" />
                Deploying
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 mr-1.5 text-white" />
                Run Preview
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 bg-[#060913] dark:bg-[#060913] light:bg-[#F8FAFC] relative overflow-hidden">
        {previewUrl ? (
          <iframe
            src={previewUrl}
            className="w-full h-full border-0 bg-white"
            title="Preview"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        ) : (
          <div className="relative flex flex-col items-center justify-center h-full text-center p-8 overflow-hidden bg-[#060913] dark:bg-[#060913] light:bg-[#F8FAFC]">
            {/* Ambient Spot Glow & Grid Overlay */}
            <div className="absolute w-64 h-64 rounded-full bg-[#7C3CFF]/10 blur-3xl pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] light:bg-[radial-gradient(rgba(0,0,0,0.05)_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-40" />

            <div className="w-16 h-16 rounded-2xl bg-[#0D1424] dark:bg-[#0D1424] light:bg-[#F1F5F9] border border-[#7C3CFF]/30 dark:border-[#7C3CFF]/30 light:border-[#7C3CFF]/50 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(124,60,255,0.25)] text-[#C56CFF] relative z-10 transition-transform duration-300 hover:scale-105">
              <Globe className="w-8 h-8 text-[#C56CFF] animate-pulse" />
            </div>
            <h3 className="text-base font-extrabold text-[#F5F7FF] dark:text-[#F5F7FF] light:text-[#0F172A] mb-1.5 relative z-10">No live preview yet</h3>
            <p className="text-xs text-[#94A3B8] dark:text-[#94A3B8] light:text-[#475569] max-w-xs leading-relaxed relative z-10">
              Click <strong className="text-[#F5F7FF] dark:text-[#F5F7FF] light:text-[#0F172A]">Run Preview</strong> in the bar above to compile and deploy your React sandbox.
            </p>
          </div>
        )}
      </div>

      {/* Error Alert Overlay - Inside the Preview Panel */}
      <RuntimeErrorAlert
        error={runtimeError}
        onDismiss={onDismiss}
        onFix={onFix}
      />
    </div>
  );
}
