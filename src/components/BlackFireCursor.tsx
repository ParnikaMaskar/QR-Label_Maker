import React, { useEffect, useState, useRef } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

const NeuralPulseCursor = () => {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const [isHovering, setIsHovering] = useState(false);
  const [velocity, setVelocity] = useState(0);
  
  const springConfig = { damping: 25, stiffness: 250 };
  const sx = useSpring(cursorX, springConfig);
  const sy = useSpring(cursorY, springConfig);

  useEffect(() => {
    let lastX = 0;
    let lastY = 0;

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);

      // Calculate speed for the "pulse" effect
      const deltaX = Math.abs(e.clientX - lastX);
      const deltaY = Math.abs(e.clientY - lastY);
      setVelocity(Math.min(deltaX + deltaY, 100));
      
      lastX = e.clientX;
      lastY = e.clientY;
    };

    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (window.getComputedStyle(target).cursor === 'pointer') {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleOver);
    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleOver);
    };
  }, []);

  return (
    <>
      {/* 1. THE SPOTLIGHT (Gravity Well) */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-[9998] opacity-50"
        style={{
          background: `radial-gradient(circle 150px at ${sx.get()}px ${sy.get()}px, rgba(var(--primary-rgb), 0.08), transparent 80%)`,
        }}
      />

      {/* 2. THE PRECISION RING */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9999] rounded-full border border-primary/40 mix-blend-difference"
        style={{
          x: sx,
          y: sy,
          translateX: '-50%',
          translateY: '-50%',
          // The ring expands when you move fast and shrinks when you hover
          width: isHovering ? 80 : 20 + velocity * 0.5,
          height: isHovering ? 80 : 20 + velocity * 0.5,
          backgroundColor: isHovering ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent',
          borderWidth: isHovering ? '1px' : '2px',
        }}
        transition={{ type: 'spring', bounce: 0.3 }}
      />

      {/* 3. THE CENTER POINT */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9999] h-1 w-1 rounded-full bg-primary"
        style={{
          x: sx,
          y: sy,
          translateX: '-50%',
          translateY: '-50%',
        }}
      />
    </>
  );
};

export default NeuralPulseCursor;