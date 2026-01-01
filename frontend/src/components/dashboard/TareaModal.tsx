import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Droplets, Scissors, Wind, Calendar, User, MapPin, Loader2, Save, CheckCircle2, Clock, PlayCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Interfaces extendidas
interface Tarea {
    id: number;
    descripcion: string;
    fecha_prog: string;
    estado: 'Pendiente' | 'EnProgreso' | 'Completada' | 'Cancelada';
    parcela_id: number;
    usuario_id: number;
}

interface TareaModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: Tarea | null; // Prop opcional para edición
}

const TareaModal: React.FC<TareaModalProps> = ({ open, onClose, onSuccess, initialData }) => {
    const { toast } = useToast();
    const [dbParcelas, setDbParcelas] = useState<{id: number, nombre: string}[]>([]);
    const [dbUsuarios, setDbUsuarios] = useState<{id: number, nombre: string}[]>([]);

    // ESTADOS DEL FORMULARIO
    const [tipo, setTipo] = useState('Riego');
    const [parcelaId, setParcelaId] = useState('');
    const [trabajadorId, setTrabajadorId] = useState('');
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
    const [estado, setEstado] = useState<Tarea['estado']>('Pendiente');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isEditing = !!initialData;

    // CARGAR SELECTORES Y SINCRONIZAR DATOS DE EDICIÓN
    useEffect(() => {
        if (open) {
            const fetchData = async () => {
                try {
                    const [resP, resU] = await Promise.all([
                        fetch('http://localhost:5000/api/parcelas'),
                        fetch('http://localhost:5000/api/usuarios')
                    ]);
                    setDbParcelas(await resP.json());
                    setDbUsuarios(await resU.json());
                } catch (error) {
                    console.error("Error cargando selectores:", error);
                }
            };
            fetchData();

            if (initialData) {
                setTipo(initialData.descripcion);
                setParcelaId(initialData.parcela_id.toString());
                setTrabajadorId(initialData.usuario_id.toString());
                setFecha(initialData.fecha_prog.split('T')[0]);
                setEstado(initialData.estado);
            } else {
                setTipo('Riego');
                setParcelaId('');
                setTrabajadorId('');
                setFecha(new Date().toISOString().split('T')[0]);
                setEstado('Pendiente');
            }
        }
    }, [open, initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const url = isEditing 
            ? `http://localhost:5000/api/tareas/${initialData.id}` 
            : 'http://localhost:5000/api/tareas';
        
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    descripcion: tipo,
                    fecha_prog: fecha,
                    estado: estado, // Ahora enviamos el estado seleccionado
                    parcela_id: parseInt(parcelaId),
                    usuario_id: parseInt(trabajadorId)
                }),
            });

            if (res.ok) {
                toast({
                    title: isEditing ? 'Tarea Actualizada' : '¡Tarea Programada!',
                    description: `Actividad de ${tipo} guardada correctamente.`,
                });
                onSuccess();
                onClose();
            }
        } catch (error) {
            toast({ title: 'Error', description: 'No se pudo procesar la tarea', variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="glass-card border-accent/20 sm:max-w-md bg-[#121212] text-white">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-avocado-pulp/20 flex items-center justify-center">
                            <Save className="w-6 h-6 text-avocado-pulp" />
                        </div>
                        <div>
                            <DialogTitle className="font-display text-xl">
                                {isEditing ? 'Editar Tarea' : 'Nueva Tarea'}
                            </DialogTitle>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    {/* TIPO DE ACTIVIDAD */}
                    <div className="space-y-2">
                        <Label>Tipo de Actividad</Label>
                        <Select value={tipo} onValueChange={setTipo}>
                            <SelectTrigger className="bg-white/5 border-white/10">
                                <SelectValue placeholder="Seleccione tipo" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a1a1a] text-white">
                                <SelectItem value="Riego">Riego</SelectItem>
                                <SelectItem value="Poda">Poda</SelectItem>
                                <SelectItem value="Fumigacion">Fumigación</SelectItem>
                                <SelectItem value="Cosecha">Cosecha</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Parcela</Label>
                            <Select value={parcelaId} onValueChange={setParcelaId} required>
                                <SelectTrigger className="bg-white/5 border-white/10">
                                    <SelectValue placeholder="Parcela" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1a1a] text-white">
                                    {dbParcelas.map((p) => (
                                        <SelectItem key={p.id} value={p.id.toString()}>{p.nombre}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Asignar a</Label>
                            <Select value={trabajadorId} onValueChange={setTrabajadorId} required>
                                <SelectTrigger className="bg-white/5 border-white/10">
                                    <SelectValue placeholder="Personal" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1a1a] text-white">
                                    {dbUsuarios.map((u) => (
                                        <SelectItem key={u.id} value={u.id.toString()}>{u.nombre}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Fecha</Label>
                            <input
                                type="date"
                                value={fecha}
                                onChange={(e) => setFecha(e.target.value)}
                                className="w-full h-10 rounded-md border border-white/10 bg-white/5 px-3 text-sm outline-none focus:ring-1 focus:ring-avocado-pulp"
                                required
                            />
                        </div>
                        {/* ESTADO DE LA TAREA */}
                        <div className="space-y-2">
                            <Label>Estado</Label>
                            <Select value={estado} onValueChange={(v: Tarea['estado']) => setEstado(v)}>
                                <SelectTrigger className="bg-white/5 border-white/10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1a1a] text-white">
                                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                                    <SelectItem value="EnProgreso">En Progreso</SelectItem>
                                    <SelectItem value="Completada">Completada</SelectItem>
                                    <SelectItem value="Cancelada">Cancelada</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="ghost" onClick={onClose} className="text-gray-400">
                            Cancelar
                        </Button>
                        <Button type="submit" className="bg-avocado-pulp text-black hover:bg-avocado-pulp/90 font-bold" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Guardar Cambios'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default TareaModal;