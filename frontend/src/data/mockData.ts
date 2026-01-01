import type { Finca, Parcela, Variedad, Siembra, Cosecha, Trabajador, Tarea, Sensor, Lectura, RecomendacionIA, Insumo, User } from '@/types/farms';

export const users: User[] = [
    { id: 1, username: 'admin', rol: 'Administrador' },
    { id: 2, username: 'tecnico1', rol: 'Tecnico' },
    { id: 3, username: 'peon1', rol: 'Peon' },
];

export const fincas: Finca[] = [
    { id: 1, nombre: 'El Sol', ubicacion: 'Loja – Ecuador', propietario: 'Juan Pérez' },
    { id: 2, nombre: 'La Brisa', ubicacion: 'Pichincha – Ecuador', propietario: 'María Vallejo' },
];

export const variedades: Variedad[] = [
    { id: 1, nombre: 'Hass', descripcion: 'Piel rugosa, alto contenido de aceite' },
    { id: 2, nombre: 'Fuerte', descripcion: 'Clima templado, piel lisa' },
    { id: 3, nombre: 'Bacon', descripcion: 'Resistente al frío' },
    { id: 4, nombre: 'Reed', descripcion: 'Cosecha tardía' },
    { id: 5, nombre: 'Zutano', descripcion: 'Polinizador' },
];

export const parcelas: Parcela[] = [
    { id: 1, nombre: 'A-1', area_ha: 2.5, estado: 'Activa', finca_id: 1 },
    { id: 2, nombre: 'A-2', area_ha: 3.0, estado: 'Activa', finca_id: 1 },
    { id: 3, nombre: 'B-1', area_ha: 1.8, estado: 'EnMantenimiento', finca_id: 1 },
    { id: 4, nombre: 'C-1', area_ha: 4.0, estado: 'Activa', finca_id: 2 },
    { id: 5, nombre: 'C-2', area_ha: 2.2, estado: 'Activa', finca_id: 2 },
];

export const siembras: Siembra[] = [
    { id: 1, fecha: '2023-01-15', cant_plantas: 120, parcela_id: 1, variedad_id: 1 },
    { id: 2, fecha: '2023-02-10', cant_plantas: 100, parcela_id: 2, variedad_id: 2 },
    { id: 3, fecha: '2023-03-05', cant_plantas: 90, parcela_id: 1, variedad_id: 3 },
    { id: 4, fecha: '2023-04-12', cant_plantas: 110, parcela_id: 4, variedad_id: 1 },
    { id: 5, fecha: '2023-05-20', cant_plantas: 130, parcela_id: 5, variedad_id: 4 },
];

export const cosechas: Cosecha[] = [
    { id: 1, fecha: '2024-03-01', cant_kg: 250, calidad: 'Alta', siembra_id: 1 },
    { id: 2, fecha: '2024-04-01', cant_kg: 180, calidad: 'Media', siembra_id: 2 },
    { id: 3, fecha: '2024-05-10', cant_kg: 200, calidad: 'Alta', siembra_id: 3 },
    { id: 4, fecha: '2024-06-15', cant_kg: 300, calidad: 'Alta', siembra_id: 4 },
    { id: 5, fecha: '2024-07-20', cant_kg: 220, calidad: 'Media', siembra_id: 5 },
];

export const trabajadores: Trabajador[] = [
    { id: 1, nombre: 'Carlos López', rol: 'Peon', contacto: 'carlos@mail.com' },
    { id: 2, nombre: 'Ana Torres', rol: 'Tecnico', contacto: 'ana@mail.com' },
    { id: 3, nombre: 'Luis Guamán', rol: 'Peon', contacto: 'luis@mail.com' },
    { id: 4, nombre: 'Rosa Morales', rol: 'Tecnico', contacto: 'rosa@mail.com' },
    { id: 5, nombre: 'Diego Intriago', rol: 'Administrador', contacto: 'diego@mail.com' },
];

export const tareas: Tarea[] = [
    { id: 1, descripcion: 'Riego por goteo', fecha_prog: '2024-11-25', estado: 'Pendiente', parcela_id: 1 },
    { id: 2, descripcion: 'Poda de formación', fecha_prog: '2024-11-26', estado: 'Completada', parcela_id: 2 },
    { id: 3, descripcion: 'Aplicación de fertilizante', fecha_prog: '2024-11-27', estado: 'EnProgreso', parcela_id: 1 },
    { id: 4, descripcion: 'Fumigación preventiva', fecha_prog: '2024-11-28', estado: 'Pendiente', parcela_id: 2 },
    { id: 5, descripcion: 'Instalación de malla sombra', fecha_prog: '2024-11-29', estado: 'Pendiente', parcela_id: 3 },
];

