import React, { useState, useEffect, useRef } from 'react';
import { QrCode, MoveRight, Fingerprint, Crown, Sparkles, Star, Eye } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// --- DANGEROUS PROCEDURAL SCORPION ---
const DangerousScorpion = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mouse = { x: width / 2, y: height / 2 };
    const segments: { x: number; y: number; angle: number }[] = [];
    const numSegments = 28; // Longer, more menacing tail
    const segLength = 22;

    for (let i = 0; i < numSegments; i++) {
      segments.push({ x: width / 2, y: height / 2, angle: 0 });
    }

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      let targetX = mouse.x;
      let targetY = mouse.y;

      // Inverse Kinematics Logic
      for (let i = 0; i < numSegments; i++) {
        const seg = segments[i];
        const dx = targetX - seg.x;
        const dy = targetY - seg.y;
        seg.angle = Math.atan2(dy, dx);
        seg.x = targetX - Math.cos(seg.angle) * segLength;
        seg.y = targetY - Math.sin(seg.angle) * segLength;
        targetX = seg.x;
        targetY = seg.y;
      }

      // Draw the "Scorpion Spine"
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      for (let i = 0; i < numSegments; i++) {
        const seg = segments[i];
        const ribAngle = seg.angle + Math.PI / 2;
        // Ribs get smaller towards the tip
        const ribLen = Math.max(2, 22 - i * 0.7) + Math.sin(Date.now() * 0.01 + i) * 2;

        ctx.beginPath();
        ctx.strokeStyle = i === 0 ? 'rgba(255, 0, 0, 0.4)' : 'rgba(100, 100, 255, 0.15)';
        ctx.lineWidth = Math.max(1, 4 - i * 0.1);

        // Draw Vertebrae/Ribs
        ctx.moveTo(seg.x + Math.cos(ribAngle) * ribLen, seg.y + Math.sin(ribAngle) * ribLen);
        ctx.lineTo(seg.x - Math.cos(ribAngle) * ribLen, seg.y - Math.sin(ribAngle) * ribLen);
        ctx.stroke();

        // Connect segments
        if (i < numSegments - 1) {
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(100, 100, 255, 0.1)';
          ctx.moveTo(seg.x, seg.y);
          ctx.lineTo(segments[i + 1].x, segments[i + 1].y);
          ctx.stroke();
        }
      }

      // The Stinger (Danger Zone)
      ctx.beginPath();
      const stingerPulse = 6 + Math.sin(Date.now() * 0.01) * 2;
      ctx.arc(mouse.x, mouse.y, stingerPulse, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 50, 50, 0.8)';
      ctx.shadowBlur = 15;
      ctx.shadowColor = 'red';
      ctx.fill();
      ctx.shadowBlur = 0;

      requestAnimationFrame(animate);
    };

    animate();
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-60" />;
};

