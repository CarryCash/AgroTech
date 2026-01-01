import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Scale, Calendar, Leaf, Save, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

interface EditCosechaModalProps {
    open: boolean;
    onClose: () => void;
    initialData: Cosecha | null; // Cambiado de 'cosecha' a 'initialData'
    siembras: SiembraData[];
    onSuccess: () => void;
}

const EditCosechaModal = ({ open, onClose, initialData, siembras, onSuccess }) => {
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        siembra_id: '',
        fecha: '',
        cant_kg: '',
        calidad: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                siembra_id: initialData.siembra_id.toString(),
                fecha: initialData.fecha.split('T')[0],
                cant_kg: initialData.cant_kg.toString(),
                calidad: initialData.calidad
            });
        }
    }, [initialData]);

    const handleSave = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/cosechas/${initialData?.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                toast({ title: "Éxito", description: "Cosecha actualizada correctamente" });
                onSuccess();
                onClose();
            }
        } catch (error) {
            toast({ title: "Error", variant: "destructive", description: "No se pudo actualizar" });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="bg-[#181111] text-cream border-white/10">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-avocado-pulp">
                        <Scale className="w-5 h-5" /> Editar Cosecha
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>Origen (Siembra - Parcela)</Label>
                        <Select value={formData.siembra_id} onValueChange={(v) => setFormData({ ...formData, siembra_id: v })}>
                            <SelectTrigger className="bg-white/5 border-white/10">
                                <SelectValue placeholder="Seleccionar siembra" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1b1b1b] border-white/10">
                                {siembras.map((s) => (
                                    <SelectItem key={s.id} value={s.id.toString()}>
                                        {s.variedad_nombre} - {s.parcela_nombre} ({s.fecha.split('T')[0]})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Cantidad (kg)</Label>
                            <Input
                                type="number"
                                value={formData.cant_kg}
                                onChange={(e) => setFormData({ ...formData, cant_kg: e.target.value })}
                                className="bg-white/5 border-white/10"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Calidad</Label>
                            <Select value={formData.calidad} onValueChange={(v) => setFormData({ ...formData, calidad: v })}>
                                <SelectTrigger className="bg-white/5 border-white/10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1b1b1b] border-white/10">
                                    <SelectItem value="Alta">Calidad Alta</SelectItem>
                                    <SelectItem value="Media">Calidad Media</SelectItem>
                                    <SelectItem value="Baja">Calidad Baja</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Fecha de Cosecha</Label>
                        <Input
                            type="date"
                            value={formData.fecha}
                            onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                            className="bg-white/5 border-white/10"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSave} className="bg-avocado-pulp text-[#181111] hover:bg-avocado-dark font-bold">
                        <Save className="w-4 h-4 mr-2" /> Guardar Cambios
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EditCosechaModal;