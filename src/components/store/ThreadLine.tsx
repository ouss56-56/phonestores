import { motion, useScroll, useSpring } from "framer-motion";

export default function ThreadLine() {
    const { scrollYProgress } = useScroll();
    const scaleY = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    return (
        <div className="fixed top-0 right-8 w-[1px] h-full pointer-events-none z-[100] hidden lg:block">
            {/* Track */}
            <div className="absolute inset-0 bg-black/[0.03]" />

            {/* Active Line */}
            <motion.div
                className="absolute top-0 left-0 w-full bg-red-500 origin-top h-full"
                style={{ scaleY }}
            />

            {/* Decorative Dot */}
            <motion.div
                className="absolute w-2 h-2 rounded-full bg-red-500 -left-[3.5px]"
                style={{ top: `${scaleY.get() * 100}%` }}
            />
        </div>
    );
}
