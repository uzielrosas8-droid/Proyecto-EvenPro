// =====================================================
// RUTAS DE RECOMENDACIONES EVENTPRO
// =====================================================

const express = require('express');
const { body, validationResult } = require('express-validator');
const recommendationEngine = require('../services/recommendationEngine');

const router = express.Router();

// =====================================================
// MIDDLEWARE DE AUTENTICACIÓN
// =====================================================

const authenticateToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                error: 'Token de autenticación requerido'
            });
        }

        // Verificar token (implementación básica)
        req.userId = 1; // Por ahora, usuario fijo para desarrollo
        next();
        
    } catch (error) {
        return res.status(401).json({
            error: 'Token inválido'
        });
    }
};

// =====================================================
// OBTENER RECOMENDACIONES PARA EVENTO
// =====================================================

router.post('/evento', [
    body('tipo_evento_id').isInt({ min: 1 }).withMessage('Tipo de evento válido requerido'),
    body('num_invitados').isInt({ min: 1 }).withMessage('Número de invitados válido requerido'),
    body('presupuesto').isFloat({ min: 0 }).withMessage('Presupuesto válido requerido'),
    body('ubicacion.lat').optional().isFloat().withMessage('Latitud válida requerida'),
    body('ubicacion.lng').optional().isFloat().withMessage('Longitud válida requerida')
], authenticateToken, async (req, res) => {
    try {
        // Validar entrada
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            tipo_evento_id,
            num_invitados,
            presupuesto,
            ubicacion = { lat: 0, lng: 0 }
        } = req.body;

        // Crear objeto evento temporal para recomendaciones
        const evento = {
            id: 'temp',
            tipo_evento_id,
            num_invitados,
            fecha_evento: new Date().toISOString().split('T')[0]
        };

        // Obtener recomendaciones
        const recomendaciones = await recommendationEngine.obtenerRecomendaciones(
            evento,
            presupuesto,
            ubicacion
        );

        res.json({
            evento: evento,
            recomendaciones
        });

    } catch (error) {
        console.error('Error obteniendo recomendaciones:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
});

// =====================================================
// OPTIMIZAR PRESUPUESTO
// =====================================================

router.post('/optimizar', [
    body('tipo_evento_id').isInt({ min: 1 }).withMessage('Tipo de evento válido requerido'),
    body('num_invitados').isInt({ min: 1 }).withMessage('Número de invitados válido requerido'),
    body('presupuesto').isFloat({ min: 0 }).withMessage('Presupuesto válido requerido')
], authenticateToken, async (req, res) => {
    try {
        // Validar entrada
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            tipo_evento_id,
            num_invitados,
            presupuesto
        } = req.body;

        // Crear objeto evento temporal para optimización
        const evento = {
            id: 'temp',
            tipo_evento_id,
            num_invitados,
            fecha_evento: new Date().toISOString().split('T')[0]
        };

        // Optimizar presupuesto
        const optimizacion = await recommendationEngine.optimizarPresupuesto(
            evento,
            presupuesto
        );

        res.json({
            evento: evento,
            optimizacion
        });

    } catch (error) {
        console.error('Error optimizando presupuesto:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
});

// =====================================================
// OBTENER RECOMENDACIONES PERSONALIZADAS
// =====================================================

router.get('/personalizadas/:tipo_evento', authenticateToken, async (req, res) => {
    try {
        const { tipo_evento } = req.params;
        const { preferencias } = req.query;

        // Obtener recomendaciones personalizadas
        const recomendaciones = await recommendationEngine.obtenerRecomendacionesPersonalizadas(
            req.userId,
            tipo_evento,
            preferencias ? JSON.parse(preferencias) : {}
        );

        if (!recomendaciones) {
            return res.status(404).json({
                error: 'No se encontraron recomendaciones personalizadas'
            });
        }

        res.json({
            tipo_evento,
            recomendaciones
        });

    } catch (error) {
        console.error('Error obteniendo recomendaciones personalizadas:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
});

// =====================================================
// OBTENER ELEMENTOS RECOMENDADOS POR TIPO
// =====================================================

router.get('/elementos/:tipo_evento', async (req, res) => {
    try {
        const { tipo_evento } = req.params;

        // Mapear nombre del tipo a ID
        const tipoMap = {
            'cumpleaños': 1,
            'boda': 2,
            'corporativo': 3,
            'festejo': 4
        };

        const tipoId = tipoMap[tipo_evento.toLowerCase()];
        
        if (!tipoId) {
            return res.status(400).json({
                error: 'Tipo de evento no válido'
            });
        }

        // Obtener elementos recomendados del motor
        const elementos = recommendationEngine.elementosPorTipo[tipoId] || [];

        res.json({
            tipo_evento,
            elementos_recomendados: elementos,
            descripcion: `Elementos recomendados para eventos de tipo ${tipo_evento}`
        });

    } catch (error) {
        console.error('Error obteniendo elementos recomendados:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
});

// =====================================================
// CALCULAR PRESUPUESTO RECOMENDADO
// =====================================================

router.post('/presupuesto', [
    body('tipo_evento_id').isInt({ min: 1 }).withMessage('Tipo de evento válido requerido'),
    body('num_invitados').isInt({ min: 1 }).withMessage('Número de invitados válido requerido')
], async (req, res) => {
    try {
        // Validar entrada
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { tipo_evento_id, num_invitados } = req.body;

        // Calcular presupuesto recomendado
        const presupuestoRecomendado = await recommendationEngine.calcularPresupuestoRecomendado(
            tipo_evento_id,
            num_invitados
        );

        res.json({
            tipo_evento_id,
            num_invitados,
            presupuesto_recomendado: presupuestoRecomendado
        });

    } catch (error) {
        console.error('Error calculando presupuesto recomendado:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
});

// =====================================================
// OBTENER ESTADÍSTICAS DE RECOMENDACIONES
// =====================================================

router.get('/estadisticas', authenticateToken, async (req, res) => {
    try {
        // Por ahora, retornar estadísticas básicas
        // En el futuro, se podrían implementar métricas más avanzadas
        
        const estadisticas = {
            total_recomendaciones: 0,
            tipos_evento_populares: [],
            elementos_mas_solicitados: [],
            presupuesto_promedio: 0,
            proveedores_top: []
        };

        res.json({
            estadisticas,
            mensaje: 'Estadísticas de recomendaciones (en desarrollo)'
        });

    } catch (error) {
        console.error('Error obteniendo estadísticas de recomendaciones:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
});

module.exports = router;
