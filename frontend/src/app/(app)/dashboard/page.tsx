'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, FileText, Activity, Zap, Mic, BarChart3,
    X, Download, Shield, Sparkles, Layout,
    Search, Clock, AlertTriangle, CheckCircle2,
    ArrowUpRight, Target, HeartPulse
} from 'lucide-react';
import AnimatedCounter from '@/components/AnimatedCounter';
import PageTransition from '@/components/PageTransition';
import api, { apiRoutes } from '@/lib/api';
import { useRouter } from 'next/navigation';

const FEATURES = [
    { title: 'Ambient Audio Capture', desc: 'Real-time record with noise suppression.', icon: Mic },
    { title: 'SOAP Note Generation', desc: 'Automatic structuring using medical NLP.', icon: FileText },
    { title: 'Clinical Risk Detection', desc: 'Identification of patient red flags.', icon: AlertTriangle },
    { title: 'Interactive Analytics', desc: 'Diagnosis patterns and clinical trends.', icon: BarChart3 },
    { title: 'Premium PDF Export', desc: 'Professional resumes for billing.', icon: Download },
    { title: 'Medical Dashboard', desc: 'Futuristic interface for EHR management.', icon: Layout },
];

const RECENT_CONSULTATIONS = [
    { id: 'VAR-001', name: 'Varun Tej', doctor: 'Dr. Priya Sharma', status: 'Note Generated', time: '10:25 AM', date: 'Mar 08', info: 'Fever, Headache' },
    { id: 'ADH-002', name: 'Adhil Khan', doctor: 'Dr. Mohan Reddy', status: 'Processing', time: '10:10 AM', date: 'Mar 08', info: 'Fatigue, Dizziness' },
    { id: 'JAS-003', name: 'Jaswanth Kumar', doctor: 'Dr. Ananya Iyer', status: 'Risk Alert', time: '09:50 AM', date: 'Mar 08', info: 'Cough, Chest Pain' },
    { id: 'PRI-004', name: 'Priya Sharma', doctor: 'Dr. Rajesh Khanna', status: 'Note Generated', time: '09:30 AM', date: 'Mar 08', info: 'Nausea, Migraine' },
    { id: 'VAN-005', name: 'Vanjinathan S', doctor: 'Dr. Suresh Raina', status: 'Completed', time: '08:45 AM', date: 'Mar 08', info: 'Back Pain' },
    { id: 'THA-006', name: 'Thanveer Ahmed', doctor: 'Dr. Vikram Singh', status: 'Risk Alert', time: '08:15 AM', date: 'Mar 08', info: 'Shortness of Breath' },
    { id: 'MOH-007', name: 'Mohan Reddy', doctor: 'Dr. Kavita Rao', status: 'Completed', time: '07:30 AM', date: 'Mar 08', info: 'Joint Pain' },
    { id: 'RAH-008', name: 'Rahul Verma', doctor: 'Dr. Sanjay Dutt', status: 'Note Generated', time: '06:55 AM', date: 'Mar 08', info: 'Cold, Fever' },
];

