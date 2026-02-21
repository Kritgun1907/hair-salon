/**
 * @file sparkles.tsx
 * @description Canvas-based sparkle / particle animation.
 *              Renders floating particles behind child content.
 */

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  fadeSpeed: number;
}

export function SparklesCore({
  id,
  background,
  minSize,
  maxSize,
  particleDensity,
  className,
  particleColor,
}: {
  id?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  speed?: number;
  particleDensity?: number;
  className?: string;
  particleColor?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeObserver = new ResizeObserver(() => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initParticles();
    });
    resizeObserver.observe(canvas);

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    function initParticles() {
      particles.current = [];
      const count = Math.floor(
        ((canvas!.width * canvas!.height) / 10000) * (particleDensity ?? 100)
      );
      for (let i = 0; i < count; i++) {
        particles.current.push(createParticle());
      }
    }

    function createParticle(): Particle {
      const size =
        Math.random() * ((maxSize ?? 3) - (minSize ?? 1)) + (minSize ?? 1);
      return {
        x: Math.random() * canvas!.width,
        y: Math.random() * canvas!.height,
        size,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random(),
        fadeSpeed: Math.random() * 0.02 + 0.005,
      };
    }

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      particles.current.forEach((p, i) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.opacity += p.fadeSpeed;
        if (p.opacity > 1) p.fadeSpeed = -Math.abs(p.fadeSpeed);
        if (p.opacity < 0) {
          particles.current[i] = createParticle();
          return;
        }
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fillStyle = particleColor ?? "#ffffff";
        ctx!.globalAlpha = p.opacity;
        ctx!.fill();
        ctx!.globalAlpha = 1;
      });
      animationRef.current = requestAnimationFrame(animate);
    }

    initParticles();
    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
      resizeObserver.disconnect();
    };
  }, [particleDensity, minSize, maxSize, particleColor]);

  return (
    <canvas
      ref={canvasRef}
      id={id}
      className={cn("h-full w-full", className)}
      style={{ background: background ?? "transparent" }}
    />
  );
}
