import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Insumo {
    id: number;
    nombre: string;
    tipo: string;
    stock_actual: number;
    unidad_medida: string;
}

interface EditProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    insumo: Insumo | null;
}

const EditInsumoModal: React.FC<EditProps> = ({ open, onClose, onSuccess, insumo }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        tipo: '',
        stock_actual: 0,
        unidad_medida: ''
    });

    useEffect(() => {
        if (insumo) {
            setFormData({
                nombre: insumo.nombre,
                tipo: insumo.tipo,
                stock_actual: insumo.stock_actual,
                unidad_medida: insumo.unidad_medida
            });
        }
    }, [insumo]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!insumo) return;

        try {
            const res = await fetch(`http://localhost:5000/api/insumos/${insumo.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                onSuccess();
                onClose();
            }
        } catch (error) {
            console.error("Error al actualizar:", error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-[#1a1a1a] text-white border-white/10">
                <DialogHeader>
                    <DialogTitle>Editar Insumo</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label>Nombre</Label>
                        <Input
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            className="bg-white/5 border-white/10 text-white"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Stock Actual</Label>
                            <Input
                                type="number"
                                value={formData.stock_actual}
                                onChange={(e) => setFormData({ ...formData, stock_actual: Number(e.target.value) })}
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Unidad</Label>
                            <Input
                                value={formData.unidad_medida}
                                onChange={(e) => setFormData({ ...formData, unidad_medida: e.target.value })}
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" className="bg-[#A7C957] text-black hover:bg-[#A7C957]/90">
                            Guardar Cambios
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditInsumoModal;