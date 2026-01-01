import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
    LayoutDashboard,
    Map,
    Leaf,
    Scale,
    Users,
    ClipboardList,
    Activity,
    Cpu,
    Package,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const adminLinks = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/parcelas', icon: Map, label: 'Parcelas' },
        { to: '/siembras', icon: Leaf, label: 'Siembras' },
        { to: '/cosechas', icon: Scale, label: 'Cosechas' },
        { to: '/trabajadores', icon: Users, label: 'Trabajadores' },
        { to: '/tareas', icon: ClipboardList, label: 'Tareas' },
        { to: '/sensores', icon: Activity, label: 'Sensores IoT' },
        { to: '/recomendaciones', icon: Cpu, label: 'IA' },
        { to: '/insumos', icon: Package, label: 'Insumos' },
    ];

    const tecnicoLinks = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/sensores', icon: Activity, label: 'Sensores IoT' },
        { to: '/recomendaciones', icon: Cpu, label: 'IA' },
        { to: '/parcelas', icon: Map, label: 'Parcelas' },
        { to: '/tareas', icon: ClipboardList, label: 'Tareas' },
    ];

    const peonLinks = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/tareas', icon: ClipboardList, label: 'Mis Tareas' },
        { to: '/cosechas', icon: Scale, label: 'Registrar Cosecha' },
    ];

    const links = user?.rol === 'Administrador'
        ? adminLinks
        : user?.rol === 'Tecnico'
            ? tecnicoLinks
            : peonLinks;

    return (
        <aside
            className={cn(
                'fixed left-0 top-0 z-40 h-screen glass-panel transition-all duration-300 flex flex-col',
                collapsed ? 'w-16' : 'w-64'
            )}
        >
            {/* Logo */}
            <div className="p-4 border-b border-border/50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                    <Leaf className="w-5 h-5 text-cream" />
                </div>
                {!collapsed && (
                    <div className="animate-fade-in">
                        <h1 className="font-display font-bold text-lg gradient-text">Finca El Sol</h1>
                        <p className="text-xs text-muted-foreground">ERP Agrícola</p>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {links.map((link) => {
                    const isActive = location.pathname === link.to;
                    return (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                                isActive
                                    ? 'bg-accent/20 text-accent'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                            )}
                        >
                            <link.icon
                                className={cn(
                                    'w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110',
                                    isActive && 'text-accent'
                                )}
                            />
                            {!collapsed && (
                                <span className="font-medium text-sm animate-fade-in">{link.label}</span>
                            )}
                            {isActive && !collapsed && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            {/* User section */}
            <div className="p-3 border-t border-border/50">
                {!collapsed && user && (
                    <div className="mb-3 px-3 py-2 rounded-lg bg-muted/30 animate-fade-in">
                        <p className="text-sm font-medium text-foreground">{user.username}</p>
                        <p className="text-xs text-muted-foreground">{user.rol}</p>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={logout}
                        className="text-muted-foreground hover:text-destructive"
                    >
                        <LogOut className="w-5 h-5" />
                    </Button>
                    {!collapsed && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground"
                        >
                            <Settings className="w-5 h-5" />
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onToggle}
                        className="ml-auto text-muted-foreground"
                    >
                        {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    </Button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
