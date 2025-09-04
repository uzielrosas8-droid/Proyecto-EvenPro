-- =====================================================
-- BASE DE DATOS EVENTPRO - SISTEMA ORGANIZADOR DE EVENTOS
-- =====================================================

-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS eventpro_db;
USE eventpro_db;

-- =====================================================
-- TABLA DE USUARIOS
-- =====================================================
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso TIMESTAMP NULL,
    activo BOOLEAN DEFAULT TRUE
);

-- =====================================================
-- TABLA DE TIPOS DE EVENTO
-- =====================================================
CREATE TABLE tipos_evento (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    icono VARCHAR(50),
    elementos_recomendados JSON NOT NULL,
    presupuesto_minimo DECIMAL(10,2) DEFAULT 0,
    presupuesto_maximo DECIMAL(10,2) DEFAULT 999999,
    color_tema VARCHAR(7) DEFAULT '#6366f1'
);

-- =====================================================
-- TABLA DE PROVEEDORES
-- =====================================================
CREATE TABLE proveedores (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(200) NOT NULL,
    tipo_servicio VARCHAR(100) NOT NULL,
    descripcion TEXT,
    ubicacion VARCHAR(200) NOT NULL,
    coordenadas_lat DECIMAL(10,8),
    coordenadas_lng DECIMAL(11,8),
    precio_base DECIMAL(10,2) NOT NULL,
    precio_por_persona DECIMAL(8,2) DEFAULT 0,
    disponibilidad JSON,
    calificacion DECIMAL(3,2) DEFAULT 0,
    telefono VARCHAR(20),
    email VARCHAR(100),
    sitio_web VARCHAR(200),
    imagenes JSON,
    servicios_incluidos JSON,
    restricciones TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

-- =====================================================
-- TABLA DE EVENTOS
-- =====================================================
CREATE TABLE eventos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    tipo_evento_id INT NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    fecha_evento DATE NOT NULL,
    hora_inicio TIME,
    hora_fin TIME,
    ubicacion VARCHAR(200) NOT NULL,
    coordenadas_lat DECIMAL(10,8),
    coordenadas_lng DECIMAL(11,8),
    num_invitados INT NOT NULL,
    presupuesto DECIMAL(10,2) NOT NULL,
    estado ENUM('planificando', 'confirmado', 'en_progreso', 'completado', 'cancelado') DEFAULT 'planificando',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (tipo_evento_id) REFERENCES tipos_evento(id)
);

-- =====================================================
-- TABLA DE ELEMENTOS DEL EVENTO
-- =====================================================
CREATE TABLE elementos_evento (
    id INT PRIMARY KEY AUTO_INCREMENT,
    evento_id INT NOT NULL,
    proveedor_id INT,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    cantidad INT DEFAULT 1,
    subtotal DECIMAL(10,2) NOT NULL,
    estado ENUM('pendiente', 'confirmado', 'cancelado') DEFAULT 'pendiente',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE,
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id)
);

-- =====================================================
-- TABLA DE CRONOGRAMAS
-- =====================================================
CREATE TABLE cronogramas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    evento_id INT NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    responsable VARCHAR(100),
    estado ENUM('pendiente', 'en_progreso', 'completado') DEFAULT 'pendiente',
    orden INT DEFAULT 0,
    FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLA DE INVITADOS
-- =====================================================
CREATE TABLE invitados (
    id INT PRIMARY KEY AUTO_INCREMENT,
    evento_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    telefono VARCHAR(20),
    confirmado BOOLEAN DEFAULT FALSE,
    fecha_confirmacion TIMESTAMP NULL,
    notas TEXT,
    FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLA DE CALIFICACIONES
-- =====================================================
CREATE TABLE calificaciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    proveedor_id INT NOT NULL,
    evento_id INT NOT NULL,
    calificacion INT NOT NULL CHECK (calificacion >= 1 AND calificacion <= 5),
    comentario TEXT,
    fecha_calificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (proveedor_id) REFERENCES proveedores(id),
    FOREIGN KEY (evento_id) REFERENCES eventos(id),
    UNIQUE KEY unique_calificacion (usuario_id, proveedor_id, evento_id)
);

