import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import HarvestModal from '@/components/dashboard/HarvestModal';
import { Scale, Plus, Calendar, MapPin, Edit2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// 1. DEFINICIÓN DE INTERFACES PARA TIPADO ESTRICTO
interface Cosecha {
    id: number;
    siembra_id: number;
    fecha: string;
    cant_kg: number;
    calidad: 'Alta' | 'Media' | 'Baja';
    parcela_nombre: string;
    variedad_nombre: string;
}

interface SiembraData {
    id: number;
    parcela_nombre: string;
    variedad_nombre: string;
    fecha: string;
}

const Cosechas: React.FC = () => {
    const { toast } = useToast();

    // ESTADOS TIPADOS (Sin 'any')
    const [dbCosechas, setDbCosechas] = useState<Cosecha[]>([]);
    const [dbSiembras, setDbSiembras] = useState<SiembraData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // ESTADOS PARA MODALES
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [selectedCosecha, setSelectedCosecha] = useState<Cosecha | null>(null);

    // 2. CARGA DE DATOS DESDE EL BACKEND
    const fetchData = async () => {
        setLoading(true);
        try {
            const [resC, resS] = await Promise.all([
                fetch('http://localhost:5000/api/cosechas'),
                fetch('http://localhost:5000/api/siembras')
            ]);

            if (resC.ok && resS.ok) {
                const dataC: Cosecha[] = await resC.json();
                const dataS: SiembraData[] = await resS.json();
                setDbCosechas(dataC);
                setDbSiembras(dataS);
            }
        } catch (error) {
            toast({
                title: "Error de conexión",
                description: "No se pudo conectar con el servidor",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // 3. LÓGICA DE ELIMINACIÓN
    const handleDelete = async (id: number) => {
        if (!window.confirm("¿Seguro que deseas eliminar este registro de cosecha?")) return;

        try {
            const res = await fetch(`http://localhost:5000/api/cosechas/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                toast({ title: "Eliminado", description: "La cosecha ha sido borrada." });
                fetchData();
            }
        } catch (error) {
            toast({ title: "Error", description: "No se pudo procesar la eliminación", variant: "destructive" });
        }
    };

    // 4. LÓGICA DE APERTURA PARA EDICIÓN
    const handleEdit = (cosecha: Cosecha) => {
        setSelectedCosecha(cosecha);
        setModalOpen(true);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
                        <Scale className="w-8 h-8 text-avocado-pulp" />
                        Registro de Cosechas
                    </h1>
                    <p className="text-muted-foreground mt-1">Historial y registro de producción</p>
                </div>
                <Button
                    variant="accent"
                    onClick={() => {
                        setSelectedCosecha(null); // <--- ESTO ES CLAVE: Limpia los datos previos
                        setModalOpen(true);
                    }}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Cosecha
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20 text-muted-foreground animate-pulse font-medium">
                    Consultando base de datos...
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dbCosechas.map((cosecha) => (
                        <div key={cosecha.id} className="glass-card p-5 group relative border border-white/5 hover:scale-[1.02] transition-all duration-300">

                            {/* BOTONES DE ACCIÓN */}
                            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-cream/70 hover:text-avocado-pulp hover:bg-white/10"
                                    onClick={() => handleEdit(cosecha)}>
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => handleDelete(cosecha.id)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="flex items-start justify-between mb-4">
                                <Badge className={
                                    cosecha.calidad === 'Alta' ? 'bg-green-500/20 text-green-400 border-none' :
                                        cosecha.calidad === 'Media' ? 'bg-yellow-500/20 text-yellow-400 border-none' :
                                            'bg-red-500/20 text-red-400 border-none'
                                }>
                                    Calidad {cosecha.calidad}
                                </Badge>
                                <div className="text-right">
                                    <span className="text-2xl font-display font-bold text-avocado-pulp">
                                        {cosecha.cant_kg} kg
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2 pt-4 border-t border-white/5 text-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-avocado-pulp" />
                                    {new Date(cosecha.fecha).toLocaleDateString('es-EC', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-avocado-pulp" />
                                    <span>
                                        Parcela <b className="text-foreground/80">{cosecha.parcela_nombre}</b> • {cosecha.variedad_nombre}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <HarvestModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                initialData={selectedCosecha} // Si es null, el modal dirá "Registrar". Si tiene datos, dirá "Editar".
                siembras={dbSiembras}
                onSuccess={fetchData} // La función que recarga tu tabla
            />
        </div>
    );
};

export default Cosechas;