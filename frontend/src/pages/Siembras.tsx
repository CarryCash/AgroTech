import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Leaf, Calendar, MapPin, Sprout, Plus, Filter, Edit2, Trash2 } from 'lucide-react';
import AddSiembraModal from '@/components/dashboard/AddSiembraModal';
import SiembraDetalleModal from '@/components/dashboard/SiembraDetalleModal';
import { cn } from '@/lib/utils';
import { Siembra, Parcela, Variedad } from '@/types/farms';
import { useToast } from '@/hooks/use-toast';

const Siembras: React.FC = () => {
    const { toast } = useToast();

    // ESTADOS PARA DATOS REALES
    const [dbSiembras, setDbSiembras] = useState<Siembra[]>([]);
    const [dbParcelas, setDbParcelas] = useState<Parcela[]>([]);
    const [dbVariedades, setDbVariedades] = useState<Variedad[]>([]);
    const [loading, setLoading] = useState(true);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [filtroVariedad, setFiltroVariedad] = useState<string | null>(null);
    const [selectedSiembra, setSelectedSiembra] = useState<Siembra | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // 1. CARGA DE DATOS DESDE EL BACKEND
    // En Siembras.tsx
    const fetchData = async () => {
        setLoading(true);
        try {
            // Ejecutamos las 3 peticiones al mismo tiempo
            const [resSiembras, resParcelas, resVariedades] = await Promise.all([
                fetch('http://localhost:5000/api/siembras'),
                fetch('http://localhost:5000/api/parcelas'),
                fetch('http://localhost:5000/api/variedades')
            ]);

            // Verificamos que todas las respuestas sean correctas
            if (!resSiembras.ok || !resParcelas.ok || !resVariedades.ok) {
                throw new Error("Error al obtener datos de una de las APIs");
            }

            const dataSiembras = await resSiembras.json();
            const dataParcelas = await resParcelas.json();
            const dataVariedades = await resVariedades.json();

            // Guardamos todo en sus respectivos estados
            setDbSiembras(dataSiembras);
            setDbParcelas(dataParcelas);
            setDbVariedades(dataVariedades);

        } catch (error) {
            console.error("Error detallado:", error);
            toast({
                variant: "destructive",
                title: "Error de carga",
                description: "No se pudieron cargar los datos maestros (parcelas/variedades)."
            });
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => { fetchData(); }, []);

    // 2. LÓGICA DE ELIMINACIÓN
    const handleDelete = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation(); // Evita abrir el detalle al hacer clic en borrar
        if (window.confirm("¿Estás seguro de eliminar este registro de siembra?")) {
            try {
                const response = await fetch(`http://localhost:5000/api/siembras/${id}`, { method: 'DELETE' });
                if (response.ok) {
                    toast({ title: "Eliminado", description: "Siembra borrada correctamente" });
                    fetchData();
                }
            } catch (error) {
                toast({ title: "Error", description: "Fallo al eliminar", variant: "destructive" });
            }
        }
    };

    // 3. LÓGICA DE EDICIÓN
    const handleEdit = (e: React.MouseEvent, siembra: Siembra) => {
        e.stopPropagation();
        setSelectedSiembra(siembra);
        setIsAddModalOpen(true);
    };

    const siembrasFiltradas = filtroVariedad
        ? dbSiembras.filter(s => {
            const v = dbVariedades.find(varie => varie.id === s.variedad_id);
            return v?.nombre === filtroVariedad;
        })
        : dbSiembras;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
                        <Leaf className="w-8 h-8 text-avocado-pulp" />
                        Registro de Siembras
                    </h1>
                    <p className="text-muted-foreground mt-1">Historial de plantaciones por parcela</p>
                </div>

                <Button
                    onClick={() => { setSelectedSiembra(null); setIsAddModalOpen(true); }}
                    className="bg-avocado-pulp hover:bg-avocado-dark text-[#181111] font-bold gap-2 shadow-lg transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Nueva Siembra
                </Button>
            </div>

            {/* FILTROS */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                <Button variant="outline" size="sm" onClick={() => setFiltroVariedad(null)}
                    className={cn("rounded-full border-white/10 text-xs", !filtroVariedad ? "bg-avocado-pulp text-[#181111]" : "bg-white/5")}>
                    Todas
                </Button>
                {dbVariedades.map((v) => (
                    <Button key={v.id} variant="outline" size="sm" onClick={() => setFiltroVariedad(v.nombre)}
                        className={cn("rounded-full border-white/10 text-xs", filtroVariedad === v.nombre ? "bg-avocado-pulp text-[#181111]" : "bg-white/5")}>
                        {v.nombre}
                    </Button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-20 text-muted-foreground animate-pulse">Cargando siembras...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {siembrasFiltradas.map((siembra) => {
                        const parcela = dbParcelas.find(p => p.id === siembra.parcela_id);
                        const variedad = dbVariedades.find(v => v.id === siembra.variedad_id);

                        return (
                            <div key={siembra.id} onClick={() => { setSelectedSiembra(siembra); setIsDetailOpen(true); }}
                                className="glass-card p-5 hover:scale-[1.02] cursor-pointer transition-all border border-white/5 group relative">

                                {/* BOTONES DE ACCIÓN RÁPIDA */}
                                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-cream/70 hover:text-avocado-pulp hover:bg-white/10"
                                        onClick={(e) => handleEdit(e, siembra)}>
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                                        onClick={(e) => handleDelete(e, siembra.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="flex items-start justify-between mb-3">
                                    <Badge variant="outline" className="flex items-center gap-1 bg-avocado-pulp/10 text-avocado-pulp border-avocado-pulp/20">
                                        <Sprout className="w-3 h-3" />
                                        {variedad?.nombre}
                                    </Badge>
                                    <div className="text-right">
                                        <span className="text-2xl font-display font-bold text-avocado-pulp">{siembra.cant_plantas}</span>
                                        <span className="text-[10px] text-muted-foreground ml-1 uppercase font-semibold">Plantas</span>
                                    </div>
                                </div>

                                <p className="text-[11px] text-muted-foreground mb-4 line-clamp-2 min-h-[2.5rem]">
                                    {variedad?.descripcion}
                                </p>

                                <div className="space-y-2 pt-4 border-t border-white/5 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-avocado-pulp" />
                                        {new Date(siembra.fecha).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-avocado-pulp" />
                                        <span>Parcela <b className="text-foreground/80">{parcela?.nombre}</b></span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <AddSiembraModal
                open={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                initialData={selectedSiembra}
                onSuccess={fetchData}
                parcelas={dbParcelas}
                variedades={dbVariedades}
            />

            <SiembraDetalleModal
                siembra={selectedSiembra}
                open={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
            />
        </div>
    );
};

export default Siembras;