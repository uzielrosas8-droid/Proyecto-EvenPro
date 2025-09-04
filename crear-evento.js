// Variables globales para el estado del evento
let currentStep = 1;
let selectedEventType = null;
let eventData = {
    type: null,
    name: '',
    date: '',
    time: '',
    location: '',
    description: '',
    budget: '',
    guests: ''
};

// Inicializar variable global para el paso actual
window.currentStep = 1;

// Variables del tutorial
let currentTutorialStep = 1;
let tutorialActive = false;

// Inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    initializeEventTypes();
    updateProgressBar();
    showStep(currentStep);
    
    // Mostrar mensaje de bienvenida solo la primera vez
    showWelcomeMessage();
    
    // Agregar indicadores visuales para campos obligatorios
    addRequiredFieldIndicators();
    
    // Agregar tooltips informativos
    addInformativeTooltips();
    
    // Mejorar la accesibilidad del teclado
    improveKeyboardAccessibility();
    
    // Event listeners para el tutorial
    setupTutorialEventListeners();

    // Configurar cálculo del presupuesto
    setupBudgetCalculation();
});

// Inicializar los tipos de evento con event listeners
function initializeEventTypes() {
    const eventTypes = document.querySelectorAll('.event-type');
    
    eventTypes.forEach(type => {
        type.addEventListener('click', function() {
            // Remover selección previa
            eventTypes.forEach(t => t.classList.remove('selected'));
            
            // Seleccionar el actual
            this.classList.add('selected');
            
            // Guardar datos del tipo seleccionado
            selectedEventType = {
                id: this.dataset.id,
                name: this.dataset.name
            };
            
            eventData.type = selectedEventType;
            
            // Habilitar el botón de continuar
            const continueBtn = document.getElementById('step1ContinueBtn');
            if (continueBtn) {
                continueBtn.disabled = false;
                continueBtn.classList.remove('btn-disabled');
            }
            
            // Mostrar mensaje de confirmación
            showMessage('Tipo de evento seleccionado: ' + selectedEventType.name, 'success');
            
            // Si el tutorial está activo, avanzar automáticamente
            if (tutorialActive && currentTutorialStep === 1) {
                setTimeout(() => {
                    currentTutorialStep = 2;
                    showTutorialMessage(2);
                    goToStep(2);
                    positionSpotlight(2);
                    highlightRequiredFields();
                }, 1000);
            }
        });
    });
}

// Navegar al siguiente paso
function nextStep() {
    // Validación antes de avanzar
    if (!validateCurrentStep()) {
        showMessage('Por favor completa la información requerida antes de continuar.', 'error', 4000);
        return;
    }
    if (window.currentStep < 4) {
        window.currentStep++;
        goToStep(window.currentStep);
    }
}

function prevStep() {
    if (window.currentStep > 1) {
        window.currentStep--;
        goToStep(window.currentStep);
    }
}

// Mostrar un paso específico
function showStep(stepNumber) {
    // Ocultar todos los pasos
    const steps = document.querySelectorAll('.form-step');
    steps.forEach(step => step.classList.remove('active'));
    
    // Mostrar el paso actual
    const currentStepElement = document.getElementById(`step-${stepNumber}`);
    if (currentStepElement) {
        currentStepElement.classList.add('active');
    }
    
    // Actualizar botones de navegación
    updateNavigationButtons();
    
    // Ejecutar lógica específica del paso
    switch(stepNumber) {
        case 2:
            loadStep2Data();
            break;
        case 3:
            loadStep3Data();
            break;
        case 4:
            loadStep4Data();
            break;
    }
    
    // Actualizar la variable global currentStep
    window.currentStep = stepNumber;
}

// Actualizar la barra de progreso
function updateProgressBar() {
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
        const progress = (window.currentStep / 4) * 100; // Paso 1 => 25%
        progressFill.style.width = progress + '%';
    }
    
    // Actualizar los pasos de progreso
    const progressSteps = document.querySelectorAll('.progress-step');
    progressSteps.forEach((step, index) => {
        if (index + 1 <= window.currentStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
}

// Validar el paso actual
function validateCurrentStep() {
    switch(window.currentStep) {
        case 1:
            // El paso 1 siempre es válido (solo selección de tipo)
            return !!selectedEventType; // exigir selección de tipo
        case 2:
            // Validar campos obligatorios del paso 2 y marcar errores
            const requiredFields = ['eventName', 'eventDate', 'eventTime', 'eventLocation', 'eventGuests'];
            let allValid = true;
            let firstInvalid = null;
            requiredFields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field) {
                    const valid = field.value && field.value.toString().trim() !== '';
                    field.classList.toggle('error', !valid);
                    if (!valid && !firstInvalid) firstInvalid = field;
                    allValid = allValid && valid;
                }
            });
            if (!allValid && firstInvalid) {
                firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstInvalid.focus();
            }
            return allValid;
        case 3:
            // Requerir al menos un campo de presupuesto con valor > 0
            const budgetFields = ['platosPorPersona','costoPlato','costoBebidas','decoracionBasica','floresArreglos','iluminacionEspecial','entretenimiento','equiposSonido','fotografo','videografo','otrosServicios'];
            const hasAny = budgetFields.some(id => {
                const el = document.getElementById(id);
                return el && el.value && parseFloat(el.value) > 0;
            });
            if (!hasAny) {
                // Marcar todos los campos de presupuesto como requeridos hasta que alguno tenga valor > 0
                budgetFields.forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.classList.add('error');
                });
                const first = document.getElementById('platosPorPersona') || document.getElementById('decoracionBasica');
                if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                // Limpiar marcas de error si ya hay alguno
                budgetFields.forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.classList.remove('error');
                });
            }
            return hasAny;
        case 4:
            // El paso 4 es solo confirmación
            return true;
        default:
            return false;
    }
}

// Cargar datos del paso 2
function loadStep2Data() {
    // Pre-llenar el tipo de evento seleccionado
    if (selectedEventType) {
        const eventTypeDisplay = document.getElementById('eventTypeDisplay');
        if (eventTypeDisplay) {
            eventTypeDisplay.textContent = selectedEventType.name;
        }
    }
}

