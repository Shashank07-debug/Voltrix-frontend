import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import gsap from "gsap";
import { Cpu, ShieldCheck, Zap, Code2, Layers, Sparkles, Terminal, Compass, ArrowUpRight } from "lucide-react";
import { ThreeDCanvas } from "@/components/ThreeDCanvas";
import { ThemeToggle } from "@/components/ThemeToggle";

interface AuthLayoutProps {
  children: React.ReactNode;
  mode: "signin" | "signup";
}

export function AuthLayout({ children, mode }: AuthLayoutProps) {
  const location = useLocation();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Refs for GSAP Animation Control
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtextRef = useRef<HTMLParagraphElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const authPanelRef = useRef<HTMLDivElement>(null);
  const topNavRef = useRef<HTMLElement>(null);
  const energySweepRef = useRef<HTMLDivElement>(null);
  const featureNodesRef = useRef<HTMLDivElement>(null);

  const [isTouchOrReduced, setIsTouchOrReduced] = useState(false);

  useEffect(() => {
    // Check reduced motion or touch capability
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    setIsTouchOrReduced(mediaQuery.matches || hasTouch);

    const handleMouseMove = (e: MouseEvent) => {
      if (mediaQuery.matches || hasTouch) return;
      const { innerWidth, innerHeight } = window;
      // Mouse offset normalized -1 to 1
      const x = (e.clientX / innerWidth - 0.5) * 2;
      const y = (e.clientY / innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const isFirstRenderRef = useRef(true);

  // GSAP Initial Load-In Timeline (~1.5–2.2s total)
  useEffect(() => {
    const ctx = gsap.context(() => {
      const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (isReduced) {
        // Fallback for reduced motion: simple opacity fades
        gsap.to([topNavRef.current, logoRef.current, headlineRef.current, subtextRef.current, authPanelRef.current, featureNodesRef.current], {
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
        });
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Step 1: Nav & Central Logo reveal (Scale 0.92 -> 1, opacity 0 -> 1, glowing halo)
      tl.fromTo(
        topNavRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.7 }
      )
      .fromTo(
        logoRef.current,
        { scale: 0.92, opacity: 0, filter: "brightness(0.5) blur(10px)" },
        { scale: 1, opacity: 1, filter: "brightness(1) blur(0px)", duration: 0.9 },
        "-=0.4"
      )
      // Step 2: Line-by-line Headline Reveal using yPercent + overflow mask
      .fromTo(
        ".gsap-headline-line",
        { yPercent: 100, opacity: 0 },
        { yPercent: 0, opacity: 1, clearProps: "all", duration: 0.85, stagger: 0.12 },
        "-=0.5"
      )
      // Step 3: Supporting copy text reveal
      .fromTo(
        subtextRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.7 },
        "-=0.4"
      )
      // Step 4: Floating Scene Feature Nodes
      .fromTo(
        ".gsap-feature-node",
        { opacity: 0, scale: 0.85, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.7, stagger: 0.1 },
        "-=0.5"
      )
      // Step 5: Translucent Auth Panel Floats up from depth (y 25px -> 0, scale 0.96 -> 1, opacity 0 -> 1)
      .fromTo(
        authPanelRef.current,
        { opacity: 0, scale: 0.96, y: 25 },
        { opacity: 1, scale: 1, y: 0, duration: 0.9, ease: "expo.out" },
        "-=0.7"
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Mode Transition Choreography (Sign In ↔ Sign Up ~500–800ms)
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Energy sweep & Scene flash
      if (energySweepRef.current) {
        gsap.fromTo(
          energySweepRef.current,
          { opacity: 0, scaleX: 0.2 },
          { opacity: 0.7, scaleX: 1, duration: 0.35, ease: "power2.in", yoyo: true, repeat: 1 }
        );
      }

      // Re-trigger headline line-by-line reveal for new mode text
      gsap.fromTo(
        ".gsap-headline-line",
        { yPercent: 80, opacity: 0 },
        { yPercent: 0, opacity: 1, clearProps: "all", duration: 0.6, stagger: 0.12, ease: "power3.out" }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [mode]);

  // Magnetic Hover Effect Handler (max 4–8px shift)
  const handleMagneticMove = (e: React.MouseEvent<HTMLElement>) => {
    if (isTouchOrReduced) return;
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(target, {
      x: x * 0.2,
      y: y * 0.2,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleMagneticLeave = (e: React.MouseEvent<HTMLElement>) => {
    if (isTouchOrReduced) return;
    gsap.to(e.currentTarget, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: "elastic.out(1, 0.5)",
    });
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen w-full relative overflow-x-hidden bg-[#03040B] dark:bg-[#03040B] light:bg-[#F8FAFC] text-[#F5F7FF] dark:text-[#F5F7FF] light:text-[#0F172A] font-sans selection:bg-[#4F8CFF]/30 selection:text-[#E8F4FF] flex flex-col justify-between transition-colors duration-200"
    >
      {/* 5-Layer Cosmic Depth Canvas */}
      <ThreeDCanvas mode={mode} parallaxOffset={isTouchOrReduced ? { x: 0, y: 0 } : { x: mousePos.x, y: mousePos.y }} />

      {/* Mode Switch Energy Sweep Flash Overlay */}
      <div
        ref={energySweepRef}
        className="fixed inset-0 pointer-events-none z-40 opacity-0 bg-gradient-to-r from-transparent via-[#4F8CFF]/20 to-transparent blur-2xl origin-left"
      />

      {/* Ambient Radial Spotlight Backdrops */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            background: mode === "signin"
              ? `radial-gradient(circle at 25% 35%, rgba(79, 140, 255, 0.18), transparent 50%), radial-gradient(circle at 75% 65%, rgba(124, 60, 255, 0.15), transparent 50%)`
              : `radial-gradient(circle at 35% 25%, rgba(124, 60, 255, 0.22), transparent 50%), radial-gradient(circle at 65% 75%, rgba(79, 140, 255, 0.16), transparent 50%)`
          }}
        />
      </div>

      {/* TOP BRAND NAVIGATION BAR (Layer: UI - parallax ~3px) */}
      <header
        ref={topNavRef}
        style={{
          transform: isTouchOrReduced ? "none" : `translate3d(${mousePos.x * 2}px, ${mousePos.y * 2}px, 0)`,
        }}
        className="relative z-30 w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between transition-transform duration-300 ease-out"
      >
        {/* Brand Logo & Name */}
        <Link
          to="/"
          onMouseMove={handleMagneticMove}
          onMouseLeave={handleMagneticLeave}
          className="flex items-center gap-3.5 group cursor-pointer"
        >
          <div className="relative w-10 h-10 rounded-full p-0.5 bg-[#080C1E] dark:bg-[#080C1E] light:bg-[#F1F5F9] border border-[#7CC7FF]/40 shadow-[0_0_20px_rgba(79,140,255,0.3)] flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
            <img
              src="/voltrix-logo.png"
              alt="Voltrix Emblem"
              className="w-full h-full object-contain rounded-full voltrix-logo-glow"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-wider text-[#F5F7FF] dark:text-[#F5F7FF] light:text-[#0F172A] font-mono flex items-center gap-1.5">
              VOLTRIX <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#4F8CFF]/20 border border-[#4F8CFF]/40 text-[#7CC7FF] dark:text-[#7CC7FF] light:text-[#0284C7] font-semibold">AI v2.4</span>
            </span>
          </div>
        </Link>

        {/* Status Pill & Mode Toggle Header Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:flex items-center gap-2.5 px-4 py-1.5 rounded-full voltrix-glass-pill text-xs font-mono text-[#7CC7FF] dark:text-[#7CC7FF] light:text-[#0284C7]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4F8CFF] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4F8CFF]"></span>
            </span>
            <span>SYSTEM ONLINE</span>
          </div>

          <ThemeToggle />

          <Link
            to={mode === "signin" ? "/signup" : "/login"}
            onMouseMove={handleMagneticMove}
            onMouseLeave={handleMagneticLeave}
            className="px-4 py-2 rounded-xl voltrix-glass-pill border border-[#150160]/40 text-xs font-semibold text-[#E8F4FF] dark:text-[#E8F4FF] light:text-[#0F172A] hover:border-[#4F8CFF]/60 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-lg"
          >
            <span>{mode === "signin" ? "Create Account" : "Sign In"}</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#7CC7FF] dark:text-[#7CC7FF] light:text-[#0284C7]" />
          </Link>
        </div>
      </header>

      {/* MAIN EDITORIAL SCENE CONTAINER */}
      <main className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT COLUMN: Editorial Presentation & Atmospheric Environment (Desktop) */}
          <div
            className="lg:col-span-6 flex flex-col justify-center space-y-6 sm:space-y-8 pr-0 lg:pr-6"
            style={{
              transform: isTouchOrReduced ? "none" : `translate3d(${mousePos.x * 6}px, ${mousePos.y * 6}px, 0)`,
            }}
          >
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full voltrix-glass-pill border border-[#4F8CFF]/35 text-xs font-mono text-[#7CC7FF] dark:text-[#7CC7FF] light:text-[#0284C7] w-fit shadow-[0_0_20px_rgba(79,140,255,0.2)]">
              <Sparkles className="w-3.5 h-3.5 text-[#4F8CFF] animate-pulse" />
              <span className="font-semibold tracking-wide text-[#E8F4FF] dark:text-[#E8F4FF] light:text-[#0F172A]">
                {mode === "signin" ? "THE PORTAL INTO VOLTRIX" : "EXPEDITION INTO THE FUTURE"}
              </span>
            </div>

            {/* GSAP Line-by-line Reveal Editorial Headline */}
            <h1
              ref={headlineRef}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-[#F5F7FF]"
            >
              {mode === "signin" ? (
                <>
                  <span className="block overflow-hidden pb-1">
                    <span className="inline-block gsap-headline-line">Step Into the</span>
                  </span>
                  <span className="block overflow-hidden">
                    <span className="inline-block gsap-headline-line gradient-text-voltrix">
                      Neural Workspace.
                    </span>
                  </span>
                </>
              ) : (
                <>
                  <span className="block overflow-hidden pb-1">
                    <span className="inline-block gsap-headline-line">Initialize Your</span>
                  </span>
                  <span className="block overflow-hidden">
                    <span className="inline-block gsap-headline-line gradient-text-voltrix">
                      Developer Portal.
                    </span>
                  </span>
                </>
              )}
            </h1>

            {/* Supporting Copy */}
            <p
              ref={subtextRef}
              className="text-sm sm:text-base text-[#A7B0C5] leading-relaxed max-w-lg font-medium"
            >
              {mode === "signin"
                ? "Experience autonomous full-stack development powered by deep AI synthesis. Access your live environments, agent swarms, and SOC2 encrypted vaults."
                : "Create your account to unlock continuous AI pair programming, sub-second live HMR preview runtimes, and collaborative cloud sandboxes."}
            </p>

            {/* Central Levitating Emblem Core (Embedded in environment) */}
            <div
              ref={logoRef}
              className="relative w-full max-w-[360px] aspect-square hidden lg:flex items-center justify-center my-2 preserve-3d"
            >
              {/* Outer Orbital Energy Ring */}
              <div className="absolute w-[280px] h-[280px] rounded-full border border-dashed border-[#4F8CFF]/40 animate-orbit-slow flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[#7CC7FF] absolute -top-1 shadow-[0_0_12px_#7CC7FF]" />
              </div>
              <div className="absolute w-[210px] h-[210px] rounded-full border border-[#7C3CFF]/50 animate-orbit-reverse flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[#C56CFF] absolute -bottom-1 shadow-[0_0_12px_#C56CFF]" />
              </div>

              {/* Central Glowing Core Badge */}
              <div
                onMouseMove={handleMagneticMove}
                onMouseLeave={handleMagneticLeave}
                className="relative z-30 w-32 h-32 rounded-full p-1 bg-gradient-to-b from-[#4F8CFF] via-[#080C1E] to-[#7C3CFF] border border-[#7CC7FF]/70 shadow-[0_0_60px_rgba(79,140,255,0.55)] flex items-center justify-center group cursor-pointer"
              >
                <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-[#4F8CFF] to-[#7C3CFF] blur-xl opacity-60 group-hover:opacity-90 transition-opacity" />
                <div className="relative w-full h-full rounded-full bg-[#03040B] p-3 flex items-center justify-center overflow-hidden border border-white/20">
                  <img
                    src="/voltrix-logo.png"
                    alt="Voltrix Emblem Core"
                    className="w-full h-full object-contain voltrix-logo-glow transition-transform duration-500 group-hover:scale-110 rounded-full"
                  />
                </div>
              </div>
            </div>

            {/* Orbiting Feature Nodes (Foreground Layer - Parallax ~12px) */}
            <div
              ref={featureNodesRef}
              className="hidden lg:grid grid-cols-3 gap-3 pt-2 max-w-lg"
              style={{
                transform: isTouchOrReduced ? "none" : `translate3d(${mousePos.x * 12}px, ${mousePos.y * 12}px, 0)`,
              }}
            >
              {mode === "signin" ? (
                <>
                  <div className="gsap-feature-node p-3 rounded-xl voltrix-glass-pill border border-[#4F8CFF]/30 flex flex-col items-start gap-1 text-xs">
                    <Cpu className="w-4 h-4 text-[#7CC7FF]" />
                    <span className="font-bold text-[#F5F7FF]">AI Swarm Engine</span>
                    <span className="text-[10px] text-[#A7B0C5]">Autonomous agent</span>
                  </div>
                  <div className="gsap-feature-node p-3 rounded-xl voltrix-glass-pill border border-[#7C3CFF]/30 flex flex-col items-start gap-1 text-xs">
                    <ShieldCheck className="w-4 h-4 text-[#C56CFF]" />
                    <span className="font-bold text-[#F5F7FF]">SOC2 Security</span>
                    <span className="text-[10px] text-[#A7B0C5]">Encrypted state</span>
                  </div>
                  <div className="gsap-feature-node p-3 rounded-xl voltrix-glass-pill border border-[#7CC7FF]/30 flex flex-col items-start gap-1 text-xs">
                    <Zap className="w-4 h-4 text-[#7CC7FF]" />
                    <span className="font-bold text-[#F5F7FF]">Sub-sec HMR</span>
                    <span className="text-[10px] text-[#A7B0C5]">Live preview</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="gsap-feature-node p-3 rounded-xl voltrix-glass-pill border border-[#7C3CFF]/30 flex flex-col items-start gap-1 text-xs">
                    <Terminal className="w-4 h-4 text-[#C56CFF]" />
                    <span className="font-bold text-[#F5F7FF]">AI Pair Programmer</span>
                    <span className="text-[10px] text-[#A7B0C5]">Realtime assist</span>
                  </div>
                  <div className="gsap-feature-node p-3 rounded-xl voltrix-glass-pill border border-[#4F8CFF]/30 flex flex-col items-start gap-1 text-xs">
                    <Compass className="w-4 h-4 text-[#7CC7FF]" />
                    <span className="font-bold text-[#F5F7FF]">Cloud Sandboxes</span>
                    <span className="text-[10px] text-[#A7B0C5]">Instant setup</span>
                  </div>
                  <div className="gsap-feature-node p-3 rounded-xl voltrix-glass-pill border border-[#C56CFF]/30 flex flex-col items-start gap-1 text-xs">
                    <Code2 className="w-4 h-4 text-[#C56CFF]" />
                    <span className="font-bold text-[#F5F7FF]">Fullstack Runtimes</span>
                    <span className="text-[10px] text-[#A7B0C5]">React & Node</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Translucent Floating Auth Panel (UI Layer - Parallax ~3px) */}
          <div
            className="lg:col-span-6 w-full max-w-md mx-auto relative z-30"
            style={{
              transform: isTouchOrReduced ? "none" : `translate3d(${mousePos.x * 3}px, ${mousePos.y * 3}px, 0)`,
            }}
          >
            {/* Outer Energy Halo Glow */}
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-[#4F8CFF]/20 via-transparent to-[#7C3CFF]/20 blur-2xl pointer-events-none" />

            <div
              ref={authPanelRef}
              className="voltrix-glass-card p-6 sm:p-8 relative overflow-hidden pointer-events-auto shadow-[0_25px_80px_rgba(0,0,0,0.8)]"
            >
              {/* Electric Sheen Highlight Header Line */}
              <div className="absolute top-0 left-1/6 right-1/6 h-[2px] bg-gradient-to-r from-transparent via-[#4F8CFF] to-transparent shadow-[0_0_15px_#4F8CFF]" />

              {/* Mobile Emblem Visual Header (Stacked composition for mobile) */}
              <div className="flex flex-col items-center text-center mb-6">
                <div className="lg:hidden relative mb-3 cursor-pointer group flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#4F8CFF] to-[#7C3CFF] blur-md opacity-70" />
                  <div className="relative w-12 h-12 rounded-full p-0.5 bg-[#03040B] border border-[#7CC7FF] shadow-lg flex items-center justify-center overflow-hidden">
                    <img
                      src="/voltrix-logo.png"
                      alt="Voltrix Logo"
                      className="w-full h-full object-contain voltrix-logo-glow rounded-full"
                    />
                  </div>
                </div>

                <h2 className="text-xl sm:text-2xl font-extrabold text-[#F5F7FF] tracking-tight">
                  {mode === "signin" ? "Sign In to Workspace" : "Create Voltrix Portal"}
                </h2>
                <p className="text-xs text-[#A7B0C5] mt-1 font-medium">
                  {mode === "signin"
                    ? "Enter your credentials to enter your developer environment"
                    : "Initialize your identity to start building on Voltrix"}
                </p>
              </div>

              {/* Mode Toggle Tabs Segment */}
              <div className="grid grid-cols-2 p-1 mb-6 rounded-xl bg-[#040814]/90 border border-[#7C3CFF]/25 backdrop-blur-md relative z-10">
                <Link
                  to="/login"
                  className={`relative py-2.5 text-xs font-semibold rounded-lg transition-colors duration-200 text-center z-10 ${
                    mode === "signin"
                      ? "text-[#F5F7FF] shadow-[0_0_20px_rgba(79,140,255,0.3)]"
                      : "text-[#69738C] hover:text-[#F5F7FF]"
                  }`}
                >
                  {mode === "signin" && (
                    <div className="absolute inset-0 bg-gradient-to-r from-[#4F8CFF]/45 to-[#7C3CFF]/45 border border-[#4F8CFF]/60 rounded-lg backdrop-blur-md" />
                  )}
                  <span className="relative z-10">Sign In</span>
                </Link>

                <Link
                  to="/signup"
                  className={`relative py-2.5 text-xs font-semibold rounded-lg transition-colors duration-200 text-center z-10 ${
                    mode === "signup"
                      ? "text-[#F5F7FF] shadow-[0_0_20px_rgba(124,60,255,0.3)]"
                      : "text-[#69738C] hover:text-[#F5F7FF]"
                  }`}
                >
                  {mode === "signup" && (
                    <div className="absolute inset-0 bg-gradient-to-r from-[#7C3CFF]/45 to-[#9B5CFF]/45 border border-[#7C3CFF]/60 rounded-lg backdrop-blur-md" />
                  )}
                  <span className="relative z-10">Sign Up</span>
                </Link>
              </div>

              {/* Form Content Slot */}
              <div className="relative z-10">{children}</div>

              {/* Footer Legal & Security Notice */}
              <div className="mt-6 pt-4 border-t border-white/5 text-[11px] text-center text-[#69738C] leading-relaxed">
                By entering the portal, you agree to Voltrix's{" "}
                <a href="#" className="text-[#7CC7FF] hover:underline font-medium">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-[#7CC7FF] hover:underline font-medium">
                  Privacy Policy
                </a>.
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER METADATA */}
      <footer className="relative z-30 w-full max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#69738C] gap-2">
        <div>© 2026 Voltrix Platform Inc. All rights reserved.</div>
        <div className="flex items-center gap-4">
          <span className="hover:text-[#A7B0C5] cursor-pointer transition-colors">Documentation</span>
          <span>•</span>
          <span className="hover:text-[#A7B0C5] cursor-pointer transition-colors">API Reference</span>
          <span>•</span>
          <span className="hover:text-[#A7B0C5] cursor-pointer transition-colors">Security Vault</span>
        </div>
      </footer>
    </div>
  );
}

