import React, { useState, useEffect } from 'react';
import ParcelaGrid from '@/components/dashboard/ParcelaGrid';
import ParcelaDetalleModal from '@/components/dashboard/ParcelaDetalleModal';
import AddParcelaModal from '@/components/dashboard/AddParcelaModal';
import EditParcelaModal from '@/components/dashboard/EditParcelaModal'; // Importado
import { Map, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Parcela } from '@/types/farms';
import { useToast } from '@/hooks/use-toast'; // Corregido el import de toast

const Parcelas: React.FC = () => {
    const { toast } = useToast();

    // ESTADOS PARA DATOS REALES
    const [dbParcelas, setDbParcelas] = useState<Parcela[]>([]);
    const [loading, setLoading] = useState(true);

    // ESTADOS PARA MODALES
    const [selectedParcela, setSelectedParcela] = useState<Parcela | null>(null);
    const [editingParcela, setEditingParcela] = useState<Parcela | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // 1. FUNCIÓN PARA CARGAR PARCELAS
    const fetchParcelas = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5000/api/parcelas');
            if (!response.ok) throw new Error('Error al conectar con el servidor');
            const data = await response.json();
            setDbParcelas(data);
        } catch (error) {
            toast({
                title: "Error de conexión",
                description: "No se pudieron cargar las parcelas.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchParcelas();
    }, []);

    // 2. ACCIONES DEL CRUD
    const handleEditAction = (parcela: Parcela) => {
        setEditingParcela(parcela);
        setIsEditModalOpen(true);
    };

    const handleDeleteAction = async (id: number) => {
        if (window.confirm("¿Estás seguro de eliminar esta parcela? Esta acción no se puede deshacer.")) {
            try {
                const response = await fetch(`http://localhost:5000/api/parcelas/${id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    toast({ title: "Eliminado", description: "La parcela ha sido borrada." });
                    fetchParcelas(); // Recargar lista
                } else {
                    throw new Error("No se pudo eliminar");
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "No se pudo eliminar la parcela de la base de datos.",
                    variant: "destructive"
                });
            }
        }
    };

    const handleParcelaClick = (parcela: Parcela) => {
        setSelectedParcela(parcela);
        setIsDetailOpen(true);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
                        <Map className="w-8 h-8 text-avocado-pulp" />
                        Gestión de Parcelas
                    </h1>
                    <p className="text-muted-foreground mt-1">Administra las parcelas de la finca</p>
                </div>

                <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-avocado-pulp hover:bg-avocado-dark text-[#181111] font-bold gap-2 shadow-lg shadow-success/10"
                >
                    <Plus className="w-5 h-5" />
                    Nueva Parcela
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <p className="text-muted-foreground animate-pulse">Cargando parcelas desde MySQL...</p>
                </div>
            ) : (
                <ParcelaGrid
                    parcelas={dbParcelas}
                    onParcelaClick={handleParcelaClick}
                    onEditClick={handleEditAction}     // Pasamos la prop de editar
                    onDeleteClick={handleDeleteAction} // Pasamos la prop de eliminar
                />
            )}

            {/* MODAL: DETALLES */}
            <ParcelaDetalleModal
                parcela={selectedParcela}
                open={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
            />

            {/* MODAL: AÑADIR */}
            <AddParcelaModal
                open={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchParcelas} // Asegúrate de que AddParcelaModal use esta prop
            />

            {/* MODAL: EDITAR (Nuevo) */}
            <EditParcelaModal
                open={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={fetchParcelas}
                parcela={editingParcela}
            />
        </div>
    );
};

export default Parcelas;