// Cargar datos del paso 3 (Calculador de Presupuesto)
function loadStep3Data() {
    // Cargar datos del paso 2 desde localStorage
    const savedData = localStorage.getItem('eventData');
    if (savedData) {
        const parsedData = JSON.parse(savedData);
        eventData = { ...eventData, ...parsedData };
        
        // Llenar campos del paso 2 si existen
        if (eventData.name) document.getElementById('eventName').value = eventData.name;
        if (eventData.date) document.getElementById('eventDate').value = eventData.date;
        if (eventData.time) document.getElementById('eventTime').value = eventData.time;
        if (eventData.location) document.getElementById('eventLocation').value = eventData.location;
        if (eventData.guests) document.getElementById('eventGuests').value = eventData.guests;
        if (eventData.description) document.getElementById('eventDescription').value = eventData.description;
    }
    
    // Cargar datos de presupuesto si existen
    const savedBudget = localStorage.getItem('eventBudget');
    if (savedBudget) {
        const budgetData = JSON.parse(savedBudget);
        Object.keys(budgetData).forEach(key => {
            const field = document.getElementById(key);
            if (field) {
                field.value = budgetData[key];
            }
        });
        
        // Recalcular presupuesto
        calcularPresupuesto();
    }
}

// Cargar datos del paso 4
function loadStep4Data() {
    // Cargar todos los datos del evento
    const savedData = localStorage.getItem('eventData');
    if (savedData) {
        const parsedData = JSON.parse(savedData);
        eventData = { ...eventData, ...parsedData };
    }
    
    // Cargar datos de presupuesto
    const savedBudget = localStorage.getItem('eventBudget');
    if (savedBudget) {
        const budgetData = JSON.parse(savedBudget);
        eventData.budget = budgetData;
    }
    
    // Mostrar resumen del evento
    showEventSummary();
}

// Cargar recomendaciones
function loadRecommendations() {
    const recommendationsContainer = document.getElementById('recommendations');
    if (!recommendationsContainer) return;
    
    // Obtener el tipo de evento seleccionado
    const selectedType = eventData.type || 'general';
    
    // Definir recomendaciones por tipo de evento
    const recommendations = {
        'cumpleaños': [
            { title: '🎂 Pastel Personalizado', description: 'Pastel temático según la edad y preferencias', price: 'ARS 2,500 - 5,000' },
            { title: '🎈 Decoración Temática', description: 'Globos, banderines y decoración colorida', price: 'ARS 1,500 - 3,000' },
            { title: '🎁 Actividades para Niños', description: 'Juegos, payasos o animadores', price: 'ARS 3,000 - 8,000' }
        ],
        'boda': [
            { title: '💒 Ceremonia Elegante', description: 'Decoración floral y arreglos especiales', price: 'ARS 15,000 - 30,000' },
            { title: '🍾 Recepción Premium', description: 'Catering de alta calidad y bebidas', price: 'ARS 25,000 - 50,000' },
            { title: '📸 Fotografía Profesional', description: 'Cobertura completa del evento', price: 'ARS 8,000 - 15,000' }
        ],
        'corporativo': [
            { title: '🏢 Equipos de Presentación', description: 'Proyectores, pantallas y audio', price: 'ARS 5,000 - 12,000' },
            { title: '☕ Coffee Break', description: 'Refrigerios y bebidas para participantes', price: 'ARS 3,000 - 8,000' },
            { title: '📋 Materiales de Trabajo', description: 'Folletos, carpetas y elementos de marca', price: 'ARS 2,000 - 6,000' }
        ],
        'festejo': [
            { title: '🎉 Ambientación Festiva', description: 'Decoración general y elementos de celebración', price: 'ARS 2,000 - 5,000' },
            { title: '🎵 Música y Entretenimiento', description: 'DJ, banda en vivo o música ambiental', price: 'ARS 4,000 - 12,000' },
            { title: '🍽️ Catering Básico', description: 'Platos principales y bebidas', price: 'ARS 6,000 - 15,000' }
        ],
        'general': [
            { title: '🎨 Decoración Básica', description: 'Elementos decorativos generales', price: 'ARS 1,500 - 4,000' },
            { title: '🎵 Equipos de Sonido', description: 'Audio básico para el evento', price: 'ARS 2,000 - 6,000' },
            { title: '📸 Fotografía Básica', description: 'Cobertura fotográfica simple', price: 'ARS 3,000 - 8,000' }
        ]
    };
    
    // Obtener recomendaciones para el tipo seleccionado
    const eventRecommendations = recommendations[selectedType] || recommendations.general;
    
    // Generar HTML de las recomendaciones
    let recommendationsHTML = '<h3>💡 Recomendaciones para tu evento</h3>';
    recommendationsHTML += '<div class="recommendations-grid">';
    
    eventRecommendations.forEach(rec => {
        recommendationsHTML += `
            <div class="recommendation-card">
                <h4>${rec.title}</h4>
                <p>${rec.description}</p>
                <div class="recommendation-price">${rec.price}</div>
            </div>
        `;
    });
    
    recommendationsHTML += '</div>';
    
    recommendationsContainer.innerHTML = recommendationsHTML;
}

// Mostrar resumen del evento
function showEventSummary() {
    const summaryContainer = document.getElementById('eventSummary');
    if (!summaryContainer) return;
    
    let summaryHTML = `
        <div class="summary-section">
            <h3>📋 Resumen del Evento</h3>
            <div class="summary-grid">
                <div class="summary-item">
                    <strong>Tipo de Evento:</strong>
                    <span>${eventData.type || 'No seleccionado'}</span>
                </div>
                <div class="summary-item">
                    <strong>Nombre:</strong>
                    <span>${eventData.name || 'No especificado'}</span>
                </div>
                <div class="summary-item">
                    <strong>Fecha:</strong>
                    <span>${eventData.date || 'No especificada'}</span>
                </div>
                <div class="summary-item">
                    <strong>Hora:</strong>
                    <span>${eventData.time || 'No especificada'}</span>
                </div>
                <div class="summary-item">
                    <strong>Ubicación:</strong>
                    <span>${eventData.location || 'No especificada'}</span>
                </div>
                <div class="summary-item">
                    <strong>Invitados:</strong>
                    <span>${eventData.guests || 'No especificado'}</span>
                </div>
            </div>
        </div>
    `;
    
    // Agregar descripción si existe
    if (eventData.description) {
        summaryHTML += `
            <div class="summary-section">
                <h3>📝 Descripción</h3>
                <p>${eventData.description}</p>
            </div>
        `;
    }
    
    // Agregar presupuesto si existe
    if (eventData.budget) {
        const totalBudget = Object.values(eventData.budget).reduce((sum, value) => sum + (parseFloat(value) || 0), 0);
        summaryHTML += `
            <div class="summary-section">
                <h3>💰 Presupuesto Total</h3>
                <div class="budget-summary">
                    <div class="total-amount">ARS ${totalBudget.toLocaleString()}</div>
                    <div class="budget-breakdown">
                        ${Object.entries(eventData.budget).map(([key, value]) => {
                            if (value && parseFloat(value) > 0) {
                                const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                                return `<div class="budget-item"><span>${label}:</span> ARS ${parseFloat(value).toLocaleString()}</div>`;
                            }
                            return '';
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
    }
    
    summaryContainer.innerHTML = summaryHTML;
}

// Capturar datos del paso 2
function captureStep2Data() {
    eventData.name = document.getElementById('eventName').value;
    eventData.date = document.getElementById('eventDate').value;
    eventData.time = document.getElementById('eventTime').value;
    eventData.location = document.getElementById('eventLocation').value;
    eventData.guests = document.getElementById('eventGuests').value;
    eventData.description = document.getElementById('eventDescription').value;
    
    // Guardar en localStorage
    localStorage.setItem('eventData', JSON.stringify(eventData));
}

// Actualizar botones de navegación
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn) {
        prevBtn.style.display = window.currentStep === 1 ? 'none' : 'inline-block';
    }
    
    if (nextBtn) {
        if (window.currentStep === 4) {
            nextBtn.textContent = 'Finalizar Evento';
            nextBtn.onclick = finalizarEvento;
            nextBtn.classList.remove('btn-secondary');
            nextBtn.classList.add('btn-primary');
        } else {
            nextBtn.textContent = 'Siguiente';
            nextBtn.onclick = () => nextStep();
            nextBtn.classList.remove('btn-primary');
            nextBtn.classList.add('btn-secondary');
        }
    }
}

// Calcular presupuesto
function calcularPresupuesto() {
    const invitados = parseInt(document.getElementById('eventGuests')?.value || 0);
    const platosPorPersona = parseInt(document.getElementById('platosPorPersona')?.value || 1);
    const costoPlato = parseInt(document.getElementById('costoPlato')?.value || 0);
    const costoBebidas = parseInt(document.getElementById('costoBebidas')?.value || 0);
    const decoracionBasica = parseInt(document.getElementById('decoracionBasica')?.value || 0);
    const floresArreglos = parseInt(document.getElementById('floresArreglos')?.value || 0);
    const iluminacionEspecial = parseInt(document.getElementById('iluminacionEspecial')?.value || 0);
    const entretenimiento = parseInt(document.getElementById('entretenimiento')?.value || 0);
    const equiposSonido = parseInt(document.getElementById('equiposSonido')?.value || 0);
    const fotografo = parseInt(document.getElementById('fotografo')?.value || 0);
    const videografo = parseInt(document.getElementById('videografo')?.value || 0);
    const otrosServicios = parseInt(document.getElementById('otrosServicios')?.value || 0);
    
    // Calcular costos por categoría
    const cateringTotal = (invitados * platosPorPersona * costoPlato) + (invitados * costoBebidas);
    const decoracionTotal = decoracionBasica + floresArreglos + iluminacionEspecial;
    const entretenimientoTotal = entretenimiento + equiposSonido;
    const serviciosTotal = fotografo + videografo + otrosServicios;
    
    // Calcular total general
    const presupuestoTotal = cateringTotal + decoracionTotal + entretenimientoTotal + serviciosTotal;
    
    // Actualizar display del presupuesto
    const presupuestoDisplay = document.getElementById('presupuestoTotal');
    if (presupuestoDisplay) {
        presupuestoDisplay.textContent = `$${presupuestoTotal.toLocaleString('es-AR')}`;
    }
    
    // Actualizar desglose
    const desgloseDisplay = document.getElementById('desglosePresupuesto');
    if (desgloseDisplay) {
        desgloseDisplay.innerHTML = `
            <li><span>🍽️ Catering:</span> <span>$${cateringTotal.toLocaleString('es-AR')}</span></li>
            <li><span>🎨 Decoración:</span> <span>$${decoracionTotal.toLocaleString('es-AR')}</span></li>
            <li><span>🎵 Entretenimiento:</span> <span>$${entretenimientoTotal.toLocaleString('es-AR')}</span></li>
            <li><span>📸 Servicios:</span> <span>$${serviciosTotal.toLocaleString('es-AR')}</span></li>
            <li style="border-top: 2px solid rgba(255,255,255,0.3); margin-top: 1rem; padding-top: 1rem;"><span><strong>TOTAL:</strong></span> <span><strong>$${presupuestoTotal.toLocaleString('es-AR')}</strong></span></li>
        `;
    }
    
    // Guardar el presupuesto calculado en eventData
    eventData.budget = presupuestoTotal;
    
    return presupuestoTotal;
}

// Función para finalizar evento y volver al menú
function finalizarEvento() {
    // Capturar datos del paso 2
    captureStep2Data();
    
    // Capturar datos de presupuesto
    const budgetData = {};
    const budgetFields = ['platosPorPersona', 'costoPorPlato', 'bebidasPorPersona', 'decoracionBasica', 'floresArreglos', 'iluminacionEspecial', 'djMusico', 'equiposSonido', 'fotografo', 'videografo', 'otrosServicios'];
    budgetFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field && field.value) {
            budgetData[fieldId] = field.value;
        }
    });
    
    // Guardar presupuesto en localStorage
    localStorage.setItem('eventBudget', JSON.stringify(budgetData));
    
    // Guardar evento completo
    const eventComplete = {
        ...eventData,
        budget: budgetData,
        createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('eventComplete', JSON.stringify(eventComplete));
    
    // Mostrar modal de éxito
    const successModal = document.getElementById('successModal');
    if (successModal) {
        successModal.style.display = 'block';
    }
    
    // Mostrar mensaje de éxito
    showMessage('🎉 ¡Evento creado exitosamente! Tu evento ha sido guardado y puedes acceder a él desde el menú principal.', 'success', 8000);
    
    // Cerrar tutorial si está activo
    if (tutorialActive) {
        closeTutorial();
    }
}

// Función para validar campos numéricos
function validateNumericInput(input) {
    // Remover caracteres no numéricos excepto punto decimal
    let value = input.value.replace(/[^\d.]/g, '');
    
    // Asegurar que solo haya un punto decimal
    const parts = value.split('.');
    if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limitar a 2 decimales
    if (parts.length === 2 && parts[1].length > 2) {
        value = parts[0] + '.' + parts[1].substring(0, 2);
    }
    
    // Actualizar el valor del campo
    input.value = value;
    
    // Validar que el valor sea positivo
    const numericValue = parseFloat(value);
    if (numericValue < 0) {
        input.value = '';
        showMessage('Por favor ingresa un valor positivo', 'error', 3000);
        return false;
    }
    
    return true;
}

// Mostrar mensajes
function showMessage(message, type = 'info', duration = 4000) {
    // Crear elemento de mensaje si no existe
    let messageElement = document.getElementById('messageContainer');
    if (!messageElement) {
        messageElement = document.createElement('div');
        messageElement.id = 'messageContainer';
        messageElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            word-wrap: break-word;
        `;
        document.body.appendChild(messageElement);
    }
    
    // Configurar estilo según el tipo
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#3b82f6',
        warning: '#f59e0b'
    };
    
    messageElement.style.backgroundColor = colors[type] || colors.info;
    messageElement.innerHTML = message; // Permite HTML en el mensaje
    
    // Mostrar mensaje con animación
    messageElement.style.display = 'block';
    setTimeout(() => {
        messageElement.style.transform = 'translateX(0)';
    }, 10);
    
    // Ocultar después de la duración especificada con animación
    setTimeout(() => {
        messageElement.style.transform = 'translateX(100%)';
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 300);
    }, duration);
}

