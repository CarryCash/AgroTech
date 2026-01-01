/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   1. CONFIGURACIÓN INICIAL Y LIMPIEZA
   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
SET FOREIGN_KEY_CHECKS = 0;
DROP DATABASE IF EXISTS finca_el_sol;
CREATE DATABASE finca_el_sol CHARACTER SET utf8mb4;
USE finca_el_sol;
SET FOREIGN_KEY_CHECKS = 1;

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   2. ESTRUCTURA DE TABLAS (DDL)
   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

-- Tablas Maestras
CREATE TABLE finca (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    ubicacion VARCHAR(255) NOT NULL,
    propietario VARCHAR(100) NOT NULL
);

CREATE TABLE variedad (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT
);

CREATE TABLE trabajador (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    rol ENUM('Administrador', 'Tecnico', 'Peon') NOT NULL,
    contacto VARCHAR(100) UNIQUE
);

CREATE TABLE insumo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo ENUM('Fertilizante', 'Fungicida', 'Herbicida', 'Insecticida', 'Otros') NOT NULL,
    stock_actual DECIMAL(10,2) DEFAULT 0,
    unidad_medida VARCHAR(20) DEFAULT 'Kg',
    fecha_caducidad DATE,
    estado VARCHAR(50) DEFAULT 'Óptimo'
);

CREATE TABLE usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    passw VARCHAR(255) NOT NULL,
    rol ENUM('Administrador', 'Tecnico', 'Peon') NOT NULL
);

-- Tablas con dependencias
CREATE TABLE parcela (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    area_ha DECIMAL(5,2) CHECK (area_ha > 0),
    estado ENUM('Activa', 'EnMantenimiento', 'Baja') DEFAULT 'Activa',
    finca_id INT NOT NULL,
    CONSTRAINT fk_parcela_finca FOREIGN KEY (finca_id) REFERENCES finca(id) ON DELETE CASCADE
);

CREATE TABLE siembra (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL,
    cant_plantas INT CHECK (cant_plantas > 0),
    parcela_id INT NOT NULL,
    variedad_id INT NOT NULL,
    CONSTRAINT fk_siembra_parcela FOREIGN KEY (parcela_id) REFERENCES parcela(id) ON DELETE CASCADE,
    CONSTRAINT fk_siembra_variedad FOREIGN KEY (variedad_id) REFERENCES variedad(id)
);

CREATE TABLE cosecha (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL,
    cant_kg INT CHECK (cant_kg >= 0),
    calidad ENUM('Alta', 'Media', 'Baja') DEFAULT 'Media',
    siembra_id INT NOT NULL,
    CONSTRAINT fk_cosecha_siembra FOREIGN KEY (siembra_id) REFERENCES siembra(id) ON DELETE CASCADE
);

CREATE TABLE tarea (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(255) NOT NULL,
    fecha_prog DATE NOT NULL,
    estado ENUM('Pendiente', 'EnProgreso', 'Completada', 'Cancelada') DEFAULT 'Pendiente',
    parcela_id INT NOT NULL,
    CONSTRAINT fk_tarea_parcela FOREIGN KEY (parcela_id) REFERENCES parcela(id) ON DELETE CASCADE
);

CREATE TABLE sensor (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo ENUM('Temperatura', 'Humedad', 'pH', 'Viento') NOT NULL,
    ubicacion VARCHAR(100),
    estado ENUM('Activo', 'Inactivo') DEFAULT 'Activo',
    parcela_id INT NOT NULL,
    CONSTRAINT fk_sensor_parcela FOREIGN KEY (parcela_id) REFERENCES parcela(id) ON DELETE CASCADE
);

CREATE TABLE lectura (
    id INT AUTO_INCREMENT PRIMARY KEY,
    valor DECIMAL(6,2) NOT NULL,
    fecha_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
    sensor_id INT NOT NULL,
    CONSTRAINT fk_lectura_sensor FOREIGN KEY (sensor_id) REFERENCES sensor(id) ON DELETE CASCADE
);

CREATE TABLE recomendacion_ia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descripcion TEXT NOT NULL,
    fecha_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('Pendiente', 'Aceptada', 'Rechazada') DEFAULT 'Pendiente',
    parcela_id INT NOT NULL,
    tecnico_id INT,
    CONSTRAINT fk_rec_parcela FOREIGN KEY (parcela_id) REFERENCES parcela(id) ON DELETE CASCADE,
    CONSTRAINT fk_rec_tecnico FOREIGN KEY (tecnico_id) REFERENCES usuario(id)
);

CREATE TABLE tarea_trabajador (
    tarea_id INT,
    trabajador_id INT,
    PRIMARY KEY (tarea_id, trabajador_id),
    CONSTRAINT fk_tt_tarea FOREIGN KEY (tarea_id) REFERENCES tarea(id) ON DELETE CASCADE,
    CONSTRAINT fk_tt_trab FOREIGN KEY (trabajador_id) REFERENCES trabajador(id) ON DELETE CASCADE
);

CREATE TABLE insumo_tarea (
    insumo_id INT,
    tarea_id INT,
    cantidad_usada DECIMAL(10,2) CHECK (cantidad_usada > 0),
    PRIMARY KEY (insumo_id, tarea_id),
    CONSTRAINT fk_it_insumo FOREIGN KEY (insumo_id) REFERENCES insumo(id) ON DELETE CASCADE,
    CONSTRAINT fk_it_tarea FOREIGN KEY (tarea_id) REFERENCES tarea(id) ON DELETE CASCADE
);

CREATE TABLE tarea_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tarea_id INT,
    campo ENUM('estado', 'fecha_prog', 'descripcion'),
    valor_anterior VARCHAR(255),
    valor_nuevo VARCHAR(255),
    fecha_cambio DATETIME DEFAULT CURRENT_TIMESTAMP
);

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   3. VISTAS
   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
