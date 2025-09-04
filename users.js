// =====================================================
// RUTAS DE USUARIOS EVENTPRO
// =====================================================

const express = require('express');
const { body, validationResult } = require('express-validator');
const { executeQuery } = require('../config/database');

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
// OBTENER PERFIL DEL USUARIO
// =====================================================

router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const usuarios = await executeQuery(
            'SELECT id, nombre, email, telefono, fecha_registro, ultimo_acceso FROM usuarios WHERE id = ?',
            [req.userId]
        );

        if (usuarios.length === 0) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        const usuario = usuarios[0];

        // Obtener estadísticas del usuario
        const estadisticas = await executeQuery(
            `SELECT 
                COUNT(*) as total_eventos,
                COUNT(CASE WHEN estado = 'completado' THEN 1 END) as eventos_completados,
                COUNT(CASE WHEN estado = 'planificando' THEN 1 END) as eventos_planificando,
                SUM(CASE WHEN estado = 'completado' THEN presupuesto END) as presupuesto_total
             FROM eventos 
             WHERE usuario_id = ?`,
            [req.userId]
        );

        res.json({
            usuario,
            estadisticas: estadisticas[0]
        });

    } catch (error) {
        console.error('Error obteniendo perfil:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
});

// =====================================================
// ACTUALIZAR PERFIL DEL USUARIO
// =====================================================

router.put('/profile', [
    body('nombre').optional().notEmpty().withMessage('El nombre no puede estar vacío'),
    body('telefono').optional().isMobilePhone().withMessage('Teléfono válido requerido')
], authenticateToken, async (req, res) => {
    try {
        // Validar entrada
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { nombre, telefono } = req.body;

        // Construir query de actualización
        const fields = [];
        const values = [];
        
        if (nombre) {
            fields.push('nombre = ?');
            values.push(nombre);
        }
        
        if (telefono) {
            fields.push('telefono = ?');
            values.push(telefono);
        }

        if (fields.length === 0) {
            return res.status(400).json({
                error: 'No hay campos para actualizar'
            });
        }

        values.push(req.userId);

        // Actualizar usuario
        await executeQuery(
            `UPDATE usuarios SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        res.json({
            mensaje: 'Perfil actualizado exitosamente'
        });

    } catch (error) {
        console.error('Error actualizando perfil:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
});

// =====================================================
// CAMBIAR CONTRASEÑA
// =====================================================

router.put('/password', [
    body('password_actual').notEmpty().withMessage('La contraseña actual es requerida'),
    body('password_nueva').isLength({ min: 6 }).withMessage('La nueva contraseña debe tener al menos 6 caracteres')
], authenticateToken, async (req, res) => {
    try {
        // Validar entrada
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { password_actual, password_nueva } = req.body;

        // Obtener usuario actual
        const usuarios = await executeQuery(
            'SELECT password_hash FROM usuarios WHERE id = ?',
            [req.userId]
        );

        if (usuarios.length === 0) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        // Verificar contraseña actual
        const bcrypt = require('bcryptjs');
        const isValidPassword = await bcrypt.compare(password_actual, usuarios[0].password_hash);
        
        if (!isValidPassword) {
            return res.status(400).json({
                error: 'La contraseña actual es incorrecta'
            });
        }

        // Hash de la nueva contraseña
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        const newPasswordHash = await bcrypt.hash(password_nueva, saltRounds);

        // Actualizar contraseña
        await executeQuery(
            'UPDATE usuarios SET password_hash = ? WHERE id = ?',
            [newPasswordHash, req.userId]
        );

        res.json({
            mensaje: 'Contraseña cambiada exitosamente'
        });

    } catch (error) {
        console.error('Error cambiando contraseña:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
});

// =====================================================
// OBTENER HISTORIAL DE EVENTOS
// =====================================================

router.get('/historial', authenticateToken, async (req, res) => {
    try {
        const { limit = 10, offset = 0 } = req.query;

        const eventos = await executeQuery(
            `SELECT 
                e.*,
                te.nombre as tipo_evento_nombre,
                te.icono as tipo_evento_icono,
                te.color_tema
             FROM eventos e
             JOIN tipos_evento te ON e.tipo_evento_id = te.id
             WHERE e.usuario_id = ?
             ORDER BY e.fecha_evento DESC
             LIMIT ? OFFSET ?`,
            [req.userId, parseInt(limit), parseInt(offset)]
        );

        // Obtener total de eventos
        const total = await executeQuery(
            'SELECT COUNT(*) as total FROM eventos WHERE usuario_id = ?',
            [req.userId]
        );

        res.json({
            eventos,
            paginacion: {
                total: total[0].total,
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });

    } catch (error) {
        console.error('Error obteniendo historial:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
});

// =====================================================
// OBTENER ESTADÍSTICAS DETALLADAS
// =====================================================

router.get('/estadisticas', authenticateToken, async (req, res) => {
    try {
        // Estadísticas generales
        const generales = await executeQuery(
            `SELECT 
                COUNT(*) as total_eventos,
                COUNT(CASE WHEN estado = 'completado' THEN 1 END) as eventos_completados,
                COUNT(CASE WHEN estado = 'planificando' THEN 1 END) as eventos_planificando,
                COUNT(CASE WHEN estado = 'en_progreso' THEN 1 END) as eventos_en_progreso,
                COUNT(CASE WHEN estado = 'cancelado' THEN 1 END) as eventos_cancelados,
                SUM(CASE WHEN estado = 'completado' THEN presupuesto END) as presupuesto_total,
                AVG(CASE WHEN estado = 'completado' THEN presupuesto END) as presupuesto_promedio
             FROM eventos 
             WHERE usuario_id = ?`,
            [req.userId]
        );

        // Eventos por tipo
        const porTipo = await executeQuery(
            `SELECT 
                te.nombre as tipo_evento,
                te.icono,
                te.color_tema,
                COUNT(*) as cantidad,
                AVG(e.presupuesto) as presupuesto_promedio
             FROM eventos e
             JOIN tipos_evento te ON e.tipo_evento_id = te.id
             WHERE e.usuario_id = ?
             GROUP BY te.id, te.nombre, te.icono, te.color_tema
             ORDER BY cantidad DESC`,
            [req.userId]
        );

        // Eventos por mes (último año)
        const porMes = await executeQuery(
            `SELECT 
                DATE_FORMAT(fecha_evento, '%Y-%m') as mes,
                COUNT(*) as cantidad,
                SUM(presupuesto) as presupuesto_total
             FROM eventos 
             WHERE usuario_id = ? 
             AND fecha_evento >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)
             GROUP BY DATE_FORMAT(fecha_evento, '%Y-%m')
             ORDER BY mes DESC`,
            [req.userId]
        );

        res.json({
            generales: generales[0],
            por_tipo: porTipo,
            por_mes: porMes
        });

    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
});

module.exports = router;
