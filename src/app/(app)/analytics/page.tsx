'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import { TrendingUp, Users, Activity, Brain, Clock, Target, HeartPulse } from 'lucide-react';
import AnimatedCounter from '@/components/AnimatedCounter';
import PageTransition, { StaggerContainer, StaggerItem } from '@/components/PageTransition';
import api, { apiRoutes } from '@/lib/api';

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#181818] border border-white/10 rounded-2xl p-4 shadow-2xl backdrop-blur-xl">
                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">{label}</p>
                {payload.map((p: any, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                        <p className="text-sm font-bold text-white">
                            {p.name}: <span className="text-[#e85d3b]">{p.value}</span>
                        </p>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function AnalyticsPage() {
    const [stats, setStats] = useState({ total_symptoms: 268, total_diagnoses: 115, critical_alerts: 5, active_patients: 100 });
    const [diseases, setDiseases] = useState<any[]>([]);
    const [timeline, setTimeline] = useState<any[]>([]);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [dRes, tRes] = await Promise.all([
                    api.get(apiRoutes.diseaseDistribution),
                    api.get(apiRoutes.consultationTimeline),
                ]);
                setDiseases(dRes.data);
                setTimeline(tRes.data);
            } catch {
                setDiseases([
                    { name: 'Respiratory', value: 32, color: '#e85d3b' },
                    { name: 'Cardiac', value: 24, color: '#ef4444' },
                    { name: 'Neurological', value: 18, color: '#6366f1' },
                    { name: 'Metabolic', value: 14, color: '#2EC4B6' },
                    { name: 'Other', value: 12, color: '#94a3b8' },
                ]);
                setTimeline([
                    { date: 'Mon', consultations: 45, notes: 42 },
                    { date: 'Tue', consultations: 52, notes: 49 },
                    { date: 'Wed', consultations: 61, notes: 58 },
                    { date: 'Thu', consultations: 48, notes: 46 },
                    { date: 'Fri', consultations: 72, notes: 70 },
                    { date: 'Sat', consultations: 35, notes: 33 },
                    { date: 'Sun', consultations: 28, notes: 25 },
                ]);
            }
        };
        fetchAll();
    }, []);

    return (
        <PageTransition>
            <div className="mb-8">
                <h1 className="text-3xl font-black text-white">Clinical Analytics</h1>
                <p className="text-xs text-white/30 uppercase tracking-[0.2em] font-bold mt-1">Intelligence Output & Patterns</p>
            </div>

            {/* Consolidated Metrics */}
            <div className="bg-[#d5e6d8] rounded-[40px] p-10 mb-8 flex flex-wrap items-center justify-between gap-10 md:px-16">
                {[
                    { label: 'Clinical Output', value: stats.total_symptoms, icon: Activity },
                    { label: 'Active Patterns', value: stats.total_diagnoses, icon: Brain },
                    { label: 'Critical Signals', value: stats.critical_alerts, icon: TrendingUp },
                    { label: 'Patient Volume', value: stats.active_patients, icon: Users },
                ].map((stat, i) => (
                    <div key={stat.label} className={`flex-1 min-w-[150px] flex flex-col items-center md:items-start ${i < 3 ? 'md:border-r border-black/10' : ''}`}>
                        <div className="text-4xl font-black text-black mb-1">
                            <AnimatedCounter value={stat.value} />
                        </div>
                        <div className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em]">{stat.label}</div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-[1fr_450px] gap-8">
                {/* Unified Trends */}
                <div className="bg-[#181818] rounded-[40px] border border-white/5 p-10">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-1">Consultation Velocity</h3>
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Weekly Note Generation</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#e85d3b]" />
                                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Consultations</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-white/20" />
                                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Notes</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={timeline} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorConsults" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#e85d3b" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#e85d3b" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.1)', fontSize: 10, fontWeight: 900 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.1)', fontSize: 10, fontWeight: 900 }} />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(232,93,59,0.2)', strokeWidth: 2 }} />
                                <Area type="monotone" dataKey="consultations" stroke="#e85d3b" strokeWidth={4} fill="url(#colorConsults)" />
                                <Area type="monotone" dataKey="notes" stroke="rgba(255,255,255,0.2)" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Diagnosis Focus */}
                <div className="bg-[#181818] rounded-[40px] border border-white/5 p-10 flex flex-col">
                    <div className="mb-10 text-center md:text-left">
                        <h3 className="text-xl font-bold text-white mb-1">Diagnosis Mix</h3>
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Disease Category Distribution</p>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="h-[250px] w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={diseases} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value" stroke="none">
                                        {diseases.map((entry, i) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-3xl font-black text-white">115</span>
                                <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Total</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 w-full mt-10">
                            {diseases.map((d) => (
                                <div key={d.name} className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color }} />
                                        <span className="text-[9px] font-black text-white uppercase tracking-widest">{d.name}</span>
                                    </div>
                                    <p className="text-lg font-black text-white/80">{d.value}%</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Simplest KPI Visuals */}
            <div className="grid md:grid-cols-3 gap-6 mt-8">
                {[
                    { label: 'Clinical Accuracy', value: '98.8%', icon: HeartPulse, color: 'text-green-500' },
                    { label: 'Documentation Load', value: '-85%', icon: Target, color: 'text-[#e85d3b]' },
                    { label: 'System Uptime', value: '100%', icon: CheckCircle2, color: 'text-cyan-500' }
                ].map((item) => (
                    <div key={item.label} className="bg-[#181818] rounded-[40px] p-8 border border-white/5 flex items-center justify-between group">
                        <div>
                            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-2">{item.label}</p>
                            <h4 className="text-2xl font-black text-white">{item.value}</h4>
                        </div>
                        <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${item.color}`}>
                            <item.icon size={24} />
                        </div>
                    </div>
                ))}
            </div>
        </PageTransition>
    );
}

const CheckCircle2 = ({ size, className }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M20 6 9 17l-5-5" /><circle cx="12" cy="12" r="10" />
    </svg>
);
