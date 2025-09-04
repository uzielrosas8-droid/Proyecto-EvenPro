// =====================================================
// MOTOR DE RECOMENDACIONES INTELIGENTES EVENTPRO
// =====================================================

const { executeQuery } = require('../config/database');

class RecommendationEngine {
    constructor() {
        // Elementos recomendados por tipo de evento
        this.elementosPorTipo = {
            1: ['Salón', 'Catering', 'Decoración', 'Entretenimiento', 'Pastel'], // Cumpleaños
            2: ['Salón', 'Catering', 'Decoración', 'Fotografía', 'Música', 'Transporte', 'Vestimenta'], // Boda
            3: ['Salón', 'Catering', 'Equipos AV', 'Materiales', 'Networking'], // Corporativo
            4: ['Salón', 'Catering', 'Decoración', 'Música', 'Animación'] // Festejo
        };

        // Pesos para el algoritmo de scoring
        this.pesos = {
            calificacion: 0.35,      // 35% del score
            distancia: 0.25,         // 25% del score
            precio: 0.20,            // 20% del score
            disponibilidad: 0.15,    // 15% del score
            experiencia: 0.05        // 5% del score
        };
    }

    // =====================================================
    // MÉTODO PRINCIPAL DE RECOMENDACIONES
    // =====================================================

