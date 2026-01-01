import React from 'react';
import { Parcela } from '@/types/farms';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Sprout, Activity, AlertTriangle, Edit2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ParcelaGridProps {
    parcelas: Parcela[];
    onParcelaClick: (parcela: Parcela) => void;
    onEditClick: (parcela: Parcela) => void; // Nueva prop para editar
    onDeleteClick: (id: number) => void;    // Nueva prop para eliminar
}

const ParcelaGrid: React.FC<ParcelaGridProps> = ({ 
    parcelas, 
    onParcelaClick, 
    onEditClick,
    onDeleteClick 
}) => {
    
    const estadoStyles = {
        Activa: 'border-l-success bg-success/5 text-success',
        EnMantenimiento: 'border-l-warning bg-warning/5 text-warning',
        Baja: 'border-l-destructive bg-destructive/5 text-destructive',
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {parcelas.map((parcela) => (
                <div
                    key={parcela.id}
                    onClick={() => onParcelaClick(parcela)}
                    className={cn(
                        "glass-card p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] border-l-4 group relative",
                        estadoStyles[parcela.estado] || 'border-l-muted'
                    )}
                >
                    {/* BOTONES DE ACCIÓN (CRUD) */}
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 bg-black/20 hover:bg-avocado-pulp hover:text-white text-muted-foreground"
                            onClick={(e) => {
                                e.stopPropagation(); // Evita abrir el detalle de la parcela
                                onEditClick(parcela);
                            }}
                        >
                            <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 bg-black/20 hover:bg-destructive hover:text-white text-muted-foreground"
                            onClick={(e) => {
                                e.stopPropagation();
                                if(parcela.id) onDeleteClick(parcela.id);
                            }}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* ENCABEZADO */}
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                                <MapPin className="w-5 h-5 text-avocado-pulp" />
                            </div>
                            <div>
                                <h3 className="font-display font-bold text-xl text-foreground">
                                    {parcela.nombre}
                                </h3>
                                <p className="text-sm text-muted-foreground">{parcela.area_ha} hectáreas</p>
                            </div>
                        </div>
                    </div>

                    {/* ESTADO BADGE */}
                    <Badge variant="outline" className={cn("font-semibold mb-4", estadoStyles[parcela.estado])}>
                        {parcela.estado === 'EnMantenimiento' ? 'Mantenimiento' : parcela.estado}
                    </Badge>

                    {/* DETALLES DINÁMICOS */}
                    <div className="space-y-3 mt-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Sprout className="w-4 h-4 text-avocado-pulp/70" />
                            <span>Variedad principal: <b className="text-foreground/80 font-medium">Hass</b></span>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                            <div className="flex items-center gap-2 text-xs font-medium">
                                <Activity className="w-3.5 h-3.5 text-info" />
                                <span className="text-info">
                                    {parcela.num_sensores || 0} sensores
                                </span>
                            </div>

                            <div className="flex items-center gap-2 text-xs font-medium">
                                <AlertTriangle className="w-3.5 h-3.5 text-warning" />
                                <span className="text-warning">
                                    {parcela.num_tareas || 0} tareas pendientes
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ParcelaGrid;