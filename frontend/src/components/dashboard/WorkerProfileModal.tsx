import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Save, ShieldCheck, Mail, Pencil, X } from 'lucide-react';
import { Trabajador } from '@/types/farms'; // Importamos el tipo correcto

interface WorkerProfileModalProps {
    worker: Trabajador | null; // Cambiado de any a Trabajador
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const WorkerProfileModal: React.FC<WorkerProfileModalProps> = ({ worker, open, onClose, onSuccess }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ nombre: '', contacto: '', rol: '' });

    useEffect(() => {
        if (worker && open) {
            setFormData({
                nombre: worker.nombre,
                contacto: worker.contacto || '',
                rol: worker.rol
            });
            setIsEditing(false);
        }
    }, [worker, open]);

    if (!worker) return null;

    const handleUpdate = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/usuarios/${worker.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.nombre,
                    email: formData.contacto,
                    rol: formData.rol
                })
            });
            if (res.ok) {
                onSuccess();
                onClose();
            }
        } catch (error) { 
            console.error("Error al actualizar:", error); 
        }
    };

    const handleDelete = async () => {
        if (!confirm("¿Eliminar trabajador?")) return;
        try {
            const res = await fetch(`http://localhost:5000/api/usuarios/${worker.id}`, { method: 'DELETE' });
            if (res.ok) {
                onSuccess();
                onClose();
            }
        } catch (error) {
            console.error("Error al eliminar:", error);
        }
    };

    // Función segura para generar iniciales sin usar 'any'
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .filter(part => part.length > 0)
            .map(part => part[0].toUpperCase())
            .join('')
            .slice(0, 2);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="glass-card border-white/10 sm:max-w-md bg-[#181111] text-cream overflow-hidden p-0">
                <div className="relative h-24 bg-gradient-to-r from-avocado-dark to-avocado-pulp/40 opacity-30" />
                
                <div className="relative -mt-12 flex flex-col items-center px-6 pb-6">
                    {/* Avatar con iniciales corregido */}
                    <div className="w-20 h-20 rounded-2xl bg-[#261c1c] border-4 border-[#181111] flex items-center justify-center text-2xl font-bold text-avocado-pulp shadow-xl">
                        {getInitials(worker.nombre)}
                    </div>

                    {isEditing ? (
                        <div className="w-full mt-4 space-y-3">
                            <Input 
                                value={formData.nombre} 
                                onChange={e => setFormData({...formData, nombre: e.target.value})} 
                                className="bg-white/5 border-white/10 text-cream" 
                                placeholder="Nombre" 
                            />
                            <Input 
                                value={formData.contacto} 
                                onChange={e => setFormData({...formData, contacto: e.target.value})} 
                                className="bg-white/5 border-white/10 text-cream" 
                                placeholder="Correo" 
                            />
                            <Select value={formData.rol} onValueChange={val => setFormData({...formData, rol: val})}>
                                <SelectTrigger className="bg-white/5 border-white/10 text-cream">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1b1b1b] text-white border-white/10">
                                    <SelectItem value="Administrador">Administrador</SelectItem>
                                    <SelectItem value="Tecnico">Técnico</SelectItem>
                                    <SelectItem value="Peon">Peón</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    ) : (
                        <div className="text-center mt-4">
                            <DialogTitle className="text-2xl font-bold text-cream">{worker.nombre}</DialogTitle>
                            <Badge className="mt-2 bg-avocado-pulp/10 text-avocado-pulp border-avocado-pulp/20 hover:bg-avocado-pulp/20 transition-colors">
                                <ShieldCheck className="w-3 h-3 mr-1" /> {worker.rol}
                            </Badge>
                            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-3">
                                <Mail className="w-4 h-4 text-avocado-pulp" /> {worker.contacto || "Sin correo electrónico"}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-2 w-full mt-6">
                        {isEditing ? (
                            <>
                                <Button onClick={handleUpdate} className="flex-1 bg-avocado-pulp text-black hover:bg-avocado-pulp/80">
                                    <Save className="w-4 h-4 mr-2"/> Guardar
                                </Button>
                                <Button variant="ghost" onClick={() => setIsEditing(false)} className="text-cream hover:bg-white/5">
                                    <X className="w-4 h-4"/>
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button onClick={() => setIsEditing(true)} variant="outline" className="flex-1 border-white/10 text-cream hover:bg-white/5 hover:text-white">
                                    <Pencil className="w-4 h-4 mr-2"/> Editar Perfil
                                </Button>
                                <Button onClick={handleDelete} variant="destructive" size="icon" className="bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default WorkerProfileModal;