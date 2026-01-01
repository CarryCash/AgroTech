const mysql = require('mysql2');

// Configuración de la conexión
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',          // Tu usuario de MySQL (normalmente root)
    password: 'HolaMundo123', // La contraseña que usas para entrar a MySQL
    database: 'finca_el_sol',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Exportamos para usar promesas (async/await)
module.exports = pool.promise();