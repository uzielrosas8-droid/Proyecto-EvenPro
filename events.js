// =====================================================
// RUTAS DE EVENTOS EVENTPRO
// =====================================================

const express = require('express');
const { body, validationResult } = require('express-validator');
const { executeQuery } = require('../config/database');
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
        // En producción, usaría jwt.verify()
        req.userId = 1; // Por ahora, usuario fijo para desarrollo
        next();
        
    } catch (error) {
        return res.status(401).json({
            error: 'Token inválido'
        });
    }
};

// =====================================================
// OBTENER TIPOS DE EVENTO
// =====================================================

router.get('/tipos', async (req, res) => {
    try {
        const tipos = await executeQuery(
            'SELECT * FROM tipos_evento ORDER BY nombre'
        );

        res.json({
            tipos_evento: tipos
        });

    } catch (error) {
        console.error('Error obteniendo tipos de evento:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
});

// =====================================================
// CREAR NUEVO EVENTO
// =====================================================

router.post('/', [
    body('nombre').notEmpty().withMessage('El nombre del evento es requerido'),
    body('tipo_evento_id').isInt({ min: 1 }).withMessage('Tipo de evento válido requerido'),
    body('fecha_evento').isISO8601().withMessage('Fecha válida requerida'),
    body('ubicacion').notEmpty().withMessage('La ubicación es requerida'),
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
            nombre,
            tipo_evento_id,
            descripcion,
            fecha_evento,
            hora_inicio,
            hora_fin,
            ubicacion,
            coordenadas_lat,
            coordenadas_lng,
            num_invitados,
            presupuesto
        } = req.body;

        // Crear evento
        const result = await executeQuery(
            `INSERT INTO eventos (
                usuario_id, tipo_evento_id, nombre, descripcion, 
                fecha_evento, hora_inicio, hora_fin, ubicacion,
                coordenadas_lat, coordenadas_lng, num_invitados, presupuesto
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                req.userId, tipo_evento_id, nombre, descripcion,
                fecha_evento, hora_inicio, hora_fin, ubicacion,
                coordenadas_lat, coordenadas_lng, num_invitados, presupuesto
            ]
        );

        const eventoId = result.insertId;

        // Crear cronograma básico
        await executeQuery(
            `INSERT INTO cronogramas (evento_id, titulo, descripcion, hora_inicio, hora_fin, orden)
             VALUES 
                (?, 'Preparación', 'Preparación del evento', '08:00:00', '10:00:00', 1),
                (?, 'Evento Principal', 'Evento principal', '10:00:00', '18:00:00', 2),
                (?, 'Limpieza', 'Limpieza y desmontaje', '18:00:00', '20:00:00', 3)`,
            [eventoId, eventoId, eventoId]
        );

        // Obtener recomendaciones
        const evento = {
            id: eventoId,
            tipo_evento_id,
            num_invitados,
            fecha_evento
        };

        const recomendaciones = await recommendationEngine.obtenerRecomendaciones(
            evento,
            presupuesto,
            { lat: coordenadas_lat || 0, lng: coordenadas_lng || 0 }
        );

        res.status(201).json({
            mensaje: 'Evento creado exitosamente',
            evento: {
                id: eventoId,
                nombre,
                tipo_evento_id,
                fecha_evento,
                ubicacion,
                num_invitados,
                presupuesto
            },
            recomendaciones
        });

    } catch (error) {
        console.error('Error creando evento:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
});

// =====================================================
// OBTENER EVENTOS DEL USUARIO
// =====================================================

router.get('/', authenticateToken, async (req, res) => {
    try {
        const eventos = await executeQuery(
            `SELECT 
                e.*,
                te.nombre as tipo_evento_nombre,
                te.icono as tipo_evento_icono,
                te.color_tema
             FROM eventos e
             JOIN tipos_evento te ON e.tipo_evento_id = te.id
             WHERE e.usuario_id = ?
             ORDER BY e.fecha_evento DESC`,
            [req.userId]
        );

        res.json({
            eventos
        });

    } catch (error) {
        console.error('Error obteniendo eventos:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
});

// =====================================================
// OBTENER EVENTO ESPECÍFICO
// =====================================================

router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const eventos = await executeQuery(
            `SELECT 
                e.*,
                te.nombre as tipo_evento_nombre,
                te.icono as tipo_evento_icono,
                te.color_tema,
                te.elementos_recomendados
             FROM eventos e
             JOIN tipos_evento te ON e.tipo_evento_id = te.id
             WHERE e.id = ? AND e.usuario_id = ?`,
            [id, req.userId]
        );

        if (eventos.length === 0) {
            return res.status(404).json({
                error: 'Evento no encontrado'
            });
        }

        const evento = eventos[0];

        // Obtener elementos del evento
        const elementos = await executeQuery(
            `SELECT 
                el.*,
                p.nombre as proveedor_nombre,
                p.tipo_servicio
             FROM elementos_evento el
             LEFT JOIN proveedores p ON el.proveedor_id = p.id
             WHERE el.evento_id = ?
             ORDER BY el.fecha_creacion`,
            [id]
        );

        // Obtener cronograma
        const cronograma = await executeQuery(
            `SELECT * FROM cronogramas 
             WHERE evento_id = ? 
             ORDER BY orden`,
            [id]
        );

        // Obtener invitados
        const invitados = await executeQuery(
            `SELECT * FROM invitados 
             WHERE evento_id = ? 
             ORDER BY nombre`,
            [id]
        );

        res.json({
            evento: {
                ...evento,
                elementos,
                cronograma,
                invitados
            }
        });

    } catch (error) {
        console.error('Error obteniendo evento:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
});

// =====================================================
// ACTUALIZAR EVENTO
// =====================================================

router.put('/:id', [
    body('nombre').optional().notEmpty().withMessage('El nombre del evento no puede estar vacío'),
    body('fecha_evento').optional().isISO8601().withMessage('Fecha válida requerida'),
    body('num_invitados').optional().isInt({ min: 1 }).withMessage('Número de invitados válido requerido'),
    body('presupuesto').optional().isFloat({ min: 0 }).withMessage('Presupuesto válido requerido')
], authenticateToken, async (req, res) => {
    try {
        // Validar entrada
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;
        const updateData = req.body;

        // Verificar que el evento pertenece al usuario
        const eventos = await executeQuery(
            'SELECT id FROM eventos WHERE id = ? AND usuario_id = ?',
            [id, req.userId]
        );

        if (eventos.length === 0) {
            return res.status(404).json({
                error: 'Evento no encontrado'
            });
        }

        // Construir query de actualización
        const fields = [];
        const values = [];
        
        Object.keys(updateData).forEach(key => {
            if (updateData[key] !== undefined) {
                fields.push(`${key} = ?`);
                values.push(updateData[key]);
            }
        });

        if (fields.length === 0) {
            return res.status(400).json({
                error: 'No hay campos para actualizar'
            });
        }

        fields.push('fecha_actualizacion = CURRENT_TIMESTAMP');
        values.push(id, req.userId);

        // Actualizar evento
        await executeQuery(
            `UPDATE eventos SET ${fields.join(', ')} WHERE id = ? AND usuario_id = ?`,
            values
        );

        res.json({
            mensaje: 'Evento actualizado exitosamente'
        });

    } catch (error) {
        console.error('Error actualizando evento:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
});

// =====================================================
// ELIMINAR EVENTO
// =====================================================

router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar que el evento pertenece al usuario
        const eventos = await executeQuery(
            'SELECT id FROM eventos WHERE id = ? AND usuario_id = ?',
            [id, req.userId]
        );

        if (eventos.length === 0) {
            return res.status(404).json({
                error: 'Evento no encontrado'
            });
        }

        // Eliminar evento (las FK se encargan de eliminar elementos relacionados)
        await executeQuery(
            'DELETE FROM eventos WHERE id = ? AND usuario_id = ?',
            [id, req.userId]
        );

        res.json({
            mensaje: 'Evento eliminado exitosamente'
        });

    } catch (error) {
        console.error('Error eliminando evento:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
});

// =====================================================
// OBTENER RECOMENDACIONES PARA EVENTO
// =====================================================

router.post('/:id/recomendaciones', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { presupuesto, ubicacion } = req.body;

        // Verificar que el evento pertenece al usuario
        const eventos = await executeQuery(
            'SELECT * FROM eventos WHERE id = ? AND usuario_id = ?',
            [id, req.userId]
        );

        if (eventos.length === 0) {
            return res.status(404).json({
                error: 'Evento no encontrado'
            });
        }

        const evento = eventos[0];

        // Obtener recomendaciones
        const recomendaciones = await recommendationEngine.obtenerRecomendaciones(
            evento,
            presupuesto || evento.presupuesto,
            ubicacion || { lat: evento.coordenadas_lat || 0, lng: evento.coordenadas_lng || 0 }
        );

        res.json({
            evento_id: id,
            recomendaciones
        });

    } catch (error) {
        console.error('Error obteniendo recomendaciones:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
});

module.exports = router;
