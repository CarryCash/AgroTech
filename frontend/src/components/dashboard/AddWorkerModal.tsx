import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AddWorkerModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AddWorkerModal: React.FC<AddWorkerModalProps> = ({ open, onClose, onSuccess }) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        rol: 'Peon'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/usuarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast({ title: "Trabajador registrado", description: "Se ha añadido al equipo correctamente." });
                setFormData({ username: '', email: '', rol: 'Peon' }); // Limpiar
                onSuccess();
                onClose();
            }
        } catch (error) {
            toast({ title: "Error", description: "No se pudo conectar con el servidor", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="bg-[#121212] text-white border-white/10 sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-avocado-pulp">
                        <UserPlus className="w-5 h-5" />
                        Registrar Nuevo Trabajador
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre Completo</Label>
                        <Input
                            id="name"
                            placeholder="Ej. Juan Pérez"
                            value={formData.username}
                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                            className="bg-white/5 border-white/10 focus:border-avocado-pulp"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Correo Electrónico</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="juan@finca.com"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="bg-white/5 border-white/10 focus:border-avocado-pulp"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Rol Asignado</Label>
                        <Select
                            value={formData.rol}
                            onValueChange={(val) => setFormData({ ...formData, rol: val })}
                        >
                            <SelectTrigger className="bg-white/5 border-white/10">
                                <SelectValue placeholder="Selecciona un rol" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1b1b1b] text-white border-white/10">
                                <SelectItem value="Administrador">Administrador</SelectItem>
                                <SelectItem value="Tecnico">Técnico</SelectItem>
                                <SelectItem value="Peon">Peón</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-avocado-pulp text-black hover:bg-avocado-dark">
                            <Save className="w-4 h-4 mr-2" />
                            {loading ? 'Guardando...' : 'Registrar Trabajador'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddWorkerModal;