'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    AlertTriangle, ShieldAlert, Heart, Brain, Pill, Activity,
    ChevronRight, AlertCircle, Info, User, Clock, Target
} from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import PageTransition, { StaggerContainer, StaggerItem } from '@/components/PageTransition';
import api, { apiRoutes } from '@/lib/api';

interface RiskAlert {
    id: number;
    patient_id: string;
    patient_name: string;
    alert_type: string;
    severity: string;
    title: string;
    description: string;
    recommendation: string;
    created_at: string;
    time: string;
}

const severityConfig: Record<string, { color: string; bg: string; border: string; icon: any }> = {
    critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', icon: ShieldAlert },
    high: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', icon: AlertTriangle },
    medium: { color: '#e85d3b', bg: 'rgba(232,93,59,0.1)', border: 'rgba(232,93,59,0.3)', icon: AlertCircle },
    low: { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.3)', icon: Info },
};

const typeIcons: Record<string, any> = {
    cardiac: Heart,
    respiratory: Activity,
    neurological: Brain,
    drug_interaction: Pill,
    renal: Activity,
    gastrointestinal: Activity,
};

const demoRisks: RiskAlert[] = [
    {
        id: 1, patient_id: 'VAR-001', patient_name: 'Varun Tej',
        alert_type: 'respiratory', severity: 'medium',
        title: 'Viral Fatigue risk',
        description: 'Patient reports persistent headache and body aches with temp of 101.4°F.',
        recommendation: 'Monitor core temperature closely. Prescribed Paracetamol. Advise rest and hydration.',
        created_at: 'Mar 08', time: '10:25 AM'
    },
    {
        id: 2, patient_id: 'JAS-003', patient_name: 'Jaswanth Kumar',
        alert_type: 'respiratory', severity: 'critical',
        title: 'Acute Asthma Risk',
        description: 'Detected cough and chest tightness during ambient recording. Historical asthma diagnosis.',
        recommendation: 'Immediate bronchodilator evaluation. Order pulmonary function test. Review inhaler technique.',
        created_at: 'Mar 08', time: '09:50 AM'
    }
];

