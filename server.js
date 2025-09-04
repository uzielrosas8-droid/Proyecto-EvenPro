// =====================================================
// SERVIDOR PRINCIPAL EVENTPRO
// =====================================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// =====================================================
// MIDDLEWARE DE SEGURIDAD
// =====================================================

// Helmet para headers de seguridad
app.use(helmet());

// Rate limiting para prevenir spam
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // máximo 100 requests por ventana
    message: {
        error: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.'
    }
});
app.use('/api/', limiter);

// CORS configurado
const corsOptions = {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'],
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// =====================================================
// MIDDLEWARE DE PARSING
// =====================================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// =====================================================
// MIDDLEWARE DE LOGGING
// =====================================================

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// =====================================================
// RUTAS PRINCIPALES
// =====================================================

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({
        mensaje: '🎉 ¡Bienvenido a EventPro API!',
        version: '1.0.0',
        estado: 'Activo',
        timestamp: new Date().toISOString()
    });
});

// Ruta de estado del servidor
app.get('/api/status', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// =====================================================
// IMPORTAR RUTAS
// =====================================================

// Rutas de autenticación
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Rutas de eventos
const eventRoutes = require('./routes/events');
app.use('/api/events', eventRoutes);

// Rutas de proveedores
const providerRoutes = require('./routes/providers');
app.use('/api/providers', providerRoutes);

// Rutas de usuarios
const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

// Rutas de recomendaciones
const recommendationRoutes = require('./routes/recommendations');
app.use('/api/recommendations', recommendationRoutes);

// =====================================================
// MIDDLEWARE DE MANEJO DE ERRORES
// =====================================================

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        path: req.originalUrl,
        method: req.method
    });
});

// Manejo global de errores
app.use((error, req, res, next) => {
    console.error('Error no manejado:', error);
    
    res.status(error.status || 500).json({
        error: process.env.NODE_ENV === 'production' 
            ? 'Error interno del servidor' 
            : error.message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
});

// =====================================================
// INICIAR SERVIDOR
// =====================================================

app.listen(PORT, () => {
    console.log('🚀 Servidor EventPro iniciado exitosamente!');
    console.log(`📍 Puerto: ${PORT}`);
    console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`⏰ Iniciado: ${new Date().toLocaleString()}`);
    console.log('='.repeat(50));
});

// =====================================================
// MANEJO DE SEÑALES DE TERMINACIÓN
// =====================================================

process.on('SIGTERM', () => {
    console.log('🛑 Señal SIGTERM recibida, cerrando servidor...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 Señal SIGINT recibida, cerrando servidor...');
    process.exit(0);
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
    console.error('❌ Error no capturado:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promesa rechazada no manejada:', reason);
    process.exit(1);
});

module.exports = app;