-- =====================================================
-- INSERTAR DATOS DE EJEMPLO
-- =====================================================

-- Tipos de evento
INSERT INTO tipos_evento (nombre, descripcion, icono, elementos_recomendados, presupuesto_minimo, presupuesto_maximo, color_tema) VALUES
('Cumpleaños', 'Celebración de cumpleaños para todas las edades', '🎂', '["Salón", "Catering", "Decoración", "Entretenimiento", "Pastel"]', 1000, 50000, '#FF6B6B'),
('Boda', 'Ceremonia y recepción de boda', '💒', '["Salón", "Catering", "Decoración", "Fotografía", "Música", "Transporte", "Vestimenta"]', 50000, 500000, '#A8E6CF'),
('Evento Corporativo', 'Eventos empresariales y conferencias', '🏢', '["Salón", "Catering", "Equipos AV", "Materiales", "Networking"]', 5000, 100000, '#4ECDC4'),
('Festejo', 'Celebraciones generales y fiestas', '🎉', '["Salón", "Catering", "Decoración", "Música", "Animación"]', 2000, 100000, '#FFE66D');

-- Proveedores de ejemplo
INSERT INTO proveedores (nombre, tipo_servicio, descripcion, ubicacion, coordenadas_lat, coordenadas_lng, precio_base, precio_por_persona, calificacion, telefono, email) VALUES
('Salón Elegante', 'Salón', 'Salón de eventos elegante con capacidad para 200 personas', 'Centro Comercial Plaza Mayor', 19.4326, -99.1332, 15000, 0, 4.8, '+52 55 1234 5678', 'info@salonelegante.com'),
('Catering Gourmet', 'Catering', 'Servicio de catering de alta calidad con opciones vegetarianas', 'Zona Rosa', 19.4200, -99.1600, 8000, 150, 4.9, '+52 55 8765 4321', 'contacto@cateringgourmet.com'),
('Decoraciones Mágicas', 'Decoración', 'Decoración temática personalizada para todo tipo de eventos', 'Colonia Roma', 19.4100, -99.1500, 5000, 0, 4.7, '+52 55 5555 1234', 'decoraciones@magicas.com'),
('Música en Vivo', 'Entretenimiento', 'Grupo musical versátil para eventos sociales', 'Polanco', 19.4300, -99.1900, 12000, 0, 4.6, '+52 55 9876 5432', 'musica@enviovivo.com'),
('Fotografía Profesional', 'Fotografía', 'Servicio fotográfico completo con álbum digital', 'Condesa', 19.4150, -99.1650, 15000, 0, 4.9, '+52 55 1111 2222', 'fotos@profesional.com'),
('Salón Corporativo', 'Salón', 'Salón moderno para eventos empresariales', 'Santa Fe', 19.3800, -99.2600, 20000, 0, 4.5, '+52 55 3333 4444', 'corporativo@salon.com'),
('Catering Empresarial', 'Catering', 'Catering especializado en eventos corporativos', 'Reforma', 19.4250, -99.1550, 10000, 200, 4.8, '+52 55 5555 6666', 'empresarial@catering.com'),
('Equipos AV Pro', 'Equipos AV', 'Alquiler de equipos de audio y video profesionales', 'Centro Histórico', 19.4320, -99.1330, 8000, 0, 4.7, '+52 55 7777 8888', 'av@equipospro.com');

-- Usuario de ejemplo
INSERT INTO usuarios (nombre, email, password_hash, telefono) VALUES
('Carlos Mendoza', 'carlos@eventpro.com', '$2b$10$example_hash_here', '+52 55 9999 0000');

