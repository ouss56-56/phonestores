import { useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  strength?: number;
}

export function MagneticButton({ children, className = "", onClick, strength = 6 }: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 20 });
  const springY = useSpring(y, { stiffness: 200, damping: 20 });

  const handleMouse = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) / rect.width * strength * 2);
    y.set((e.clientY - cy) / rect.height * strength * 2);
  }, [x, y, strength]);

  const handleLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);

  return (
    <motion.button
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.button>
  );
}

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
}

export function TiltCard({ children, className = "", maxTilt = 3 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRX = useSpring(rotateX, { stiffness: 150, damping: 15 });
  const springRY = useSpring(rotateY, { stiffness: 150, damping: 15 });
  const shadow = useTransform(
    [springRX, springRY],
    ([rx, ry]: number[]) => {
      const x = -(ry as number) * 3;
      const y = (rx as number) * 3;
      return `${x}px ${y + 15}px 40px rgba(0,0,0,0.3)`;
    }
  );

  const handleMouse = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    rotateX.set(((e.clientY - cy) / rect.height) * -maxTilt);
    rotateY.set(((e.clientX - cx) / rect.width) * maxTilt);
  }, [rotateX, rotateY, maxTilt]);

  const handleLeave = useCallback(() => { rotateX.set(0); rotateY.set(0); }, [rotateX, rotateY]);

  return (
    <motion.div
      ref={ref}
      style={{ rotateX: springRX, rotateY: springRY, boxShadow: shadow, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function LiquidDivider({ color = "hsl(15,85%,55%)" }: { color?: string }) {
  return (
    <div className="wave-divider" aria-hidden="true">
      <svg viewBox="0 0 2400 80" preserveAspectRatio="none" fill="none">
        <path
          d={`M0,40 C200,10 400,70 600,40 C800,10 1000,70 1200,40 C1400,10 1600,70 1800,40 C2000,10 2200,70 2400,40 L2400,80 L0,80Z`}
          fill={color}
          fillOpacity="0.04"
        />
        <path
          d={`M0,50 C200,20 400,60 600,45 C800,30 1000,65 1200,50 C1400,35 1600,60 1800,45 C2000,30 2200,55 2400,50 L2400,80 L0,80Z`}
          fill={color}
          fillOpacity="0.06"
        />
      </svg>
    </div>
  );
}

export function ThreadLine() {
  return (
    <svg
      className="fixed left-8 top-0 h-full w-[2px] z-0 pointer-events-none hidden lg:block"
      viewBox="0 0 2 2000"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <line
        x1="1" y1="0" x2="1" y2="2000"
        stroke="hsl(15,85%,55%)"
        strokeWidth="1"
        strokeOpacity="0.12"
        className="thread-line"
      />
    </svg>
  );
}
