import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "@/lib/api";
import { Sparkles, Loader2 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect based on auth status
    if (isAuthenticated()) {
      // If authenticated, redirect to projects dashboard
      navigate("/projects");
    } else {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative flex flex-col items-center">
        <div className="w-20 h-20 rounded-full p-1 bg-slate-900 border border-cyan-500/40 shadow-[0_0_30px_rgba(56,189,248,0.4)] flex items-center justify-center mb-6 overflow-hidden">
          <img src="/voltrix-logo.png" alt="Voltrix Logo" className="w-full h-full object-contain rounded-full" />
        </div>
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white via-cyan-200 to-purple-300 bg-clip-text text-transparent mb-4">Voltrix</h1>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    </div>
  );
};

export default Index;
