import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Lock, Mail, Eye, EyeOff, ArrowRight } from "lucide-react";
import { api, setAuthToken, setUserInfo } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AuthLayout } from "@/components/AuthLayout";
import { motion } from "framer-motion";

export function LoginModal() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Missing credentials",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.login({ username: email, password });
      setAuthToken(response.token);
      if (response.user) {
        setUserInfo(response.user);
      }
      toast({
        title: "Welcome back!",
        description: "Successfully authenticated into Voltrix workspace.",
      });
      navigate("/projects");
    } catch (error) {
      toast({
        title: "Authentication failed",
        description: error instanceof Error ? error.message : "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout mode="signin">
      <form onSubmit={handleSubmit} className="space-y-5 relative z-50 pointer-events-auto">
        {/* Email Input Field */}
        <div className="space-y-2 voltrix-input-group">
          <Label htmlFor="email" className="text-xs font-semibold text-[#A7B0C5] px-0.5 block tracking-wide">
            Work Email
          </Label>
          <div className="relative group">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#7CC7FF] group-focus-within:border-[#4F8CFF] group-focus-within:bg-[#4F8CFF]/15 group-focus-within:text-[#7CC7FF] transition-all pointer-events-none z-10 shadow-sm">
              <Mail className="w-4 h-4" />
            </div>
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-[54px] pr-4 h-12 voltrix-input rounded-xl text-sm text-[#F5F7FF] placeholder:text-[#5B657E] focus:outline-none focus:ring-0 relative z-0 cursor-text pointer-events-auto"
              disabled={isLoading}
              autoComplete="email"
              required
            />
          </div>
        </div>

        {/* Password Input Field */}
        <div className="space-y-2 voltrix-input-group">
          <div className="flex items-center justify-between px-0.5">
            <Label htmlFor="password" className="text-xs font-semibold text-[#A7B0C5] tracking-wide">
              Password
            </Label>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                toast({
                  title: "Password Reset",
                  description: "Password reset instructions sent if email exists.",
                });
              }}
              className="text-[11px] font-medium text-[#69738C] hover:text-[#7CC7FF] transition-colors"
            >
              Forgot password?
            </a>
          </div>
          <div className="relative group">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#C56CFF] group-focus-within:border-[#7C3CFF] group-focus-within:bg-[#7C3CFF]/15 group-focus-within:text-[#C56CFF] transition-all pointer-events-none z-10 shadow-sm">
              <Lock className="w-4 h-4" />
            </div>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-[54px] pr-12 h-12 voltrix-input rounded-xl text-sm text-[#F5F7FF] placeholder:text-[#5B657E] focus:outline-none focus:ring-0 relative z-0 cursor-text pointer-events-auto"
              disabled={isLoading}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#69738C] hover:text-[#F5F7FF] transition-colors p-1 z-20 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Primary Action Button ("Sign in →") */}
        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} className="pt-2">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 voltrix-btn-primary flex items-center justify-center gap-2 cursor-pointer group text-sm font-semibold tracking-wide"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#F5F7FF]" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign in to Workspace</span>
                <ArrowRight className="w-4 h-4 text-[#E8F4FF] transition-transform duration-200 group-hover:translate-x-1.5" />
              </>
            )}
          </Button>
        </motion.div>
      </form>
    </AuthLayout>
  );
}

