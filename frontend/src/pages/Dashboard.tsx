import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import StatCard from '@/components/dashboard/StatCard';
import SensorChart from '@/components/dashboard/SensorChart';
import RecomendacionCard from '@/components/dashboard/RecomendacionCard';
import ParcelaGrid from '@/components/dashboard/ParcelaGrid';
import HarvestModal from '@/components/dashboard/HarvestModal';
import TareaCard from '@/components/dashboard/TareaCard';
import ProductionChart from '@/components/dashboard/ProductionChart';
import { Button } from '@/components/ui/button';
import {
    Scale,
    Leaf,
    Users,
    Activity,
    TrendingUp,
    Plus,
    Map,
    ClipboardList,
    Cpu,
} from 'lucide-react';
import {
    parcelas,
    cosechas,
    siembras,
    trabajadores,
    sensores,
    recomendacionesIA,
    tareas,
    generateSensorHistory,
} from '@/data/mockData';
import { toast } from '@/hooks/use-toast';

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const [harvestModalOpen, setHarvestModalOpen] = useState(false);

    const [dbParcelas, setDbParcelas] = useState([]);
    const [loading, setLoading] = useState(true);

    const [dbSiembras, setDbSiembras] = useState([]);

    // Efecto para cargar las siembras (copia esto si no lo tienes)
    useEffect(() => {
        fetch('http://localhost:5000/api/siembras')
            .then(res => res.json())
            .then(data => setDbSiembras(data))
            .catch(err => console.error("Error cargando siembras en dashboard", err));
    }, []);


    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/parcelas');
                const data = await res.json();
                setDbParcelas(data);
                setLoading(false);
            } catch (error) {
                console.error("Error cargando parcelas:", error);
                setLoading(false);
            }
        };
        loadData();
    }, []);



    const totalProduction = cosechas.reduce((acc, c) => acc + c.cant_kg, 0);
    const activePlants = siembras.reduce((acc, s) => acc + s.cant_plantas, 0);
    const activeWorkers = trabajadores.filter(t => t.rol !== 'Administrador').length;
    const activeSensors = sensores.filter(s => s.estado === 'Activo').length;
    const pendingRecommendations = recomendacionesIA.filter(r => r.estado === 'Pendiente');
    const pendingTasks = tareas.filter(t => t.estado === 'Pendiente' || t.estado === 'EnProgreso');

    const handleAcceptRecommendation = (id: number) => {
        toast({ title: 'Recomendación aceptada', description: 'Se ha programado la acción correspondiente' });
    };

    const handleRejectRecommendation = (id: number) => {
        toast({ title: 'Recomendación rechazada', description: 'La recomendación ha sido descartada' });
    };

    const handleStartTask = (id: number) => {
        toast({ title: 'Tarea iniciada', description: 'El estado ha cambiado a "En Progreso"' });
    };

    const handleCompleteTask = (id: number) => {
        toast({ title: '¡Tarea completada!', description: 'Excelente trabajo' });
    };

    if (loading) return <div className="p-10 text-center">Cargando datos de la finca...</div>;

    // Admin Dashboard
    if (user?.rol === 'Administrador') {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
                        <p className="text-muted-foreground">Bienvenido, {user.username}</p>
                    </div>
                    <Button variant="accent" onClick={() => setHarvestModalOpen(true)}>
                        <Plus className="w-4 h-4" />
                        Nueva Cosecha
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Producción Total"
                        value={`${totalProduction} kg`}
                        subtitle="Este año"
                        icon={Scale}
                        trend={{ value: 12.5, isPositive: true }}
                    />
                    <StatCard
                        title="Plantas Activas"
                        value={activePlants}
                        subtitle={`${siembras.length} siembras`}
                        icon={Leaf}
                        iconColor="text-success"
                    />
                    <StatCard
                        title="Trabajadores"
                        value={activeWorkers}
                        subtitle="En campo"
                        icon={Users}
                        iconColor="text-info"
                    />
                    <StatCard
                        title="Sensores IoT"
                        value={activeSensors}
                        subtitle="Activos"
                        icon={Activity}
                        iconColor="text-warning"
                    />
                </div>

                {/* Charts and Parcelas */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 glass-card p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-accent" />
                                Producción Mensual 2024
                            </h2>
                        </div>
                        <ProductionChart type="bar" />
                    </div>

                    <div className="glass-card p-5">
                        <h2 className="text-lg font-display font-semibold text-foreground flex items-center gap-2 mb-4">
                            <Leaf className="w-5 h-5 text-accent" />
                            Por Variedad
                        </h2>
                        <ProductionChart type="pie" />
                    </div>
                </div>

                {/* Parcelas */}
                <div>
                    <h2 className="text-xl font-display font-semibold text-foreground flex items-center gap-2 mb-4">
                        <Map className="w-5 h-5 text-accent" />
                        Parcelas
                    </h2>
                    <ParcelaGrid
                        parcelas={dbParcelas}
                        onParcelaClick={(p) => console.log(p)}
                        onEditClick={(p) => console.log("Editando:", p)} // Añadido
                        onDeleteClick={(id) => console.log("Eliminando ID:", id)} // Añadido
                    />                </div>

                {/* AI Recommendations */}
                {pendingRecommendations.length > 0 && (
                    <div>
                        <h2 className="text-xl font-display font-semibold text-foreground flex items-center gap-2 mb-4">
                            <Cpu className="w-5 h-5 text-accent" />
                            Recomendaciones IA Pendientes
                        </h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {pendingRecommendations.slice(0, 4).map((rec) => (
                                <RecomendacionCard
                                    key={rec.id}
                                    recomendacion={rec}
                                    onAccept={handleAcceptRecommendation}
                                    onReject={handleRejectRecommendation}
                                />
                            ))}
                        </div>
                    </div>
                )}

                <HarvestModal
                    open={harvestModalOpen}
                    onClose={() => setHarvestModalOpen(false)}
                    initialData={null} // Pasamos null porque desde el Dashboard siempre es una "Nueva Cosecha"
                    siembras={dbSiembras}
                    onSuccess={() => {
                        // Aquí puedes recargar las estadísticas del dashboard si lo deseas
                        console.log("Cosecha guardada con éxito");
                    }}
                />            </div>
        );
    }

    // Technician Dashboard
    if (user?.rol === 'Tecnico') {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-display font-bold text-foreground">Panel Técnico</h1>
                    <p className="text-muted-foreground">Monitoreo IoT y Recomendaciones IA</p>
                </div>

                {/* Sensor Charts */}
                <div>
                    <h2 className="text-xl font-display font-semibold text-foreground flex items-center gap-2 mb-4">
                        <Activity className="w-5 h-5 text-accent" />
                        Sensores en Tiempo Real
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sensores.slice(0, 3).map((sensor) => (
                            <SensorChart
                                key={sensor.id}
                                sensor={sensor}
                                data={generateSensorHistory(sensor.id, 12)}
                            />
                        ))}
                    </div>
                </div>

                {/* AI Recommendations */}
                <div>
                    <h2 className="text-xl font-display font-semibold text-foreground flex items-center gap-2 mb-4">
                        <Cpu className="w-5 h-5 text-accent" />
                        Recomendaciones de IA
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {recomendacionesIA.map((rec) => (
                            <RecomendacionCard
                                key={rec.id}
                                recomendacion={rec}
                                onAccept={handleAcceptRecommendation}
                                onReject={handleRejectRecommendation}
                            />
                        ))}
                    </div>
                </div>

                {/* Parcelas */}
                <div>
                    <h2 className="text-xl font-display font-semibold text-foreground flex items-center gap-2 mb-4">
                        <Map className="w-5 h-5 text-accent" />
                        Estado de Parcelas
                    </h2>
                    <ParcelaGrid
                        parcelas={dbParcelas}
                        onParcelaClick={(p) => console.log(p)}
                        onEditClick={(p) => console.log("Editando:", p)} // Añadido
                        onDeleteClick={(id) => console.log("Eliminando ID:", id)} // Añadido
                    />                </div>
            </div>
        );
    }

    // Worker (Peon) Dashboard
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold text-foreground">Mis Tareas</h1>
                    <p className="text-muted-foreground">Bienvenido, {user?.username}</p>
                </div>
                <Button variant="accent" onClick={() => setHarvestModalOpen(true)}>
                    <Scale className="w-4 h-4" />
                    Registrar Cosecha
                </Button>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    title="Tareas Pendientes"
                    value={pendingTasks.filter(t => t.estado === 'Pendiente').length}
                    icon={ClipboardList}
                    iconColor="text-warning"
                />
                <StatCard
                    title="En Progreso"
                    value={pendingTasks.filter(t => t.estado === 'EnProgreso').length}
                    icon={Activity}
                    iconColor="text-info"
                />
                <StatCard
                    title="Completadas Hoy"
                    value={tareas.filter(t => t.estado === 'Completada').length}
                    icon={Scale}
                    iconColor="text-success"
                />
            </div>

            {/* Tasks */}
            <div>
                <h2 className="text-xl font-display font-semibold text-foreground flex items-center gap-2 mb-4">
                    <ClipboardList className="w-5 h-5 text-accent" />
                    Tareas Asignadas
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pendingTasks.map((tarea) => (
                        <TareaCard
                            key={tarea.id}
                            tarea={tarea}
                            onStart={handleStartTask}
                            onComplete={handleCompleteTask}
                        />
                    ))}
                </div>
            </div>

            <HarvestModal
                open={harvestModalOpen}
                onClose={() => setHarvestModalOpen(false)}
                initialData={null} // Pasamos null porque desde el Dashboard siempre es una "Nueva Cosecha"
                siembras={dbSiembras}
                onSuccess={() => {
                    // Aquí puedes recargar las estadísticas del dashboard si lo deseas
                    console.log("Cosecha guardada con éxito");
                }}
            />        </div>
    );
};

export default Dashboard;