CREATE OR REPLACE VIEW vw_produccion_anual AS
SELECT p.nombre AS parcela, YEAR(c.fecha) AS anio, 
       SUM(c.cant_kg) AS total_kg, AVG(c.cant_kg) AS promedio_kg_cosecha
FROM parcela p
JOIN siembra s ON s.parcela_id = p.id
JOIN cosecha c ON c.siembra_id = s.id
GROUP BY p.id, anio;

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   4. PROCEDIMIENTOS ALMACENADOS
   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
DELIMITER //

CREATE PROCEDURE sp_actualizar_parcela(
    IN p_id INT, IN p_nombre VARCHAR(50), IN p_area DECIMAL(5,2),
    IN p_estado ENUM('Activa','EnMantenimiento','Baja'), IN p_finca_id INT
)
BEGIN
    UPDATE parcela SET nombre = p_nombre, area_ha = p_area, estado = p_estado, finca_id = p_finca_id
    WHERE id = p_id;
END//

CREATE PROCEDURE sp_eliminar_parcela(IN p_id INT)
BEGIN
    DELETE FROM parcela WHERE id = p_id;
END//

DELIMITER ;

DELIMITER //
CREATE PROCEDURE sp_registrar_cosecha(
    IN p_siembra_id INT,
    IN p_fecha DATE,
    IN p_cant_kg DECIMAL(10,2),
    IN p_calidad VARCHAR(20),
    OUT p_id INT
)
BEGIN
    INSERT INTO cosecha (siembra_id, fecha_cosecha, cant_kg, calidad)
    VALUES (p_siembra_id, p_fecha, p_cant_kg, p_calidad);
    
    SET p_id = LAST_INSERT_ID();
END //
DELIMITER ;

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   5. TRIGGERS
   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
DELIMITER //
CREATE TRIGGER tr_tarea_estado
AFTER UPDATE ON tarea
FOR EACH ROW
BEGIN
    IF OLD.estado <> NEW.estado THEN
        INSERT INTO tarea_log (tarea_id, campo, valor_anterior, valor_nuevo)
        VALUES (NEW.id, 'estado', OLD.estado, NEW.estado);
    END IF;
END//
DELIMITER ;

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   6. CARGA DE DATOS INICIALES
   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
INSERT INTO finca (nombre, ubicacion, propietario) VALUES 
('El Sol','Loja – Ecuador','Juan Pérez'),
('La Brisa','Pichincha – Ecuador','María Vallejo');

INSERT INTO variedad (nombre, descripcion) VALUES
('Hass','Líder en exportación, piel rugosa.'),
('Fuerte','Piel lisa, textura cremosa.'),
('Bacon','Resistente al frío.'),
('Reed','Cosecha tardía.'),
('Zutano','Polinizador.');

INSERT INTO parcela (nombre, area_ha, estado, finca_id) VALUES
('A-1',2.5,'Activa',1), ('A-2',3.0,'Activa',1),
('B-1',1.8,'EnMantenimiento',1), ('C-1',4.0,'Activa',2);

INSERT INTO siembra (fecha, cant_plantas, parcela_id, variedad_id) VALUES
('2023-01-14',120,1,1), ('2023-02-09',100,2,2);

INSERT INTO trabajador (nombre, rol, contacto) VALUES
('Carlos López','Peon','carlos@mail.com'), 
('Ana Torres','Tecnico','ana@mail.com'),
('Diego Intriago','Administrador','diego@mail.com');

INSERT INTO insumo (nombre, tipo, fecha_caducidad, stock_actual, unidad_medida, estado) VALUES
('Fertilizante Orgánico NPK', 'Fertilizante', '2026-05-15', 200.00, 'Kg', 'Óptimo'),
('Aceite de Neem', 'Insecticida', '2024-11-10', 5.00, 'L', 'Reabastecimiento urgente'),
('Fungicida Cúprico', 'Fungicida', '2025-03-15', 45.00, 'Kg', 'Óptimo'),
('Herbicida Glifosato', 'Herbicida', '2025-08-30', 12.50, 'L', 'Reabastecimiento urgente'),
('Jabón Potásico', 'Insecticida', '2026-02-10', 20.00, 'L', 'Óptimo');

INSERT INTO usuario (username, passw, rol) VALUES
('admin', SHA2('1234', 256), 'Administrador'),
('tecnico1', SHA2('1234', 256), 'Tecnico');

INSERT INTO tarea (descripcion, fecha_prog, estado, parcela_id) VALUES
('Riego por goteo', CURDATE(), 'Pendiente', 1),
('Poda de formación', CURDATE(), 'Completada', 2);

-- Insertar datos de cosecha vinculados a las siembras existentes
INSERT INTO cosecha (fecha, cant_kg, calidad, siembra_id) VALUES 
('2024-01-10', 150, 'Alta', 1), 
('2024-02-15', 180, 'Media', 2), 
('2024-03-20', 210, 'Alta', 1),
('2024-04-05', 190, 'Media', 2), 
('2024-05-12', 250, 'Alta', 1), 
('2024-06-18', 280, 'Alta', 1),
('2024-07-22', 220, 'Media', 1), 
('2024-08-14', 190, 'Baja', 2), 
('2024-09-05', 300, 'Alta', 1),
('2024-10-10', 260, 'Alta', 2), 
('2024-11-20', 240, 'Media', 1), 
('2024-12-15', 350, 'Alta', 1),
('2025-01-05', 380, 'Alta', 1), 
('2025-02-10', 320, 'Alta', 2), 
('2025-03-15', 410, 'Alta', 1);