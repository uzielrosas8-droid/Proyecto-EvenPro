# 🎉 EventPro - Sistema de Creación de Eventos

**EventPro** - Creando eventos perfectos, paso a paso 🎉

## 📋 Descripción

EventPro es un sistema web completo y moderno para la creación y gestión de eventos. Ofrece una interfaz intuitiva con un tutorial interactivo que guía a los usuarios a través de todo el proceso de creación de eventos, desde la selección del tipo hasta la confirmación final.

## ✨ Características Principales

### 🎯 **Sistema de Pasos Inteligente**
- **4 pasos bien definidos** para crear eventos
- **Barra de progreso visual** que muestra el avance
- **Navegación intuitiva** entre pasos
- **Validación automática** de campos obligatorios

### 🎓 **Tutorial Interactivo Completo**
- **Modal informativo** con explicaciones detalladas
- **Tutorial interactivo** con spotlight visual
- **Guía paso a paso** con indicadores visuales
- **Acceso múltiple** al tutorial (botón, tecla F1, hints)

### 💰 **Calculador de Presupuesto Avanzado**
- **Cálculo automático** en tiempo real
- **Categorías organizadas** (Catering, Decoración, Entretenimiento, Servicios)
- **Desglose detallado** de costos
- **Valores predefinidos** para facilitar el uso

### 🎨 **Interfaz Moderna y Responsiva**
- **Diseño responsive** para todos los dispositivos
- **Animaciones suaves** y transiciones elegantes
- **Colores modernos** y tipografía clara
- **Iconografía intuitiva** con emojis y FontAwesome

## 🚀 Cómo Usar EventPro

### 1. **Acceso al Sistema**
- Abre `crear-evento.html` en tu navegador
- Verás la página principal con el header y la barra de progreso

### 2. **Paso 1: Seleccionar Tipo de Evento**
- **¿Qué hacer?** Haz clic en una de las 4 tarjetas de tipo de evento:
  - 🎂 **Cumpleaños** - Para celebraciones personales
  - 💒 **Boda** - Para ceremonias nupciales
  - 🏢 **Evento Corporativo** - Para reuniones empresariales
  - 🎉 **Festejo** - Para celebraciones generales
- **Resultado** La tarjeta seleccionada se resalta en azul
- **Siguiente** El botón "Continuar" se habilita automáticamente

### 3. **Paso 2: Detalles del Evento**
- **Campos obligatorios** (marcados con *):
  - **Nombre del Evento**: Escribe un título descriptivo
  - **Fecha del Evento**: Selecciona la fecha en el calendario
  - **Hora de Inicio**: Elige la hora de comienzo
  - **Ubicación**: Escribe la dirección o lugar
  - **Número de Invitados**: Ingresa la cantidad de personas
- **Campo opcional**:
  - **Descripción**: Agrega detalles adicionales del evento
- **Validación**: El botón "Calcular Presupuesto" se habilita cuando completes los campos obligatorios

### 4. **Paso 3: Calculador de Presupuesto**
- **Catering y Alimentación**:
  - Platos por persona (ej: 1)
  - Costo por plato en ARS (ej: 500)
  - Bebidas por persona en ARS (ej: 200)
- **Decoración y Ambientación**:
  - Decoración básica en ARS (ej: 1000)
  - Flores y arreglos en ARS (ej: 800)
  - Iluminación especial en ARS (ej: 500)
- **Entretenimiento y Música**:
  - DJ o Músico en ARS (ej: 2000)
  - Equipos de sonido en ARS (ej: 800)
- **Servicios Adicionales**:
  - Fotógrafo en ARS (ej: 1500)
  - Videógrafo en ARS (ej: 2000)
  - Otros servicios en ARS (ej: 500)
- **Resultado**: El presupuesto total se calcula automáticamente y se muestra con desglose detallado

### 5. **Paso 4: Confirmación y Recomendaciones**
- **Resumen del evento**: Revisa todos los datos ingresados
- **Recomendaciones personalizadas**: Basadas en el tipo de evento seleccionado
- **Finalización**: Haz clic en "Finalizar Evento" para completar el proceso

## 🎓 Sistema de Tutorial

### **Modal Informativo**
- **Acceso**: Botón "¿Cómo usar?" en el header o "Ver Tutorial" en la barra de progreso
- **Contenido**: 4 pasos detallados con explicaciones completas
- **Navegación**: Botones anterior/siguiente para recorrer los pasos
- **Características**: Explicaciones visuales, tips útiles y ejemplos prácticos

### **Tutorial Interactivo**
- **Acceso**: Botón "Iniciar Tutorial Interactivo" en el modal
- **Funcionamiento**: 
  - Se cierra el modal informativo
  - Se resalta el primer paso en la interfaz principal
  - Aparece un spotlight que guía al usuario
  - El tutorial avanza automáticamente al completar cada acción
- **Indicadores visuales**:
  - **Spotlight**: Crea un "hueco" visual que resalta elementos específicos
  - **Resaltado**: Los pasos de la barra de progreso se iluminan
  - **Mensajes contextuales**: Instrucciones específicas para cada paso

### **Atajos de Teclado**
- **F1**: Abre el tutorial desde cualquier lugar
- **Enter/Espacio**: Activa elementos seleccionados con el teclado

## 🎨 Características de UX/UI

### **Animaciones y Transiciones**
- **Fade In**: Entrada suave de elementos
- **Hover Effects**: Efectos visuales al pasar el mouse
- **Transformaciones**: Escalado y movimiento de elementos interactivos
- **Transiciones**: Cambios suaves entre estados

### **Feedback Visual**
- **Estados de campos**: Normal, focus, error, éxito
- **Mensajes de sistema**: Notificaciones animadas (éxito, error, info, advertencia)
- **Indicadores de progreso**: Barra de progreso y pasos numerados
- **Validación en tiempo real**: Feedback inmediato de campos obligatorios

### **Responsividad**
- **Mobile First**: Diseño optimizado para dispositivos móviles
- **Breakpoints**: Adaptación automática a diferentes tamaños de pantalla
- **Touch Friendly**: Elementos optimizados para interacción táctil
- **Navegación adaptativa**: Menús que se ajustan al espacio disponible

## 🔧 Funcionalidades Técnicas

### **Gestión de Estado**
- **Variables globales**: Control del paso actual y datos del evento
- **Local Storage**: Persistencia de datos del evento
- **Validación**: Verificación automática de campos obligatorios
- **Navegación**: Control de flujo entre pasos

### **Event Listeners**
- **Click events**: Para tipos de evento y botones de navegación
- **Input events**: Para validación en tiempo real
- **Keyboard events**: Para accesibilidad y atajos
- **Focus events**: Para indicadores visuales

### **Cálculos Automáticos**
- **Presupuesto**: Suma automática de todas las categorías
- **Validación**: Verificación de campos numéricos
- **Actualización**: Cálculo en tiempo real mientras se escriben valores
- **Formateo**: Presentación de números en formato argentino (ARS)

## 📱 Compatibilidad

### **Navegadores Soportados**
- ✅ Chrome (recomendado)
- ✅ Firefox
- ✅ Safari
- ✅ Edge

### **Dispositivos**
- ✅ **Desktop**: Pantallas grandes y medianas
- ✅ **Tablet**: Dispositivos táctiles medianos
- ✅ **Mobile**: Smartphones y dispositivos pequeños

### **Resoluciones**
- **Desktop**: 1920x1080, 1366x768, 1440x900
- **Tablet**: 768x1024, 1024x768
- **Mobile**: 375x667, 414x896, 360x640

## 🚀 Instalación y Uso

### **Requisitos**
- Navegador web moderno
- Conexión a internet (para FontAwesome y CDNs)

### **Archivos del Proyecto**
```
EventPro/
├── crear-evento.html      # Página principal
├── crear-evento.css       # Estilos y diseño
├── crear-evento.js        # Lógica y funcionalidades
├── test-tutorial.html     # Archivo de pruebas
├── Base.html             # Página del dashboard
├── Inicio Sesion.html    # Página de inicio
├── conoce-mas.html       # Página informativa
└── README.md             # Este archivo
```

### **Cómo Ejecutar**
1. Descarga todos los archivos en una carpeta
2. Abre `crear-evento.html` en tu navegador
3. ¡Comienza a crear eventos!

### **Pruebas**
- Usa `test-tutorial.html` para probar funcionalidades específicas
- Verifica que todos los botones y formularios funcionen
- Prueba la responsividad en diferentes dispositivos

## 🎯 Casos de Uso

### **Eventos Personales**
- **Cumpleaños**: Fiestas de todas las edades
- **Aniversarios**: Celebración de relaciones
- **Graduaciones**: Logros académicos
- **Reuniones familiares**: Encuentros informales

### **Eventos Profesionales**
- **Conferencias**: Eventos corporativos
- **Seminarios**: Capacitaciones y workshops
- **Lanzamientos**: Presentación de productos
- **Networking**: Eventos de conexión profesional

### **Eventos Especiales**
- **Bodas**: Ceremonias nupciales
- **Quinceañeras**: Celebraciones tradicionales
- **Eventos de caridad**: Recaudación de fondos
- **Festivales**: Eventos culturales y artísticos

## 🔍 Solución de Problemas

### **Problemas Comunes**

#### **El tutorial no avanza**
- **Causa**: Campos obligatorios no completados
- **Solución**: Completa todos los campos marcados con *
- **Verificación**: Los botones se habilitan automáticamente

#### **El presupuesto no se calcula**
- **Causa**: Campos numéricos vacíos o inválidos
- **Solución**: Ingresa solo números en los campos de presupuesto
- **Verificación**: Los valores se actualizan en tiempo real

#### **La página no se ve bien en móvil**
- **Causa**: Navegador no compatible o cache desactualizado
- **Solución**: Actualiza el navegador y limpia la cache
- **Verificación**: Usa el modo desarrollador para simular dispositivos

### **Debug y Logs**
- **Console**: Abre las herramientas de desarrollador (F12)
- **Logs**: Los mensajes importantes aparecen en la consola
- **Errores**: Los errores JavaScript se muestran en rojo

## 🚀 Futuras Mejoras

### **Funcionalidades Planificadas**
- **Sistema de usuarios**: Registro y login
- **Historial de eventos**: Guardado de eventos anteriores
- **Exportación**: PDF y Excel de presupuestos
- **Integración**: APIs de proveedores de servicios
- **Notificaciones**: Recordatorios por email/SMS

### **Mejoras Técnicas**
- **PWA**: Aplicación web progresiva
- **Offline**: Funcionamiento sin conexión
- **Base de datos**: Persistencia en servidor
- **API REST**: Backend para gestión de eventos
- **Testing**: Suite de pruebas automatizadas

## 📞 Soporte y Contacto

### **Documentación**
- **README**: Este archivo con instrucciones completas
- **Código comentado**: Explicaciones en el código fuente
- **Ejemplos**: Casos de uso en el tutorial

### **Comunidad**
- **Issues**: Reporta problemas en el repositorio
- **Sugerencias**: Propón nuevas funcionalidades
- **Contribuciones**: Ayuda a mejorar el proyecto

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Puedes usar, modificar y distribuir libremente.

---

**🎉 ¡Gracias por usar EventPro! 🎉**

*Creando eventos perfectos, paso a paso*