// Agregar indicadores para campos obligatorios
function addRequiredFieldIndicators() {
    const requiredFields = ['eventName', 'eventDate', 'eventTime', 'eventLocation', 'eventGuests'];
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            // Agregar asterisco al label
            const label = field.previousElementSibling;
            if (label && label.tagName === 'LABEL') {
                if (!label.innerHTML.includes('*')) {
                    label.innerHTML += ' <span class="required">*</span>';
                }
            }
            
            // Agregar atributo required
            field.setAttribute('required', '');
            
            // Agregar validación en tiempo real
            field.addEventListener('blur', function() {
                if (this.value.trim() === '') {
                    this.classList.add('error');
                    showMessage('Este campo es obligatorio', 'error', 3000);
                } else {
                    this.classList.remove('error');
                }
            });
            
            field.addEventListener('input', function() {
                if (this.value.trim() !== '') {
                    this.classList.remove('error');
                }
            });
        }
    });
}

// Agregar tooltips informativos
function addInformativeTooltips() {
    const tooltipData = {
        'eventName': 'Escribe un nombre descriptivo para tu evento (ej: "Cumpleaños de María")',
        'eventDate': 'Selecciona la fecha en que se realizará el evento',
        'eventTime': 'Elige la hora de inicio del evento',
        'eventLocation': 'Escribe la dirección o lugar donde será el evento',
        'eventGuests': 'Ingresa la cantidad de personas que asistirán',
        'eventDescription': 'Agrega detalles adicionales como tema, estilo, o instrucciones especiales',
        'platosPorPersona': 'Cantidad de platos que cada invitado consumirá',
        'costoPorPlato': 'Costo por plato en pesos argentinos (ARS)',
        'bebidasPorPersona': 'Costo de bebidas por persona en ARS',
        'decoracionBasica': 'Costo de decoración básica en ARS',
        'floresArreglos': 'Costo de flores y arreglos en ARS',
        'iluminacionEspecial': 'Costo de iluminación especial en ARS',
        'djMusico': 'Costo del DJ o músico en ARS',
        'equiposSonido': 'Costo de equipos de sonido en ARS',
        'fotografo': 'Costo del fotógrafo en ARS',
        'videografo': 'Costo del videógrafo en ARS',
        'otrosServicios': 'Otros servicios adicionales en ARS'
    };
    
    Object.entries(tooltipData).forEach(([fieldId, tooltipText]) => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.setAttribute('title', tooltipText);
            field.addEventListener('mouseenter', function() {
                showTooltip(this, tooltipText);
            });
            field.addEventListener('mouseleave', function() {
                hideTooltip();
            });
        }
    });
}

// Mostrar tooltip
function showTooltip(element, tooltipText) {
    const tooltip = document.createElement('div');
    tooltip.className = 'info-tooltip';
    tooltip.textContent = tooltipText;
    tooltip.style.cssText = `
        position: absolute;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 0.9rem;
        z-index: 1000;
        max-width: 250px;
        word-wrap: break-word;
        pointer-events: none;
    `;
    
    document.body.appendChild(tooltip);
    
    const rect = element.getBoundingClientRect();
    tooltip.style.left = rect.left + 'px';
    tooltip.style.top = (rect.top - tooltip.offsetHeight - 10) + 'px';
    
    element.tooltipElement = tooltip;
}

// Ocultar tooltip
function hideTooltip() {
    const element = event.target; // Use event.target to get the element that triggered the mouseleave
    if (element.tooltipElement) {
        element.tooltipElement.remove();
        element.tooltipElement = null;
    }
}

// Mejorar la accesibilidad del teclado
function improveKeyboardAccessibility() {
    // Agregar navegación por teclado a las tarjetas de tipo de evento
    const eventTypeCards = document.querySelectorAll('.event-type');
    eventTypeCards.forEach(card => {
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `Seleccionar tipo de evento: ${card.querySelector('h3').textContent}`);
        
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
    
    // Agregar navegación por teclado a los botones
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.setAttribute('tabindex', '0');
    });
    
    // Agregar navegación por teclado a los campos de formulario
    const formFields = document.querySelectorAll('input, select, textarea');
    formFields.forEach(field => {
        field.setAttribute('tabindex', '0');
        
        // Agregar atajo de teclado para el botón siguiente (Enter)
        field.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && currentStep < 4) {
                e.preventDefault();
                nextStep();
            }
        });
    });
    
    // Agregar atajo de teclado para el tutorial (F1)
    document.addEventListener('keydown', function(e) {
        if (e.key === 'F1') {
            e.preventDefault();
            startTutorial();
        }
    });
}

