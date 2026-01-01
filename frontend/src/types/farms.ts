export type UserRole = 'Administrador' | 'Tecnico' | 'Peon';

export interface User {
    id: number;
    username: string;
    rol: UserRole;
}

export interface Finca {
    id: number;
    nombre: string;
    ubicacion: string;
    propietario: string;
}

export interface Parcela {
    id?: number;
    nombre: string;
    area_ha: number;
    estado: 'Activa' | 'EnMantenimiento' | 'Baja';
    finca_id: number;
    // Estos son calculados por el JOIN que hicimos antes
    num_sensores?: number;
    num_tareas?: number;
}

export interface Variedad {
    id: number;
    nombre: string;
    descripcion: string;
}

export interface Siembra {
    id: number;
    fecha: string;
    cant_plantas: number;
    parcela_id: number;
    variedad_id: number;
}

export interface Cosecha {
    id: number;
    fecha: string;
    cant_kg: number;
    calidad: 'Alta' | 'Media' | 'Baja';
    siembra_id: number;
}

export interface Trabajador {
    id: number;
    nombre: string;
    rol: UserRole;
    contacto: string;
}

export interface Tarea {
    id: number;
    descripcion: string;
    fecha_prog: string;
    estado: 'Pendiente' | 'EnProgreso' | 'Completada' | 'Cancelada';
    parcela_id: number;
    usuario_id: number;
    // Agrega estas líneas para que el error desaparezca:
    nombre_parcela?: string; 
    nombre?: string; // Por si acaso el backend lo envía así
}

export interface Sensor {
    id: number;
    tipo: 'Temperatura' | 'Humedad' | 'pH' | 'Viento';
    ubicacion: string;
    estado: 'Activo' | 'Inactivo';
    parcela_id: number;
}

export interface Lectura {
    id: number;
    valor: number;
    fecha_hora: string;
    sensor_id: number;
}

export interface RecomendacionIA {
    id: number;
    descripcion: string;
    fecha_hora: string;
    estado: 'Pendiente' | 'Aceptada' | 'Rechazada';
    parcela_id: number;
    // Agrega estos campos para mapear el JOIN de la base de datos
    nombre_parcela?: string; 
    nombre?: string; // Opcional, por si el alias falla
}

export interface Insumo {
    id: number;
    nombre: string;
    tipo: 'Fertilizante' | 'Pesticida' | 'Herbicida' | 'Otros';
    stock_kg: number;
}
