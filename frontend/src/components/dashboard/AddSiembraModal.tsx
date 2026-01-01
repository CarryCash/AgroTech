import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Sprout, Calendar, MapPin, Hash, Save, Info } from 'lucide-react';
import { Siembra, Parcela, Variedad } from '@/types/farms';
import { useToast } from '@/hooks/use-toast';

interface AddSiembraModalProps {
    open: boolean;
    onClose: () => void;
    initialData: Siembra | null;
    onSuccess: () => void;
    parcelas: Parcela[];
    variedades: Variedad[];
}

const AddSiembraModal: React.FC<AddSiembraModalProps> = ({ 
    open, onClose, initialData, onSuccess, parcelas, variedades 
}) => {
    const { toast } = useToast();
    const isEditing = !!initialData;

    const [formData, setFormData] = useState({
        variedad_id: '',
        parcela_id: '',
        cant_plantas: '',
        fecha: new Date().toISOString().split('T')[0]
    });

    // Sincronizar datos al abrir para editar o crear
    useEffect(() => {
        if (open) {
            if (initialData) {
                setFormData({
                    variedad_id: initialData.variedad_id.toString(),
                    parcela_id: initialData.parcela_id.toString(),
                    cant_plantas: initialData.cant_plantas.toString(),
                    fecha: initialData.fecha.split('T')[0]
                });
            } else {
                setFormData({
                    variedad_id: '',
                    parcela_id: '',
                    cant_plantas: '',
                    fecha: new Date().toISOString().split('T')[0]
                });
            }
        }
    }, [initialData, open]);

    // Lógica para obtener la descripción de la variedad seleccionada
    const variedadSeleccionada = variedades.find(v => v.id.toString() === formData.variedad_id);

    const handleSubmit = async () => {
        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing 
            ? `http://localhost:5000/api/siembras/${initialData.id}`
            : 'http://localhost:5000/api/siembras';
        
        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                toast({ title: isEditing ? "Actualizado" : "Registrado", description: "La siembra se guardó correctamente." });
                onSuccess();
                onClose();
            }
        } catch (error) {
            toast({ title: "Error", variant: "destructive", description: "No se pudo guardar la siembra." });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="border-white/10 sm:max-w-[450px] bg-[#181111] text-cream">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-avocado-pulp">
                        <Sprout className="w-6 h-6" />
                        {isEditing ? 'Editar Registro' : 'Nueva Siembra'}
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-5 py-4">
                    {/* Selector de Variedad */}
                    <div className="grid gap-2">
                        <Label className="text-xs uppercase font-bold text-muted-foreground">Variedad de Aguacate</Label>
                        <Select 
                            value={formData.variedad_id} 
                            onValueChange={(v) => setFormData({...formData, variedad_id: v})}
                        >
                            <SelectTrigger className="bg-white/5 border-white/10">
                                <SelectValue placeholder="Seleccione variedad" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1b1b1b] border-white/10">
                                {variedades.map((v) => (
                                    <SelectItem key={v.id} value={v.id.toString()}>{v.nombre}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        
                        {/* RECUADRO DE DESCRIPCIÓN DINÁMICA */}
                        {variedadSeleccionada && (
                            <div className="mt-1 p-3 rounded-lg bg-avocado-pulp/5 border border-avocado-pulp/20 flex gap-3 animate-in fade-in slide-in-from-top-1">
                                <Info className="w-4 h-4 text-avocado-pulp shrink-0 mt-0.5" />
                                <p className="text-[11px] leading-relaxed text-muted-foreground">
                                    <strong className="text-avocado-pulp">Nota:</strong> {variedadSeleccionada.descripcion}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Selector de Parcela */}
                    <div className="grid gap-2">
                        <Label className="text-xs uppercase font-bold text-muted-foreground">Parcela de Destino</Label>
                        <Select 
                            value={formData.parcela_id} 
                            onValueChange={(v) => setFormData({...formData, parcela_id: v})}
                        >
                            <SelectTrigger className="bg-white/5 border-white/10">
                                <SelectValue placeholder="Seleccione ubicación" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1b1b1b] border-white/10 text-white">
                                {parcelas.map((p) => (
                                    <SelectItem key={p.id} value={p.id.toString()}>{p.nombre} ({p.area_ha} ha)</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label className="text-xs uppercase font-bold text-muted-foreground">N° Plantas</Label>
                            <div className="relative">
                                <Hash className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="number"
                                    value={formData.cant_plantas}
                                    onChange={(e) => setFormData({...formData, cant_plantas: e.target.value})}
                                    className="bg-white/5 border-white/10 pl-9"
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label className="text-xs uppercase font-bold text-muted-foreground">Fecha de Inicio</Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="date"
                                    value={formData.fecha}
                                    onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                                    className="bg-white/5 border-white/10 pl-9"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="border-t border-white/5 pt-4">
                    <Button variant="ghost" onClick={onClose} className="text-white hover:bg-white/5">
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleSubmit} 
                        className="bg-avocado-pulp hover:bg-avocado-dark text-[#181111] font-bold gap-2 px-6"
                    >
                        <Save className="w-4 h-4" />
                        {isEditing ? 'Guardar Cambios' : 'Confirmar Registro'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddSiembraModal;