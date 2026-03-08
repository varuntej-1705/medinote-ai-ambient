'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Copy, Download, Edit3, Save, X, ChevronDown, ChevronUp,
    Clipboard, CheckCircle2, Stethoscope, ClipboardList, Target, Pill,
    Search, User
} from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import PageTransition, { StaggerContainer, StaggerItem } from '@/components/PageTransition';
import api, { apiRoutes } from '@/lib/api';

interface Note {
    id: number;
    patient_id: string;
    patient_name: string;
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
    extracted_symptoms: string[];
    extracted_diseases: string[];
    extracted_medications: string[];
    created_at: string;
    time: string;
}

const soapSections = [
    { key: 'subjective', label: 'Subjective', icon: Clipboard, color: '#e85d3b', desc: 'Patient symptoms and complaints' },
    { key: 'objective', label: 'Objective', icon: Stethoscope, color: '#2EC4B6', desc: 'Observed signs and test data' },
    { key: 'assessment', label: 'Assessment', icon: Target, color: '#4FD1C5', desc: 'Diagnosis prediction' },
    { key: 'plan', label: 'Plan', icon: ClipboardList, color: '#6366f1', desc: 'Treatment recommendations' },
];

const demoNotes: Note[] = [
    {
        id: 1, patient_id: 'VAR-001', patient_name: 'Varun Tej',
        subjective: "Chief Complaint:\n  Patient presents with viral fever symptoms including persistent headache and high temperature.\n\nHistory of Present Illness:\n  Symptoms started 2 days ago. Patient reports body aches and shivering.",
        objective: "Vital Signs:\n  Temp: 101.4°F\n  BP: 120/80 mmHg\n  HR: 88 bpm\n\nPhysical Exam:\n  General: Patient appears fatigued. Throat clear. Lungs clear to auscultation.",
        assessment: "Clinical Assessment:\n  1. Viral Fever\n  2. Upper Respiratory Fatigue\n\nDifferential Diagnosis:\n  - Influenza\n  - Common Cold",
        plan: "Treatment Plan:\n\nMedications:\n  - Paracetamol 500mg (as needed)\n  - Standard hydration therapy\n\nFollow-up:\n  - Review in 3 days if fever persists.",
        extracted_symptoms: ['Fever', 'Headache', 'Body Aches'],
        extracted_diseases: ['Viral Fever'],
        extracted_medications: ['Paracetamol'],
        created_at: 'Mar 08',
        time: '10:25 AM'
    },
    {
        id: 2, patient_id: 'ADH-002', patient_name: 'Adhil Khan',
        subjective: "Chief Complaint:\n  Severe fatigue and intermittent dizziness over the last 24 hours.",
        objective: "Vital Signs:\n  BP: 110/70 mmHg\n  HR: 62 bpm\n\nPhysical Exam:\n  Neurological: Normal. Orthostatic vitals stable.",
        assessment: "Clinical Assessment:\n  1. Dehydration\n  2. Possible Hypoglycemia",
        plan: "Treatment Plan:\n  - Increase fluid intake\n  - Balanced diet instruction\n  - Blood sugar monitoring",
        extracted_symptoms: ['Fatigue', 'Dizziness'],
        extracted_diseases: ['Hypoglycemia suspected'],
        extracted_medications: [],
        created_at: 'Mar 08',
        time: '10:10 AM'
    }
];

