const express = require('express');
const cors = require('cors');
const db = require('./db');
const app = express();

app.use(cors());
app.use(express.json());


// APi de Gemini

// --- FUNCIONALIDAD 1: GESTIÓN DE SIEMBRAS ---
// OBTENER todas las siembras con nombres de variedad y parcela


app.get('/api/siembras', async (req, res) => {
    try {
        const query = `
            SELECT s.*, v.nombre as variedad_nombre, v.descripcion as variedad_desc, p.nombre as parcela_nombre, p.area_ha
            FROM siembra s
            JOIN variedad v ON s.variedad_id = v.id
            JOIN parcela p ON s.parcela_id = p.id
            ORDER BY s.fecha DESC
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// CREAR nueva siembra
app.post('/api/siembras', async (req, res) => {
    const { fecha, cant_plantas, parcela_id, variedad_id } = req.body;
    try {
        await db.query(
            'INSERT INTO siembra (fecha, cant_plantas, parcela_id, variedad_id) VALUES (?, ?, ?, ?)',
            [fecha, cant_plantas, parcela_id, variedad_id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// ACTUALIZAR siembra
app.put('/api/siembras/:id', async (req, res) => {
    const { id } = req.params;
    const { fecha, cant_plantas, parcela_id, variedad_id } = req.body;
    try {
        await db.query(
            'UPDATE siembra SET fecha = ?, cant_plantas = ?, parcela_id = ?, variedad_id = ? WHERE id = ?',
            [fecha, cant_plantas, parcela_id, variedad_id, id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// ELIMINAR siembra
app.delete('/api/siembras/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM siembra WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// --- FUNCIONALIDAD 2: GESTIÓN DE PARCELAS (Versión Optimizada) ---
app.get('/api/parcelas', async (req, res) => {
    try {
        // Usamos LEFT JOIN para contar sensores y tareas sin errores de subconsultas
        const query = `
            SELECT 
                p.id, 
                p.nombre, 
                p.area_ha, 
                p.estado,
                p.finca_id,
                COUNT(DISTINCT s.id) AS num_sensores,
                COUNT(DISTINCT t.id) AS num_tareas
            FROM parcela p
            LEFT JOIN sensor s ON s.parcela_id = p.id
            LEFT JOIN tarea t ON t.parcela_id = p.id AND t.estado = 'Pendiente'
            GROUP BY p.id
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (err) {
        console.error("Error en /api/parcelas:", err);
        res.status(500).send("Error al obtener parcelas: " + err.message);
    }
});

app.post('/api/parcelas', async (req, res) => {
    const { nombre, area_ha, estado, finca_id } = req.body;

    // Validación simple
    if (!nombre || !area_ha) {
        return res.status(400).json({ error: "Nombre y Área son obligatorios" });
    }

    try {
        // finca_id || 1 porque en tu SQL "El Sol" es ID 1
        const [result] = await db.query(
            'INSERT INTO parcela (nombre, area_ha, estado, finca_id) VALUES (?, ?, ?, ?)',
            [nombre, area_ha, estado || 'Activa', finca_id || 1]
        );
        res.status(201).json({ id: result.insertId, message: "Parcela creada con éxito" });
    } catch (err) {
        res.status(500).json({ error: "Error al guardar la parcela" });
    }
});

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   ENDPOINTS CRUD: PARCELAS
   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

// 1. ACTUALIZAR (PUT)
app.put('/api/parcelas/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, area_ha, estado, finca_id } = req.body;

    // Validación básica
    if (!nombre || !area_ha || !finca_id) {
        return res.status(400).json({
            error: "Todos los campos (nombre, área, estado, finca) son obligatorios."
        });
    }

    try {
        const query = `
            UPDATE parcela 
            SET nombre = ?, area_ha = ?, estado = ?, finca_id = ? 
            WHERE id = ?
        `;

        const [result] = await db.query(query, [nombre, area_ha, estado, finca_id, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "No se encontró la parcela para actualizar." });
        }

        res.json({
            success: true,
            message: "Parcela actualizada correctamente en la base de datos."
        });
    } catch (err) {
        console.error("Error al actualizar parcela:", err);
        res.status(500).json({ error: "Error interno del servidor al actualizar." });
    }
});

// 2. ELIMINAR (DELETE)
app.delete('/api/parcelas/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.query('DELETE FROM parcela WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "La parcela no existe." });
        }

        res.json({ success: true, message: "Parcela eliminada exitosamente." });
    } catch (err) {
        console.error("Error al eliminar parcela:", err);

        // Manejo específico de error de integridad referencial (Llaves Foráneas)
        if (err.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({
                error: "No se puede eliminar la parcela porque tiene registros asociados (sensores, siembras o tareas). Primero elimina esos registros o cambia el estado de la parcela a 'Baja'."
            });
        }

        res.status(500).json({ error: "Error al intentar eliminar la parcela." });
    }
});


app.get('/api/cosechas', async (req, res) => {
    try {
        const query = `
            SELECT c.*, p.nombre as parcela_nombre, v.nombre as variedad_nombre
            FROM cosecha c
            JOIN siembra s ON c.siembra_id = s.id
            JOIN parcela p ON s.parcela_id = p.id
            JOIN variedad v ON s.variedad_id = v.id
            ORDER BY c.fecha DESC
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// --- FUNCIONALIDAD 3: REGISTRO DE COSECHA (Procedimiento Almacenado) ---
app.post('/api/cosechas', async (req, res) => {
    const { siembra_id, fecha, cant_kg, calidad } = req.body;

    try {
        // Ejecución del procedimiento corregido
        await db.query('CALL sp_registrar_cosecha(?, ?, ?, ?, @id)', 
            [siembra_id, fecha, cant_kg, calidad]
        );

        // Recuperación del ID desde la variable de sesión @id
        const [result] = await db.query('SELECT @id AS id');
        
        res.status(201).json({ 
            success: true, 
            id: result[0].id 
        });
    } catch (err) {
        console.error("Error en DB:", err.message);
        res.status(500).send("Error de base de datos: " + err.message);
    }
});

// ACTUALIZAR Cosecha
app.put('/api/cosechas/:id', async (req, res) => {
    const { id } = req.params;
    const { siembra_id, fecha, cant_kg, calidad } = req.body;
    try {
        await db.query(
            'UPDATE cosecha SET siembra_id = ?, fecha = ?, cant_kg = ?, calidad = ? WHERE id = ?',
            [siembra_id, fecha, cant_kg, calidad, id]
        );
        res.json({ success: true, message: "Cosecha actualizada" });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// ELIMINAR Cosecha
app.delete('/api/cosechas/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM cosecha WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: "Cosecha eliminada" });
    } catch (err) {
        res.status(500).send(err.message);
    }
});



// --- FUNCIONALIDAD 4: DASHBOARD / ESTADÍSTICAS ---
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        // Datos reales de tus tablas
        const [cosechaTotal] = await db.query('SELECT SUM(cant_kg) as total FROM cosecha WHERE YEAR(fecha) = 2024');
        const [plantasActivas] = await db.query('SELECT SUM(cant_plantas) as total FROM siembra');
        const [trabajadores] = await db.query('SELECT COUNT(*) as total FROM trabajador');

        res.json({
            produccionTotal: cosechaTotal[0].total || 0,
            plantasActivas: plantasActivas[0].total || 0,
            numTrabajadores: trabajadores[0].total || 0
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.get('/api/dashboard/grafico-mensual', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT MONTH(fecha) as mes, SUM(cant_kg) as total 
            FROM cosecha 
            WHERE YEAR(fecha) = 2024 
            GROUP BY MONTH(fecha)
            ORDER BY mes ASC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// --- FUNCIONALIDAD 5: VISTAS ---
app.get('/api/resumen-anual', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM vw_produccion_anual');
        res.json(rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Obtener todas las variedades
app.get('/api/variedades', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM variedad');
        res.json(rows);
    } catch (err) {
        console.error("Error en /api/variedades:", err);
        res.status(500).send("Error al obtener variedades: " + err.message);
    }
});

// --- RUTAS PARA USUARIOS / TRABAJADORES ---

app.post('/api/usuarios', async (req, res) => {
    const { username, email, rol } = req.body;
    try {
        await db.query('CALL sp_registrar_trabajador(?, ?, ?)', [username, rol, email]);
        res.status(201).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- RUTA PARA OBTENER TRABAJADORES ---
app.get('/api/usuarios', async (req, res) => {
    try {
        // Usamos alias (AS) para que coincida exactamente con lo que tu frontend mapea
        const query = 'SELECT id, nombre, rol, contacto FROM trabajador ORDER BY id DESC';
        const [rows] = await db.query(query);
        
        console.log("Datos enviados al frontend:", rows); // Esto saldrá en tu terminal negra de Node
        res.json(rows); 
    } catch (error) {
        console.error("Error en DB:", error);
        res.status(500).json({ error: "Error al obtener trabajadores" });
    }
});

// --- RUTA PARA CREAR ---
app.post('/api/usuarios', async (req, res) => {
    // El frontend envía 'username' y 'email', pero tu tabla usa 'nombre' y 'contacto'
    const { username, email, rol } = req.body; 
    try {
        const [result] = await db.query(
            // Corregido: La tabla es 'trabajador', la columna es 'contacto'
            'INSERT INTO trabajador (nombre, rol, contacto) VALUES (?, ?, ?)',
            [username, rol, email] // El orden debe coincidir con los (?)
        );
        res.status(201).json({ id: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// --- RUTA PARA ACTUALIZAR ---
app.put('/api/usuarios/:id', async (req, res) => {
    const { id } = req.params;
    const { username, email, rol } = req.body;
    try {
        await db.query(
            // Corregido: Cambiado 'usuarios' por 'trabajador' 
            // y nombres de columnas a 'nombre' y 'contacto'
            'UPDATE trabajador SET nombre = ?, rol = ?, contacto = ? WHERE id = ?',
            [username, rol, email, id]
        );
        res.json({ message: "Trabajador actualizado con éxito" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. Eliminar un usuario
// RUTA PARA ELIMINAR TRABAJADOR
app.delete('/api/usuarios/:id', async (req, res) => {
    const { id } = req.params; // Captura el ID de la URL
    
    try {
        const [result] = await db.query('DELETE FROM trabajador WHERE id = ?', [id]);
        
        if (result.affectedRows > 0) {
            res.json({ message: "Trabajador eliminado con éxito" });
        } else {
            res.status(404).json({ error: "No se encontró el trabajador con ese ID" });
        }
    } catch (error) {
        console.error("Error al eliminar:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

app.post('/api/insumos', async (req, res) => {
    const { nombre, tipo, fecha_caducidad, stock_actual, unidad_medida } = req.body;
    try {
        const query = `
            INSERT INTO insumo (nombre, tipo, fecha_caducidad, stock_actual, unidad_medida, estado) 
            VALUES (?, ?, ?, ?, ?, 'Optimo')
        `;
        const [result] = await db.query(query, [nombre, tipo, fecha_caducidad, stock_actual, unidad_medida]);
        res.status(201).json({ id: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/insumos', async (req, res) => {
    try {
        // Forzamos los nombres para que coincidan con tu interfaz de React
        const query = `
            SELECT 
                id, 
                nombre, 
                tipo, 
                stock_actual, 
                unidad_medida, 
                estado 
            FROM insumo
        `;
        const [rows] = await db.query(query);
        
        console.log("Filas crudas de la DB:", rows); // Revisa tu terminal de Node
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ELIMINAR INSUMO
app.delete('/api/insumos/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM insumo WHERE id = ?', [req.params.id]);
        res.json({ message: "Eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// EDITAR INSUMO
// Ruta para ACTUALIZAR
app.put('/api/insumos/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, tipo, stock_actual, unidad_medida } = req.body;
    try {
        // Recalculamos el estado basado en el nuevo stock
        const estado = stock_actual < 50 ? 'Reabastecimiento urgente' : 'Óptimo';
        
        const query = `
            UPDATE insumo 
            SET nombre = ?, tipo = ?, stock_actual = ?, unidad_medida = ?, estado = ?
            WHERE id = ?
        `;
        await db.query(query, [nombre, tipo, stock_actual, unidad_medida, estado, id]);
        res.json({ message: "Insumo actualizado correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/tareas', async (req, res) => {
    // Asegúrate de que el modal de React envíe exactamente estos nombres
    const { descripcion, fecha_prog, estado, parcela_id, usuario_id } = req.body;
    
    try {
        // Uso de CALL para cumplir con el punto 7 de tus requisitos
        await db.query('CALL sp_registrar_tarea(?, ?, ?, ?, ?)', 
            [descripcion, fecha_prog, estado || 'Pendiente', parcela_id, usuario_id]
        );
        res.status(200).json({ message: "Tarea registrada mediante procedimiento almacenado" });
    } catch (err) {
        console.error("Error en Tareas:", err.message);
        res.status(500).json({ error: "Error en la base de datos", details: err.message });
    }
});

// Obtener tareas con el nombre de la parcela
app.get('/api/tareas', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT t.*, p.nombre as nombre_parcela 
            FROM tarea t 
            JOIN parcela p ON t.parcela_id = p.id 
            ORDER BY t.fecha_prog DESC
        `);
        res.json(rows);
    } catch (err) { res.status(500).json(err); }
});

