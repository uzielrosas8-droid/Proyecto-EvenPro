// =====================================================
// CONFIGURACIÓN DE BASE DE DATOS EVENTPRO
// =====================================================

const mysql = require('mysql2/promise');
require('dotenv').config();

// =====================================================
// CONFIGURACIÓN DE CONEXIÓN
// =====================================================

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'eventpro_db',
    port: process.env.DB_PORT || 3306,
    
    // Configuración del pool de conexiones
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    
    // Configuración de timeouts
    acquireTimeout: 60000,
    timeout: 60000,
    
    // Configuración de reconexión
    reconnect: true,
    
    // Configuración de SSL (para producción)
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
    } : false
};

// =====================================================
// CREAR POOL DE CONEXIONES
// =====================================================

let pool;

const createPool = () => {
    try {
        pool = mysql.createPool(dbConfig);
        console.log('✅ Pool de conexiones a MySQL creado exitosamente');
        return pool;
    } catch (error) {
        console.error('❌ Error al crear pool de conexiones:', error);
        throw error;
    }
};

// =====================================================
// FUNCIONES DE CONEXIÓN
// =====================================================

const getConnection = async () => {
    if (!pool) {
        pool = createPool();
    }
    
    try {
        const connection = await pool.getConnection();
        return connection;
    } catch (error) {
        console.error('❌ Error al obtener conexión:', error);
        throw error;
    }
};

const executeQuery = async (query, params = []) => {
    let connection;
    
    try {
        connection = await getConnection();
        const [results] = await connection.execute(query, params);
        return results;
    } catch (error) {
        console.error('❌ Error al ejecutar query:', error);
        console.error('Query:', query);
        console.error('Parámetros:', params);
        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

const executeTransaction = async (queries) => {
    let connection;
    
    try {
        connection = await getConnection();
        await connection.beginTransaction();
        
        const results = [];
        
        for (const { query, params = [] } of queries) {
            const [result] = await connection.execute(query, params);
            results.push(result);
        }
        
        await connection.commit();
        return results;
        
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('❌ Error en transacción:', error);
        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

// =====================================================
// FUNCIONES DE UTILIDAD
// =====================================================

const testConnection = async () => {
    try {
        const connection = await getConnection();
        await connection.ping();
        connection.release();
        console.log('✅ Conexión a MySQL exitosa');
        return true;
    } catch (error) {
        console.error('❌ Error de conexión a MySQL:', error);
        return false;
    }
};

const closePool = async () => {
    if (pool) {
        await pool.end();
        console.log('🔌 Pool de conexiones cerrado');
    }
};

// =====================================================
// FUNCIONES DE INICIALIZACIÓN
// =====================================================

const initializeDatabase = async () => {
    try {
        // Probar conexión
        const isConnected = await testConnection();
        
        if (!isConnected) {
            throw new Error('No se pudo conectar a la base de datos');
        }
        
        // Verificar si las tablas existen
        const tables = await executeQuery(`
            SELECT TABLE_NAME 
            FROM information_schema.TABLES 
            WHERE TABLE_SCHEMA = ?
        `, [process.env.DB_NAME || 'eventpro_db']);
        
        console.log(`📊 Base de datos inicializada. Tablas encontradas: ${tables.length}`);
        
        return true;
        
    } catch (error) {
        console.error('❌ Error al inicializar base de datos:', error);
        throw error;
    }
};

// =====================================================
// EXPORTAR FUNCIONES
// =====================================================

module.exports = {
    createPool,
    getConnection,
    executeQuery,
    executeTransaction,
    testConnection,
    closePool,
    initializeDatabase,
    pool: () => pool
};

// =====================================================
// MANEJO DE SEÑALES DE TERMINACIÓN
// =====================================================

process.on('SIGINT', async () => {
    console.log('🛑 Cerrando conexiones de base de datos...');
    await closePool();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('🛑 Cerrando conexiones de base de datos...');
    await closePool();
    process.exit(0);
});