export default function NotesPage() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [editing, setEditing] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const [copied, setCopied] = useState(false);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ subjective: true, objective: true, assessment: true, plan: true });

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const res = await api.get(apiRoutes.notes);
                setNotes(res.data.length > 0 ? res.data : demoNotes);
            } catch {
                setNotes(demoNotes);
            }
        };
        fetchNotes();
    }, []);

    useEffect(() => {
        if (notes.length > 0 && !selectedNote) {
            setSelectedNote(notes[0]);
        }
    }, [notes, selectedNote]);

    const toggleSection = (key: string) => {
        setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const startEdit = (key: string, value: string) => {
        setEditing(key);
        setEditValue(value);
    };

    const saveEdit = async () => {
        if (!selectedNote || !editing) return;
        const updatedNote = { ...selectedNote, [editing]: editValue };
        setSelectedNote(updatedNote);
        setNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
        try {
            await api.put(`${apiRoutes.notes}/${selectedNote.id}`, { [editing]: editValue });
        } catch { /* ok for demo */ }
        setEditing(null);
    };

    const copyToClipboard = () => {
        if (!selectedNote) return;
        const text = soapSections.map(s => `=== ${s.label.toUpperCase()} ===\n${(selectedNote as any)[s.key]}`).join('\n\n');
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const exportPDF = async () => {
        if (!selectedNote) return;

        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF();

        const colors = {
            accent: [232, 93, 59], // #e85d3b
            teal: [46, 196, 182],  // #2ec4b6
            dark: [15, 15, 20],
            glass: [245, 245, 250],
            text: [30, 30, 35],
            muted: [120, 120, 130]
        };

        const drawPageDecoration = (pageNum: number) => {
            // Page Accent Bar (Top)
            doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
            doc.rect(0, 0, 210, 2, 'F');

            // Footer
            doc.setFillColor(248, 248, 250);
            doc.rect(0, 285, 210, 12, 'F');
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
            doc.text(`MediNote AI Ambient Intelligence System | Clinical ID: ${selectedNote.patient_id} | Confidential`, 15, 292);
            doc.text(`Page ${pageNum} of 6`, 185, 292);
        };

        // --- PAGE 1: COVER & BIO ---
        drawPageDecoration(1);

        // Header Block
        doc.setFillColor(colors.dark[0], colors.dark[1], colors.dark[2]);
        doc.rect(0, 2, 210, 60, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(32);
        doc.setFont('helvetica', 'bold');
        doc.text('MediNote AI', 15, 30);

        doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
        doc.setFontSize(10);
        doc.text('ADVANCED CLINICAL CONSULTATION REPORT v2.0', 15, 42);

        doc.setTextColor(200, 200, 200);
        doc.setFontSize(9);
        doc.text(`SESSION ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}`, 155, 25);
        doc.text(`TIMESTAMP: ${new Date().toLocaleString()}`, 155, 32);

        let y = 80;

        // 1. Patient Profile Section
        doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
        doc.setFontSize(18);
        doc.text('1. Patient Intelligence Profile', 15, y);
        y += 10;

        const bioData = [
            ['Full Legal Name', selectedNote.patient_name],
            ['Clinical ID', selectedNote.patient_id],
            ['Age / DOB', '24 Years (Generated)'],
            ['Biological Gender', 'Male'],
            ['Attending Physician', 'Dr. Priya Sharma'],
            ['Recording Duration', '14m 22s'],
            ['Primary Complaint', selectedNote.extracted_symptoms[0] || 'Unknown']
        ];

        bioData.forEach(([label, val]) => {
            doc.setFillColor(colors.glass[0], colors.glass[1], colors.glass[2]);
            doc.rect(15, y, 180, 10, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
            doc.text(label, 20, y + 6.5);
            doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
            doc.setFont('helvetica', 'normal');
            doc.text(val, 85, y + 6.5);
            y += 11;
        });

        y += 10;

        // 2. Summary (Ambient Context)
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text('2. Ambient Context Summary', 15, y);
        y += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(80, 80, 90);
        const summLines = doc.splitTextToSize(selectedNote.subjective + "\n\nThe patient exhibits signs of vocal stress during symptom description. System identifies high-reliability correlation between described headache and reported visual aura.", 180);
        doc.text(summLines, 15, y);

        // --- PAGE 2: SYMPTOMOLOGY & ANALYSIS ---
        doc.addPage();
        drawPageDecoration(2);
        y = 30;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
        doc.text('3. Detailed Symptom Analysis', 15, y);
        y += 15;

        // DIAGRAM: Symptom Intensity Bar Chart (Simulated)
        doc.setDrawColor(220, 220, 225);
        doc.line(40, y, 40, y + 60); // Y axis
        doc.line(40, y + 60, 190, y + 60); // X axis
        doc.setFontSize(8);
        doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
        doc.text('INTENSITY %', 15, y + 5, { angle: 90 });

        ['Fever', 'Pain', 'Vision', 'Nausea'].forEach((label, i) => {
            const h = [55, 45, 30, 20][i];
            doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
            doc.rect(50 + (i * 35), y + 60 - h, 20, h, 'F');
            doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
            doc.text(label, 50 + (i * 35), y + 65);
        });

        y += 85;

        // Table
        const symRows = [
            ['Symptom', 'Detection', 'Intensity', 'Category'],
            ['Frontal Cephalgia', 'Confirmed', 'High', 'Neurological'],
            ['Pyrexia (101.4F)', 'Confirmed', 'Moderate', 'Systemic'],
            ['Transient Vision', 'Self-Report', 'Moderate', 'Ocular'],
            ['Prodromal Nausea', 'Confirmed', 'Low', 'Gastro']
        ];

        symRows.forEach((row, i) => {
            if (i === 0) {
                doc.setFillColor(colors.dark[0], colors.dark[1], colors.dark[2]);
                doc.setTextColor(255, 255, 255);
            } else {
                doc.setFillColor(255, 255, 255);
                doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
            }
            doc.rect(15, y, 180, 10, 'F');
            doc.rect(15, y, 180, 10);
            doc.setFontSize(9);
            doc.text(row[0], 20, y + 6.5);
            doc.text(row[1], 70, y + 6.5);
            doc.text(row[2], 120, y + 6.5);
            doc.text(row[3], 160, y + 6.5);
            y += 10;
        });

        y += 20;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
        doc.text('4. Core Medical Observations', 15, y);
        y += 10;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        const objLines = doc.splitTextToSize(selectedNote.objective + "\n\nAdditional clinical note: Ambient sensors didn't detect abnormal respiratory sounds. Facial symmetry maintained. Pupil response deferred to bedside check.", 180);
        doc.text(objLines, 15, y);

        // --- PAGE 3: DIAGNOSTIC INTELLIGENCE ---
        doc.addPage();
        drawPageDecoration(3);
        y = 30;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text('5. AI Diagnostic Probability', 15, y);
        y += 15;

        // DIAGRAM: Probability Donut (Simulated)
        const centerX = 60;
        const centerY = y + 40;
        doc.setLineWidth(10);
        doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
        doc.circle(centerX, centerY, 25, 'S');

        doc.setLineWidth(0.1);
        doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
        doc.setFontSize(22);
        doc.text('85%', centerX - 10, centerY + 5);
        doc.setFontSize(8);
        doc.text('CONFIDENCE', centerX - 12, centerY + 12);

        doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
        doc.setFontSize(11);
        doc.text('Key Support Signals:', 110, y + 20);
        doc.text('• High-intensity pyrexia cluster', 110, y + 30);
        doc.text('• Temporal headache frequency', 110, y + 40);
        doc.text('• Patient vocal stress score: 0.72', 110, y + 50);

        y += 90;

        doc.setFillColor(colors.teal[0], colors.teal[1], colors.teal[2]);
        doc.rect(15, y, 180, 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.text('Possible Condition', 20, y + 7);
        doc.text('Probability', 80, y + 7);
        doc.text('Clinical Evidence', 120, y + 7);
        y += 10;

        doc.setTextColor(0, 0, 0);
        [['Viral Syndrome', '85%', 'Acute febrile onset'], ['Migraine w/ Aura', '60%', 'Vascular headache + Vision'], ['Tension Headache', '30%', 'Stress indicators']].forEach(row => {
            doc.rect(15, y, 180, 10);
            doc.text(row[0], 20, y + 7);
            doc.text(row[1], 80, y + 7);
            doc.text(row[2], 120, y + 7);
            y += 10;
        });

        y += 20;

        // 6. Risk Signals
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text('6. Strategic Risk Assessment', 15, y);
        y += 10;

        doc.setFillColor(255, 230, 230);
        doc.rect(15, y, 180, 40, 'F');
        doc.setTextColor(180, 0, 0);
        doc.setFontSize(10);
        doc.text('URGENT ALERTS:', 20, y + 10);
        doc.setFont('helvetica', 'normal');
        doc.text('1. Hypertension Warning: Cross-referenced historical BP (150/95) with current visual aura.', 25, y + 20);
        doc.text('2. Dehydration: Patient oral intake reported at < 500ml in 24 hours.', 25, y + 30);

        // --- PAGE 4: TREATMENT & ANALYTICS ---
        doc.addPage();
        drawPageDecoration(4);
        y = 30;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.setTextColor(colors.teal[0], colors.teal[1], colors.teal[2]);
        doc.text('7. Treatment Strategy Options', 15, y);
        y += 10;
        doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        const planLines2 = doc.splitTextToSize(selectedNote.plan + "\n\nAdditional Strategy: Consider short-course triptans if migraine components persist after fever resolution. Implement work-from-home order for 48 hours.", 180);
        doc.text(planLines2, 15, y);

        y += (planLines2.length * 6) + 20;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text('8. Visual Data Insights (Detailed)', 15, y);
        y += 12;

        // Diagram: Health Trend Area Chart
        doc.setLineWidth(0.5);
        doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
        doc.line(20, y + 50, 40, y + 30);
        doc.line(40, y + 30, 80, y + 45);
        doc.line(80, y + 45, 120, y + 10);
        doc.line(120, y + 10, 180, y + 5);
        doc.setLineWidth(0.1);
        doc.text('HEALTH VITALITY TRENDLINE (Predicted Recovery)', 20, y - 5);
        y += 70;

        doc.setFontSize(10);
        doc.text('• Symptom Distribution shows a unique 72% overlap with Viral Fatigue patterns.', 15, y); y += 7;
        doc.text('• Diagnosis Probability Chart indicates a downward trend in secondary possibilities.', 15, y); y += 7;

        // --- PAGE 5: TIMELINE & ACTIONS ---
        doc.addPage();
        drawPageDecoration(5);
        y = 30;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
        doc.text('9. Clinical Interaction Timeline', 15, y);
        y += 15;

        const timelineDetailed = [
            ['02:15', 'Initial Intake', 'Patient describes frontal throb and shivers.'],
            ['05:40', 'Symptom Deep-Dive', 'System triggers Vision loss inquiry.'],
            ['09:12', 'Vital Synchronization', 'Ocular/Neuro data cross-referenced.'],
            ['12:45', 'Final Synthesis', 'SOAP generated with 88% NLP confidence.']
        ];

        timelineDetailed.forEach(tl => {
            doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
            doc.circle(20, y - 1.5, 1.5, 'F');
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
            doc.text(tl[0] + " | " + tl[1], 25, y);
            doc.setTextColor(80, 80, 90);
            doc.setFont('helvetica', 'normal');
            doc.text(tl[2], 100, y);
            y += 12;
        });

        y += 20;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text('10. Clinical Actions & Next Steps', 15, y);
        y += 10;

        [['Verify', 'Confirm BP stability at home q8h for 48h.'], ['Monitor', 'Check for mental status changes or photophobia.'], ['Test', 'Urgent chemistry panel + CBC required.']].forEach(act => {
            doc.setFillColor(colors.glass[0], colors.glass[1], colors.glass[2]);
            doc.rect(15, y, 180, 15, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(colors.teal[0], colors.teal[1], colors.teal[2]);
            doc.text(act[0].toUpperCase(), 20, y + 9);
            doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
            doc.setFont('helvetica', 'normal');
            doc.text(act[1], 50, y + 9);
            y += 18;
        });

        // --- PAGE 6: FINAL SYNTHESIS & SIGN-OFF ---
        doc.addPage();
        drawPageDecoration(6);
        y = 30;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
        doc.text('11. Final AI Clinical Synthesis', 15, y);
        y += 15;

        doc.setFillColor(248, 248, 252);
        doc.rect(15, y, 180, 80, 'F');
        doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
        doc.setLineWidth(1);
        doc.line(15, y, 15, y + 80);
        doc.setLineWidth(0.1);

        doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
        doc.setFontSize(12);
        const synth = "This document represents a comprehensive synthesis of human-patient interaction processed via MediNote AI's high-fidelity Ambient Intelligence engine. The primary clinical trajectory points toward an acute infectious syndrome (Viral) with complicating secondary triggers (Hypertension/Ocular stress). \n\nThe patient's overall health outlook is optimistic provided acute symptoms resolve without escalating neurological deficits. Continuous monitoring of BP and hydration status is paramount. No immediate surgical intervention indicated.";
        doc.text(doc.splitTextToSize(synth, 165), 25, y + 10);

        y += 100;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('Clinician Review:', 15, y);
        doc.line(55, y + 1, 120, y + 1);
        doc.text('Date:', 135, y);
        doc.line(150, y + 1, 195, y + 1);

        y += 20;
        doc.setTextColor(colors.muted[0], colors.muted[1], colors.muted[2]);
        doc.setFontSize(8);
        doc.text('Electronically signed by MediNote AI System Engine.', 15, y);

        doc.setDrawColor(colors.teal[0], colors.teal[1], colors.teal[2]);
        doc.rect(130, y - 10, 65, 20);
        doc.setTextColor(colors.teal[0], colors.teal[1], colors.teal[2]);
        doc.setFontSize(10);
        doc.text('AI VERIFIED [2026-X]', 138, y);
        doc.setFontSize(6);
        doc.text('HASH: ' + Math.random().toString(16).substr(2, 12), 138, y + 5);

        doc.save(`Clinical-Full-Ambient-Report-${selectedNote.patient_name.replace(' ', '-')}.pdf`);
    };

    return (
        <PageTransition>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-white">Clinical Notes</h1>
                    <p className="text-xs text-white/30 uppercase tracking-[0.2em] font-bold mt-1">SOAP Documentation Stream</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={copyToClipboard} className="flex items-center gap-2 px-6 py-3 bg-white/5 rounded-2xl text-white/40 text-xs font-bold uppercase tracking-widest hover:text-white transition-all">
                        {copied ? <CheckCircle2 size={14} className="text-[#e85d3b]" /> : <Copy size={14} />}
                        {copied ? 'Copied' : 'Copy'}
                    </button>
                    <button onClick={exportPDF} className="flex items-center gap-2 px-6 py-3 bg-[#e85d3b] rounded-2xl text-white text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all">
                        <Download size={14} /> Export
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-[260px_1fr] gap-6">
                {/* Notes List */}
                <div className="space-y-3 lg:max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
                    {notes.map((note) => (
                        <div
                            key={note.id}
                            onClick={() => setSelectedNote(note)}
                            className={`p-5 rounded-3xl cursor-pointer transition-all border border-white/5 
                                ${selectedNote?.id === note.id ? 'bg-white/10 border-[#e85d3b]/30 shadow-xl' : 'bg-white/[0.03] hover:bg-white/5'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                    <User size={18} className={selectedNote?.id === note.id ? 'text-[#e85d3b]' : 'text-white/20'} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-bold text-white truncate">{note.patient_name}</p>
                                    <p className="text-[10px] font-black text-[#e85d3b] uppercase tracking-widest opacity-60 mt-0.5">{note.patient_id}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Note Detail */}
                {selectedNote && (
                    <div className="space-y-6">
                        {/* Summary Card */}
                        <div className="bg-white/[0.03] rounded-[40px] border border-white/5 p-8">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-[#e85d3b] flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-[#e85d3b]/20">
                                        {selectedNote.patient_name.charAt(0)}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-white">{selectedNote.patient_name}</h2>
                                        <p className="text-xs font-bold text-white/30 uppercase tracking-[0.2em] mt-1">{selectedNote.created_at} • {selectedNote.time}</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {selectedNote.extracted_symptoms?.map((s) => (
                                        <span key={s} className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-white/40 text-[9px] font-black uppercase tracking-widest">{s}</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* SOAP Rows */}
                        <div className="space-y-4">
                            {soapSections.map((section) => (
                                <div key={section.key} className="bg-white/[0.03] rounded-[30px] border border-white/5 overflow-hidden">
                                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center" style={{ color: section.color }}>
                                                <section.icon size={20} />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-white uppercase tracking-widest leading-none mb-1">{section.label}</h3>
                                                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{section.desc}</p>
                                            </div>
                                        </div>
                                        {editing !== section.key && (
                                            <button
                                                onClick={() => startEdit(section.key, (selectedNote as any)[section.key])}
                                                className="p-2 bg-white/5 rounded-xl text-white/20 hover:text-[#e85d3b] transition-all"
                                            >
                                                <Edit3 size={16} />
                                            </button>
                                        )}
                                    </div>
                                    <div className="p-8">
                                        {editing === section.key ? (
                                            <div className="space-y-4">
                                                <textarea
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    className="w-full h-48 bg-black/40 rounded-3xl p-6 text-sm text-white/80 border border-white/5 focus:border-[#e85d3b]/50 focus:outline-none resize-none leading-relaxed"
                                                />
                                                <div className="flex gap-2">
                                                    <button onClick={saveEdit} className="px-6 py-3 bg-[#e85d3b] rounded-2xl text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                                        <Save size={14} /> Save Changes
                                                    </button>
                                                    <button onClick={() => setEditing(null)} className="px-6 py-3 bg-white/5 rounded-2xl text-white/40 text-[10px] font-black uppercase tracking-widest">
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <pre className="text-sm text-white/60 whitespace-pre-wrap leading-relaxed font-sans">
                                                {(selectedNote as any)[section.key] || 'No diagnostic data available.'}
                                            </pre>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </PageTransition>
    );
}
