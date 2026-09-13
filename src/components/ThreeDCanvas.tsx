import React, { useEffect, useRef } from "react";

interface ThreeDCanvasProps {
  mode?: "signin" | "signup";
  parallaxOffset?: { x: number; y: number };
}

export function ThreeDCanvas({ mode = "signin", parallaxOffset = { x: 0, y: 0 } }: ThreeDCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const modeRef = useRef(mode);
  modeRef.current = mode;

  const parallaxRef = useRef(parallaxOffset);
  parallaxRef.current = parallaxOffset;

  const targetMouseRef = useRef({ x: 0, y: 0 });
  const currentMouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.innerWidth < 768;

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Layer 1: Stars (Persistent Array)
    const starCount = isMobile ? 80 : 200;
    const stars = Array.from({ length: starCount }, () => ({
      x: (Math.random() - 0.5) * 2000,
      y: (Math.random() - 0.5) * 2000,
      z: Math.random() * 1000 + 1,
      size: Math.random() * 1.6 + 0.4,
      alpha: Math.random() * 0.8 + 0.2,
      twinkleSpeed: (Math.random() * 0.02 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
    }));

    // Layer 2: Nebula Clouds
    const nebulaCount = isMobile ? 3 : 5;
    const nebulae = Array.from({ length: nebulaCount }, (_, i) => ({
      relX: 0.15 + (i * 0.22) % 0.7,
      relY: 0.2 + (i * 0.25) % 0.6,
      radius: (isMobile ? 180 : 320) + Math.random() * 100,
      color: i % 2 === 0 ? "rgba(79, 140, 255, " : "rgba(124, 60, 255, ",
      pulse: Math.random() * Math.PI * 2,
      speed: 0.004 + Math.random() * 0.003,
    }));

    // Layer 4: Orbital Energy Rings
    let ringAngle1 = 0;
    let ringAngle2 = Math.PI / 4;
    let ringAngle3 = Math.PI / 2;

    // Layer 3: 3D Wireframe Portal Sphere Nodes
    const sphereRadius = isMobile ? 100 : 160;
    const longitudeLines = 12;
    const latitudeLines = 8;
    let sphereRotY = 0;
    let sphereRotX = 0.2;

    const handleMouseMove = (e: MouseEvent) => {
      if (prefersReducedMotion) return;
      const targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      const targetY = (e.clientY / window.innerHeight - 0.5) * 2;
      targetMouseRef.current = { x: targetX, y: targetY };
    };

    window.addEventListener("mousemove", handleMouseMove);

    const render = () => {
      // Smooth lerp mouse coordinates
      currentMouseRef.current.x += (targetMouseRef.current.x - currentMouseRef.current.x) * 0.05;
      currentMouseRef.current.y += (targetMouseRef.current.y - currentMouseRef.current.y) * 0.05;

      const mx = currentMouseRef.current.x + parallaxRef.current.x;
      const my = currentMouseRef.current.y + parallaxRef.current.y;

      ctx.clearRect(0, 0, width, height);

      // --- LAYER 1: Deep Black/Navy Space Void & Twinkling 3D Starfield ---
      const bgGrad = ctx.createRadialGradient(
        width * 0.5 + mx * 30,
        height * 0.5 + my * 30,
        10,
        width * 0.5,
        height * 0.5,
        Math.max(width, height)
      );
      bgGrad.addColorStop(0, "#060A18");
      bgGrad.addColorStop(0.5, "#03040B");
      bgGrad.addColorStop(1, "#020307");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw Stars (Parallax speed factor: ~2px)
      const starCx = width * 0.5 + mx * 4;
      const starCy = height * 0.5 + my * 4;

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        if (!prefersReducedMotion) {
          s.z -= 0.8;
          if (s.z <= 0) {
            s.z = 1000;
            s.x = (Math.random() - 0.5) * 2000;
            s.y = (Math.random() - 0.5) * 2000;
          }
          s.alpha += s.twinkleSpeed;
          if (s.alpha > 0.95 || s.alpha < 0.15) s.twinkleSpeed *= -1;
        }

        const k = 500 / s.z;
        const px = s.x * k + starCx;
        const py = s.y * k + starCy;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const starAlpha = Math.min(1, (1000 - s.z) / 700) * s.alpha;
          const starRadius = Math.max(0.4, s.size * k * 0.6);

          ctx.beginPath();
          ctx.arc(px, py, starRadius, 0, Math.PI * 2);
          ctx.fillStyle = i % 3 === 0 
            ? `rgba(180, 220, 255, ${starAlpha})` 
            : i % 3 === 1 
            ? `rgba(200, 160, 255, ${starAlpha})` 
            : `rgba(240, 245, 255, ${starAlpha})`;
          ctx.fill();
        }
      }

      // --- LAYER 2: Volumetric Swirling Nebula Clouds (Parallax: ~5px) ---
      const isSignup = modeRef.current === "signup";
      nebulae.forEach((neb, i) => {
        if (!prefersReducedMotion) neb.pulse += neb.speed;

        const pulseScale = 1 + Math.sin(neb.pulse) * 0.12;
        const nebX = (isSignup ? width * (1 - neb.relX) : width * neb.relX) + mx * 8 * (i + 1);
        const nebY = height * neb.relY + my * 8 * (i + 1);
        const currentRad = neb.radius * pulseScale;

        const radGrad = ctx.createRadialGradient(nebX, nebY, 0, nebX, nebY, currentRad);
        const baseColor = isSignup && i % 2 === 0 ? "rgba(160, 60, 255, " : neb.color;
        radGrad.addColorStop(0, `${baseColor}0.14)`);
        radGrad.addColorStop(0.5, `${baseColor}0.05)`);
        radGrad.addColorStop(1, `${baseColor}0)`);

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(nebX, nebY, currentRad, 0, Math.PI * 2);
        ctx.fill();
      });

      // --- LAYER 3 & 4: 3D Cosmic Portal Core & Orbital Energy Rings (Parallax: ~10px) ---
      const portalCenterX = isMobile 
        ? width * 0.5 + mx * 10 
        : isSignup 
        ? width * 0.32 + mx * 12 
        : width * 0.28 + mx * 12;
      const portalCenterY = isMobile 
        ? height * 0.24 + my * 10 
        : height * 0.5 + my * 12;

      // Volumetric Portal Backlight Glow
      const portalGlow = ctx.createRadialGradient(
        portalCenterX, portalCenterY, 10,
        portalCenterX, portalCenterY, sphereRadius * 2.2
      );
      portalGlow.addColorStop(0, isSignup ? "rgba(147, 51, 234, 0.35)" : "rgba(79, 140, 255, 0.35)");
      portalGlow.addColorStop(0.4, isSignup ? "rgba(79, 140, 255, 0.18)" : "rgba(124, 60, 255, 0.18)");
      portalGlow.addColorStop(1, "rgba(3, 4, 11, 0)");
      ctx.fillStyle = portalGlow;
      ctx.beginPath();
      ctx.arc(portalCenterX, portalCenterY, sphereRadius * 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Draw Layer 3: 3D Wireframe Spherical Portal Geometry
      if (!prefersReducedMotion) {
        sphereRotY += 0.006;
        sphereRotX += 0.002;
      }

      ctx.lineWidth = 1;
      const primaryStroke = isSignup ? "rgba(167, 139, 250, " : "rgba(124, 199, 255, ";

      // Latitude circles
      for (let j = 1; j < latitudeLines; j++) {
        const latAngle = (j / latitudeLines) * Math.PI;
        const r = sphereRadius * Math.sin(latAngle);
        const y = sphereRadius * Math.cos(latAngle);

        ctx.beginPath();
        const ellipseHeight = r * Math.sin(sphereRotX);
        const ellipseCenterY = portalCenterY + y * Math.cos(sphereRotX);
        
        ctx.ellipse(
          portalCenterX,
          ellipseCenterY,
          r,
          Math.max(1, Math.abs(ellipseHeight)),
          0,
          0,
          Math.PI * 2
        );
        ctx.strokeStyle = `${primaryStroke}${0.12 + Math.sin(sphereRotY + j) * 0.05})`;
        ctx.stroke();
      }

      // Longitude lines
      for (let i = 0; i < longitudeLines; i++) {
        const lonAngle = (i / longitudeLines) * Math.PI * 2 + sphereRotY;
        const xOffset = Math.sin(lonAngle) * sphereRadius;
        const zDepth = Math.cos(lonAngle);

        if (zDepth > -0.2) {
          ctx.beginPath();
          ctx.ellipse(
            portalCenterX + xOffset * 0.15,
            portalCenterY,
            Math.abs(xOffset),
            sphereRadius,
            0,
            0,
            Math.PI * 2
          );
          ctx.strokeStyle = `${primaryStroke}${0.08 + Math.max(0, zDepth) * 0.15})`;
          ctx.stroke();
        }
      }

      // Draw Layer 4: Orbital Energy Rings (Independent rotation)
      if (!prefersReducedMotion) {
        ringAngle1 += isSignup ? 0.012 : 0.008;
        ringAngle2 -= isSignup ? 0.009 : 0.006;
        ringAngle3 += isSignup ? 0.006 : 0.004;
      }

      // Energy Ring 1 (Outer Blue/Cyan Ring)
      ctx.save();
      ctx.translate(portalCenterX, portalCenterY);
      ctx.rotate(ringAngle1);
      ctx.beginPath();
      ctx.arc(0, 0, sphereRadius * 1.35, 0, Math.PI * 2);
      ctx.setLineDash([12, 18, 4, 18]);
      ctx.strokeStyle = isSignup ? "rgba(147, 51, 234, 0.45)" : "rgba(79, 140, 255, 0.55)";
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Energy Ring Node Bullet 1
      const rx1 = Math.cos(ringAngle1 * 2) * sphereRadius * 1.35;
      const ry1 = Math.sin(ringAngle1 * 2) * sphereRadius * 1.35;
      ctx.beginPath();
      ctx.arc(rx1, ry1, 4, 0, Math.PI * 2);
      ctx.fillStyle = isSignup ? "#C56CFF" : "#7CC7FF";
      ctx.shadowBlur = 12;
      ctx.shadowColor = isSignup ? "#C56CFF" : "#4F8CFF";
      ctx.fill();
      ctx.restore();

      // Energy Ring 2 (Middle Neon Violet Ring)
      ctx.save();
      ctx.translate(portalCenterX, portalCenterY);
      ctx.rotate(ringAngle2);
      ctx.beginPath();
      ctx.ellipse(0, 0, sphereRadius * 1.65, sphereRadius * 0.85, Math.PI / 6, 0, Math.PI * 2);
      ctx.setLineDash([20, 10, 2, 10]);
      ctx.strokeStyle = isSignup ? "rgba(79, 140, 255, 0.5)" : "rgba(124, 60, 255, 0.6)";
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // Energy Ring Node Bullet 2
      const rx2 = Math.cos(ringAngle2 * 1.5) * sphereRadius * 1.65;
      const ry2 = Math.sin(ringAngle2 * 1.5) * sphereRadius * 0.85;
      ctx.beginPath();
      ctx.arc(rx2, ry2, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = isSignup ? "#4F8CFF" : "#9B5CFF";
      ctx.shadowBlur = 10;
      ctx.shadowColor = isSignup ? "#4F8CFF" : "#7C3CFF";
      ctx.fill();
      ctx.restore();

      // Energy Ring 3 (Outer Orbital Sweep)
      ctx.save();
      ctx.translate(portalCenterX, portalCenterY);
      ctx.rotate(ringAngle3);
      ctx.beginPath();
      ctx.arc(0, 0, sphereRadius * 2.0, 0, Math.PI * 2);
      ctx.setLineDash([3, 25]);
      ctx.strokeStyle = "rgba(180, 200, 255, 0.35)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();

      // --- LAYER 5: Atmospheric Energy Dust & Laser Beams ---
      const fgMx = mx * 15;
      const fgMy = my * 15;

      for (let r = 0; r < 4; r++) {
        const rayAngle = (r / 4) * Math.PI * 2 + ringAngle1 * 0.5;
        const rayLength = sphereRadius * (1.8 + Math.sin(rayAngle * 3) * 0.4);
        const rayX = portalCenterX + Math.cos(rayAngle) * rayLength + fgMx * 0.2;
        const rayY = portalCenterY + Math.sin(rayAngle) * rayLength + fgMy * 0.2;

        ctx.beginPath();
        ctx.moveTo(portalCenterX, portalCenterY);
        ctx.lineTo(rayX, rayY);
        const rayGrad = ctx.createLinearGradient(portalCenterX, portalCenterY, rayX, rayY);
        rayGrad.addColorStop(0, "rgba(124, 199, 255, 0.15)");
        rayGrad.addColorStop(0.7, isSignup ? "rgba(167, 139, 250, 0.08)" : "rgba(79, 140, 255, 0.08)");
        rayGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.strokeStyle = rayGrad;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-700"
      style={{ opacity: 1 }}
    />
  );
}


