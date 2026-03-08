'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassCardProps extends HTMLMotionProps<"div"> {
    children: ReactNode;
    className?: string;
    glow?: 'cyan' | 'green' | 'blue' | 'none';
    hover?: boolean;
    padding?: string;
}

export default function GlassCard({
    children,
    className = '',
    glow = 'none',
    hover = true,
    padding = 'p-6',
    ...motionProps
}: GlassCardProps) {
    const glowClass = glow === 'cyan' ? 'glow-cyan' : glow === 'green' ? 'glow-green' : glow === 'blue' ? 'glow-blue' : '';

    return (
        <motion.div
            whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
            transition={{ duration: 0.2 }}
            className={`glass-card ${padding} ${glowClass} ${className}`}
            {...motionProps}
        >
            {children}
        </motion.div>
    );
}