export const sensores: Sensor[] = [
    { id: 1, tipo: 'Humedad', ubicacion: 'A-1 – prof 20 cm', estado: 'Activo', parcela_id: 1 },
    { id: 2, tipo: 'pH', ubicacion: 'A-2 – prof 15 cm', estado: 'Activo', parcela_id: 2 },
    { id: 3, tipo: 'Temperatura', ubicacion: 'A-1 – aire 1.5 m', estado: 'Activo', parcela_id: 1 },
    { id: 4, tipo: 'Viento', ubicacion: 'B-1 – aire 2 m', estado: 'Activo', parcela_id: 3 },
    { id: 5, tipo: 'Humedad', ubicacion: 'C-1 – prof 25 cm', estado: 'Activo', parcela_id: 4 },
];

export const lecturas: Lectura[] = [
    { id: 1, valor: 42.5, fecha_hora: '2024-12-26T08:00:00', sensor_id: 1 },
    { id: 2, valor: 8.1, fecha_hora: '2024-12-26T06:00:00', sensor_id: 2 },
    { id: 3, valor: 18.7, fecha_hora: '2024-12-26T07:00:00', sensor_id: 3 },
    { id: 4, valor: 15.2, fecha_hora: '2024-12-26T08:00:00', sensor_id: 4 },
    { id: 5, valor: 38.0, fecha_hora: '2024-12-26T08:00:00', sensor_id: 5 },
];

export const recomendacionesIA: RecomendacionIA[] = [
    { id: 1, descripcion: 'Riego urgente: humedad < 45 %', fecha_hora: '2024-11-24T08:10:00', estado: 'Pendiente', parcela_id: 1, tecnico_id: 2 },
    { id: 2, descripcion: 'Aplicar azufre: pH > 7.8', fecha_hora: '2024-11-24T09:15:00', estado: 'Aceptada', parcela_id: 2, tecnico_id: 2 },
    { id: 3, descripcion: 'Cobertura anti-frost próxima noche', fecha_hora: '2024-11-24T19:00:00', estado: 'Pendiente', parcela_id: 3, tecnico_id: 4 },
    { id: 4, descripcion: 'Ajustar riego: exceso de humedad', fecha_hora: '2024-11-24T20:05:00', estado: 'Pendiente', parcela_id: 1, tecnico_id: null },
    { id: 5, descripcion: 'Revisión de salinidad en suelo', fecha_hora: '2024-11-24T21:10:00', estado: 'Rechazada', parcela_id: 4, tecnico_id: 4 },
];

export const insumos: Insumo[] = [
    { id: 1, nombre: 'Fertilizante Orgánico', tipo: 'Fertilizante', stock_kg: 200 },
    { id: 2, nombre: 'Azufre elemental', tipo: 'Fertilizante', stock_kg: 150 },
    { id: 3, nombre: 'Aceite de neem', tipo: 'Pesticida', stock_kg: 80 },
    { id: 4, nombre: 'Herbicida glifosato', tipo: 'Herbicida', stock_kg: 60 },
    { id: 5, nombre: 'Compost de lombriz', tipo: 'Fertilizante', stock_kg: 300 },
];

// Generate sensor reading history for charts
export const generateSensorHistory = (sensorId: number, hours: number = 24) => {
    const data = [];
    const now = new Date();
    const baseValues: Record<number, number> = {
        1: 42, // Humidity
        2: 7.5, // pH
        3: 20, // Temperature
        4: 12, // Wind
        5: 40, // Humidity
    };

    for (let i = hours; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000);
        const variance = (Math.random() - 0.5) * 10;
        data.push({
            time: time.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' }),
            value: Math.round((baseValues[sensorId] + variance) * 10) / 10,
        });
    }
    return data;
};

// Production data for charts
export const productionByVariety = [
    { name: 'Hass', total_kg: 550, color: '#2D5A27' },
    { name: 'Fuerte', total_kg: 180, color: '#A7C957' },
    { name: 'Bacon', total_kg: 200, color: '#4a7c3f' },
    { name: 'Reed', total_kg: 520, color: '#382929' },
    { name: 'Zutano', total_kg: 0, color: '#6b8c42' },
];

export const monthlyProduction = [
    { month: 'Ene', produccion: 0 },
    { month: 'Feb', produccion: 0 },
    { month: 'Mar', produccion: 250 },
    { month: 'Abr', produccion: 180 },
    { month: 'May', produccion: 200 },
    { month: 'Jun', produccion: 300 },
    { month: 'Jul', produccion: 220 },
    { month: 'Ago', produccion: 0 },
    { month: 'Sep', produccion: 0 },
    { month: 'Oct', produccion: 0 },
    { month: 'Nov', produccion: 0 },
    { month: 'Dic', produccion: 0 },
];