// --- 1. CREAR TAREA (Usando Procedimiento Almacenado) ---
app.post('/api/tareas', async (req, res) => {
    const { descripcion, fecha_prog, estado, parcela_id, usuario_id } = req.body;
    
    try {
        // Se utiliza CALL para ejecutar la lógica definida en la base de datos
        await db.query('CALL sp_registrar_tarea(?, ?, ?, ?, ?)', 
            [descripcion, fecha_prog, estado || 'Pendiente', parcela_id, usuario_id]
        );
        res.status(201).json({ success: true, message: "Tarea creada exitosamente" });
    } catch (err) {
        console.error("Error al crear tarea:", err.message);
        // Si el Trigger de fecha (tr_validar_fecha_tarea) falla, el error llegará aquí
        res.status(500).json({ error: "Error en base de datos", details: err.message });
    }
});

// --- 2. EDITAR TAREA (Actualización de Estado y Datos) ---
app.put('/api/tareas/:id', async (req, res) => {
    const { id } = req.params;
    const { descripcion, fecha_prog, estado, parcela_id, usuario_id } = req.body;
    
    try {
        const query = `
            UPDATE tarea 
            SET descripcion = ?, fecha_prog = ?, estado = ?, parcela_id = ?, usuario_id = ? 
            WHERE id = ?`;
        
        await db.query(query, [descripcion, fecha_prog, estado, parcela_id, usuario_id, id]);
        res.json({ success: true, message: "Tarea actualizada correctamente" });
    } catch (err) {
        console.error("Error al editar tarea:", err.message);
        res.status(500).json({ error: "No se pudo actualizar la tarea" });
    }
});

