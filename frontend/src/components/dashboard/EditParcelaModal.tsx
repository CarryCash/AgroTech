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
import { Edit2, Maximize2, Save, MapPin } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Parcela } from '@/types/farms';

interface EditParcelaModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    parcela: Parcela | null; // Recibe la parcela a editar o null
}

const EditParcelaModal: React.FC<EditParcelaModalProps> = ({ open, onClose, onSuccess, parcela }) => {
    const { toast } = useToast();

    // ESTADOS
    const [nombre, setNombre] = useState('');
    const [area, setArea] = useState('');
    const [estado, setEstado] = useState('Activa');
    const [fincaId, setFincaId] = useState('1');
    const [isSaving, setIsSaving] = useState(false);

    // Cargar datos cuando el modal recibe una parcela
    useEffect(() => {
        if (parcela) {
            setNombre(parcela.nombre);
            setArea(parcela.area_ha.toString());
            setEstado(parcela.estado);
            setFincaId(parcela.finca_id.toString());
        }
    }, [parcela, open]);

    const handleUpdate = async () => {
        if (!parcela?.id) return;

        setIsSaving(true);
        try {
            const response = await fetch(`http://localhost:5000/api/parcelas/${parcela.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre,
                    area_ha: parseFloat(area),
                    estado,
                    finca_id: parseInt(fincaId)
                }),
            });

            if (response.ok) {
                toast({ title: "¡Actualizado!", description: "Los cambios se guardaron en MySQL" });
                onSuccess();
                onClose();
            }
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Error de conexión";
            toast({ title: "Error", description: msg, variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="glass-card border-white/10 sm:max-w-md bg-[#181111] text-cream">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-display font-bold flex items-center gap-2 text-avocado-pulp">
                        <Edit2 className="w-6 h-6" />
                        Editar Parcela
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="edit-nombre" className="text-xs uppercase font-bold text-muted-foreground">Nombre</Label>
                        <Input
                            id="edit-nombre"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            className="bg-white/5 border-white/10 focus:border-avocado-pulp/50"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-area" className="text-xs uppercase font-bold text-muted-foreground flex items-center gap-1">
                                <Maximize2 className="w-3 h-3" /> Sup. (ha)
                            </Label>
                            <Input
                                id="edit-area"
                                type="number"
                                step="0.01"
                                value={area}
                                onChange={(e) => setArea(e.target.value)}
                                className="bg-white/5 border-white/10 focus:border-avocado-pulp/50"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label className="text-xs uppercase font-bold text-muted-foreground">Estado</Label>
                            <Select value={estado} onValueChange={setEstado}>
                                <SelectTrigger className="bg-white/5 border-white/10">
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

                    <div className="grid gap-2">
                        <Label className="text-xs uppercase font-bold text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> Finca
                        </Label>
                        <Select value={fincaId} onValueChange={setFincaId}>
                            <SelectTrigger className="bg-white/5 border-white/10">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#181111] border-white/10 text-cream">
                                <SelectItem value="1">Finca El Sol</SelectItem>
                                <SelectItem value="2">Finca La Brisa</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter className="pt-4">
                    <Button variant="ghost" onClick={onClose} disabled={isSaving}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleUpdate}
                        disabled={isSaving}
                        className="bg-avocado-pulp hover:bg-avocado-dark text-[#181111] font-bold gap-2"
                    >
                        {isSaving ? "Actualizando..." : <><Save className="w-4 h-4" /> Guardar Cambios</>}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EditParcelaModal;