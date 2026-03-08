'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import {
    ArrowRight, Shield, Zap, Activity, Cpu,
    CheckCircle2, AlertTriangle, Clock, X
} from 'lucide-react';
import Link from 'next/link';

export default function IntroPage() {
    const [stage, setStage] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);
    const bgCanvasRef = useRef<HTMLCanvasElement>(null);

    // Three.js Logic for Background
    useEffect(() => {
        if (!bgCanvasRef.current) return;

        const initThree = async () => {
            const THREE = await import('three');
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer({
                canvas: bgCanvasRef.current!,
                alpha: true,
                antialias: true
            });

            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.position.z = 5;

            const particlesGeometry = new THREE.BufferGeometry();
            const count = 2000;
            const positions = new Float32Array(count * 3);
            const colors = new Float32Array(count * 3);

            for (let i = 0; i < count * 3; i++) {
                positions[i] = (Math.random() - 0.5) * 15;
                colors[i] = Math.random();
            }

            particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

            const particlesMaterial = new THREE.PointsMaterial({
                size: 0.05,
                vertexColors: true,
                transparent: true,
                opacity: 0.6,
                blending: THREE.AdditiveBlending
            });

            const particles = new THREE.Points(particlesGeometry, particlesMaterial);
            scene.add(particles);

            let animId: number;
            const animate = () => {
                animId = requestAnimationFrame(animate);
                particles.rotation.y += 0.0005;
                particles.rotation.x += 0.0002;
                renderer.render(scene, camera);
            };
            animate();

            const handleResize = () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            };
            window.addEventListener('resize', handleResize);

            return () => {
                cancelAnimationFrame(animId);
                window.removeEventListener('resize', handleResize);
                particlesGeometry.dispose();
                particlesMaterial.dispose();
            };
        };

        initThree();
    }, []);

    // GSAP Transitions
    useEffect(() => {
        if (stage === 1) {
            gsap.from(".hero-title", {
                y: 50,
                opacity: 0,
                duration: 1.5,
                ease: "power4.out",
                delay: 0.5
            });
            gsap.from(".hero-tagline", {
                y: 30,
                opacity: 0,
                duration: 1,
                ease: "power3.out",
                delay: 1
            });
        }
    }, [stage]);

    const handleNextStage = () => {
        gsap.to(".stage-content", {
            opacity: 0,
            y: -20,
            duration: 0.5,
            onComplete: () => setStage(2)
        });
    };

    return (
        <div ref={containerRef} className="relative min-h-screen bg-[#0b0d17] text-[#eef1f8] overflow-hidden font-[family-name:var(--font-inter)]">
            {/* Background Layer */}
            <canvas
                ref={bgCanvasRef}
                className="absolute inset-0 pointer-events-none z-0"
            />

            {/* Global Vignette */}
            <div className="absolute inset-0 bg-radial-vignette pointer-events-none z-10" />

            <AnimatePresence mode="wait">
                {stage === 1 ? (
                    <motion.div
                        key="stage1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative z-20 flex flex-col items-center justify-center min-h-screen px-4 text-center stage-content"
                    >
                        <div className="space-y-6 max-w-4xl">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-[#e85d3b] to-[#3be8b0] p-[1px]"
                            >
                                <div className="w-full h-full rounded-2xl bg-[#0b0d17] flex items-center justify-center">
                                    <Activity size={40} className="text-[#e85d3b]" />
                                </div>
                            </motion.div>

                            <h1 className="hero-title text-6xl md:text-8xl font-black tracking-tight font-[family-name:var(--font-outfit)] uppercase">
                                Medi<span className="text-[#e85d3b]">Note</span> AI
                            </h1>

                            <p className="hero-tagline text-xl md:text-2xl text-[#a0a6bd] max-w-2xl mx-auto font-light leading-relaxed">
                                The next evolution in clinical documentation.
                                Experience <span className="text-white font-medium">Ambient Intelligence</span> for modern healthcare.
                            </p>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 2, duration: 1 }}
                                className="pt-12"
                            >
                                <button
                                    onClick={handleNextStage}
                                    className="group relative px-8 py-4 bg-white/5 border border-white/10 rounded-full overflow-hidden hover:border-[#e85d3b]/50 transition-all duration-300"
                                >
                                    <div className="relative z-10 flex items-center gap-3 font-semibold tracking-wider uppercase text-sm">
                                        Enter Experience <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#e85d3b]/0 via-[#e85d3b]/10 to-[#e85d3b]/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                </button>
                            </motion.div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="stage2"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative z-20 flex flex-col items-center justify-center min-h-screen px-4 py-20 stage-content"
                    >
                        <div className="max-w-6xl w-full">
                            <div className="text-center mb-16">
                                <h2 className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-outfit)] mb-4">
                                    Legacy vs. <span className="text-[#3be8b0]">Modern AI</span>
                                </h2>
                                <p className="text-[#a0a6bd]">A fundamental shift in medical productivity</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <motion.div
                                    initial={{ x: -50, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] relative overflow-hidden group"
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Clock size={120} />
                                    </div>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                                            <AlertTriangle className="text-red-500" size={20} />
                                        </div>
                                        <h3 className="text-xl font-bold font-[family-name:var(--font-outfit)]">Legacy Documentation</h3>
                                    </div>
                                    <ul className="space-y-4 mb-8">
                                        {['Manual data entry into EHR', 'Hours of "pajama time"', 'Burnout & dissatisfaction'].map((item, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-[#a0a6bd]">
                                                <X size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>

                                <motion.div
                                    initial={{ x: 50, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="p-8 rounded-3xl bg-[#3be8b0]/[0.05] border border-[#3be8b0]/20 relative overflow-hidden group shadow-[0_0_50px_-12px_rgba(59,232,176,0.3)]"
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Zap size={120} />
                                    </div>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-[#3be8b0]/10 flex items-center justify-center">
                                            <Activity className="text-[#3be8b0]" size={20} />
                                        </div>
                                        <h3 className="text-xl font-bold font-[family-name:var(--font-outfit)]">MediNote AI Ambient</h3>
                                    </div>
                                    <ul className="space-y-4 mb-8">
                                        {['Ambient conversation capture', 'Automated SOAP notes', 'Instant clinical alerts'].map((item, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-[#eef1f8]">
                                                <CheckCircle2 size={16} className="text-[#3be8b0] mt-0.5 flex-shrink-0" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            </div>

                            <div className="mt-16 text-center">
                                <Link
                                    href="/dashboard"
                                    className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-[#e85d3b] to-[#3be8b0] rounded-full text-white font-bold tracking-widest uppercase text-sm hover:scale-105 transition-all duration-300"
                                >
                                    Enter Application <ArrowRight />
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .bg-radial-vignette {
                    background: radial-gradient(circle at center, transparent 0%, rgba(11, 13, 23, 0.4) 50%, rgba(11, 13, 23, 0.9) 100%);
                }
            `}</style>
        </div>
    );
}
