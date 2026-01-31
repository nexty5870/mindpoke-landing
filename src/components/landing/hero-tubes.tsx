"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    __tubesApp?: any;
    __tubesAutoMove?: number;
  }
}

export function HeroTubes() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Create inline module script to load and initialize
    const script = document.createElement("script");
    script.type = "module";
    script.textContent = `
      import TubesCursor from "https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js";
      
      const canvas = document.getElementById("hero-tubes-canvas");
      if (canvas && !window.__tubesApp) {
        window.__tubesApp = TubesCursor(canvas, {
          tubes: {
            colors: ["#00d4aa", "#a855f7", "#ffb000"],
            count: 25,
            lights: {
              intensity: 120,
              colors: ["#00d4aa", "#a855f7", "#ffb000", "#60aed5"],
            },
          },
        });
        
        // Auto-move animation when mouse is outside hero
        let isInHero = false;
        let autoMoveAngle = 0;
        
        const heroSection = document.querySelector('[data-hero-section]');
        
        const checkHeroHover = (e) => {
          if (heroSection) {
            const rect = heroSection.getBoundingClientRect();
            isInHero = e.clientX >= rect.left && e.clientX <= rect.right && 
                       e.clientY >= rect.top && e.clientY <= rect.bottom;
          }
        };
        
        document.addEventListener('mousemove', checkHeroHover);
        
        // Auto-movement loop - constrained to right side of hero section
        const autoMove = () => {
          if (!isInHero && window.__tubesApp && heroSection) {
            autoMoveAngle += 0.008;
            const rect = heroSection.getBoundingClientRect();
            // Offset center to the right (75% from left)
            const centerX = rect.left + rect.width * 0.75;
            const centerY = rect.top + rect.height * 0.5;
            const radius = Math.min(rect.width, rect.height) * 0.2;
            
            const x = centerX + Math.cos(autoMoveAngle) * radius;
            const y = centerY + Math.sin(autoMoveAngle * 0.7) * radius * 0.6;
            
            // Simulate mouse movement within hero bounds
            const event = new MouseEvent('mousemove', {
              clientX: x,
              clientY: y,
              bubbles: true
            });
            canvas.dispatchEvent(event);
          }
          window.__tubesAutoMove = requestAnimationFrame(autoMove);
        };
        
        window.__tubesAutoMove = requestAnimationFrame(autoMove);
      }
    `;
    document.body.appendChild(script);

    return () => {
      if (window.__tubesAutoMove) {
        cancelAnimationFrame(window.__tubesAutoMove);
      }
      if (window.__tubesApp?.dispose) {
        window.__tubesApp.dispose();
        window.__tubesApp = undefined;
      }
      script.remove();
    };
  }, []);

  return (
    <div
      ref={heroRef}
      className="absolute inset-0 overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {/* Tubes Canvas - rendered first, behind grid */}
      <canvas
        ref={canvasRef}
        id="hero-tubes-canvas"
        className="absolute inset-0"
        style={{
          touchAction: "none",
          zIndex: 1,
          pointerEvents: "auto",
        }}
      />

      {/* Perspective Grid Lines - on top of tubes */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 2 }}
      >
        <div
          className="absolute w-[200%] h-[200%] left-1/2 top-1/2"
          style={{
            transform: 'translate(-50%, -30%) perspective(500px) rotateX(60deg)',
            backgroundImage: `
              linear-gradient(rgba(0, 212, 170, 0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 212, 170, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
            maskImage: 'radial-gradient(ellipse 80% 50% at 50% 50%, black, transparent)',
          }}
        />
      </div>

      {/* Bottom fade gradient */}
      <div
        className="absolute inset-x-0 bottom-0 h-32 pointer-events-none"
        style={{
          zIndex: 3,
          background: 'linear-gradient(to top, #0a0a0f, transparent)',
        }}
      />
    </div>
  );
}
