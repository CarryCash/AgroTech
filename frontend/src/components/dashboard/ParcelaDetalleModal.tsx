import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { MapPin, Maximize, Sprout, Activity, Navigation } from 'lucide-react';
import { Parcela } from '@/types/farms';
import { cn } from '@/lib/utils';

interface ParcelaDetalleModalProps {
    parcela: Parcela | null;
    open: boolean;
    onClose: () => void;
}

const ParcelaDetalleModal: React.FC<ParcelaDetalleModalProps> = ({ parcela, open, onClose }) => {
    if (!parcela) return null;

    const estadoStyles = {
        Activa: 'bg-success/20 text-success border-success/30',
        EnMantenimiento: 'bg-warning/20 text-warning border-warning/30',
        Baja: 'bg-destructive/20 text-destructive border-destructive/30',
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="glass-card border-white/10 sm:max-w-3xl bg-[#181111] text-cream overflow-hidden p-0">
                <div className="flex flex-col md:flex-row h-[550px]">

                    {/* LADO IZQUIERDO: DATOS TÉCNICOS */}
                    <div className="flex-1 p-8 space-y-6 overflow-y-auto">
                        <DialogHeader>
                            <div className="flex items-center justify-between mb-2">
                                <Badge variant="outline" className={cn("font-bold px-3", estadoStyles[parcela.estado])}>
                                    {parcela.estado === 'EnMantenimiento' ? 'Mantenimiento' : parcela.estado}
                                </Badge>
                                <span className="text-[10px] text-muted-foreground font-mono tracking-widest uppercase">Lote ID: {parcela.id}</span>
                            </div>
                            <DialogTitle className="text-4xl font-display font-bold text-avocado-pulp">
                                {parcela.nombre}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                <div className="flex items-center gap-2 text-avocado-cream mb-2">
                                    <Maximize className="w-4 h-4" />
                                    <span className="text-[10px] font-bold uppercase tracking-tighter">Superficie Total</span>
                                </div>
                                <p className="text-2xl font-display font-bold">{parcela.area_ha} <span className="text-sm font-normal text-muted-foreground">ha</span></p>
                            </div>

                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                <div className="flex items-center gap-2 text-avocado-cream mb-2">
                                    <Sprout className="w-4 h-4" />
                                    <span className="text-[10px] font-bold uppercase tracking-tighter">Variedad Cultivada</span>
                                </div>
                                <p className="text-sm font-semibold">Hass Premium</p>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                <Activity className="w-4 h-4 text-info" />
                                Telemetría en Tiempo Real
                            </h4>
                            <div className="grid grid-cols-1 gap-2">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-black/20 text-sm">
                                    <span className="text-muted-foreground">Humedad Suelo</span>
                                    <span className="text-info font-bold">42%</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-black/20 text-sm">
                                    <span className="text-muted-foreground">Estado Riego</span>
                                    <span className="text-success font-bold">Inactivo</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* LADO DERECHO: MAPA SATELITAL */}
                    <div className="flex-1 relative bg-[#261c1c] overflow-hidden group">
                        {/* Imagen de satélite simulada - Cambia la URL por un mapa real si tienes API */}
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fee74a62?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center transition-transform duration-700 group-hover:scale-110">
                            <div className="absolute inset-0 bg-avocado-dark/20 backdrop-brightness-75" />

                            {/* Overlay de coordenadas */}
                            <div className="absolute top-4 left-4 bg-[#181111]/90 p-2 rounded border border-white/10 backdrop-blur-md">
                                <div className="flex items-center gap-2">
                                    <Navigation className="w-3 h-3 text-avocado-pulp" />
                                    <span className="text-[10px] font-mono tracking-tighter text-cream">COORD: -78.50 / 1.20</span>
                                </div>
                            </div>

                            {/* Pin de ubicación central */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-avocado-pulp rounded-full animate-ping opacity-75" />
                                    <div className="relative bg-avocado-pulp text-white p-3 rounded-full shadow-2xl border-2 border-white/20">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                </div>
                            </div>

                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-3/4">
                                <div className="bg-[#181111]/90 backdrop-blur-md p-3 rounded-xl border border-white/10 text-center shadow-2xl">
                                    <p className="text-[10px] font-bold text-avocado-pulp uppercase mb-1">Sector de Producción</p>
                                    <p className="text-xs text-cream font-medium">Ubicación Norte - Finca El Sol</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ParcelaDetalleModal;