import React, { useState } from 'react';
import { Cpu, CheckCircle, XCircle, Clock, Sparkles, BrainCircuit, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { RecomendacionIA } from '@/types/farms';
import { cn } from '@/lib/utils';
// Eliminamos parcelas de mockData para usar los datos reales que vienen en la recomendación

interface RecomendacionCardProps {
    recomendacion: RecomendacionIA;
    onAccept?: (id: number) => void;
    onReject?: (id: number) => void;
    onAnalyze?: (id: number, descripcion: string) => void; // Nueva prop para Gemini
}

const RecomendacionCard: React.FC<RecomendacionCardProps> = ({
    recomendacion,
    onAccept,
    onReject,
    onAnalyze
}) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const statusConfig = {
        Pendiente: { icon: Clock, variant: 'pendiente' as const, label: 'Pendiente' },
        Aceptada: { icon: CheckCircle, variant: 'aceptada' as const, label: 'Aceptada' },
        Rechazada: { icon: XCircle, variant: 'rechazada' as const, label: 'Rechazada' },
    };

    const config = statusConfig[recomendacion.estado];
    const StatusIcon = config.icon;

    return (
        <div className={cn(
            'glass-card p-5 transition-all duration-300 hover:scale-[1.01] group',
            recomendacion.estado === 'Pendiente' && 'border-l-2 border-l-warning shadow-lg shadow-warning/5'
        )}>
            <div className="flex items-start gap-4">
                {/* Icono de IA con efecto de pulso si está pendiente */}
                <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                    recomendacion.estado === 'Pendiente' ? "bg-accent/20 animate-pulse" : "bg-muted/50"
                )}>
                    <Cpu className={cn("w-6 h-6", recomendacion.estado === 'Pendiente' ? "text-accent" : "text-muted-foreground")} />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Badge variant={config.variant} className="flex items-center gap-1">
                                <StatusIcon className="w-3 h-3" />
                                {config.label}
                            </Badge>
                            <span className="text-xs font-semibold text-avocado-pulp uppercase tracking-wider">
                                {recomendacion.nombre_parcela || 'Parcela'}
                            </span>
                        </div>
                        
                        {/* Botón de Análisis Gemini */}
                        {recomendacion.estado === 'Pendiente' && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 gap-1.5 text-[10px] border-accent/30 hover:bg-accent/10 text-accent uppercase font-bold"
                                onClick={() => onAnalyze?.(recomendacion.id, recomendacion.descripcion)}
                            >
                                <BrainCircuit className="w-3 h-3" />
                                Análisis IA
                            </Button>
                        )}
                    </div>

                    <h4 className="text-foreground font-semibold text-lg mb-1 leading-tight">
                        {recomendacion.descripcion}
                    </h4>

                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase">
                        <Clock className="w-3 h-3" />
                        {new Date(recomendacion.fecha_hora).toLocaleString('es-EC', {
                            dateStyle: 'long',
                            timeStyle: 'short',
                        })}
                    </div>
                </div>

                {/* Acciones Rápidas */}
                {recomendacion.estado === 'Pendiente' && (
                    <div className="flex flex-col gap-2">
                        <Button
                            size="icon"
                            variant="success"
                            className="rounded-full h-10 w-10 shadow-lg shadow-green-900/20"
                            onClick={() => onAccept?.(recomendacion.id)}
                        >
                            <CheckCircle className="w-5 h-5" />
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onReject?.(recomendacion.id)}
                            className="rounded-full h-10 w-10 text-destructive hover:bg-destructive/10"
                        >
                            <XCircle className="w-5 h-5" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecomendacionCard;