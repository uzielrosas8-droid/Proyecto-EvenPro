// =====================================================
// RUTAS DE AUTENTICACIÓN EVENTPRO
// =====================================================

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { executeQuery } = require('../config/database');

const router = express.Router();

// =====================================================
// REGISTRO DE USUARIO
// =====================================================

router.post('/register', [
    body('nombre').notEmpty().withMessage('El nombre es requerido'),
    body('email').isEmail().withMessage('Email válido requerido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('telefono').optional().isMobilePhone().withMessage('Teléfono válido requerido')
], async (req, res) => {
    try {
        // Validar entrada
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { nombre, email, password, telefono } = req.body;

        // Verificar si el usuario ya existe
        const existingUser = await executeQuery(
            'SELECT id FROM usuarios WHERE email = ?',
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({
                error: 'El email ya está registrado'
            });
        }

        // Hash de la contraseña
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Crear usuario
        const result = await executeQuery(
            'INSERT INTO usuarios (nombre, email, password_hash, telefono) VALUES (?, ?, ?, ?)',
            [nombre, email, passwordHash, telefono]
        );

        // Generar JWT
        const token = jwt.sign(
            { userId: result.insertId, email },
            process.env.JWT_SECRET || 'default_secret',
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        res.status(201).json({
            mensaje: 'Usuario registrado exitosamente',
            usuario: {
                id: result.insertId,
                nombre,
                email,
                telefono
            },
            token
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
});

// =====================================================
// INICIO DE SESIÓN
// =====================================================

router.post('/login', [
    body('email').isEmail().withMessage('Email válido requerido'),
    body('password').notEmpty().withMessage('La contraseña es requerida')
], async (req, res) => {
    try {
        // Validar entrada
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Buscar usuario
        const users = await executeQuery(
            'SELECT * FROM usuarios WHERE email = ? AND activo = TRUE',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                error: 'Credenciales inválidas'
            });
        }

        const user = users[0];

        // Verificar contraseña
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({
                error: 'Credenciales inválidas'
            });
        }

        // Actualizar último acceso
        await executeQuery(
            'UPDATE usuarios SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id = ?',
            [user.id]
        );

        // Generar JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET || 'default_secret',
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        res.json({
            mensaje: 'Inicio de sesión exitoso',
            usuario: {
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                telefono: user.telefono
            },
            token
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
});

// =====================================================
// VERIFICAR TOKEN
// =====================================================

router.get('/verify', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                error: 'Token no proporcionado'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
        
        // Buscar usuario
        const users = await executeQuery(
            'SELECT id, nombre, email, telefono FROM usuarios WHERE id = ? AND activo = TRUE',
            [decoded.userId]
        );

        if (users.length === 0) {
            return res.status(401).json({
                error: 'Usuario no encontrado'
            });
        }

        res.json({
            usuario: users[0],
            token_valido: true
        });

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: 'Token inválido'
            });
        }
        
        console.error('Error verificando token:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
});

// =====================================================
// CERRAR SESIÓN
// =====================================================

router.post('/logout', (req, res) => {
    // En JWT, el logout se maneja del lado del cliente
    // eliminando el token del localStorage
    res.json({
        mensaje: 'Sesión cerrada exitosamente'
    });
});

module.exports = router;