// ===== FUNCIONES DEL TUTORIAL =====

// Mostrar el modal del tutorial
function showTutorial() {
    const tutorialModal = document.getElementById('tutorialModal');
    if (tutorialModal) {
        tutorialModal.style.display = 'block';
        currentTutorialStep = 1;
        showTutorialStep(currentTutorialStep);
        updateTutorialNavigation();
    }
}

// Cerrar el modal del tutorial
function closeTutorial() {
    const tutorialModal = document.getElementById('tutorialModal');
    if (tutorialModal) {
        tutorialModal.style.display = 'none';
        tutorialActive = false;
        removeTutorialIndicators();
    }
}

// Mostrar un paso específico del tutorial
function showTutorialStep(stepNumber) {
    const steps = document.querySelectorAll('.tutorial-step');
    steps.forEach(step => step.classList.remove('active'));
    
    const currentStep = document.querySelector(`[data-step="${stepNumber}"]`);
    if (currentStep) {
        currentStep.classList.add('active');
    }
    
    // Actualizar el indicador de progreso
    const progressElement = document.getElementById('currentTutorialStep');
    if (progressElement) {
        progressElement.textContent = stepNumber;
    }
    
    updateTutorialNavigation();
}

// Navegar al siguiente paso del tutorial
function nextTutorialStep() {
    if (currentTutorialStep < 4) {
        currentTutorialStep++;
        showTutorialStep(currentTutorialStep);
    } else {
        // Finalizar tutorial
        closeTutorial();
        showMessage('¡Tutorial completado! Ya puedes crear tu evento', 'success');
    }
}

// Navegar al paso anterior del tutorial
function prevTutorialStep() {
    if (currentTutorialStep > 1) {
        currentTutorialStep--;
        showTutorialStep(currentTutorialStep);
    }
}

// Actualizar la navegación del tutorial
function updateTutorialNavigation() {
    const prevBtn = document.getElementById('prevTutorialBtn');
    const nextBtn = document.getElementById('nextTutorialBtn');
    
    if (prevBtn) {
        prevBtn.disabled = currentTutorialStep === 1;
    }
    
    if (nextBtn) {
        if (currentTutorialStep === 4) {
            nextBtn.textContent = 'Finalizar';
            nextBtn.innerHTML = 'Finalizar <i class="fas fa-check"></i>';
        } else {
            nextBtn.textContent = 'Siguiente';
            nextBtn.innerHTML = 'Siguiente <i class="fas fa-arrow-right"></i>';
        }
    }
}

// Iniciar el tutorial interactivo
function startTutorial() {
    tutorialActive = true;
    currentTutorialStep = 1;
    
    // Cerrar el modal del tutorial primero
    const tutorialModal = document.getElementById('tutorialModal');
    if (tutorialModal) {
        tutorialModal.style.display = 'none';
    }
    
    // Mostrar mensaje inicial claro
    showMessage('¡Bienvenido al Tutorial de EventPro! 🎉<br><br><strong>Paso 1:</strong> Selecciona el tipo de evento que deseas crear.<br><br>Haz clic en una de las tarjetas de tipo de evento que verás en la página principal.', 'info', 8000);
    
    // Ir al primer paso del formulario principal
    goToStep(1);
    
    // Posicionar el spotlight en el área de tipos de evento
    positionSpotlight(1);
    
    // Agregar indicadores visuales
    addElementIndicators();
}

// Ir a un paso específico del formulario
function goToStep(stepNumber) {
    // Ocultar todos los pasos
    const allSteps = document.querySelectorAll('.form-step');
    allSteps.forEach(step => {
        step.style.display = 'none';
    });
    
    // Mostrar el paso actual
    const currentStep = document.getElementById(`step-${stepNumber}`);
    if (currentStep) {
        currentStep.style.display = 'block';
    }
    
    // Actualizar la barra de progreso
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
        const progress = (stepNumber / 4) * 100; // Paso 1 => 25%
        progressFill.style.width = progress + '%';
    }
    
    // Actualizar los pasos de progreso
    const progressSteps = document.querySelectorAll('.progress-step');
    progressSteps.forEach((step, index) => {
        if (index + 1 <= stepNumber) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
    
    // Actualizar botones de navegación
    updateNavigationButtons();
    
    // Hacer scroll al paso
    if (currentStep) {
        currentStep.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // Actualizar la variable global currentStep
    window.currentStep = stepNumber;
}

// Mostrar mensaje del tutorial según el paso
function showTutorialMessage(stepNumber) {
    let message = '';
    let type = 'info';
    
    switch(stepNumber) {
        case 1:
            message = '🎯 PASO 1: Selecciona el tipo de evento que quieres organizar. Haz clic en una de las tarjetas de abajo.';
            break;
        case 2:
            message = '📝 PASO 2: Completa los datos básicos de tu evento. Los campos marcados con * son obligatorios.';
            break;
        case 3:
            message = '💰 PASO 3: Calcula tu presupuesto. Ingresa los costos estimados en cada categoría.';
            break;
        case 4:
            message = '✅ PASO 4: Revisa todos los datos y confirma tu evento. ¡Ya casi terminas!';
            break;
    }
    
    showMessage(message, type);
}

// Agregar indicadores visuales en la interfaz durante el tutorial
function addTutorialIndicators() {
    // Agregar overlay de tutorial
    const tutorialOverlay = document.createElement('div');
    tutorialOverlay.id = 'tutorialOverlay';
    tutorialOverlay.className = 'tutorial-overlay';
    
    // Crear spotlight que se mueve según el paso actual
    const spotlight = document.createElement('div');
    spotlight.className = 'tutorial-spotlight';
    spotlight.id = 'tutorialSpotlight';
    
    document.body.appendChild(tutorialOverlay);
    document.body.appendChild(spotlight);
    
    // Agregar indicadores en los elementos importantes
    addElementIndicators();
    
    // Posicionar el spotlight en el primer elemento
    positionSpotlight(1);
}

// Posicionar el spotlight en el elemento correspondiente al paso actual
function positionSpotlight(stepNumber) {
    const spotlight = document.getElementById('tutorialSpotlight');
    if (!spotlight) return;
    
    let targetElement;
    let message = '';
    
    switch(stepNumber) {
        case 1:
            targetElement = document.querySelector('.event-types');
            message = '🎯 Selecciona tu tipo de evento';
            break;
        case 2:
            targetElement = document.querySelector('#step-2');
            message = '📝 Completa los datos del evento';
            break;
        case 3:
            targetElement = document.querySelector('#step-3');
            message = '💰 Calcula tu presupuesto';
            break;
        case 4:
            targetElement = document.querySelector('#step-4');
            message = '✅ Confirma tu evento';
            break;
    }
    
    if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        spotlight.style.left = rect.left + 'px';
        spotlight.style.top = rect.top + 'px';
        spotlight.style.width = rect.width + 'px';
        spotlight.style.height = rect.height + 'px';
        
        // Actualizar el mensaje del spotlight
        const spotlightContent = spotlight.querySelector('.spotlight-content');
        if (spotlightContent) {
            spotlightContent.innerHTML = `<p>${message}</p>`;
        }
    }
}

// Agregar indicadores en elementos específicos
function addElementIndicators() {
    // Agregar indicadores a las tarjetas de tipo de evento
    const eventTypeCards = document.querySelectorAll('.event-type');
    eventTypeCards.forEach(card => {
        card.addEventListener('click', function() {
            if (tutorialActive && currentTutorialStep === 1) {
                // Avanzar al siguiente paso del tutorial
                currentTutorialStep = 2;
                
                // Mostrar mensaje del paso 2
                showTutorialMessage(2);
                
                // Ir al paso 2 del formulario
                goToStep(2);
                
                // Posicionar spotlight en el paso 2
                positionSpotlight(2);
                
                // Resaltar campos obligatorios
                highlightRequiredFields();
                
                // Remover indicadores del paso 1
                removeTutorialIndicators();
            }
        });
    });
    
    // Agregar indicadores a los campos del paso 2
    const requiredFields = ['#eventName', '#eventDate', '#eventTime', '#eventLocation', '#eventGuests'];
    requiredFields.forEach(fieldId => {
        const field = document.querySelector(fieldId);
        if (field) {
            field.addEventListener('input', function() {
                if (tutorialActive && currentTutorialStep === 2) {
                    // Verificar si todos los campos obligatorios están completos
                    checkStep2Completion();
                }
            });
        }
    });
    
    // Agregar indicadores a los campos de presupuesto del paso 3
    const budgetFields = ['#platosPorPersona', '#costoPorPlato', '#bebidasPorPersona', '#decoracionBasica', '#floresArreglos', '#iluminacionEspecial', '#djMusico', '#equiposSonido', '#fotografo', '#videografo', '#otrosServicios'];
    budgetFields.forEach(fieldId => {
        const field = document.querySelector(fieldId);
        if (field) {
            field.addEventListener('input', function() {
                if (tutorialActive && currentTutorialStep === 3) {
                    // Verificar si se han ingresado algunos valores de presupuesto
                    checkBudgetCompletion();
                }
            });
        }
    });
}

function checkStep2Completion() {
    const requiredFields = ['#eventName', '#eventDate', '#eventTime', '#eventLocation', '#eventGuests'];
    const allCompleted = requiredFields.every(fieldId => {
        const field = document.querySelector(fieldId);
        return field && field.value.trim() !== '';
    });
    
    if (allCompleted && tutorialActive && currentTutorialStep === 2) {
        // Avanzar al siguiente paso del tutorial
        currentTutorialStep = 3;
        
        // Mostrar mensaje del paso 3
        showTutorialMessage(3);
        
        // Ir al paso 3 del formulario
        goToStep(3);
        
        // Posicionar spotlight en el paso 3
        positionSpotlight(3);
        
        // Resaltar campos de presupuesto
        highlightBudgetFields();
        
        // Remover indicadores del paso 2
        removeTutorialIndicators();
    }
}

function checkBudgetCompletion() {
    const budgetFields = ['#platosPorPersona', '#costoPorPlato', '#bebidasPorPersona', '#decoracionBasica', '#floresArreglos', '#iluminacionEspecial', '#djMusico', '#equiposSonido', '#fotografo', '#videografo', '#otrosServicios'];
    const hasBudgetData = budgetFields.some(fieldId => {
        const field = document.querySelector(fieldId);
        return field && field.value.trim() !== '' && parseFloat(field.value) > 0;
    });
    
    if (hasBudgetData && tutorialActive && currentTutorialStep === 3) {
        // Avanzar al siguiente paso del tutorial
        currentTutorialStep = 4;
        
        // Mostrar mensaje del paso 4
        showTutorialMessage(4);
        
        // Ir al paso 4 del formulario
        goToStep(4);
        
        // Posicionar spotlight en el paso 4
        positionSpotlight(4);
        
        // Remover indicadores del paso 3
        removeTutorialIndicators();
        
        // Mostrar mensaje de felicitación
        setTimeout(() => {
            showMessage('🎉 ¡Excelente! Has completado el tutorial. Ahora puedes finalizar tu evento haciendo clic en "Finalizar Evento".', 'success', 8000);
        }, 2000);
    }
}

// Resaltar campos obligatorios
function highlightRequiredFields() {
    const requiredFields = ['#eventName', '#eventDate', '#eventTime', '#eventLocation', '#eventGuests'];
    
    requiredFields.forEach(fieldId => {
        const field = document.querySelector(fieldId);
        if (field) {
            // Agregar estilos de resaltado
            field.style.border = '3px solid #007bff';
            field.style.boxShadow = '0 0 15px rgba(0, 123, 255, 0.5)';
            field.style.transition = 'all 0.3s ease';
            
            // Agregar indicador visual
            const label = field.previousElementSibling;
            if (label && label.tagName === 'LABEL') {
                label.style.color = '#007bff';
                label.style.fontWeight = 'bold';
            }
            
            // Agregar tooltip informativo
            field.setAttribute('title', 'Campo obligatorio - Completa este campo para continuar');
        }
    });
    
    // Mostrar mensaje explicativo
    showMessage('💡 <strong>Campos Obligatorios:</strong> Los campos marcados con * son obligatorios. Completa todos para continuar al siguiente paso.', 'info', 6000);
}

// Resaltar campos de presupuesto
function highlightBudgetFields() {
    const budgetFields = ['#platosPorPersona', '#costoPorPlato', '#bebidasPorPersona', '#decoracionBasica', '#floresArreglos', '#iluminacionEspecial', '#djMusico', '#equiposSonido', '#fotografo', '#videografo', '#otrosServicios'];
    
    budgetFields.forEach(fieldId => {
        const field = document.querySelector(fieldId);
        if (field) {
            // Agregar estilos de resaltado
            field.style.border = '3px solid #28a745';
            field.style.boxShadow = '0 0 15px rgba(40, 167, 69, 0.5)';
            field.style.transition = 'all 0.3s ease';
            
            // Agregar indicador visual
            const label = field.previousElementSibling;
            if (label && label.tagName === 'LABEL') {
                label.style.color = '#28a745';
                label.style.fontWeight = 'bold';
            }
            
            // Agregar tooltip informativo
            field.setAttribute('title', 'Ingresa el costo estimado en pesos argentinos (ARS)');
        }
    });
    
    // Mostrar mensaje explicativo
    showMessage('💰 <strong>Presupuesto:</strong> Ingresa los costos estimados en cada categoría. Los valores se calculan automáticamente mientras escribes.', 'info', 6000);
}

// Remover indicadores del tutorial
function removeTutorialIndicators() {
    // Remover estilos de resaltado de todos los campos
    const allFields = document.querySelectorAll('input, select, textarea');
    allFields.forEach(field => {
        // Remover estilos de borde y sombra
        field.style.border = '';
        field.style.boxShadow = '';
        field.style.transition = '';
        
        // Remover tooltips
        field.removeAttribute('title');
        
        // Remover clases de tutorial
        field.classList.remove('tutorial-highlight');
    });
    
    // Remover estilos de las etiquetas
    const allLabels = document.querySelectorAll('label');
    allLabels.forEach(label => {
        label.style.color = '';
        label.style.fontWeight = '';
    });
    
    // Remover clases de tutorial de las tarjetas de tipo de evento
    const eventTypeCards = document.querySelectorAll('.event-type');
    eventTypeCards.forEach(card => {
        card.classList.remove('tutorial-highlight');
    });
    
    // Ocultar spotlight y overlay si existen
    const spotlight = document.querySelector('.tutorial-spotlight');
    const overlay = document.querySelector('.tutorial-overlay');
    
    if (spotlight) {
        spotlight.style.display = 'none';
    }
    
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// Configurar event listeners del tutorial
function setupTutorialEventListeners() {
    // Botón "Cómo usar?" en el header
    const tutorialBtn = document.getElementById('startTutorialBtn');
    if (tutorialBtn) {
        tutorialBtn.addEventListener('click', startTutorial);
    }
    
    // Botón "Ver Tutorial" en el progreso
    const tutorialHint = document.querySelector('.tutorial-start-hint');
    if (tutorialHint) {
        tutorialHint.addEventListener('click', startTutorial);
    }
    
    // Botones de navegación del tutorial
    const prevTutorialBtn = document.getElementById('prevTutorialBtn');
    const nextTutorialBtn = document.getElementById('nextTutorialBtn');
    
    if (prevTutorialBtn) {
        prevTutorialBtn.addEventListener('click', prevTutorialStep);
    }
    
    if (nextTutorialBtn) {
        nextTutorialBtn.addEventListener('click', nextTutorialStep);
    }
    
    // Botón de cerrar tutorial
    const closeTutorialBtn = document.querySelector('.close-btn');
    if (closeTutorialBtn) {
        closeTutorialBtn.addEventListener('click', closeTutorial);
    }
    
    // Cerrar tutorial al hacer clic fuera del modal
    const tutorialModal = document.getElementById('tutorialModal');
    if (tutorialModal) {
        tutorialModal.addEventListener('click', function(e) {
            if (e.target === tutorialModal) {
                closeTutorial();
            }
        });
    }
}

// Event listeners para campos del formulario
document.addEventListener('DOMContentLoaded', function() {
    // Capturar cambios en los campos del paso 2
    const step2Inputs = ['eventName', 'eventDate', 'eventTime', 'eventLocation', 'eventDescription', 'eventBudget', 'eventGuests'];
    
    step2Inputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', function() {
                validateStep2Fields();
            });
        }
    });
    
    // Función para validar campos del paso 2
    function validateStep2Fields() {
        const nameInput = document.getElementById('eventName');
        const dateInput = document.getElementById('eventDate');
        const timeInput = document.getElementById('eventTime');
        
        if (nameInput && dateInput && timeInput) {
            const continueBtn = document.querySelector('#step-2 .btn-primary');
            if (continueBtn) {
                const isValid = nameInput.value.trim() && dateInput.value && timeInput.value;
                continueBtn.disabled = !isValid;
                
                if (isValid) {
                    continueBtn.classList.remove('btn-disabled');
                    console.log('Botón habilitado - campos válidos');
                } else {
                    continueBtn.classList.add('btn-disabled');
                    console.log('Botón deshabilitado - campos inválidos');
                }
            }
        }
    }
    
    // Cerrar modal al hacer clic fuera
    const successModal = document.getElementById('successModal');
    if (successModal) {
        successModal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });
    }
});

// Funciones adicionales para el modal de éxito
function goToDashboard() {
    window.location.href = 'Base.html';
}

function createAnotherEvent() {
    // Resetear el formulario
    window.currentStep = 1;
    selectedEventType = null;
    eventData = {
        type: null,
        name: '',
        date: '',
        time: '',
        location: '',
        description: '',
        budget: '',
        guests: ''
    };
    
    // Limpiar selecciones
    document.querySelectorAll('.event-type').forEach(type => {
        type.classList.remove('selected');
    });
    
    // Ocultar modal
    const successModal = document.getElementById('successModal');
    if (successModal) {
        successModal.style.display = 'none';
    }
    
    // Volver al primer paso
    showStep(1);
    updateProgressBar();
    
    // Limpiar formularios
    const form = document.querySelector('form');
    if (form) form.reset();
    
    // Limpiar campos específicos
    const inputs = ['eventName', 'eventDate', 'eventTime', 'eventLocation', 'eventDescription', 'eventGuests'];
    inputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) input.value = '';
    });
    
    // Limpiar campos de presupuesto
    const budgetInputs = ['platosPorPersona', 'costoPlato', 'costoBebidas', 'decoracionBasica', 'floresArreglos', 'iluminacionEspecial', 'entretenimiento', 'equiposSonido', 'fotografo', 'videografo', 'otrosServicios'];
    budgetInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) input.value = '';
    });
    
    // Resetear presupuesto
    const presupuestoDisplay = document.getElementById('presupuestoTotal');
    if (presupuestoDisplay) {
        presupuestoDisplay.textContent = '$0';
    }
    
    const desgloseDisplay = document.getElementById('desglosePresupuesto');
    if (desgloseDisplay) {
        desgloseDisplay.innerHTML = '';
    }
    
    // Habilitar botón de continuar del paso 1
    const continueBtn = document.getElementById('step1ContinueBtn');
    if (continueBtn) {
        continueBtn.disabled = true;
        continueBtn.classList.add('btn-disabled');
    }
    
    showMessage('Formulario reiniciado. Puedes crear un nuevo evento.', 'info');
}

