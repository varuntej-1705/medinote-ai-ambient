'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Mic,
    FileText,
    AlertTriangle,
    BarChart3,
    ChevronLeft,
    ChevronRight,
    Activity,
    Menu,
    X,
    Folder,
    Target,
    Search,
    BarChart,
    Columns,
    Download,
    Users
} from 'lucide-react';

import { LucideIcon } from 'lucide-react';

interface NavItem {
    name: string;
    href: string;
    icon: LucideIcon;
}

const navItems: NavItem[] = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Patients', href: '/patients', icon: Users },
    { name: 'Consultation', href: '/record', icon: Mic },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Reports', href: '/notes', icon: FileText },
    { name: 'Risk Assessment', href: '/risks', icon: AlertTriangle },
];

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();

    return (
        <>
            {/* Mobile toggle */}
            <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="fixed top-4 left-4 z-50 p-2 rounded-xl glass-card md:hidden shadow-lg border border-white/10"
            >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Mobile overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setMobileOpen(false)}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Premium Curved Sidebar */}
            <motion.aside
                initial={false}
                animate={{
                    width: collapsed ? 80 : 240,
                    x: mobileOpen ? 0 : (typeof window !== 'undefined' && window.innerWidth < 768 ? -240 : 0)
                }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 left-0 h-full z-40 flex flex-col pointer-events-none"
            >
                {/* Curved Background Layer - Now fully flush and semicircle */}
                <div className={`absolute inset-0 left-0 bg-[#0A0A0A] pointer-events-auto transition-all duration-500
                    ${collapsed ? 'rounded-r-[60px]' : 'rounded-r-[100px]'} border-r border-white/5 shadow-[30px_0_60px_-10px_rgba(0,0,0,0.8)]`}
                >
                    {/* Interior glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#e85d3b]/5 to-transparent pointer-events-none opacity-50" />
                </div>

                <div className="relative flex flex-col h-full pointer-events-auto pt-8">
                    {/* Logo Area */}
                    <div className={`flex items-center gap-3 px-6 mb-10 ${collapsed ? 'justify-center px-0' : ''}`}>
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#e85d3b] flex items-center justify-center shadow-lg shadow-[#e85d3b]/20">
                            <Activity size={20} className="text-white" />
                        </div>
                        {!collapsed && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="overflow-hidden"
                            >
                                <h1 className="text-xl font-bold text-white tracking-tight">MediNote AI</h1>
                                <p className="text-[10px] text-white/40 font-medium tracking-[0.2em] uppercase">Clinical Intelligence</p>
                            </motion.div>
                        )}
                    </div>

                    {/* Nav Items */}
                    <nav className="flex-1 px-6 space-y-4">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileOpen(false)}
                                    className="block relative group"
                                >
                                    <motion.div
                                        className={`relative flex items-center gap-4 px-5 py-3.5 rounded-full transition-all duration-300
                                            ${isActive
                                                ? 'bg-[#e85d3b]/10 shadow-[0_8px_20px_-6px_rgba(232,93,59,0.2)] border border-[#e85d3b]/20'
                                                : 'text-white/40 hover:text-white hover:bg-white/[0.03]'
                                            } ${collapsed ? 'justify-center px-0' : 'justify-between'}`}
                                    >
                                        {!collapsed && (
                                            <span className={`text-sm font-bold tracking-tight ${isActive ? 'text-white' : ''}`}>
                                                {item.name}
                                            </span>
                                        )}

                                        <div className={`flex items-center justify-center transition-all duration-300
                                            ${isActive ? 'text-[#e85d3b] scale-110' : 'group-hover:text-white'}`}>
                                            <item.icon size={collapsed ? 24 : 18} strokeWidth={2.5} />
                                        </div>

                                        {/* Active Indicator Glow */}
                                        {isActive && !collapsed && (
                                            <div className="absolute inset-0 rounded-full shadow-[inset_0_0_15px_rgba(232,93,59,0.05)] pointer-events-none" />
                                        )}
                                    </motion.div>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Collapse Button (The circular arrow on the edge) */}
                    <div className="absolute top-[50%] -right-5 -translate-y-1/2 md:flex hidden">
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className="w-10 h-10 rounded-full bg-[#181818] border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-[#e85d3b]/40 hover:bg-[#222] transition-all shadow-xl group"
                        >
                            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}

                            {/* Pulse effect on hover */}
                            <div className="absolute inset-0 rounded-full group-hover:animate-ping bg-[#e85d3b]/10 -z-10" />
                        </button>
                    </div>

                    {/* Footer Info */}
                    {!collapsed && (
                        <div className="mt-auto p-8 opacity-40">
                            <p className="text-[10px] font-medium tracking-widest text-center uppercase text-white/50">
                                Powered by MediNote AI v1.0
                            </p>
                        </div>
                    )}
                </div>
            </motion.aside>

            {/* Spacer for desktop to prevent content overlap with fixed sidebar */}
            <div
                className={`hidden md:block transition-all duration-500 ease-in-out flex-shrink-0`}
                style={{ width: collapsed ? 80 : 240 }}
            />
        </>
    );
}