-- =====================================================
-- ÍNDICES PARA OPTIMIZAR CONSULTAS
-- =====================================================
CREATE INDEX idx_eventos_usuario ON eventos(usuario_id);
CREATE INDEX idx_eventos_fecha ON eventos(fecha_evento);
CREATE INDEX idx_eventos_estado ON eventos(estado);
CREATE INDEX idx_proveedores_tipo ON proveedores(tipo_servicio);
CREATE INDEX idx_proveedores_ubicacion ON proveedores(coordenadas_lat, coordenadas_lng);
CREATE INDEX idx_elementos_evento ON elementos_evento(evento_id);
CREATE INDEX idx_calificaciones_proveedor ON calificaciones(proveedor_id);

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista de eventos con información completa
CREATE VIEW vista_eventos_completos AS
SELECT 
    e.id,
    e.nombre,
    e.fecha_evento,
    e.ubicacion,
    e.num_invitados,
    e.presupuesto,
    e.estado,
    u.nombre as usuario_nombre,
    te.nombre as tipo_evento,
    te.color_tema,
    COUNT(el.id) as elementos_confirmados,
    SUM(el.subtotal) as costo_total
FROM eventos e
JOIN usuarios u ON e.usuario_id = u.id
JOIN tipos_evento te ON e.tipo_evento_id = te.id
LEFT JOIN elementos_evento el ON e.id = el.evento_id AND el.estado = 'confirmado'
GROUP BY e.id;

-- Vista de proveedores con calificaciones
CREATE VIEW vista_proveedores_calificados AS
SELECT 
    p.*,
    AVG(c.calificacion) as calificacion_promedio,
    COUNT(c.id) as num_calificaciones
FROM proveedores p
LEFT JOIN calificaciones c ON p.id = c.proveedor_id
GROUP BY p.id;

-- =====================================================
-- PROCEDIMIENTOS ALMACENADOS
-- =====================================================

-- Procedimiento para crear un evento completo
DELIMITER //
CREATE PROCEDURE CrearEventoCompleto(
    IN p_usuario_id INT,
    IN p_tipo_evento_id INT,
    IN p_nombre VARCHAR(200),
    IN p_fecha_evento DATE,
    IN p_ubicacion VARCHAR(200),
    IN p_invitados INT,
    IN p_presupuesto DECIMAL(10,2)
)
BEGIN
    DECLARE v_evento_id INT;
    
    -- Crear el evento
    INSERT INTO eventos (usuario_id, tipo_evento_id, nombre, fecha_evento, ubicacion, num_invitados, presupuesto)
    VALUES (p_usuario_id, p_tipo_evento_id, p_nombre, p_fecha_evento, p_ubicacion, p_invitados, p_presupuesto);
    
    SET v_evento_id = LAST_INSERT_ID();
    
    -- Crear cronograma básico
    INSERT INTO cronogramas (evento_id, titulo, descripcion, hora_inicio, hora_fin, orden)
    VALUES 
        (v_evento_id, 'Preparación', 'Preparación del evento', '08:00:00', '10:00:00', 1),
        (v_evento_id, 'Evento Principal', 'Evento principal', '10:00:00', '18:00:00', 2),
        (v_evento_id, 'Limpieza', 'Limpieza y desmontaje', '18:00:00', '20:00:00', 3);
    
    SELECT v_evento_id as evento_id;
END //
DELIMITER ;

-- Procedimiento para calcular presupuesto recomendado
DELIMITER //
CREATE PROCEDURE CalcularPresupuestoRecomendado(
    IN p_tipo_evento_id INT,
    IN p_num_invitados INT
)
BEGIN
    DECLARE v_presupuesto_min DECIMAL(10,2);
    DECLARE v_presupuesto_max DECIMAL(10,2);
    
    SELECT presupuesto_minimo, presupuesto_maximo 
    INTO v_presupuesto_min, v_presupuesto_max
    FROM tipos_evento 
    WHERE id = p_tipo_evento_id;
    
    -- Cálculo basado en número de invitados
    SET v_presupuesto_min = v_presupuesto_min + (p_num_invitados * 200);
    SET v_presupuesto_max = v_presupuesto_max + (p_num_invitados * 500);
    
    SELECT 
        v_presupuesto_min as presupuesto_minimo_recomendado,
        v_presupuesto_max as presupuesto_maximo_recomendado,
        (v_presupuesto_min + v_presupuesto_max) / 2 as presupuesto_promedio;
END //
DELIMITER ;