function setupEventTypeSelection() {
    const eventTypeCards = document.querySelectorAll('.event-type');
    
    eventTypeCards.forEach(card => {
        card.addEventListener('click', function() {
            // Remover selección previa
            eventTypeCards.forEach(c => c.classList.remove('selected'));
            
            // Seleccionar la tarjeta actual
            this.classList.add('selected');
            
            // Obtener el tipo de evento
            const eventType = this.getAttribute('data-type');
            eventData.type = eventType;
            
            // Guardar en localStorage
            localStorage.setItem('eventData', JSON.stringify(eventData));
            
            // Habilitar botón de continuar
            const continueBtn = document.querySelector('.btn-primary');
            if (continueBtn) {
                continueBtn.disabled = false;
                continueBtn.classList.remove('btn-disabled');
            }
            
            // Mostrar mensaje de confirmación
            showMessage(`✅ Tipo de evento seleccionado: ${this.querySelector('h3').textContent}`, 'success', 3000);
            
            // Si el tutorial está activo, avanzar automáticamente
            if (tutorialActive && currentTutorialStep === 1) {
                setTimeout(() => {
                    currentTutorialStep = 2;
                    showTutorialMessage(2);
                    goToStep(2);
                    positionSpotlight(2);
                    highlightRequiredFields();
                }, 1000);
            }
        });
    });
}

function setupBudgetCalculation() {
    // Configurar event listeners para todos los campos de presupuesto
    const budgetInputs = [
        'platosPorPersona', 'costoPorPlato', 'bebidasPorPersona',
        'decoracionBasica', 'floresArreglos', 'iluminacionEspecial',
        'djMusico', 'equiposSonido', 'fotografo', 'videografo', 'otrosServicios'
    ];
    
    budgetInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            // Agregar validación numérica
            input.addEventListener('input', function() {
                validateNumericInput(this);
                calcularPresupuesto();
            });
            
            // Agregar validación al perder el foco
            input.addEventListener('blur', function() {
                if (this.value && parseFloat(this.value) < 0) {
                    this.value = '';
                    showMessage('Por favor ingresa un valor positivo', 'error', 3000);
                }
            });
        }
    });
    
    // Configurar cálculo automático del presupuesto
    const eventGuestsInput = document.getElementById('eventGuests');
    if (eventGuestsInput) {
        eventGuestsInput.addEventListener('input', function() {
            validateNumericInput(this);
            calcularPresupuesto();
        });
    }
}

// Función para mostrar mensaje de bienvenida solo la primera vez
function showWelcomeMessage() {
    // Verificar si ya se mostró el mensaje de bienvenida
    const hasSeenWelcome = localStorage.getItem('eventProWelcomeShown');
    
    if (!hasSeenWelcome) {
        // Crear y mostrar el mensaje de bienvenida
        const welcomeMessage = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 2rem;
                border-radius: 20px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                text-align: center;
                max-width: 500px;
                z-index: 10000;
                animation: welcomeSlideIn 0.8s ease-out;
            ">
                <div style="font-size: 4rem; margin-bottom: 1rem;">🎉</div>
                <h2 style="margin: 0 0 1rem 0; font-size: 2rem; color: white;">¡Bienvenido a EventPro!</h2>
                <p style="margin: 0 0 1.5rem 0; font-size: 1.1rem; line-height: 1.6;">
                    Te guiaremos paso a paso para crear el evento perfecto. 
                    Si tienes dudas, haz clic en "Ver Tutorial" arriba.
                </p>
                <div style="
                    background: rgba(255,255,255,0.1);
                    padding: 1rem;
                    border-radius: 15px;
                    margin-bottom: 1.5rem;
                ">
                    <div style="margin-bottom: 0.5rem;">
                        <span style="color: #ffd700;">💡</span> 
                        <strong>Tip:</strong> Cada tipo de evento incluye elementos específicos recomendados
                    </div>
                    <div style="margin-bottom: 0.5rem;">
                        <span style="color: #ffd700;">⏱️</span> 
                        <strong>Tip:</strong> El proceso completo toma solo 5 minutos
                    </div>
                    <div>
                        <span style="color: #ffd700;">💰</span> 
                        <strong>Tip:</strong> Calcularemos tu presupuesto automáticamente
                    </div>
                </div>
                <button onclick="closeWelcomeMessage()" style="
                    background: linear-gradient(45deg, #ff6b6b, #ee5a24);
                    color: white;
                    border: none;
                    padding: 12px 30px;
                    border-radius: 25px;
                    font-size: 1.1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    ¡Comenzar a Crear Eventos!
                </button>
            </div>
            <style>
                @keyframes welcomeSlideIn {
                    from {
                        opacity: 0;
                        transform: translate(-50%, -50%) scale(0.8);
                    }
                    to {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1);
                    }
                }
            </style>
        `;
        
        // Agregar el mensaje al body
        document.body.insertAdjacentHTML('beforeend', welcomeMessage);
        
        // Marcar que ya se mostró el mensaje
        localStorage.setItem('eventProWelcomeShown', 'true');
    }
}

// Función para cerrar el mensaje de bienvenida
function closeWelcomeMessage() {
    const welcomeMessage = document.querySelector('div[style*="position: fixed"]');
    if (welcomeMessage) {
        welcomeMessage.style.animation = 'welcomeSlideOut 0.5s ease-in forwards';
        setTimeout(() => {
            welcomeMessage.remove();
        }, 500);
    }
    
    // Agregar animación de salida
    const style = document.createElement('style');
    style.textContent = `
        @keyframes welcomeSlideOut {
            from {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }
            to {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.8);
            }
        }
    `;
    document.head.appendChild(style);
}

