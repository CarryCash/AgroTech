import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from './Sidebar';
import { cn } from '@/lib/utils';

const DashboardLayout: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="min-h-screen bg-background">
            <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
            <main
                className={cn(
                    'min-h-screen transition-all duration-300 p-6',
                    sidebarCollapsed ? 'ml-16' : 'ml-64'
                )}
            >
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;
