import React, { useEffect, useState } from 'react';
import RecomendacionCard from '@/components/dashboard/RecomendacionCard';
import { Cpu, Loader2, Sparkles, BrainCircuit, X, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export interface RecomendacionIA {
    id: number;
    descripcion: string;
    fecha_hora: string;
    estado: 'Pendiente' | 'Aceptada' | 'Rechazada';
    parcela_id: number;
    nombre_parcela?: string;
    tecnico_id?: number;
}

const Recomendaciones: React.FC = () => {
    const { toast } = useToast();
    const [recomendaciones, setRecomendaciones] = useState<RecomendacionIA[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Estados para el Análisis de Gemini
    const [analisisIA, setAnalisisIA] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [selectedRec, setSelectedRec] = useState<RecomendacionIA | null>(null);

    const fetchRecomendaciones = async () => {
        try {
            setLoading(true);
            const res = await fetch('http://localhost:5000/api/ia/recomendaciones');
            if (!res.ok) throw new Error('Error al obtener datos');
            const data = await res.json();
            setRecomendaciones(data);
        } catch (error) {
            toast({ 
                title: "Error de Conexión", 
                description: "No se pudo sincronizar con el motor de IA.", 
                variant: "destructive" 
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRecomendaciones(); }, []);

    const handleAnalyze = async (id: number, descripcion: string) => {
        const rec = recomendaciones.find(r => r.id === id);
        if (!rec) return;
        
        setSelectedRec(rec);
        setIsAnalyzing(true);
        setAnalisisIA(null); 

        try {
            const res = await fetch('http://localhost:5000/api/ia/analizar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    descripcion, 
                    parcela: rec.nombre_parcela || "Parcela General"
                })
            });
            const data = await res.json();
            setAnalisisIA(data.analisis);
        } catch (error) {
            toast({ 
                title: "Falla en el Análisis", 
                description: "Gemini 3 Flash no pudo procesar la solicitud en este momento.", 
                variant: "destructive" 
            });
            setIsAnalyzing(false);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleAccept = async (id: number) => {
        try {
            const res = await fetch(`http://localhost:5000/api/ia/aceptar/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario_id: 1 }) 
            });

            if (res.ok) {
                toast({ 
                    title: '¡Acción Programada!', 
                    description: 'La recomendación se ha convertido en una tarea oficial.',
                });
                setAnalisisIA(null);
                fetchRecomendaciones();
            }
        } catch (error) {
            toast({ title: 'Error al procesar la tarea', variant: "destructive" });
        }
    };

    const handleReject = async (id: number) => {
        try {
            const res = await fetch(`http://localhost:5000/api/ia/rechazar/${id}`, { 
                method: 'PATCH' 
            });
            if (res.ok) {
                toast({ title: 'Recomendación descartada' });
                fetchRecomendaciones();
            }
        } catch (error) {
            toast({ title: 'Error al descartar', variant: "destructive" });
        }
    };

    return (
        <div className="space-y-6 animate-fade-in relative pb-20">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
                        <Cpu className="w-8 h-8 text-[#9bbd5c] animate-pulse" />
                        Recomendaciones IA
                    </h1>
                    <p className="text-muted-foreground mt-1">Sugerencias inteligentes basadas en datos de sensores</p>
                </div>
                <Badge variant="outline" className="gap-2 px-4 py-1.5 border-[#9bbd5c]/30 text-[#9bbd5c] bg-[#9bbd5c]/5">
                    <Sparkles className="w-3.5 h-3.5" /> Motor Gemini Activo
                </Badge>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="animate-spin text-[#9bbd5c] w-12 h-12" />
                    <p className="text-sm text-muted-foreground">Analizando cultivos...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {recomendaciones.filter(r => r.estado === 'Pendiente').map((rec) => (
                        <RecomendacionCard
                            key={rec.id}
                            recomendacion={rec}
                            onAccept={() => handleAccept(rec.id)}
                            onReject={() => handleReject(rec.id)}
                            onAnalyze={handleAnalyze}
                        />
                    ))}
                    
                    {recomendaciones.filter(r => r.estado === 'Pendiente').length === 0 && (
                        <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.02]">
                            <p className="text-muted-foreground">No hay alertas nuevas. Los parámetros de la finca están estables.</p>
                        </div>
                    )}
                </div>
            )}

            {/* MODAL DE ANÁLISIS DE GEMINI */}
            {(isAnalyzing || analisisIA) && (
                <div 
                    className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4"
                    onClick={() => { setAnalisisIA(null); setIsAnalyzing(false); }}
                >
                    <div 
                        className="bg-[#121212] border border-white/10 w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl"
                        onClick={(e) => e.stopPropagation()} // Evita cerrar al hacer clic dentro
                    >
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-[#9bbd5c]/10 to-transparent">
                            <div className="flex items-center gap-3 text-[#9bbd5c]">
                                <BrainCircuit className="w-6 h-6" />
                                <h3 className="font-bold text-lg">Análisis de Ingeniería Agrónoma</h3>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => { setAnalisisIA(null); setIsAnalyzing(false); }}>
                                <X className="w-5 h-5 text-gray-400" />
                            </Button>
                        </div>
                        
                        <div className="p-8">
                            {isAnalyzing ? (
                                <div className="flex flex-col items-center py-10 gap-4">
                                    <Loader2 className="w-10 h-10 animate-spin text-[#9bbd5c]" />
                                    <p className="text-sm font-mono text-[#9bbd5c]">GENERANDO DIAGNÓSTICO...</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/10 italic text-sm text-gray-400">
                                        "{selectedRec?.descripcion}"
                                    </div>
                                    <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                                        {analisisIA}
                                    </div>
                                    <div className="flex gap-3 mt-8 pt-6 border-t border-white/5">
                                        <Button 
                                            className="flex-1 bg-[#9bbd5c] hover:bg-[#8aa852] text-black font-bold gap-2" 
                                            onClick={() => selectedRec && handleAccept(selectedRec.id)}
                                        >
                                            <Check className="w-4 h-4" /> Ejecutar Ahora
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            className="flex-1 border-white/10 text-white" 
                                            onClick={() => setAnalisisIA(null)}
                                        >
                                            Ignorar
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Recomendaciones;