const ScanGoEntry = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [statusIndex, setStatusIndex] = useState(0);
  const navigate = useNavigate();
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [10, -10]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-10, 10]), springConfig);

  const sassyQuotes = [
    "Retinal scan initiated...",
    "User detected. Aesthetic: 10/10.",
    "Bypassing the commoners...",
    "Scorpion protocol: Engaged.",
    "Don't blink. Accessing..."
  ];

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  useEffect(() => {
    if (isHovered) {
      const interval = setInterval(() => setStatusIndex(s => (s + 1) % sassyQuotes.length), 2000);
      return () => clearInterval(interval);
    }
  }, [isHovered]);

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 font-sans selection:bg-primary/20 overflow-hidden perspective-1000"
    >
      {/* RESTORED: THE ORIGINAL GLOW THEME */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div 
          className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"
          style={{ maskImage: 'radial-gradient(circle at center, black, transparent 80%)' }}
        />
        {/* The Original Decorative Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full" />
        
        {/* Mouse Follower Glow */}
        <motion.div 
          className="absolute w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px]"
          animate={{ x: mouseX, y: mouseY }}
        />
      </div>

      {/* DANGEROUS SCORPION LAYER */}
      <DangerousScorpion />

      <motion.div 
        style={{ rotateX, rotateY }}
        className="z-10 w-full max-w-2xl transition-transform duration-200 ease-out"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6 px-4">
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow-primary rotate-3">
              <Star size={18} className="text-white fill-current" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase text-gradient">The QR-Project</span>
          </motion.div>
          <div className="flex items-center gap-2 bg-secondary/50 backdrop-blur px-4 py-2 rounded-full border border-border">
             <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
             <span className="text-[10px] font-bold uppercase tracking-widest italic text-success">Presence Detected</span>
          </div>
        </div>

        {/* The 3D Glass Card */}
        <div 
          className="glass-card rounded-radius-xl p-[2px] relative overflow-hidden group shadow-2xl"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* REVEAL LIGHT */}
          <motion.div 
             className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
             style={{
               background: useTransform(
                 [mouseX, mouseY], 
                 (v) => `radial-gradient(600px circle at ${v[0] + 300}px ${v[1] + 200}px, rgba(var(--primary-rgb), 0.1), transparent 40%)`
               )
             }}
          />

          <div className="bg-card/90 backdrop-blur-3xl rounded-[calc(var(--radius-xl)-2px)] p-8 md:p-12 relative z-10">
            <div className="flex flex-col md:flex-row gap-12 items-center">
              
              {/* 3D PROXIMITY QR CODE */}
              <motion.div 
                style={{ rotateY: useTransform(mouseX, [-300, 300], [-15, 15]), rotateX: useTransform(mouseY, [-300, 300], [15, -15]) }}
                className="relative shrink-0"
              >
                <div className="w-48 h-48 qr-preview-container border border-primary/20 bg-white/5 backdrop-blur shadow-inner relative group-hover:border-primary/60 transition-all duration-500">
                  <QrCode size={110} strokeWidth={1} className="text-primary group-hover:scale-110 transition-transform duration-700" />
                  <motion.div 
                    animate={{ top: ['10%', '90%', '10%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute left-2 right-2 h-[1px] bg-primary shadow-[0_0_20px_var(--primary)]"
                  />
                </div>
              </motion.div>

              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 mb-4 bg-primary/10 px-3 py-1 rounded-md">
                   <Eye size={12} className="text-primary animate-pulse" />
                   <AnimatePresence mode="wait">
                    <motion.span 
                      key={statusIndex}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="text-[10px] font-black tracking-widest text-primary uppercase"
                    >
                      {isHovered ? sassyQuotes[statusIndex] : "Analyzing observer..."}
                    </motion.span>
                  </AnimatePresence>
                </div>

                <h1 className="text-5xl font-black tracking-tighter mb-4 leading-none">
                  Wait.<br />
                  <span className="text-gradient">You're the one.</span>
                </h1>
                
                <p className="text-muted-foreground text-sm font-medium leading-relaxed mb-8">
                  Design and generate scannable QR codes and print-ready labels for packaging, inventory, events, products, and more. <span className="text-foreground italic underline decoration-primary">Let's assume it's the one.</span>
                </p>

                <div className="flex gap-4 justify-center md:justify-start">
                  <div className="badge badge-primary bg-opacity-20 hover-lift cursor-default">
                    Protocol: SCOI.IO
                  </div>
                  <div className="badge badge-secondary hover-lift cursor-default">
                    Role: Developer
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-12">
              <button 
                onClick={() => navigate('/dashboard')}
                className="btn-glow w-full py-6 rounded-radius-lg flex items-center justify-between px-10 group relative overflow-hidden"
              >
                <motion.div 
                  className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" 
                />
                <span className="uppercase tracking-[0.4em] font-black text-xs">Enter Our system</span>
                <div className="flex items-center gap-2">
                   <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity -translate-x-4 group-hover:translate-x-0 duration-300">STAY CLASSY</span>
                   <MoveRight className="group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center mt-12 text-[9px] text-muted-foreground font-black tracking-[0.6em] uppercase opacity-40 hover:opacity-100 transition-opacity cursor-help">
          Intention is everything.
        </p>
      </motion.div>
    </div>
  );
};

export default ScanGoEntry;