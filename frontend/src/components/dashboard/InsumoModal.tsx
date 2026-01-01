import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Save, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface InsumoModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void; // Nueva prop para refrescar la lista
}

const InsumoModal: React.FC<InsumoModalProps> = ({ open, onClose, onSuccess }) => {
    const [nombre, setNombre] = useState('');
    const [tipo, setTipo] = useState('');
    const [caducidad, setCaducidad] = useState('');
    const [cantidad, setCantidad] = useState('');
    const [unidad, setUnidad] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch('http://localhost:5000/api/insumos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre,
                    tipo,
                    fecha_caducidad: caducidad,
                    stock_actual: parseFloat(cantidad),
                    unidad_medida: unidad
                })
            });

            if (res.ok) {
                toast({
                    title: '¡Insumo Registrado!',
                    description: `${nombre} ha sido añadido correctamente.`,
                });
                onSuccess(); // Refresca la lista en la pantalla principal
                onClose();
                // Limpiar campos
                setNombre(''); setTipo(''); setCaducidad(''); setCantidad(''); setUnidad('');
            } else {
                throw new Error("Error al guardar");
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'No se pudo conectar con el servidor.',
                variant: 'destructive'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="glass-card border-accent/20 sm:max-w-lg bg-[#181111] text-cream">
                <DialogHeader>
                    <DialogTitle className="font-display text-2xl font-bold">Registrar Nuevo Insumo</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="nombre" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Nombre</Label>
                        <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} className="bg-[#261c1c] border-none h-12" required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Tipo</Label>
                            <Select value={tipo} onValueChange={setTipo} required>
                                <SelectTrigger className="bg-[#261c1c] border-none h-12"><SelectValue placeholder="Tipo" /></SelectTrigger>
                                <SelectContent className="bg-[#1b1b1b] text-white">
                                    <SelectItem value="Fertilizante">Fertilizante</SelectItem>
                                    <SelectItem value="Fungicida">Fungicida</SelectItem>
                                    <SelectItem value="Herbicida">Herbicida</SelectItem>
                                    <SelectItem value="Insecticida">Insecticida</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="caducidad" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Caducidad</Label>
                            <Input id="caducidad" type="date" value={caducidad} onChange={(e) => setCaducidad(e.target.value)} className="bg-[#261c1c] border-none h-12" required />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="cantidad" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Stock Inicial</Label>
                            <Input id="cantidad" type="number" step="0.01" value={cantidad} onChange={(e) => setCantidad(e.target.value)} className="bg-[#261c1c] border-none h-12" required />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Unidad</Label>
                            <Select value={unidad} onValueChange={setUnidad} required>
                                <SelectTrigger className="bg-[#261c1c] border-none h-12"><SelectValue placeholder="Kg, L..." /></SelectTrigger>
                                <SelectContent className="bg-[#1b1b1b] text-white">
                                    <SelectItem value="Kg">Kilogramos (Kg)</SelectItem>
                                    <SelectItem value="L">Litros (L)</SelectItem>
                                    <SelectItem value="Sacos">Sacos</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="bg-[#2D5A27]/10 border border-[#2D5A27]/20 p-4 rounded-lg flex items-start gap-3">
                        <Bell className="w-5 h-5 text-[#A7C957] mt-0.5" />
                        <p className="text-sm text-gray-300"><span className="text-[#A7C957] font-bold">Nota:</span> Notificaremos 30 días antes de la caducidad.</p>
                    </div>

                    <DialogFooter className="gap-3 sm:gap-0">
                        <Button type="button" variant="ghost" onClick={onClose} className="text-gray-400">Cancelar</Button>
                        <Button type="submit" className="bg-[#A7C957] hover:bg-[#A7C957]/80 text-white font-bold px-8 h-12" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5 mr-2" /> Guardar Insumo</>}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default InsumoModal;