export default function DashboardPage() {
    const router = useRouter();
    const [stats, setStats] = useState({ total_patients_today: 12, notes_generated: 28, alerts_detected: 5, active_consultations: 3 });
    const [showFeatures, setShowFeatures] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes] = await Promise.all([
                    api.get(apiRoutes.dashboardStats),
                ]);
                setStats(statsRes.data);
            } catch {
                // Fallback to static stats
            }
        };
        fetchData();
    }, []);

    const statCards = [
        { label: 'Consultations', value: stats.total_patients_today },
        { label: 'Notes Generated', value: stats.notes_generated },
        { label: 'Alerts Detected', value: stats.alerts_detected },
        { label: 'Active Sessions', value: stats.active_consultations },
    ];

    return (
        <PageTransition>
            {/* Feature Hub Overlay */}
            <AnimatePresence>
                {showFeatures && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl p-8 md:p-20 overflow-y-auto"
                    >
                        <button
                            onClick={() => setShowFeatures(false)}
                            className="absolute top-10 right-10 p-4 rounded-full bg-white/5 text-white hover:bg-[#e85d3b] transition-all"
                        >
                            <X size={24} />
                        </button>

                        <div className="max-w-6xl mx-auto">
                            <div className="mb-20 text-center">
                                <span className="text-[#e85d3b] text-xs font-bold tracking-[0.4em] uppercase mb-4 block">Capabilities</span>
                                <h1 className="text-4xl md:text-6xl font-black text-white">System Features</h1>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {FEATURES.map((f, i) => (
                                    <div key={f.title} className="bg-white/[0.03] border border-white/5 rounded-[40px] p-10">
                                        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 text-[#e85d3b]">
                                            <f.icon size={32} />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                                        <p className="text-sm text-white/30 leading-relaxed font-medium">{f.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Simple Hero */}
            <div className="relative bg-[#181818] rounded-[40px] p-8 md:p-10 mb-6 overflow-hidden border border-white/5">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="max-w-xl text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#e85d3b]/20 border border-[#e85d3b]/30 mb-6 font-bold tracking-wider">
                            <Zap size={14} className="text-[#e85d3b]" />
                            <span className="text-[10px] text-[#e85d3b] uppercase">Clinical AI Portal</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
                            Medical <br />
                            <span className="text-[#e85d3b]">Intelligence</span>
                        </h1>
                    </div>

                    {/* Interactive Feature Hub */}
                    <div
                        onClick={() => setShowFeatures(true)}
                        className="relative w-48 h-48 md:w-56 md:h-56 flex-shrink-0 cursor-pointer group"
                    >
                        <div className="absolute inset-0 rounded-full border border-white/5 animate-[spin_20s_linear_infinite]" />
                        <div className="absolute inset-2 rounded-full border border-dashed border-[#e85d3b]/30" />
                        <div className="absolute inset-4 rounded-full bg-[#e85d3b] shadow-[0_0_50px_-10px_rgba(232,93,59,0.5)] flex flex-col items-center justify-center text-white transition-all group-hover:shadow-[0_0_70px_-5px_rgba(232,93,59,0.8)]">
                        </div>
                    </div>
                </div>
            </div>

            {/* Simple Metrics */}
            <div className="bg-[#d5e6d8] rounded-[30px] p-8 mb-8 flex flex-wrap items-center justify-between gap-8 md:px-12">
                {statCards.map((stat, i) => (
                    <div key={stat.label} className={`flex-1 min-w-[150px] flex flex-col items-center md:items-start ${i < statCards.length - 1 ? 'md:border-r border-black/10' : ''}`}>
                        <div className="text-4xl font-black text-black mb-1">
                            <AnimatedCounter value={stat.value} />
                        </div>
                        <div className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Minimalist Dashboard Actions */}
            <div className="bg-[#181818] rounded-[40px] border border-white/5 p-12 mb-6 flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Patient Records</h3>
                    <p className="text-sm text-white/40 max-w-sm">Access your full clinical census, history, and patient profiles in the dedicated directory.</p>
                </div>
                <button
                    onClick={() => router.push('/patients')}
                    className="px-8 py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.05] transition-all flex items-center gap-3"
                >
                    View Patient Directory <ArrowUpRight size={16} />
                </button>
            </div>

            {/* Simple Visual Replacement for Graph */}
            <div className="grid md:grid-cols-3 gap-6">
                {[
                    { label: 'System Health', value: '99.9%', icon: HeartPulse, color: 'text-green-500' },
                    { label: 'Avg Processing', value: '4.2s', icon: Target, color: 'text-[#e85d3b]' },
                    { label: 'Accuracy Rating', value: '98.8%', icon: CheckCircle2, color: 'text-cyan-500' }
                ].map((item) => (
                    <div key={item.label} className="bg-[#181818] rounded-[40px] p-8 border border-white/5 flex items-center justify-between group hover:bg-[#202020] transition-colors">
                        <div>
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-2">{item.label}</p>
                            <h4 className="text-xl font-black text-white">{item.value}</h4>
                        </div>
                        <div className={`w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center ${item.color}`}>
                            <item.icon size={20} />
                        </div>
                    </div>
                ))}
            </div>
        </PageTransition>
    );
}
