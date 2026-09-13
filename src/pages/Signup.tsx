import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Mail, User, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import { api, setAuthToken, setUserInfo } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AuthLayout } from "@/components/AuthLayout";
import { motion } from "framer-motion";

export default function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !email || !password) {
            toast({
                title: "Missing details",
                description: "Please fill in all required fields",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        try {
            const response = await api.signup({ name, username: email, password });
            setAuthToken(response.token);
            setUserInfo(response.user);
            toast({
                title: "Welcome to Voltrix!",
                description: "Account created successfully. Initializing workspace...",
            });
            navigate("/projects");
        } catch (error) {
            toast({
                title: "Signup failed",
                description: error instanceof Error ? error.message : "Could not create account",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout mode="signup">
            <form onSubmit={handleSubmit} className="space-y-4 relative z-50 pointer-events-auto">
                {/* Full Name Input */}
                <div className="space-y-1.5 voltrix-input-group">
                    <Label htmlFor="name" className="text-xs font-semibold text-[#A7B0C5] px-0.5 block tracking-wide">
                        Full Name
                    </Label>
                    <div className="relative group">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#7CC7FF] group-focus-within:border-[#4F8CFF] group-focus-within:bg-[#4F8CFF]/15 group-focus-within:text-[#7CC7FF] transition-all pointer-events-none z-10 shadow-sm">
                            <User className="w-4 h-4" />
                        </div>
                        <Input
                            id="name"
                            type="text"
                            placeholder="Alex Mercer"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="pl-[54px] pr-4 h-11 voltrix-input rounded-xl text-sm text-[#F5F7FF] placeholder:text-[#5B657E] focus:outline-none focus:ring-0 relative z-0 cursor-text pointer-events-auto"
                            disabled={isLoading}
                            autoComplete="name"
                            required
                        />
                    </div>
                </div>

                {/* Email Address Input */}
                <div className="space-y-1.5 voltrix-input-group">
                    <Label htmlFor="email" className="text-xs font-semibold text-[#A7B0C5] px-0.5 block tracking-wide">
                        Work Email
                    </Label>
                    <div className="relative group">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#9B5CFF] group-focus-within:border-[#7C3CFF] group-focus-within:bg-[#7C3CFF]/15 group-focus-within:text-[#C56CFF] transition-all pointer-events-none z-10 shadow-sm">
                            <Mail className="w-4 h-4" />
                        </div>
                        <Input
                            id="email"
                            type="email"
                            placeholder="alex@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-[54px] pr-4 h-11 voltrix-input rounded-xl text-sm text-[#F5F7FF] placeholder:text-[#5B657E] focus:outline-none focus:ring-0 relative z-0 cursor-text pointer-events-auto"
                            disabled={isLoading}
                            autoComplete="email"
                            required
                        />
                    </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5 voltrix-input-group">
                    <Label htmlFor="password" className="text-xs font-semibold text-[#A7B0C5] px-0.5 block tracking-wide">
                        Password
                    </Label>
                    <div className="relative group">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#C56CFF] group-focus-within:border-[#7C3CFF] group-focus-within:bg-[#7C3CFF]/15 group-focus-within:text-[#C56CFF] transition-all pointer-events-none z-10 shadow-sm">
                            <Lock className="w-4 h-4" />
                        </div>
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a strong password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-[54px] pr-12 h-11 voltrix-input rounded-xl text-sm text-[#F5F7FF] placeholder:text-[#5B657E] focus:outline-none focus:ring-0 relative z-0 cursor-text pointer-events-auto"
                            disabled={isLoading}
                            autoComplete="new-password"
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

                {/* Security Requirements Indicators */}
                <div className="flex items-center gap-4 text-[11px] text-[#A7B0C5] pt-1 px-1 font-medium">
                    <span className="flex items-center gap-1.5 text-[#7CC7FF]">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#4F8CFF]" /> 8+ Characters
                    </span>
                    <span className="flex items-center gap-1.5 text-[#C56CFF]">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#7C3CFF]" /> SOC2 Encrypted
                    </span>
                </div>

                {/* Primary Action Button ("Create Account →") */}
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} className="pt-2">
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-11 voltrix-btn-primary flex items-center justify-center gap-2 cursor-pointer group text-sm font-semibold tracking-wide"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin text-[#F5F7FF]" />
                                <span>Creating Account...</span>
                            </>
                        ) : (
                            <>
                                <span>Create Account</span>
                                <ArrowRight className="w-4 h-4 text-[#E8F4FF] transition-transform duration-200 group-hover:translate-x-1.5" />
                            </>
                        )}
                    </Button>
                </motion.div>
            </form>
        </AuthLayout>
    );
}

