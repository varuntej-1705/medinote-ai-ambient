'use client';

import Sidebar from '@/components/Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[--color-dark-bg]">
            <Sidebar />
            <main className="md:ml-[260px] min-h-screen transition-all duration-300">
                <div className="p-4 sm:p-6 lg:p-8 pt-16 md:pt-6 lg:pt-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
