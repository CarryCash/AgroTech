import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sprout, MapPin, TrendingUp, Info, Edit2, Calendar } from 'lucide-react';
import { Siembra, Parcela, Variedad } from '@/types/farms';

interface SiembraDetalleModalProps {
    siembra: (Siembra & { parcela_nombre?: string; variedad_nombre?: string; variedad_desc?: string }) | null;
    open: boolean;
    onClose: () => void;
    onEdit?: () => void; // Opcional por ahora para evitar errores
}

const SiembraDetalleModal: React.FC<SiembraDetalleModalProps> = ({ siembra, open, onClose, onEdit }) => {
    if (!siembra) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="bg-[#181111] text-cream border-white/10 sm:max-w-lg p-0 overflow-hidden">
                <div className="h-24 bg-gradient-to-r from-avocado-dark to-avocado-pulp/20" />
                <div className="p-6">
                    <DialogHeader className="mb-4">
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            <Sprout className="text-avocado-pulp" />
                            {siembra.variedad_nombre || "Variedad"}
                        </DialogTitle>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> Parcela: {siembra.parcela_nombre || "N/A"}
                        </p>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                            <p className="text-[10px] uppercase text-muted-foreground font-bold">Plantas</p>
                            <p className="text-xl font-bold text-avocado-pulp">{siembra.cant_plantas}</p>
                        </div>
                        <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                            <p className="text-[10px] uppercase text-muted-foreground font-bold">Fecha</p>
                            <p className="text-sm">{new Date(siembra.fecha).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className="bg-white/5 p-4 rounded-lg mb-6 border-l-2 border-avocado-pulp">
                        <p className="text-xs italic text-muted-foreground">
                            {siembra.variedad_desc || "Sin descripción adicional."}
                        </p>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-white/5">
                        <Button variant="ghost" onClick={onClose} className="text-xs uppercase font-bold">Cerrar</Button>
                        <Button onClick={onEdit} className="bg-avocado-pulp hover:bg-avocado-dark text-[#181111] text-xs font-bold uppercase">
                            <Edit2 className="w-3 h-3 mr-2" /> Editar
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default SiembraDetalleModal;