// --- 3. ELIMINAR TAREA ---
app.delete('/api/tareas/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        await db.query('DELETE FROM tarea WHERE id = ?', [id]);
        res.json({ success: true, message: "Tarea eliminada exitosamente" });
    } catch (err) {
        console.error("Error al eliminar tarea:", err.message);
        res.status(500).json({ 
            error: "Error de integridad", 
            details: "No se puede eliminar la tarea si tiene registros vinculados en otras tablas." 
        });
    }
});

app.get('/api/tareas', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                t.*, 
                p.nombre AS nombre_parcela 
            FROM tarea t 
            JOIN parcela p ON t.parcela_id = p.id 
            ORDER BY t.fecha_prog DESC
        `);
        res.json(rows);
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

// Endpoint para actualizar solo el estado
app.patch('/api/tareas/:id/estado', async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body; // Recibe 'Completada' o 'EnProgreso'
    
    try {
        await db.query('UPDATE tarea SET estado = ? WHERE id = ?', [estado, id]);
        res.json({ message: "Estado actualizado con éxito" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint para aceptar recomendación y crear tarea automáticamente
app.post('/api/ia/aceptar/:id', async (req, res) => {
    const { id } = req.params;
    const { usuario_id } = req.body; // El admin que acepta la recomendación

    try {
        // 1. Obtener los datos de la recomendación
        const [rec] = await db.query('SELECT * FROM recomendacion_ia WHERE id = ?', [id]);
        if (rec.length === 0) return res.status(404).send("Recomendación no encontrada");

        const recomendacion = rec[0];

        // 2. Iniciar Transacción para asegurar que ambos pasos ocurran
        await db.query('START TRANSACTION');

        // Paso A: Actualizar estado de la recomendación
        await db.query('UPDATE recomendacion_ia SET estado = "Aceptada" WHERE id = ?', [id]);

        // Paso B: Crear la tarea automática basada en la recomendación
        // La fecha_prog se pone para hoy mismo
        const descTarea = `[IA RECOMENDACIÓN]: ${recomendacion.descripcion}`;
        await db.query(
            'INSERT INTO tarea (descripcion, fecha_prog, estado, parcela_id, usuario_id) VALUES (?, NOW(), "Pendiente", ?, ?)',
            [descTarea, recomendacion.parcela_id, usuario_id]
        );

        await db.query('COMMIT');
        res.json({ message: "Recomendación aceptada y tarea creada con éxito" });
    } catch (err) {
        await db.query('ROLLBACK');
        res.status(500).send(err.message);
    }
});

app.get('/api/ia/recomendaciones', async (req, res) => {
    try {
        // Cambiamos 'parcelas p' por 'parcela p' para que coincida con tu CREATE TABLE
        const [rows] = await db.query(`
            SELECT 
                r.id, 
                r.descripcion, 
                r.fecha_hora, 
                r.estado, 
                r.parcela_id, 
                p.nombre AS nombre_parcela 
            FROM recomendacion_ia r
            INNER JOIN parcela p ON r.parcela_id = p.id
            ORDER BY r.fecha_hora DESC
        `);

        res.json(rows);
    } catch (error) {
        console.error("ERROR EN DB:", error);
        res.status(500).json({ 
            error: "Error en la base de datos", 
            detalle: error.message 
        });
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Backend Agrotech en puerto ${PORT}`));