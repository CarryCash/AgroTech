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
import { Sprout, Maximize2, Save, MapPin } from 'lucide-react';
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface AddParcelaModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void; // Para disparar un refresh en el componente padre
}

const AddParcelaModal: React.FC<AddParcelaModalProps> = ({ open, onClose, onSuccess }) => {
    const { toast } = useToast();

    // ESTADOS PARA EL FORMULARIO
    const [nombre, setNombre] = useState('');
    const [area, setArea] = useState('');
    const [estado, setEstado] = useState('Activa');
    const [fincaId, setFincaId] = useState('1'); // Por defecto "El Sol"
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async () => {
        // Validaciones preventivas
        if (!nombre || !area || !fincaId) {
            toast({
                title: "Campos incompletos",
                description: "Por favor llena todos los campos obligatorios",
                variant: "destructive"
            });
            return;
        }

        const areaNum = parseFloat(area);
        if (isNaN(areaNum) || areaNum <= 0) {
            toast({
                title: "Área inválida",
                description: "La superficie debe ser un número mayor a 0",
                variant: "destructive"
            });
            return;
        }

        setIsSaving(true);
        try {
            const response = await fetch('http://localhost:5000/api/parcelas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre,
                    area_ha: areaNum,
                    estado,
                    finca_id: parseInt(fincaId)
                }),
            });

            if (response.ok) {
                toast({
                    title: "¡Parcela creada!",
                    description: `La parcela ${nombre} ha sido registrada correctamente.`
                });

                // Limpiar formulario
                setNombre('');
                setArea('');
                setEstado('Activa');
                setFincaId('1');

                if (onSuccess) onSuccess(); // Avisar al padre que refresque la lista
                onClose();
            } else {
                const errorData = await response.text();
                throw new Error(errorData);
            }
        } catch (error: unknown) {
            // Verificamos si es una instancia de Error para acceder a .message
            const errorMessage = error instanceof Error ? error.message : "Error desconocido";

            toast({
                title: "Error al guardar",
                description: errorMessage,
                variant: "destructive"
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="glass-card border-white/10 sm:max-w-md bg-[#181111] text-cream">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-display font-bold flex items-center gap-2 text-avocado-pulp">
                        <Sprout className="w-6 h-6" />
                        Nueva Parcela
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Campo: Nombre */}
                    <div className="grid gap-2">
                        <Label htmlFor="nombre" className="text-xs uppercase font-bold text-muted-foreground">Nombre / Identificador</Label>
                        <Input
                            id="nombre"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Ej: Lote A-3"
                            className="bg-white/5 border-white/10 focus:border-avocado-pulp/50"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Campo: Área */}
                        <div className="grid gap-2">
                            <Label htmlFor="area" className="text-xs uppercase font-bold text-muted-foreground flex items-center gap-1">
                                <Maximize2 className="w-3 h-3" /> Sup. (ha)
                            </Label>
                            <Input
                                id="area"
                                type="number"
                                step="0.01"
                                value={area}
                                onChange={(e) => setArea(e.target.value)}
                                placeholder="0.00"
                                className="bg-white/5 border-white/10 focus:border-avocado-pulp/50"
                            />
                        </div>

                        {/* Campo: Estado */}
                        <div className="grid gap-2">
                            <Label className="text-xs uppercase font-bold text-muted-foreground">Estado Inicial</Label>
                            <Select value={estado} onValueChange={setEstado}>
                                <SelectTrigger className="bg-white/5 border-white/10 focus:border-avocado-pulp/50">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#181111] border-white/10 text-cream">
                                    <SelectItem value="Activa">Activa</SelectItem>
                                    <SelectItem value="EnMantenimiento">Mantenimiento</SelectItem>
                                    <SelectItem value="Baja">Baja</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Campo: Finca (Nuevo parámetro) */}
                    <div className="grid gap-2">
                        <Label className="text-xs uppercase font-bold text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> Ubicación (Finca)
                        </Label>
                        <Select value={fincaId} onValueChange={setFincaId}>
                            <SelectTrigger className="bg-white/5 border-white/10 focus:border-avocado-pulp/50">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#181111] border-white/10 text-cream">
                                <SelectItem value="1">Finca El Sol (Loja)</SelectItem>
                                <SelectItem value="2">Finca La Brisa (Pichincha)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0 pt-4">
                    <Button variant="ghost" onClick={onClose} disabled={isSaving} className="text-muted-foreground hover:text-cream">
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSaving}
                        className="bg-avocado-pulp hover:bg-avocado-dark text-[#181111] font-bold gap-2"
                    >
                        {isSaving ? "Guardando..." : <><Save className="w-4 h-4" /> Registrar</>}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddParcelaModal;