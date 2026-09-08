// src/components/KineticBackground.jsx
import React, { useEffect, useRef } from 'react';

export const KineticBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    // ── Generate 3D Spherical Point-Cloud ──
    const POINT_COUNT = 160;
    const RADIUS = 140;
    const points = [];

    for (let i = 0; i < POINT_COUNT; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / POINT_COUNT);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;

      points.push({
        x: RADIUS * Math.sin(phi) * Math.cos(theta),
        y: RADIUS * Math.sin(phi) * Math.sin(theta),
        z: RADIUS * Math.cos(phi),
        baseRadius: Math.random() * 1.5 + 0.8,
        pulseOffset: Math.random() * Math.PI * 2
      });
    }

    // ── 3D Rotation Physics ──
    let rotX = 0.25;
    let rotY = 0;
    let velX = 0.0015;
    let velY = 0.0035;
    let isDragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;

    const onMouseDown = (e) => {
      // Only drag if clicking in upper hero/interactive zone
      if (e.clientY < window.innerHeight * 0.65) {
        isDragging = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
      }
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - lastMouseX;
      const dy = e.clientY - lastMouseY;
      rotY += dx * 0.007;
      rotX += dy * 0.007;
      velY = dx * 0.0025;
      velX = dy * 0.0025;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Touch events for mobile devices
    const onTouchStart = (e) => {
      if (e.touches.length === 1 && e.touches[0].clientY < window.innerHeight * 0.65) {
        isDragging = true;
        lastMouseX = e.touches[0].clientX;
        lastMouseY = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - lastMouseX;
      const dy = e.touches[0].clientY - lastMouseY;
      rotY += dx * 0.007;
      rotX += dy * 0.007;
      velY = dx * 0.0025;
      velX = dy * 0.0025;
      lastMouseX = e.touches[0].clientX;
      lastMouseY = e.touches[0].clientY;
    };

    const onTouchEnd = () => {
      isDragging = false;
    };

    window.addEventListener('touchstart', onTouchStart);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);

    // ── Render Engine ──
    let tick = 0;
    const render = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Center the 3D sphere in the upper right/center hero area
      const isDesktop = width >= 1024;
      const cx = isDesktop ? width * 0.72 : width * 0.5;
      const cy = isDesktop ? height * 0.32 : height * 0.28;

      ctx.clearRect(0, 0, width, height);

      // Autonomous rotation drift
      if (!isDragging) {
        rotX += velX;
        rotY += velY;
        velX *= 0.985;
        velY *= 0.985;
        if (Math.abs(velX) < 0.001) velX = 0.0012;
        if (Math.abs(velY) < 0.002) velY = 0.0028;
      }

      tick += 0.02;

      // ── Outer 3D Orbit Ring ──
      const ringRadius = 185;
      const ringSegments = 50;
      ctx.beginPath();
      for (let j = 0; j <= ringSegments; j++) {
        const angle = (j / ringSegments) * Math.PI * 2;
        const rx = ringRadius * Math.cos(angle);
        const rz = ringRadius * Math.sin(angle);

        const cosY = Math.cos(rotY * 0.7);
        const sinY = Math.sin(rotY * 0.7);
        const cosX = Math.cos(rotX * 0.7 + 0.35);
        const sinX = Math.sin(rotX * 0.7 + 0.35);

        const x1 = rx * cosY + rz * sinY;
        const z1 = -rx * sinY + rz * cosY;
        const y2 = -z1 * sinX;
        const z2 = z1 * cosX;

        const fov = 400;
        const scale = fov / (fov + z2);
        const projX = cx + x1 * scale;
        const projY = cy + y2 * scale;

        if (j === 0) ctx.moveTo(projX, projY);
        else ctx.lineTo(projX, projY);
      }
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // ── Project 3D Sphere Points ──
      const projected = [];
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      for (let i = 0; i < points.length; i++) {
        const p = points[i];

        const x1 = p.x * cosY + p.z * sinY;
        const z1 = -p.x * sinY + p.z * cosY;
        const y2 = p.y * cosX - z1 * sinX;
        const z2 = p.y * sinX + z1 * cosX;

        const fov = 420;
        const scale = fov / (fov + z2);
        const projX = cx + x1 * scale;
        const projY = cy + y2 * scale;

        projected.push({
          x: projX,
          y: projY,
          z: z2,
          scale,
          pulse: Math.sin(tick * 2 + p.pulseOffset) * 0.5 + 0.5,
          baseRadius: p.baseRadius
        });
      }

      // Depth sort so foreground points draw over background points
      projected.sort((a, b) => b.z - a.z);

      // Connective Neural Traces
      for (let i = 0; i < projected.length; i++) {
        const p1 = projected[i];
        if (p1.z > 20) continue;

        for (let k = i + 1; k < Math.min(i + 5, projected.length); k++) {
          const p2 = projected[k];
          const distSq = (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2;
          if (distSq < 1600) {
            const alpha = (1 - distSq / 1600) * 0.22;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Render Nodes
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        const depthAlpha = (p.z + RADIUS) / (RADIUS * 2);
        const alpha = Math.max(0.18, Math.min(0.95, 1 - depthAlpha * 0.65));
        const r = Math.max(0.7, (p.baseRadius + p.pulse * 0.8) * p.scale);

        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);

        if (p.z < -30) {
          ctx.fillStyle = `rgba(165, 243, 252, ${alpha})`;
          ctx.shadowColor = 'rgba(6, 182, 212, 0.8)';
          ctx.shadowBlur = 6;
        } else {
          ctx.fillStyle = `rgba(59, 130, 246, ${alpha * 0.6})`;
          ctx.shadowBlur = 0;
        }
        ctx.fill();
      }

      ctx.shadowBlur = 0;

      // Ambient Core Glow
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 90);
      grad.addColorStop(0, 'rgba(6, 182, 212, 0.16)');
      grad.addColorStop(0.6, 'rgba(99, 102, 241, 0.07)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, 90, 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden z-0 bg-[#060a14] pointer-events-none">
      {/* ── Perspective Grid Underlay ── */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(6, 182, 212, 0.14) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59, 130, 246, 0.14) 1px, transparent 1px)
          `,
          backgroundSize: '44px 44px',
          maskImage: 'radial-gradient(ellipse 90% 70% at 50% 30%, black 45%, transparent 95%)',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 50% 30%, black 45%, transparent 95%)'
        }}
      />

      {/* ── Interactive 3D Canvas ── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-auto cursor-grab active:cursor-grabbing"
      />
    </div>
  );
};

export default KineticBackground;