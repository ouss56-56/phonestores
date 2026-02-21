import { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

export function CustomCursor() {
    const [isHovering, setIsHovering] = useState<string | null>(null);
    const mouseX = useMotionValue(-100);
    const mouseY = useMotionValue(-100);

    const springConfig = { damping: 20, stiffness: 250 };
    const cursorX = useSpring(mouseX, springConfig);
    const cursorY = useSpring(mouseY, springConfig);

    useEffect(() => {
        const moveMouse = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };

        const handleHover = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.closest("button") || target.closest("a")) {
                setIsHovering("link");
            } else if (target.closest(".glass-card")) {
                setIsHovering("card");
            } else {
                setIsHovering(null);
            }
        };

        window.addEventListener("mousemove", moveMouse);
        window.addEventListener("mouseover", handleHover);

        return () => {
            window.removeEventListener("mousemove", moveMouse);
            window.removeEventListener("mouseover", handleHover);
        };
    }, [mouseX, mouseY]);

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999] hidden lg:block">
            <motion.div
                className="absolute top-0 left-0 w-8 h-8 rounded-full border border-primary/50 mix-blend-difference"
                style={{
                    x: cursorX,
                    y: cursorY,
                    translateX: "-50%",
                    translateY: "-50%",
                    scale: isHovering === "link" ? 2 : isHovering === "card" ? 1.5 : 1,
                    backgroundColor: isHovering ? "rgba(255, 255, 255, 0.1)" : "transparent",
                }}
                transition={{ type: "spring", ...springConfig }}
            />
            <motion.div
                className="absolute top-0 left-0 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(255,85,25,0.8)]"
                style={{
                    x: mouseX,
                    y: mouseY,
                    translateX: "-50%",
                    translateY: "-50%",
                }}
            />
        </div>
    );
}
