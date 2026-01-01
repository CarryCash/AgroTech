import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Play, CheckCircle, Edit2, Trash2, Clock } from 'lucide-react';
import type { TareaDB as Tarea } from '@/pages/Tareas'; // Ajusta la ruta según tu proyecto
import { cn } from '@/lib/utils';

interface TareaCardProps {
    tarea: Tarea;
    onStart?: (id: number) => void;
    onComplete?: (id: number) => void;
    onEdit?: (tarea: Tarea) => void;
    onDelete?: (id: number) => void;
    compact?: boolean;
}

const TareaCard: React.FC<TareaCardProps> = ({ tarea, onStart, onComplete, onEdit, onDelete, compact }) => {
    
    const estadoConfig = {
        Pendiente: { variant: 'pendiente', label: 'Pendiente', icon: <Clock className="w-3 h-3" /> },
        EnProgreso: { variant: 'enprogreso', label: 'En Progreso', icon: <Play className="w-3 h-3 text-blue-400" /> },
        Completada: { variant: 'completada', label: 'Completada', icon: <CheckCircle className="w-3 h-3 text-green-400" /> },
        Cancelada: { variant: 'cancelada', label: 'Cancelada', icon: null },
    } as const;

    if (compact) {
        return (
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                    <Badge variant={estadoConfig[tarea.estado].variant} className="text-[10px] px-1.5">
                        {estadoConfig[tarea.estado].label}
                    </Badge>
                    <span className="text-sm font-medium text-foreground truncate max-w-[150px]">{tarea.descripcion}</span>
                </div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    {tarea.nombre_parcela || tarea.nombre || 'Parcela'}
                </span>
            </div>
        );
    }

    return (
        <div className={cn(
            "glass-card p-5 transition-all duration-300 group border",
            tarea.estado === 'Completada' ? "border-green-500/20 opacity-80" : "border-white/10 hover:border-avocado-pulp/30"
        )}>
            <div className="flex items-start justify-between mb-4">
                <Badge variant={estadoConfig[tarea.estado].variant} className="gap-1.5 py-1">
                    {estadoConfig[tarea.estado].icon}
                    {estadoConfig[tarea.estado].label}
                </Badge>
                
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-blue-400 hover:bg-blue-400/10" 
                        onClick={(e) => { e.stopPropagation(); onEdit?.(tarea); }}
                    >
                        <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-red-400 hover:bg-red-400/10" 
                        onClick={(e) => { e.stopPropagation(); onDelete?.(tarea.id); }}
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </div>

            <h4 className="font-semibold text-foreground mb-3 text-lg leading-tight">
                {tarea.descripcion}
            </h4>

            <div className="space-y-2.5 mb-5">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 text-avocado-pulp" />
                    <span className="font-medium text-gray-300">
                        {tarea.nombre_parcela || tarea.nombre || 'Parcela no especificada'}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 text-avocado-pulp" />
                    <span>{new Date(tarea.fecha_prog).toLocaleDateString('es-EC', { 
                        day: '2-digit', month: 'long', year: 'numeric' 
                    })}</span>
                </div>
            </div>

            {/* ACCIONES: Iniciar y Completar */}
            {tarea.estado !== 'Completada' && tarea.estado !== 'Cancelada' && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
                    {tarea.estado === 'Pendiente' && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onStart?.(tarea.id)}
                            className="flex-1 gap-2 border-avocado-pulp/30 hover:bg-avocado-pulp/10 text-avocado-pulp"
                        >
                            <Play className="w-3.5 h-3.5 fill-current" /> Iniciar
                        </Button>
                    )}
                    
                    <Button
                        size="sm"
                        variant={tarea.estado === 'EnProgreso' ? 'default' : 'outline'}
                        onClick={() => onComplete?.(tarea.id)}
                        className={cn(
                            "flex-1 gap-2 transition-all",
                            tarea.estado === 'EnProgreso' 
                                ? "bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20" 
                                : "text-green-500 border-green-500/30 hover:bg-green-500/10"
                        )}
                    >
                        <CheckCircle className="w-3.5 h-3.5" /> Completar
                    </Button>
                </div>
            )}

            {tarea.estado === 'Completada' && (
                <div className="mt-4 pt-3 border-t border-green-500/10 flex justify-center items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500/50" />
                    <span className="text-xs font-bold text-green-500/60 uppercase tracking-widest">
                        Actividad Finalizada
                    </span>
                </div>
            )}
        </div>
    );
};

export default TareaCard;