import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, AlertTriangle, Plus, Loader2, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import InsumoModal from '@/components/dashboard/InsumoModal';
import EditInsumoModal from '@/components/dashboard/EditInsumoModal'; // Importamos el nuevo modal

interface InsumoDB {
    id: number;
    nombre: string;
    tipo: string;
    stock_actual: number;
    unidad_medida: string;
    estado: string;
}

const Insumos: React.FC = () => {
    const [dbInsumos, setDbInsumos] = useState<InsumoDB[]>([]);
    const [insumoModalOpen, setInsumoModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedInsumo, setSelectedInsumo] = useState<InsumoDB | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchInsumos = async () => {
        try {
            setLoading(true);
            const res = await fetch('http://localhost:5000/api/insumos');
            const data = await res.json();
            if (Array.isArray(data)) setDbInsumos(data);
        } catch (error) {
            console.error("Error cargando insumos:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("¿Estás seguro de que deseas eliminar este insumo?")) return;
        
        try {
            const res = await fetch(`http://localhost:5000/api/insumos/${id}`, {
                method: 'DELETE',
            });
            if (res.ok) fetchInsumos();
        } catch (error) {
            console.error("Error al eliminar:", error);
        }
    };

    const handleEditClick = (insumo: InsumoDB) => {
        setSelectedInsumo(insumo);
        setEditModalOpen(true);
    };

    useEffect(() => { fetchInsumos(); }, []);

    const tipoColors: Record<string, string> = {
        Fertilizante: 'bg-success/20 text-success border-success/30',
        Fungicida: 'bg-warning/20 text-warning border-warning/30',
        Herbicida: 'bg-destructive/20 text-destructive border-destructive/30',
        Insecticida: 'bg-info/20 text-info border-info/30',
        Otros: 'bg-muted text-muted-foreground',
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
                        <Package className="w-8 h-8 text-avocado-pulp" />
                        Inventario de Insumos
                    </h1>
                </div>
                <Button onClick={() => setInsumoModalOpen(true)} className="bg-[#A7C957] hover:bg-[#A7C957]/80 text-white font-bold gap-2">
                    <Plus className="w-5 h-5" /> Registrar Insumo
                </Button>
            </div>

            {/* Modales */}
            <InsumoModal open={insumoModalOpen} onClose={() => setInsumoModalOpen(false)} onSuccess={fetchInsumos} />
            <EditInsumoModal 
                open={editModalOpen} 
                onClose={() => { setEditModalOpen(false); setSelectedInsumo(null); }} 
                onSuccess={fetchInsumos} 
                insumo={selectedInsumo} 
            />

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-avocado-pulp" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dbInsumos.map((insumo) => {
                        const lowStock = insumo.stock_actual < 50;
                        return (
                            <div key={insumo.id} className={cn('glass-card p-5 group relative border border-white/5', lowStock && 'border-l-4 border-l-warning')}>
                                {/* Botones de Acción (aparecen al hacer hover) */}
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-400" onClick={() => handleEditClick(insumo)}>
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(insumo.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="flex items-start justify-between mb-4">
                                    <Badge variant="outline" className={cn("font-medium", tipoColors[insumo.tipo] || tipoColors.Otros)}>
                                        {insumo.tipo}
                                    </Badge>
                                    <div className="text-right">
                                        <div className="flex items-baseline justify-end">
                                            <span className="text-2xl font-display font-bold text-avocado-pulp">{insumo.stock_actual}</span>
                                            <span className="text-xs text-muted-foreground ml-1 uppercase font-semibold">{insumo.unidad_medida}</span>
                                        </div>
                                    </div>
                                </div>

                                <h3 className="font-display text-lg font-semibold text-foreground mb-3">{insumo.nombre}</h3>

                                <div className="mt-4 pt-4 border-t border-white/5">
                                    {lowStock ? (
                                        <div className="flex items-center gap-2 text-sm text-warning font-medium">
                                            <AlertTriangle className="w-4 h-4" /> Reabastecimiento urgente
                                        </div>
                                    ) : (
                                        <div className="text-xs text-muted-foreground">
                                            Estado: <span className="text-success">{insumo.estado}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Insumos;