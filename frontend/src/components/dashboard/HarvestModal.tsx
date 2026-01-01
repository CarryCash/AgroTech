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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Scale, Calendar, Star, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Interfaces para coherencia de datos
interface Cosecha {
    id: number;
    siembra_id: number;
    fecha: string;
    cant_kg: number;
    calidad: 'Alta' | 'Media' | 'Baja';
    parcela_nombre: string;
    variedad_nombre: string;
}

interface SiembraData {
    id: number;
    parcela_nombre: string;
    variedad_nombre: string;
    fecha: string;
}

interface HarvestModalProps {
    open: boolean;
    onClose: () => void;
    initialData: Cosecha | null;
    siembras: SiembraData[];
    onSuccess: () => void;
}

const HarvestModal: React.FC<HarvestModalProps> = ({ open, onClose, initialData, siembras, onSuccess }) => {
    const { toast } = useToast();
    const [siembraId, setSiembraId] = useState('');
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
    const [cantKg, setCantKg] = useState('');
    const [calidad, setCalidad] = useState<'Alta' | 'Media' | 'Baja'>('Media');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isEditing = !!initialData;

    // Sincronizar el formulario cuando se abre para editar o crear nuevo
    useEffect(() => {
        if (open) {
            if (initialData) {
                setSiembraId(initialData.siembra_id.toString());
                setFecha(initialData.fecha.split('T')[0]);
                setCantKg(initialData.cant_kg.toString());
                setCalidad(initialData.calidad);
            } else {
                setSiembraId('');
                setFecha(new Date().toISOString().split('T')[0]);
                setCantKg('');
                setCalidad('Media');
            }
        }
    }, [initialData, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!siembraId) {
            toast({ title: "Atención", description: "Selecciona una siembra", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);

        try {
            const url = isEditing 
                ? `http://localhost:5000/api/cosechas/${initialData.id}` 
                : 'http://localhost:5000/api/cosechas';
            
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    siembra_id: parseInt(siembraId),
                    fecha: fecha,
                    cant_kg: parseFloat(cantKg),
                    calidad: calidad
                }),
            });

            if (response.ok) {
                toast({
                    title: isEditing ? '¡Actualizado!' : '¡Registrado!',
                    description: `Cosecha de ${cantKg} kg guardada correctamente.`,
                });
                onSuccess();
                onClose();
            } else {
                throw new Error("Error en la respuesta del servidor");
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'No se pudo guardar la cosecha.',
                variant: 'destructive'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="glass-card border-white/10 sm:max-w-md bg-[#121212] text-white">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-xl bg-avocado-pulp/20 flex items-center justify-center">
                            <Scale className="w-6 h-6 text-avocado-pulp" />
                        </div>
                        <div>
                            <DialogTitle className="font-display text-xl">
                                {isEditing ? 'Editar Cosecha' : 'Registrar Cosecha'}
                            </DialogTitle>
                            <DialogDescription className="text-gray-400">
                                {isEditing ? 'Modifique los datos del registro' : 'Ingrese los datos de la nueva cosecha'}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                    <div className="space-y-2">
                        <Label>Siembra</Label>
                        <Select value={siembraId} onValueChange={setSiembraId} required>
                            <SelectTrigger className="bg-white/5 border-white/10">
                                <SelectValue placeholder="Seleccione la siembra" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1b1b1b] border-white/10 text-white">
                                {siembras.map((s) => (
                                    <SelectItem key={s.id} value={s.id.toString()}>
                                        {s.parcela_nombre} - {s.variedad_nombre} ({new Date(s.fecha).toLocaleDateString()})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="fecha">Fecha</Label>
                            <Input
                                id="fecha"
                                type="date"
                                value={fecha}
                                onChange={(e) => setFecha(e.target.value)}
                                className="bg-white/5 border-white/10"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cantidad">Cantidad (kg)</Label>
                            <Input
                                id="cantidad"
                                type="number"
                                step="0.01"
                                value={cantKg}
                                onChange={(e) => setCantKg(e.target.value)}
                                placeholder="0.00"
                                className="bg-white/5 border-white/10"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Calidad</Label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['Alta', 'Media', 'Baja'] as const).map((q) => (
                                <button
                                    key={q}
                                    type="button"
                                    onClick={() => setCalidad(q)}
                                    className={`
                                        p-3 rounded-lg border transition-all flex flex-col items-center gap-1
                                        ${calidad === q
                                            ? 'border-avocado-pulp bg-avocado-pulp/20 text-avocado-pulp'
                                            : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'
                                        }
                                    `}
                                >
                                    <Star className={`w-4 h-4 ${calidad === q ? 'fill-current' : ''}`} />
                                    <span className="text-xs font-medium">{q}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button type="button" variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white">
                            Cancelar
                        </Button>
                        <Button type="submit" className="bg-avocado-pulp text-black hover:bg-avocado-dark font-bold" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : null}
                            {isEditing ? 'Guardar Cambios' : 'Registrar Cosecha'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default HarvestModal;