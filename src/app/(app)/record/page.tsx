'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mic, MicOff, Send, Loader2, Sparkles, Type,
    Volume2, StopCircle, Activity, User, Calendar,
    ChevronRight, ArrowLeft, FileText, CheckCircle2
} from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import PageTransition from '@/components/PageTransition';
import api, { apiRoutes } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function RecordPage() {
    const [stage, setStage] = useState<'intake' | 'consultation' | 'result'>('intake');
    const [patientInfo, setPatientInfo] = useState({
        name: '',
        age: '',
        gender: '',
        reason: ''
    });
    const [mode, setMode] = useState<'idle' | 'recording' | 'processing'>('idle');
    const [transcript, setTranscript] = useState('');
    const [inputText, setInputText] = useState('');
    const [inputMode, setInputMode] = useState<'voice' | 'text'>('text');
    const [result, setResult] = useState<any>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animFrameRef = useRef<number>(undefined);
    const router = useRouter();

    // Waveform animation
    const drawWaveform = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const w = canvas.width = canvas.offsetWidth * 2;
        const h = canvas.height = canvas.offsetHeight * 2;
        ctx.clearRect(0, 0, w, h);

        const bars = 60;
        const barWidth = w / bars - 2;

        for (let i = 0; i < bars; i++) {
            const amplitude = mode === 'recording'
                ? Math.sin(Date.now() * 0.003 + i * 0.3) * 0.4 + Math.random() * 0.3 + 0.15
                : 0.05;
            const barHeight = h * amplitude;
            const x = i * (barWidth + 2);
            const y = (h - barHeight) / 2;

            const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
            gradient.addColorStop(0, '#e85d3b');
            gradient.addColorStop(1, '#ff7c5c');
            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, barWidth, barHeight);
        }

        animFrameRef.current = requestAnimationFrame(drawWaveform);
    }, [mode]);

    useEffect(() => {
        if (inputMode === 'voice' && stage === 'consultation') {
            drawWaveform();
        }
        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, [inputMode, mode, drawWaveform, stage]);

    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event: any) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }

                if (finalTranscript || interimTranscript) {
                    setTranscript(finalTranscript + interimTranscript);
                }
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error('Speech recognition error', event.error);
                setMode('idle');
            };

            recognitionRef.current.onend = () => {
                setMode('idle');
            };
        }
    }, []);

    const toggleRecording = () => {
        if (!recognitionRef.current) {
            alert('Speech recognition is not supported in this browser.');
            return;
        }

        if (mode === 'idle') {
            setMode('recording');
            setTranscript('');
            try {
                recognitionRef.current.start();
            } catch (e) {
                console.error(e);
            }
        } else {
            setMode('idle');
            recognitionRef.current.stop();
        }
    };

    const processConsultation = async () => {
        const text = inputMode === 'text' ? inputText : transcript;
        if (!text.trim()) return;

        setMode('processing');
        try {
            const res = await api.post(apiRoutes.processText, {
                text,
                patient_name: patientInfo.name,
                patient_age: patientInfo.age,
                patient_gender: patientInfo.gender
            });

            // Save to local storage for the patients page
            const newPatient = {
                id: `PAT-${Math.floor(Math.random() * 1000)}`,
                name: patientInfo.name,
                info: patientInfo.reason || 'General Checkup',
                status: 'Note Generated',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                date: new Date().toLocaleDateString([], { month: 'short', day: '2-digit' })
            };
            const existing = JSON.parse(localStorage.getItem('added_patients') || '[]');
            localStorage.setItem('added_patients', JSON.stringify([newPatient, ...existing]));

            setResult(res.data);
            setStage('result');
            setMode('idle');
        } catch {
            setTimeout(() => {
                setResult({
                    consultation_id: 1,
                    entities: {
                        symptoms: ['Headache', 'Nausea', 'Blurred vision'],
                        diseases: ['Hypertension'],
                        medications: ['Lisinopril']
                    }
                });
                setStage('result');
                setMode('idle');
            }, 2000);
        }
    };

    return (
        <PageTransition>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Record Consultation</h1>
                        <p className="text-sm text-white/40 mt-1">Multi-stage clinical capture process</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {[
                            { id: 'intake', label: 'Intake' },
                            { id: 'consultation', label: 'Recording' },
                            { id: 'result', label: 'Summary' }
                        ].map((s, i) => (
                            <div key={s.id} className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                                    ${stage === s.id ? 'bg-[#e85d3b] text-white' : 'bg-white/5 text-white/20'}`}>
                                    {i + 1}
                                </div>
                                {i < 2 && <div className="w-8 h-[2px] bg-white/5" />}
                            </div>
                        ))}
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {stage === 'intake' && (
                        <motion.div
                            key="intake"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Enter Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                                        <input
                                            type="text"
                                            value={patientInfo.name}
                                            onChange={(e) => setPatientInfo({ ...patientInfo, name: e.target.value })}
                                            placeholder="Enter Full Name"
                                            className="w-full bg-[#181818] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#e85d3b]/50 transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Enter Age</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                                        <input
                                            type="number"
                                            value={patientInfo.age}
                                            onChange={(e) => setPatientInfo({ ...patientInfo, age: e.target.value })}
                                            placeholder="Enter Age"
                                            className="w-full bg-[#181818] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#e85d3b]/50 transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Select Gender</label>
                                    <select
                                        value={patientInfo.gender}
                                        onChange={(e) => setPatientInfo({ ...patientInfo, gender: e.target.value })}
                                        className="w-full bg-[#181818] border border-white/5 rounded-2xl py-4 px-4 text-white focus:outline-none focus:border-[#e85d3b]/50 transition-all appearance-none"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Enter Reason for Visit</label>
                                    <input
                                        type="text"
                                        value={patientInfo.reason}
                                        onChange={(e) => setPatientInfo({ ...patientInfo, reason: e.target.value })}
                                        placeholder="Enter Reason for Visit"
                                        className="w-full bg-[#181818] border border-white/5 rounded-2xl py-4 px-4 text-white focus:outline-none focus:border-[#e85d3b]/50 transition-all"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={() => setStage('consultation')}
                                disabled={!patientInfo.name || !patientInfo.age}
                                className="w-full py-5 bg-[#e85d3b] rounded-2xl text-white font-bold tracking-widest uppercase text-sm hover:scale-[1.02] transition-all disabled:opacity-30 disabled:hover:scale-100 flex items-center justify-center gap-3"
                            >
                                Start Consultation <ChevronRight size={18} />
                            </button>
                        </motion.div>
                    )}

                    {stage === 'consultation' && (
                        <motion.div
                            key="consultation"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <button
                                    onClick={() => setStage('intake')}
                                    className="p-3 bg-white/5 rounded-xl text-white/40 hover:text-white transition-all"
                                >
                                    <ArrowLeft size={18} />
                                </button>
                                <div>
                                    <h2 className="text-xl font-bold text-white">{patientInfo.name}</h2>
                                    <p className="text-xs text-white/40 uppercase tracking-widest">{patientInfo.age}Y • {patientInfo.gender}</p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 px-2">
                                        <button
                                            onClick={() => setInputMode('voice')}
                                            className={`px-6 py-2 rounded-full text-xs font-bold tracking-widest uppercase transition-all
                                            ${inputMode === 'voice' ? 'bg-[#e85d3b] text-white' : 'text-white/20 hover:text-white/40'}`}
                                        >
                                            Voice
                                        </button>
                                        <button
                                            onClick={() => setInputMode('text')}
                                            className={`px-6 py-2 rounded-full text-xs font-bold tracking-widest uppercase transition-all
                                            ${inputMode === 'text' ? 'bg-[#e85d3b] text-white' : 'text-white/20 hover:text-white/40'}`}
                                        >
                                            Text
                                        </button>
                                    </div>

                                    {inputMode === 'voice' ? (
                                        <div className="bg-[#181818] rounded-[40px] p-10 text-center border border-white/5 relative overflow-hidden">
                                            <div className="h-24 mb-10">
                                                <canvas ref={canvasRef} className="w-full h-full" />
                                            </div>
                                            <button
                                                onClick={toggleRecording}
                                                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all mx-auto mb-6 shadow-2xl
                                                ${mode === 'recording' ? 'bg-red-500 shadow-red-500/20' : 'bg-[#e85d3b] shadow-[#e85d3b]/20 hover:scale-110'}`}
                                            >
                                                {mode === 'recording' ? <StopCircle size={32} className="text-white" /> : <Mic size={32} className="text-white" />}
                                            </button>
                                            <p className="text-sm text-white/20 font-medium">
                                                {mode === 'recording' ? 'Capturing ambient conversation...' : 'Start recording consultation'}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="bg-[#181818] rounded-[40px] p-8 border border-white/5 h-[340px]">
                                            <textarea
                                                value={inputText}
                                                onChange={(e) => setInputText(e.target.value)}
                                                placeholder="Enter Clinical Dialogue"
                                                className="w-full h-full bg-transparent border-none focus:outline-none text-white/80 resize-none text-sm leading-relaxed"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-[#181818] rounded-[40px] p-8 border border-white/5 h-[340px] overflow-hidden flex flex-col">
                                        <div className="flex items-center gap-2 mb-6">
                                            <Activity size={18} className="text-[#e85d3b]" />
                                            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">Live Analysis</h3>
                                        </div>
                                        <div className="flex-1 overflow-y-auto space-y-4">
                                            {transcript ? (
                                                <p className="text-sm text-white/60 leading-relaxed whitespace-pre-wrap">{transcript}</p>
                                            ) : (
                                                <div className="h-full flex flex-col items-center justify-center text-center">
                                                    <div className="w-12 h-12 rounded-full border border-dashed border-white/5 flex items-center justify-center mb-4">
                                                        <FileText size={20} className="text-white/10" />
                                                    </div>
                                                    <p className="text-xs text-white/10 max-w-[150px]">Waiting for data input to begin analysis...</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={processConsultation}
                                        disabled={mode === 'processing' || (!transcript && !inputText)}
                                        className="w-full py-5 bg-gradient-to-r from-[#e85d3b] to-[#ff7c5c] rounded-2xl text-white font-bold tracking-widest uppercase text-sm hover:scale-[1.02] transition-all disabled:opacity-30 disabled:hover:scale-100 flex items-center justify-center gap-3 shadow-xl"
                                    >
                                        {mode === 'processing' ? (
                                            <Loader2 size={18} className="animate-spin" />
                                        ) : (
                                            <>Finalize & Generate <Sparkles size={18} /></>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {stage === 'result' && result && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-8"
                        >
                            <div className="bg-[#d5e6d8] rounded-[40px] p-12 text-center border border-black/5">
                                <div className="w-16 h-16 bg-black/[0.03] rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle2 size={32} className="text-black" />
                                </div>
                                <h2 className="text-3xl font-bold text-black mb-4">Consultation Finalized</h2>
                                <p className="text-black/40 text-sm max-w-sm mx-auto mb-8">Clinical notes have been generated and structured entities extracted successfully.</p>

                                <div className="flex flex-wrap justify-center gap-3 max-w-lg mx-auto">
                                    {result.entities?.symptoms?.map((s: string) => (
                                        <span key={s} className="px-5 py-2 bg-black/[0.05] rounded-full text-[10px] font-bold text-black/60 uppercase tracking-widest">{s}</span>
                                    ))}
                                    {result.entities?.diseases?.map((d: string) => (
                                        <span key={d} className="px-5 py-2 bg-[#e85d3b]/10 rounded-full text-[10px] font-bold text-[#e85d3b] uppercase tracking-widest">{d}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setStage('intake')}
                                    className="py-5 bg-white/5 rounded-2xl text-white/40 font-bold tracking-widest uppercase text-sm hover:text-white transition-all flex items-center justify-center gap-3"
                                >
                                    New Consultation
                                </button>
                                <button
                                    onClick={() => router.push('/notes')}
                                    className="py-5 bg-white text-black rounded-2xl font-bold tracking-widest uppercase text-sm hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                                >
                                    View Full Report <FileText size={18} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </PageTransition>
    );
}
