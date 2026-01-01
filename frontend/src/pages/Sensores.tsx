import React from 'react';
import SensorChart from '@/components/dashboard/SensorChart';
import { sensores, generateSensorHistory } from '@/data/mockData';
import { Activity } from 'lucide-react';

const Sensores: React.FC = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
                    <Activity className="w-8 h-8 text-accent" />
                    Sensores IoT
                </h1>
                <p className="text-muted-foreground mt-1">Monitoreo en tiempo real de las parcelas</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sensores.map((sensor) => (
                    <SensorChart
                        key={sensor.id}
                        sensor={sensor}
                        data={generateSensorHistory(sensor.id, 24)}
                    />
                ))}
            </div>
        </div>
    );
};

export default Sensores;
