'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, User, Calendar, Clock, ChevronRight,
    Filter, ArrowUpRight, Activity, FilterX,
    MoreVertical, FileText, AlertTriangle
} from 'lucide-react';
import PageTransition, { StaggerContainer, StaggerItem } from '@/components/PageTransition';

interface Patient {
    id: string;
    name: string;
    doctor?: string;
    status: string;
    time: string;
    date: string;
    info: string;
    age?: string;
    gender?: string;
}

const DEFAULT_PATIENTS: Patient[] = [
    { id: 'VAR-001', name: 'Varun Tej', doctor: 'Dr. Priya Sharma', status: 'Note Generated', time: '10:25 AM', date: 'Mar 08', info: 'Viral Fever', age: '24', gender: 'Male' },
    { id: 'ADH-002', name: 'Adhil Khan', doctor: 'Dr. Mohan Reddy', status: 'Processing', time: '10:10 AM', date: 'Mar 08', info: 'Hypoglycemia Suspected', age: '29', gender: 'Male' },
    { id: 'JAS-003', name: 'Jaswanth Kumar', doctor: 'Dr. Ananya Iyer', status: 'Risk Alert', time: '09:50 AM', date: 'Mar 08', info: 'Asthma Risk', age: '26', gender: 'Male' },
    { id: 'PRI-004', name: 'Priya Sharma', doctor: 'Dr. Rajesh Khanna', status: 'Note Generated', time: '09:30 AM', date: 'Mar 08', info: 'Migraine', age: '27', gender: 'Female' },
    { id: 'VAN-005', name: 'Vanjinathan S', doctor: 'Dr. Suresh Raina', status: 'Completed', time: '08:45 AM', date: 'Mar 08', info: 'Muscle Strain', age: '33', gender: 'Male' },
    { id: 'THA-006', name: 'Thanveer Ahmed', doctor: 'Dr. Vikram Singh', status: 'Risk Alert', time: '08:15 AM', date: 'Mar 08', info: 'Asthma Risk', age: '35', gender: 'Male' },
    { id: 'MOH-007', name: 'Mohan Reddy', doctor: 'Dr. Kavita Rao', status: 'Completed', time: '07:30 AM', date: 'Mar 08', info: 'Arthritis', age: '42', gender: 'Male' },
    { id: 'RAH-008', name: 'Rahul Verma', doctor: 'Dr. Sanjay Dutt', status: 'Note Generated', time: '06:55 AM', date: 'Mar 08', info: 'Upper Respiratory Infection', age: '31', gender: 'Male' },
];

export default function PatientsPage() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('added_patients') || '[]');
        setPatients([...stored, ...DEFAULT_PATIENTS]);
    }, []);

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <PageTransition>
            <div className="mb-8">
                <h1 className="text-3xl font-black text-white">Patient Directory</h1>
                <p className="text-xs text-white/30 uppercase tracking-[0.2em] font-bold mt-1">Full Clinical Census & History</p>
            </div>

            <div className="grid lg:grid-cols-[1fr_400px] gap-8">
                <div className="space-y-6">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name or clinical ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/5 rounded-[30px] py-6 pl-16 pr-8 text-white focus:outline-none focus:border-[#e85d3b]/30 transition-all font-medium text-sm"
                        />
                    </div>

                    {/* Patients List */}
                    <div className="bg-[#181818] rounded-[40px] border border-white/5 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/[0.01]">
                                        <th className="px-10 py-5 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Patient Profile</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Status</th>
                                        <th className="px-6 py-5 text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Last Visit</th>
                                        <th className="px-10 py-5 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.02]">
                                    {filteredPatients.map((p) => (
                                        <tr
                                            key={p.id}
                                            onClick={() => setSelectedPatient(p)}
                                            className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                                        >
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-[#e85d3b] transition-colors">
                                                        <User size={20} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-white transition-colors">{p.name}</span>
                                                        <span className="text-[10px] font-black text-white/20 tracking-wider uppercase">{p.id} • {p.age || 'N/A'}Y • {p.gender || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${p.status === 'Risk Alert' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' :
                                                            p.status === 'Processing' ? 'bg-[#e85d3b] animate-pulse' :
                                                                'bg-green-500'
                                                        }`} />
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${p.status === 'Risk Alert' ? 'text-red-500' : 'text-white/40'
                                                        }`}>{p.status}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 font-bold text-white/60 text-xs">
                                                {p.date}
                                            </td>
                                            <td className="px-10 py-6 text-right">
                                                <button className="p-2 bg-white/5 rounded-xl text-white/20 hover:text-white transition-all">
                                                    <ArrowUpRight size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Patient Profile Detail Sidebar */}
                <div className="relative">
                    <AnimatePresence mode="wait">
                        {selectedPatient ? (
                            <motion.div
                                key={selectedPatient.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="sticky top-8 bg-white/[0.03] rounded-[40px] border border-white/5 p-10 overflow-hidden"
                            >
                                <div className="relative z-10">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-16 h-16 rounded-2xl bg-[#e85d3b] flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-[#e85d3b]/20">
                                            {selectedPatient.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-white leading-none mb-2">{selectedPatient.name}</h2>
                                            <div className="flex items-center gap-2">
                                                <div className="px-3 py-1 rounded-full border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/30">
                                                    {selectedPatient.id}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white/5 p-5 rounded-3xl">
                                                <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">Clinic Info</p>
                                                <p className="text-xs font-bold text-white">{selectedPatient.age}Y • {selectedPatient.gender}</p>
                                            </div>
                                            <div className="bg-white/5 p-5 rounded-3xl">
                                                <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">Attending</p>
                                                <p className="text-xs font-bold text-white">{selectedPatient.doctor || 'UNASSIGNED'}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-4">Latest Insights</h4>
                                            <div className="p-6 rounded-[30px] bg-white/5 border border-white/5">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-[#e85d3b]/10 flex items-center justify-center text-[#e85d3b] flex-shrink-0">
                                                        <Activity size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-white mb-1">Diagnosis / Concern</p>
                                                        <p className="text-xs text-white/40 leading-relaxed">{selectedPatient.info}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 space-y-3">
                                            <button className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white transition-all flex items-center justify-center gap-2">
                                                <FileText size={14} /> Full History
                                            </button>
                                            <button className="w-full py-4 border border-[#e85d3b]/30 hover:bg-[#e85d3b]/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#e85d3b] transition-all flex items-center justify-center gap-2">
                                                <AlertTriangle size={14} /> View Risks
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="sticky top-8 h-[500px] rounded-[40px] border border-dashed border-white/10 flex flex-col items-center justify-center text-center p-12">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                    <User size={32} className="text-white/10" />
                                </div>
                                <h3 className="text-sm font-black text-white/20 uppercase tracking-[0.2em]">Select a patient to view clinical profile</h3>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </PageTransition>
    );
}
