import React, { useState, useEffect } from 'react';
import TareaCard from '@/components/dashboard/TareaCard';
import { ClipboardList, Plus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast'; // Ajustado a useToast estándar
import { Button } from '@/components/ui/button';
import TareaModal from '@/components/dashboard/TareaModal';

export interface TareaDB {
    id: number;
    descripcion: string;
    fecha_prog: string;
    estado: 'Pendiente' | 'EnProgreso' | 'Completada' | 'Cancelada';
    parcela_id: number;
    usuario_id: number;
    nombre_parcela?: string;
    nombre?: string;
}

const Tareas: React.FC = () => {
    const { toast } = useToast();
    const [dbTareas, setDbTareas] = useState<TareaDB[]>([]);
    const [loading, setLoading] = useState(true);
    const [tareasModalOpen, setTareasModalOpen] = useState(false);

    // NUEVO: Estado para la tarea que vamos a editar
    const [tareaAEditar, setTareaAEditar] = useState<TareaDB | null>(null);

    const fetchTareas = async () => {
        try {
            setLoading(true);
            const res = await fetch('http://localhost:5000/api/tareas');
            const data = await res.json();
            if (Array.isArray(data)) setDbTareas(data);
        } catch (error) {
            console.error("Error cargando tareas:", error);
            toast({ title: "Error", description: "No se pudieron cargar las tareas", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTareas(); }, []);

    // 1. HANDLER PARA ELIMINAR
    const handleDelete = async (id: number) => {
        if (!confirm("¿Estás seguro de que deseas eliminar esta tarea?")) return;

        try {
            const res = await fetch(`http://localhost:5000/api/tareas/${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                toast({ title: 'Tarea eliminada', variant: 'destructive' });
                fetchTareas();
            }
        } catch (error) {
            toast({ title: 'Error al eliminar', variant: 'destructive' });
        }
    };

    // 2. HANDLER PARA ABRIR EDICIÓN
    const handleEdit = (tarea: TareaDB) => {
        setTareaAEditar(tarea);
        setTareasModalOpen(true);
    };

    // 3. HANDLERS DE ESTADO (PATCH)
    const handleStart = async (id: number) => {
        try {
            const res = await fetch(`http://localhost:5000/api/tareas/${id}/estado`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: 'EnProgreso' }),
            });
            if (res.ok) {
                toast({ title: 'Tarea iniciada' });
                fetchTareas();
            }
        } catch (error) { console.error(error); }
    };

    // 3. HANDLER PARA COMPLETAR TAREA
    const handleComplete = async (id: number) => {
        try {
            // Hacemos el PATCH al endpoint de estado
            const res = await fetch(`http://localhost:5000/api/tareas/${id}/estado`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: 'Completada' }),
            });

            if (res.ok) {
                toast({
                    title: '¡Tarea completada!',
                    description: 'La tarea se ha movido al historial de completadas.'
                });
                // ¡IMPORTANTE! Esto vuelve a traer las tareas del backend
                // y al actualizar el estado dbTareas, React re-calcula los filtros
                fetchTareas();
            } else {
                throw new Error('Error al actualizar el estado');
            }
        } catch (error) {
            console.error(error);
            toast({
                title: 'Error',
                description: 'No se pudo completar la tarea',
                variant: 'destructive'
            });
        }
    };

    // FILTROS
    const pendientes = dbTareas.filter(t => t.estado === 'Pendiente');
    const enProgreso = dbTareas.filter(t => t.estado === 'EnProgreso');
    const completadas = dbTareas.filter(t => t.estado === 'Completada');

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
                        <ClipboardList className="w-8 h-8 text-avocado-pulp" />
                        Gestión de Tareas
                    </h1>
                    <p className="text-muted-foreground mt-1">Administra las actividades de la finca</p>
                </div>

                <Button
                    className="bg-avocado-pulp text-black hover:bg-avocado-pulp/90 font-bold gap-2"
                    onClick={() => {
                        setTareaAEditar(null); // Reset para que sea "Nueva Tarea"
                        setTareasModalOpen(true);
                    }}
                >
                    <Plus className="w-5 h-5" />
                    Nueva Tarea
                </Button>
            </div>

            <TareaModal
                open={tareasModalOpen}
                onClose={() => {
                    setTareasModalOpen(false);
                    setTareaAEditar(null);
                }}
                onSuccess={fetchTareas}
                initialData={tareaAEditar} // Enviamos la tarea a editar al modal
            />

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-avocado-pulp w-10 h-10" /></div>
            ) : (
                <div className="space-y-8">
                    {/* SECCIÓN PENDIENTES */}
                    <section>
                        <h2 className="text-lg font-semibold text-orange-400 mb-4 flex items-center gap-2">
                            Pendientes ({pendientes.length})
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {pendientes.map((tarea) => (
                                <TareaCard
                                    key={tarea.id}
                                    tarea={tarea}
                                    onStart={handleStart}
                                    onComplete={handleComplete}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    </section>

                    {/* SECCIÓN EN PROGRESO */}
                    <section>
                        <h2 className="text-lg font-semibold text-blue-400 mb-4 flex items-center gap-2">
                            En Progreso ({enProgreso.length})
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {enProgreso.map((tarea) => (
                                <TareaCard
                                    key={tarea.id}
                                    tarea={tarea}
                                    onComplete={handleComplete}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    </section>

                    {/* SECCIÓN COMPLETADAS */}
                    <section>
                        <h2 className="text-lg font-semibold text-green-500 mb-4 flex items-center gap-2">
                            Completadas ({completadas.length})
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {completadas.map((tarea) => (
                                <TareaCard
                                    key={tarea.id}
                                    tarea={tarea}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
};

export default Tareas;