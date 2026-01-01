import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Activity, Droplets, Thermometer, Wind } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Sensor } from '@/types/farm';

interface SensorChartProps {
    sensor: Sensor;
    data: { time: string; value: number }[];
}

const sensorConfig: Record<string, { icon: React.ElementType; color: string; unit: string; gradient: string }> = {
    Humedad: { icon: Droplets, color: '#3b82f6', unit: '%', gradient: 'url(#humidityGradient)' },
    pH: { icon: Activity, color: '#A7C957', unit: '', gradient: 'url(#phGradient)' },
    Temperatura: { icon: Thermometer, color: '#ef4444', unit: '°C', gradient: 'url(#tempGradient)' },
    Viento: { icon: Wind, color: '#8b5cf6', unit: ' km/h', gradient: 'url(#windGradient)' },
};

const SensorChart: React.FC<SensorChartProps> = ({ sensor, data }) => {
    const config = sensorConfig[sensor.tipo];
    const Icon = config.icon;
    const latestValue = data[data.length - 1]?.value || 0;

    return (
        <div className="glass-card p-5 h-full">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${config.color}20` }}
                    >
                        <Icon className="w-5 h-5" style={{ color: config.color }} />
                    </div>
                    <div>
                        <h3 className="font-medium text-foreground">{sensor.tipo}</h3>
                        <p className="text-xs text-muted-foreground">{sensor.ubicacion}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-display font-bold" style={{ color: config.color }}>
                        {latestValue}{config.unit}
                    </p>
                    <div className="flex items-center gap-1.5">
                        <span className={cn(
                            'sensor-indicator',
                            sensor.estado === 'Activo' ? 'sensor-active' : 'sensor-inactive'
                        )} />
                        <span className="text-xs text-muted-foreground">{sensor.estado}</span>
                    </div>
                </div>
            </div>

            <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                        <defs>
                            <linearGradient id={`gradient-${sensor.id}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={config.color} stopOpacity={0.3} />
                                <stop offset="100%" stopColor={config.color} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis
                            dataKey="time"
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                            }}
                            labelStyle={{ color: 'hsl(var(--foreground))' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={config.color}
                            strokeWidth={2}
                            fill={`url(#gradient-${sensor.id})`}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SensorChart;
