// =====================================================
// RUTAS DE PROVEEDORES EVENTPRO
// =====================================================

const express = require('express');
const { executeQuery } = require('../config/database');

const router = express.Router();

// =====================================================
// LISTAR TODOS LOS PROVEEDORES
// =====================================================

router.get('/', async (req, res) => {
    try {
        const { tipo_servicio, ubicacion, precio_max } = req.query;
        
        let query = `
            SELECT 
                p.*,
                COUNT(c.id) as num_calificaciones,
                AVG(c.calificacion) as calificacion_promedio
            FROM proveedores p
            LEFT JOIN calificaciones c ON p.id = c.proveedor_id
            WHERE p.activo = TRUE
        `;
        
        const params = [];
        
        // Filtro por tipo de servicio
        if (tipo_servicio) {
            query += ` AND p.tipo_servicio = ?`;
            params.push(tipo_servicio);
        }
        
        // Filtro por precio máximo
        if (precio_max) {
            query += ` AND p.precio_base <= ?`;
            params.push(parseFloat(precio_max));
        }
        
        query += ` GROUP BY p.id ORDER BY p.calificacion DESC, p.nombre`;
        
        const proveedores = await executeQuery(query, params);
        
        res.json({
            proveedores: proveedores.map(p => ({
                ...p,
                calificacion_promedio: p.calificacion_promedio || p.calificacion,
                num_calificaciones: p.num_calificaciones || 0
            }))
        });
        
    } catch (error) {
        console.error('Error obteniendo proveedores:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
});

// =====================================================
// BUSCAR PROVEEDORES
// =====================================================

router.get('/search', async (req, res) => {
    try {
        const { 
            tipo_servicio, 
            ubicacion_lat, 
            ubicacion_lng, 
            radio_km = 50,
            precio_max,
            calificacion_min = 0
        } = req.query;
        
        let query = `
            SELECT 
                p.*,
                ST_Distance_Sphere(
                    POINT(p.coordenadas_lng, p.coordenadas_lat), 
                    POINT(?, ?)
                ) as distancia_metros,
                COUNT(c.id) as num_calificaciones,
                AVG(c.calificacion) as calificacion_promedio
            FROM proveedores p
            LEFT JOIN calificaciones c ON p.id = c.proveedor_id
            WHERE p.activo = TRUE
        `;
        
        const params = [ubicacion_lng || 0, ubicacion_lat || 0];
        
        // Filtro por tipo de servicio
        if (tipo_servicio) {
            query += ` AND p.tipo_servicio = ?`;
            params.push(tipo_servicio);
        }
        
        // Filtro por precio máximo
        if (precio_max) {
            query += ` AND p.precio_base <= ?`;
            params.push(parseFloat(precio_max));
        }
        
        // Filtro por calificación mínima
        if (calificacion_min > 0) {
            query += ` AND p.calificacion >= ?`;
            params.push(parseFloat(calificacion_min));
        }
        
        query += ` GROUP BY p.id`;
        
        // Filtro por distancia
        if (ubicacion_lat && ubicacion_lng) {
            query += ` HAVING distancia_metros <= ?`;
            params.push(radio_km * 1000); // Convertir km a metros
        }
        
        query += ` ORDER BY distancia_metros ASC, p.calificacion DESC`;
        
        const proveedores = await executeQuery(query, params);
        
        res.json({
            proveedores: proveedores.map(p => ({
                ...p,
                distancia_km: Math.round(p.distancia_metros / 1000 * 100) / 100,
                calificacion_promedio: p.calificacion_promedio || p.calificacion,
                num_calificaciones: p.num_calificaciones || 0
            }))
        });
        
    } catch (error) {
        console.error('Error buscando proveedores:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
});

// =====================================================
// OBTENER PROVEEDOR ESPECÍFICO
// =====================================================

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const proveedores = await executeQuery(
            `SELECT 
                p.*,
                COUNT(c.id) as num_calificaciones,
                AVG(c.calificacion) as calificacion_promedio
             FROM proveedores p
             LEFT JOIN calificaciones c ON p.id = c.proveedor_id
             WHERE p.id = ? AND p.activo = TRUE
             GROUP BY p.id`,
            [id]
        );
        
        if (proveedores.length === 0) {
            return res.status(404).json({
                error: 'Proveedor no encontrado'
            });
        }
        
        const proveedor = proveedores[0];
        
        // Obtener calificaciones recientes
        const calificaciones = await executeQuery(
            `SELECT 
                c.*,
                u.nombre as usuario_nombre
             FROM calificaciones c
             JOIN usuarios u ON c.usuario_id = u.id
             WHERE c.proveedor_id = ?
             ORDER BY c.fecha_calificacion DESC
             LIMIT 10`,
            [id]
        );
        
        res.json({
            proveedor: {
                ...proveedor,
                calificacion_promedio: proveedor.calificacion_promedio || proveedor.calificacion,
                num_calificaciones: proveedor.num_calificaciones || 0,
                calificaciones_recientes: calificaciones
            }
        });
        
    } catch (error) {
        console.error('Error obteniendo proveedor:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
});

// =====================================================
// OBTENER PROVEEDORES POR TIPO DE SERVICIO
// =====================================================

router.get('/tipo/:tipo', async (req, res) => {
    try {
        const { tipo } = req.params;
        const { ubicacion_lat, ubicacion_lng, radio_km = 50 } = req.query;
        
        let query = `
            SELECT 
                p.*,
                ST_Distance_Sphere(
                    POINT(p.coordenadas_lng, p.coordenadas_lat), 
                    POINT(?, ?)
                ) as distancia_metros,
                COUNT(c.id) as num_calificaciones,
                AVG(c.calificacion) as calificacion_promedio
            FROM proveedores p
            LEFT JOIN calificaciones c ON p.id = c.proveedor_id
            WHERE p.tipo_servicio = ? AND p.activo = TRUE
            GROUP BY p.id
        `;
        
        const params = [ubicacion_lng || 0, ubicacion_lat || 0, tipo];
        
        // Filtro por distancia si se proporciona ubicación
        if (ubicacion_lat && ubicacion_lng) {
            query += ` HAVING distancia_metros <= ?`;
            params.push(radio_km * 1000);
        }
        
        query += ` ORDER BY p.calificacion DESC, distancia_metros ASC`;
        
        const proveedores = await executeQuery(query, params);
        
        res.json({
            tipo_servicio: tipo,
            proveedores: proveedores.map(p => ({
                ...p,
                distancia_km: Math.round(p.distancia_metros / 1000 * 100) / 100,
                calificacion_promedio: p.calificacion_promedio || p.calificacion,
                num_calificaciones: p.num_calificaciones || 0
            }))
        });
        
    } catch (error) {
        console.error('Error obteniendo proveedores por tipo:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
});

module.exports = router;