    async obtenerRecomendaciones(evento, presupuesto, ubicacion) {
        try {
            console.log(`🎯 Generando recomendaciones para evento tipo ${evento.tipo_evento_id}`);
            
            const elementos = this.elementosPorTipo[evento.tipo_evento_id] || [];
            const recomendaciones = {};
            
            // Distribuir presupuesto por elemento
            const presupuestoPorElemento = this.calcularPresupuestoPorElemento(presupuesto, elementos.length);
            
            for (const elemento of elementos) {
                console.log(`🔍 Buscando proveedores para: ${elemento}`);
                
                const proveedores = await this.buscarProveedores(
                    elemento, 
                    ubicacion, 
                    presupuestoPorElemento,
                    evento.num_invitados
                );
                
                // Ordenar por relevancia
                const proveedoresOrdenados = this.ordenarPorRelevancia(
                    proveedores, 
                    evento, 
                    ubicacion, 
                    presupuestoPorElemento
                );
                
                recomendaciones[elemento] = proveedoresOrdenados.slice(0, 3); // Top 3
            }
            
            return {
                evento_id: evento.id,
                elementos_recomendados: elementos,
                recomendaciones,
                presupuesto_distribuido: presupuestoPorElemento,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('❌ Error en motor de recomendaciones:', error);
            throw error;
        }
    }

    // =====================================================
    // BÚSQUEDA DE PROVEEDORES
    // =====================================================

    async buscarProveedores(elemento, ubicacion, presupuesto, numInvitados) {
        try {
            let query = `
                SELECT 
                    p.*,
                    ST_Distance_Sphere(
                        POINT(p.coordenadas_lng, p.coordenadas_lat), 
                        POINT(?, ?)
                    ) as distancia_metros
                FROM proveedores p
                WHERE p.tipo_servicio = ? 
                AND p.activo = TRUE
            `;
            
            let params = [ubicacion.lng, ubicacion.lat, elemento];
            
            // Filtro de presupuesto
            if (presupuesto > 0) {
                query += ` AND (p.precio_base + (p.precio_por_persona * ?)) <= ?`;
                params.push(numInvitados, presupuesto);
            }
            
            // Ordenar por calificación y distancia
            query += ` ORDER BY p.calificacion DESC, distancia_metros ASC`;
            
            const proveedores = await executeQuery(query, params);
            
            // Calcular precio total por proveedor
            return proveedores.map(proveedor => ({
                ...proveedor,
                precio_total: proveedor.precio_base + (proveedor.precio_por_persona * numInvitados),
                distancia_km: Math.round(proveedor.distancia_metros / 1000 * 100) / 100
            }));
            
        } catch (error) {
            console.error(`❌ Error buscando proveedores para ${elemento}:`, error);
            return [];
        }
    }

    // =====================================================
    // ALGORITMO DE SCORING INTELIGENTE
    // =====================================================

    ordenarPorRelevancia(proveedores, evento, ubicacion, presupuesto) {
        return proveedores.map(proveedor => {
            let score = 0;
            
            // 1. Calificación (35%)
            const calificacionScore = (proveedor.calificacion / 5) * this.pesos.calificacion;
            score += calificacionScore;
            
            // 2. Distancia (25%)
            const distanciaMaxima = 50000; // 50km
            const distanciaNormalizada = Math.max(0, 1 - (proveedor.distancia_metros / distanciaMaxima));
            const distanciaScore = distanciaNormalizada * this.pesos.distancia;
            score += distanciaScore;
            
            // 3. Precio (20%)
            const precioNormalizado = Math.max(0, 1 - (proveedor.precio_total / presupuesto));
            const precioScore = precioNormalizado * this.pesos.precio;
            score += precioScore;
            
            // 4. Disponibilidad (15%)
            const disponibilidadScore = this.calcularScoreDisponibilidad(proveedor, evento.fecha_evento) * this.pesos.disponibilidad;
            score += disponibilidadScore;
            
            // 5. Experiencia (5%)
            const experienciaScore = this.calcularScoreExperiencia(proveedor) * this.pesos.experiencia;
            score += experienciaScore;
            
            // Bonus por coincidencia perfecta
            if (proveedor.precio_total <= presupuesto * 0.8) {
                score += 0.1; // Bonus del 10%
            }
            
            return {
                ...proveedor,
                score: Math.round(score * 100) / 100,
                score_breakdown: {
                    calificacion: calificacionScore,
                    distancia: distanciaScore,
                    precio: precioScore,
                    disponibilidad: disponibilidadScore,
                    experiencia: experienciaScore
                }
            };
        }).sort((a, b) => b.score - a.score);
    }

    // =====================================================
    // CÁLCULOS AUXILIARES
    // =====================================================

    calcularPresupuestoPorElemento(presupuestoTotal, numElementos) {
        // Distribuir presupuesto de manera inteligente
        const distribucion = {
            1: 0.4,   // Salón: 40%
            2: 0.3,   // Catering: 30%
            3: 0.15,  // Decoración: 15%
            4: 0.1,   // Entretenimiento: 10%
            5: 0.05   // Otros: 5%
        };
        
        let presupuestoPorElemento = {};
        let presupuestoRestante = presupuestoTotal;
        
        for (let i = 0; i < numElementos; i++) {
            const porcentaje = distribucion[i + 1] || 0.05;
            presupuestoPorElemento[i] = Math.round(presupuestoTotal * porcentaje);
            presupuestoRestante -= presupuestoPorElemento[i];
        }
        
        // Ajustar si hay presupuesto restante
        if (presupuestoRestante > 0) {
            presupuestoPorElemento[0] += presupuestoRestante; // Dar al salón
        }
        
        return presupuestoPorElemento;
    }

    calcularScoreDisponibilidad(proveedor, fechaEvento) {
        try {
            if (!proveedor.disponibilidad) return 0.5; // Score neutral si no hay info
            
            const disponibilidad = JSON.parse(proveedor.disponibilidad);
            const fecha = new Date(fechaEvento);
            const diaSemana = fecha.getDay(); // 0 = Domingo, 1 = Lunes, etc.
            
            // Verificar disponibilidad para el día
            if (disponibilidad[diaSemana] === false) return 0; // No disponible
            if (disponibilidad[diaSemana] === true) return 1;  // Disponible
            
            return 0.5; // Disponibilidad parcial
        } catch (error) {
            return 0.5; // Score neutral si hay error
        }
    }

    calcularScoreExperiencia(proveedor) {
        // Basado en años de experiencia (si está disponible)
        // Por ahora, usar un score basado en calificación
        return proveedor.calificacion / 5;
    }

    // =====================================================
    // RECOMENDACIONES PERSONALIZADAS
    // =====================================================

    async obtenerRecomendacionesPersonalizadas(usuarioId, tipoEvento, preferencias = {}) {
        try {
            // Obtener historial de eventos del usuario
            const historial = await executeQuery(`
                SELECT 
                    e.tipo_evento_id,
                    el.proveedor_id,
                    p.tipo_servicio,
                    c.calificacion
                FROM eventos e
                JOIN elementos_evento el ON e.id = el.evento_id
                JOIN proveedores p ON el.proveedor_id = p.id
                LEFT JOIN calificaciones c ON c.proveedor_id = p.id AND c.usuario_id = e.usuario_id
                WHERE e.usuario_id = ? AND e.estado = 'completado'
                ORDER BY e.fecha_evento DESC
                LIMIT 10
            `, [usuarioId]);
            
            // Analizar preferencias del usuario
            const preferenciasUsuario = this.analizarPreferenciasUsuario(historial);
            
            // Aplicar preferencias a las recomendaciones
            return this.aplicarPreferenciasUsuario(preferenciasUsuario, tipoEvento);
            
        } catch (error) {
            console.error('❌ Error en recomendaciones personalizadas:', error);
            return null;
        }
    }

    analizarPreferenciasUsuario(historial) {
        const preferencias = {
            proveedores_favoritos: {},
            tipos_servicio_preferidos: {},
            rangos_precio: {}
        };
        
        historial.forEach(item => {
            // Contar proveedores favoritos
            if (item.proveedor_id) {
                preferencias.proveedores_favoritos[item.proveedor_id] = 
                    (preferencias.proveedores_favoritos[item.proveedor_id] || 0) + 1;
            }
            
            // Contar tipos de servicio preferidos
            if (item.tipo_servicio) {
                preferencias.tipos_servicio_preferidos[item.tipo_servicio] = 
                    (preferencias.tipos_servicio_preferidos[item.tipo_servicio] || 0) + 1;
            }
        });
        
        return preferencias;
    }

    aplicarPreferenciasUsuario(preferencias, tipoEvento) {
        // Implementar lógica para aplicar preferencias
        // Por ahora, retornar las preferencias analizadas
        return {
            tipo_evento: tipoEvento,
            preferencias,
            timestamp: new Date().toISOString()
        };
    }

    // =====================================================
    // OPTIMIZACIÓN DE PRESUPUESTO
    // =====================================================

    async optimizarPresupuesto(evento, presupuesto) {
        try {
            const elementos = this.elementosPorTipo[evento.tipo_evento_id] || [];
            const optimizacion = {};
            
            for (const elemento of elementos) {
                const proveedores = await this.buscarProveedores(
                    elemento, 
                    { lat: 0, lng: 0 }, // Ubicación neutral para optimización
                    presupuesto * 0.3, // 30% del presupuesto por elemento
                    evento.num_invitados
                );
                
                if (proveedores.length > 0) {
                    // Encontrar la mejor relación calidad-precio
                    const mejorOpcion = proveedores.reduce((mejor, actual) => {
                        const ratioMejor = mejor.calificacion / mejor.precio_total;
                        const ratioActual = actual.calificacion / actual.precio_total;
                        return ratioActual > ratioMejor ? actual : mejor;
                    });
                    
                    optimizacion[elemento] = {
                        proveedor: mejorOpcion,
                        precio_optimizado: mejorOpcion.precio_total,
                        ratio_calidad_precio: (mejorOpcion.calificacion / mejorOpcion.precio_total).toFixed(4)
                    };
                }
            }
            
            return {
                evento_id: evento.id,
                presupuesto_original: presupuesto,
                optimizacion,
                presupuesto_total_optimizado: Object.values(optimizacion)
                    .reduce((total, item) => total + item.precio_optimizado, 0),
                ahorro: presupuesto - Object.values(optimizacion)
                    .reduce((total, item) => total + item.precio_optimizado, 0)
            };
            
        } catch (error) {
            console.error('❌ Error en optimización de presupuesto:', error);
            throw error;
        }
    }
}

module.exports = new RecommendationEngine();
