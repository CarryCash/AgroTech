import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Mail, Shield, UserPlus, Loader2 } from 'lucide-react';
import WorkerProfileModal from '@/components/dashboard/WorkerProfileModal';
import AddWorkerModal from '@/components/dashboard/AddWorkerModal';
import { Trabajador } from '@/types/farms';

const Trabajadores: React.FC = () => {
    const [dbTrabajadores, setDbTrabajadores] = useState<Trabajador[]>([]);
    const [selectedWorker, setSelectedWorker] = useState<Trabajador | null>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // Nuevo estado de carga

    const fetchWorkers = async () => {
        try {
            setIsLoading(true);
            const res = await fetch('http://localhost:5000/api/usuarios');
            if (!res.ok) throw new Error("Error en la respuesta");
            const data = await res.json();
            
            // Protección: Si data no es array, forzamos array vacío
            setDbTrabajadores(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error cargando equipo:", error);
            setDbTrabajadores([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkers();
    }, []);

    const rolColors: Record<string, string> = {
        Administrador: 'bg-accent/20 text-accent border-accent/30',
        Tecnico: 'bg-info/20 text-info border-info/30',
        Peon: 'bg-muted text-muted-foreground border-white/10',
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
                        <Users className="w-8 h-8 text-avocado-pulp" />
                        Equipo de Trabajo
                    </h1>
                    <p className="text-muted-foreground mt-1">Gestión del personal de la finca</p>
                </div>

                <Button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-avocado-pulp hover:bg-avocado-dark text-black font-bold gap-2"
                >
                    <UserPlus className="w-4 h-4" />
                    Nuevo Trabajador
                </Button>
            </div>

            {/* ESTADO DE CARGA O MENSAJE VACÍO */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                    <Loader2 className="w-10 h-10 animate-spin text-avocado-pulp mb-4" />
                    <p>Cargando equipo...</p>
                </div>
            ) : dbTrabajadores.length === 0 ? (
                <div className="glass-card p-10 text-center border-dashed border-2 border-white/10">
                    <p className="text-muted-foreground">No se encontraron trabajadores registrados.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dbTrabajadores.map((trabajador) => (
                        <div
                            key={trabajador.id}
                            onClick={() => {
                                setSelectedWorker(trabajador);
                                setIsProfileOpen(true);
                            }}
                            className="glass-card p-5 hover:scale-[1.02] transition-all duration-300 cursor-pointer group border border-white/5 hover:border-avocado-pulp/30"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-avocado-dark/40 to-avocado-pulp/20 flex items-center justify-center border border-white/10 group-hover:border-avocado-pulp/50">
                                    <span className="text-xl font-display font-bold text-avocado-cream">
                                        {trabajador.nombre ? trabajador.nombre.split(' ').map(n => n[0]).join('').slice(0,2) : '??'}
                                    </span>
                                </div>

                                <div className="flex-1">
                                    <h3 className="font-bold text-foreground group-hover:text-avocado-pulp">
                                        {trabajador.nombre || 'Sin nombre'}
                                    </h3>
                                    <Badge variant="outline" className={rolColors[trabajador.rol] || rolColors.Peon}>
                                        <Shield className="w-3 h-3 mr-1" />
                                        {trabajador.rol || 'Peon'}
                                    </Badge>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="w-4 h-4 text-avocado-pulp" />
                                {trabajador.contacto || 'Sin contacto'}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <AddWorkerModal
                open={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchWorkers}
            />

            <WorkerProfileModal
                worker={selectedWorker}
                open={isProfileOpen}
                onClose={() => {
                    setIsProfileOpen(false);
                    setSelectedWorker(null);
                }}
                onSuccess={fetchWorkers}
            />
        </div>
    );
};

export default Trabajadores;