export default function RisksPage() {
    const [alerts, setAlerts] = useState<RiskAlert[]>([]);
    const [selectedAlert, setSelectedAlert] = useState<RiskAlert | null>(null);
    const [filter, setFilter] = useState<string>('all');

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const res = await api.get(apiRoutes.risks);
                setAlerts(res.data.length > 0 ? res.data : demoRisks);
            } catch {
                setAlerts(demoRisks);
            }
        };
        fetchAlerts();
    }, []);

    const filteredAlerts = filter === 'all' ? alerts : alerts.filter(a => a.severity === filter);

    const severityCounts = {
        all: alerts.length,
        critical: alerts.filter(a => a.severity === 'critical').length,
        high: alerts.filter(a => a.severity === 'high').length,
        medium: alerts.filter(a => a.severity === 'medium').length,
        low: alerts.filter(a => a.severity === 'low').length,
    };

    return (
        <PageTransition>
            <div className="mb-8">
                <h1 className="text-2xl font-black text-white">Risk Intelligence</h1>
                <p className="text-xs text-white/30 uppercase tracking-[0.2em] font-bold mt-1">Clinical AI Guardrail Stream</p>
            </div>

            {/* Severity Filters */}
            <div className="flex flex-wrap gap-2 mb-8">
                {(['all', 'critical', 'high', 'medium', 'low'] as const).map((sev) => (
                    <button
                        key={sev}
                        onClick={() => setFilter(sev)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === sev
                            ? 'bg-white/10 border border-[#e85d3b]/30 text-white'
                            : 'bg-white/[0.03] border border-white/5 text-white/30 hover:text-white/60'
                            }`}
                    >
                        {sev === 'all' ? 'All Alerts' : sev}
                        <span className="px-2 py-0.5 rounded-lg bg-black/40 text-[9px] font-black">{severityCounts[sev]}</span>
                    </button>
                ))}
            </div>

            <div className="grid lg:grid-cols-[1fr_400px] gap-8">
                {/* Alerts List */}
                <div className="space-y-4">
                    {filteredAlerts.map((alert) => {
                        const config = severityConfig[alert.severity] || severityConfig.low;
                        const TypeIcon = typeIcons[alert.alert_type] || Activity;
                        const isSelected = selectedAlert?.id === alert.id;

                        return (
                            <div
                                key={alert.id}
                                onClick={() => setSelectedAlert(alert)}
                                className={`group relative p-6 rounded-[30px] border transition-all cursor-pointer 
                                    ${isSelected ? 'bg-white/10 border-[#e85d3b]/30 shadow-2xl' : 'bg-white/[0.03] border-white/5 hover:bg-white/5'}`}
                            >
                                <div className="flex items-start gap-5">
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: config.bg, color: config.color }}>
                                        <TypeIcon size={24} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-sm font-black text-white uppercase tracking-widest">{alert.title}</h3>
                                                <div className="w-1 h-1 rounded-full" style={{ backgroundColor: config.color }} />
                                            </div>
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30 group-hover:opacity-100 transition-opacity">#{alert.patient_id}</span>
                                        </div>
                                        <p className="text-xs text-white/40 leading-relaxed line-clamp-2 mb-4 font-medium">{alert.description}</p>
                                        <div className="flex items-center justify-between mt-auto">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center mt-1">
                                                    <User size={12} className="text-white/20" />
                                                </div>
                                                <span className="text-[10px] font-bold text-white/60">{alert.patient_name}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-white/20">
                                                <Clock size={12} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">{alert.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Alert Detail */}
                <div className="relative">
                    {selectedAlert ? (
                        <div className="sticky top-8 bg-white/[0.03] rounded-[40px] border border-white/5 p-10 overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                {(() => { const Icon = typeIcons[selectedAlert.alert_type] || Activity; return <Icon size={120} />; })()}
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl`}
                                        style={{
                                            background: severityConfig[selectedAlert.severity]?.bg,
                                            color: severityConfig[selectedAlert.severity]?.color,
                                            boxShadow: `0 10px 30px -10px ${severityConfig[selectedAlert.severity]?.color}20`
                                        }}>
                                        {(() => { const Icon = typeIcons[selectedAlert.alert_type] || Activity; return <Icon size={28} />; })()}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-white uppercase tracking-widest leading-none mb-2">{selectedAlert.title}</h2>
                                        <div className="flex items-center gap-2">
                                            <div className="px-3 py-1 rounded-full border border-white/10 text-[9px] font-black uppercase tracking-widest text-[#e85d3b]">
                                                {selectedAlert.severity} Severity
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white/5 p-4 rounded-2xl">
                                            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">Patient</p>
                                            <p className="text-xs font-bold text-white">{selectedAlert.patient_name}</p>
                                        </div>
                                        <div className="bg-white/5 p-4 rounded-2xl">
                                            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">Detected</p>
                                            <p className="text-xs font-bold text-white">{selectedAlert.time}, {selectedAlert.created_at}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-4">Background Info</h4>
                                        <p className="text-sm text-white/40 leading-relaxed font-medium">{selectedAlert.description}</p>
                                    </div>

                                    <div className="p-8 rounded-[30px] bg-gradient-to-br from-[#e85d3b]/10 to-transparent border border-[#e85d3b]/10">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Target size={16} className="text-[#e85d3b]" />
                                            <h4 className="text-[10px] font-black text-[#e85d3b] uppercase tracking-[0.3em]">Recommendation</h4>
                                        </div>
                                        <p className="text-sm text-white/80 leading-relaxed font-bold italic">"{selectedAlert.recommendation}"</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="sticky top-8 h-[500px] rounded-[40px] border border-dashed border-white/5 flex flex-col items-center justify-center text-center p-12">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                <ShieldAlert size={32} className="text-white/10" />
                            </div>
                            <h3 className="text-sm font-black text-white/20 uppercase tracking-[0.2em]">Select an alert to view clinical guidance</h3>
                        </div>
                    )}
                </div>
            </div>
        </PageTransition>
    );
}
