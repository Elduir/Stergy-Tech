/*==============================================================================
  SCRIPT DE AUTENTICACIÓN Y GESTIÓN DE CUENTAS
  ============================================================================== 
  Este archivo contiene toda la funcionalidad para:
  - Creación de nuevas cuentas de usuario
  - Validación de formularios
  - Gestión de sesiones de login
  - Almacenamiento seguro de datos en localStorage
==============================================================================*/

// =============================================================================
// OBJETO PARA GESTIONAR USUARIOS (Simulado con localStorage)
// =============================================================================
/*
  En una aplicación real, esto se comunicaría con un servidor backend.
  Para este ejemplo, usamos localStorage del navegador para demostración.
*/
const UsuarioManager = {
    // Nombre de la clave en localStorage donde se guardan los usuarios
    STORAGE_KEY: 'usuarios_stergy',
    
    /**
     * Obtiene todos los usuarios registrados
     * @returns {Array} Array de objetos usuario
     */
    obtenerUsuarios() {
        const usuarios = localStorage.getItem(this.STORAGE_KEY);
        return usuarios ? JSON.parse(usuarios) : [];
    },
    
    /**
     * Guarda los usuarios en localStorage
     * @param {Array} usuarios - Array de usuarios a guardar
     */
    guardarUsuarios(usuarios) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(usuarios));
    },
    
    /**
     * Busca un usuario por correo electrónico
     * @param {String} email - Email a buscar
     * @returns {Object|null} Objeto usuario o null si no existe
     */
    buscarPorEmail(email) {
        const usuarios = this.obtenerUsuarios();
        return usuarios.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
    },
    
    /**
     * Busca un usuario por nombre de usuario
     * @param {String} username - Nombre de usuario a buscar
     * @returns {Object|null} Objeto usuario o null si no existe
     */
    buscarPorUsuario(username) {
        const usuarios = this.obtenerUsuarios();
        return usuarios.find(user => user.username.toLowerCase() === username.toLowerCase()) || null;
    },
    
    /**
     * Crea una nueva cuenta de usuario
     * @param {String} username - Nombre de usuario
     * @param {String} email - Email del usuario
     * @param {String} password - Contraseña (se guardaría hasheada en producción)
     * @returns {Object} Objeto con éxito y mensaje
     */
    crearUsuario(username, email, password) {
        // Validar que el usuario no exista
        if (this.buscarPorUsuario(username)) {
            return { exito: false, mensaje: 'El nombre de usuario ya está registrado' };
        }
        
        // Validar que el email no exista
        if (this.buscarPorEmail(email)) {
            return { exito: false, mensaje: 'El correo electrónico ya está registrado' };
        }
        
        // Crear nuevo usuario
        const nuevoUsuario = {
            id: Date.now(), // ID único basado en timestamp
            username: username,
            email: email,
            password: password, // En producción, NUNCA guardes contraseñas en texto plano. Usa hash (bcrypt, etc.)
            fechaRegistro: new Date().toISOString(),
            activo: true
        };
        
        // Obtener usuarios actuales y agregar el nuevo
        const usuarios = this.obtenerUsuarios();
        usuarios.push(nuevoUsuario);
        this.guardarUsuarios(usuarios);
        
        return { exito: true, mensaje: 'Cuenta creada exitosamente', usuario: nuevoUsuario };
    },
    
    /**
     * Verifica las credenciales de login
     * @param {String} email - Email del usuario
     * @param {String} password - Contraseña
     * @returns {Object} Objeto con éxito, mensaje y datos del usuario
     */
    verificarLogin(email, password) {
        // Buscar usuario por email
        const usuario = this.buscarPorEmail(email);
        
        // Validar que exista el usuario
        if (!usuario) {
            return { exito: false, mensaje: 'Correo electrónico o contraseña incorrectos' };
        }
        
        // Validar que la contraseña sea correcta
        // En producción, comparar hash de contraseña con bcrypt.compare()
        if (usuario.password !== password) {
            return { exito: false, mensaje: 'Correo electrónico o contraseña incorrectos' };
        }
        
        // Si llegamos aquí, el login es válido
        return { exito: true, mensaje: 'Inicio de sesión exitoso', usuario: usuario };
    },
    
    /**
     * Inicia sesión y guarda el usuario en sessionStorage
     * @param {Object} usuario - Objeto usuario
     */
    iniciarSesion(usuario) {
        // Guardar usuario en sesión (se borra al cerrar el navegador)
        sessionStorage.setItem('usuario_logueado', JSON.stringify(usuario));
        
        // Opcionalmente, guardar en localStorage si el usuario marcó "Recuérdame"
        // (En este caso, no guardaremos por seguridad)
    },
    
    /**
     * Obtiene el usuario actualmente logueado
     * @returns {Object|null} Usuario logueado o null
     */
    obtenerUsuarioActual() {
        const usuario = sessionStorage.getItem('usuario_logueado');
        return usuario ? JSON.parse(usuario) : null;
    },
    
    /**
     * Cierra la sesión del usuario
     */
    cerrarSesion() {
        sessionStorage.removeItem('usuario_logueado');
    }
    ,
    
    // ============================================================================
    // === USUARIO DE PRUEBA (ELIMINAR EN PRODUCCIÓN) =============================
    // Este bloque inserta un usuario admin de prueba si no existe. Está marcado
    // claramente para que sea fácil localizar y eliminar cuando ya no se necesite.
    // Usuario: admin
    // Email: admin@gmail.com
    // Contraseña: 12345678
    // ============================================================================
    seedTestUser() {
        const TEST_USERNAME = 'admin';
        const TEST_EMAIL = 'admin@gmail.com';
        const TEST_PASSWORD = '12345678';

        // Si ya existe por email o username, no hacer nada
        if (this.buscarPorEmail(TEST_EMAIL) || this.buscarPorUsuario(TEST_USERNAME)) return;

        const nuevoUsuario = {
            id: Date.now(),
            username: TEST_USERNAME,
            email: TEST_EMAIL,
            password: TEST_PASSWORD,
            fechaRegistro: new Date().toISOString(),
            activo: true,
            /* TAG: TEST_USER_SEED - eliminar este objeto para quitar usuario de prueba */
        };

        const usuarios = this.obtenerUsuarios();
        usuarios.push(nuevoUsuario);
        this.guardarUsuarios(usuarios);
        console.warn('Usuario de prueba creado:', TEST_USERNAME, TEST_EMAIL);
    },
};

// =============================================================================
// VALIDACIÓN DE FORMULARIOS
// =============================================================================

/**
 * Valida que un email tenga formato correcto
 * @param {String} email - Email a validar
 * @returns {Boolean} true si es válido
 */
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Valida que un nombre de usuario sea válido
 * @param {String} username - Usuario a validar
 * @returns {Object} Objeto con validez y mensaje de error si aplica
 */
function validarUsername(username) {
    // No debe estar vacío
    if (!username || username.trim() === '') {
        return { valido: false, mensaje: 'El usuario no puede estar vacío' };
    }
    
    // Debe tener entre 3 y 20 caracteres
    if (username.length < 3 || username.length > 20) {
        return { valido: false, mensaje: 'El usuario debe tener entre 3 y 20 caracteres' };
    }
    
    // Solo puede contener letras, números y guiones
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        return { valido: false, mensaje: 'El usuario solo puede contener letras, números, guiones y guiones bajos' };
    }
    
    return { valido: true, mensaje: '' };
}

/**
 * Valida que una contraseña sea segura
 * @param {String} password - Contraseña a validar
 * @returns {Object} Objeto con validez y mensaje de error si aplica
 */
function validarPassword(password) {
    // Debe tener mínimo 8 caracteres
    if (password.length < 8) {
        return { valido: false, mensaje: 'La contraseña debe tener mínimo 8 caracteres' };
    }
    
    // Debe contener al menos un número
    if (!/\d/.test(password)) {
        return { valido: false, mensaje: 'La contraseña debe contener al menos un número' };
    }
    
    // Debe contener al menos una letra mayúscula
    if (!/[A-Z]/.test(password)) {
        return { valido: false, mensaje: 'La contraseña debe contener al menos una letra mayúscula' };
    }
    
    return { valido: true, mensaje: '' };
}

// =============================================================================
// MANEJADORES DE FORMULARIO DE CREACIÓN DE CUENTA
// =============================================================================

/**
 * Maneja el envío del formulario de crear cuenta
 * Se ejecuta cuando el usuario hace clic en "Crear Cuenta"
 */
function manejarCrearCuenta(event) {
    // Prevenir el envío por defecto del formulario
    event.preventDefault();
    
    // Obtener valores del formulario
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // ===== VALIDACIONES =====
    
    // Validar que el usuario sea válido
    const validarUser = validarUsername(username);
    if (!validarUser.valido) {
        mostrarError(validarUser.mensaje);
        return;
    }
    
    // Validar que el email sea válido
    if (!validarEmail(email)) {
        mostrarError('Por favor ingresa un correo electrónico válido');
        return;
    }
    
    // Validar que la contraseña sea segura
    const validarPass = validarPassword(password);
    if (!validarPass.valido) {
        mostrarError(validarPass.mensaje);
        return;
    }
    
    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
        mostrarError('Las contraseñas no coinciden');
        return;
    }
    
    // Validar que acepte los términos
    const aceptaTerminos = document.getElementById('terms').checked;
    if (!aceptaTerminos) {
        mostrarError('Debes aceptar los términos y condiciones');
        return;
    }
    
    // ===== CREAR USUARIO =====
    const resultado = UsuarioManager.crearUsuario(username, email, password);
    
    if (resultado.exito) {
        // Mostrar mensaje de éxito
        mostrarExito('¡Cuenta creada exitosamente! Redirigiendo a login...');
        
        // Redirigir a login después de 2 segundos
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    } else {
        // Mostrar error
        mostrarError(resultado.mensaje);
    }
}

// =============================================================================
// MANEJADORES DE FORMULARIO DE LOGIN
// =============================================================================

/**
 * Maneja el envío del formulario de login
 * Se ejecuta cuando el usuario hace clic en "Iniciar Sesión"
 */
function manejarLogin(event) {
    // Prevenir el envío por defecto del formulario
    event.preventDefault();
    
    // Obtener valores del formulario
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const recordarme = document.getElementById('remember') ? document.getElementById('remember').checked : false;
    
    // Validar que los campos no estén vacíos
    if (!email || !password) {
        mostrarError('Por favor ingresa tu correo y contraseña');
        return;
    }
    
    // Verificar credenciales
    const resultado = UsuarioManager.verificarLogin(email, password);
    
    if (resultado.exito) {
        // Iniciar sesión
        UsuarioManager.iniciarSesion(resultado.usuario);
        
        // Si marcó "Recuérdame", guardar email (sin contraseña por seguridad)
        if (recordarme) {
            localStorage.setItem('email_guardado', email);
        }
        
        // Mostrar mensaje de éxito
        mostrarExito('¡Bienvenido! Redirigiendo...');
        
        // Redirigir a la página principal después de 1.5 segundos
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1500);
    } else {
        // Mostrar error
        mostrarError(resultado.mensaje);
    }
}

// =============================================================================
// FUNCIONES DE UTILIDAD PARA MOSTRAR MENSAJES
// =============================================================================

/**
 * Muestra un mensaje de error en la página
 * @param {String} mensaje - Mensaje a mostrar
 */
function mostrarError(mensaje) {
    // Crear elemento para el error (si no existe)
    let errorDiv = document.getElementById('error-message');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'error-message';
        errorDiv.style.cssText = `
            background-color: #cd5c5c;
            color: white;
            padding: 12px 15px;
            border-radius: 8px;
            margin-bottom: 15px;
            border-left: 4px solid #8B3A3A;
            font-size: 14px;
        `;
        // Insertar antes del formulario
        const form = document.querySelector('.login-form');
        if (form) {
            form.parentNode.insertBefore(errorDiv, form);
        }
    }
    
    errorDiv.textContent = mensaje;
    errorDiv.style.display = 'block';
    
    // Ocultar el error después de 5 segundos
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

/**
 * Muestra un mensaje de éxito en la página
 * @param {String} mensaje - Mensaje a mostrar
 */
function mostrarExito(mensaje) {
    // Crear elemento para el éxito (si no existe)
    let sucessDiv = document.getElementById('succes-message');
    if (!sucessDiv) {
        sucessDiv = document.createElement('div');
        sucessDiv.id = 'succes-message';
        sucessDiv.style.cssText = `
            background-color: #6b8e23;
            color: white;
            padding: 12px 15px;
            border-radius: 8px;
            margin-bottom: 15px;
            border-left: 4px solid #556B2F;
            font-size: 14px;
        `;
        // Insertar antes del formulario
        const form = document.querySelector('.login-form');
        if (form) {
            form.parentNode.insertBefore(sucessDiv, form);
        }
    }
    
    sucessDiv.textContent = mensaje;
    sucessDiv.style.display = 'block';
}

/**
 * Restaura el email guardado en el campo de login si existe
 * Útil si el usuario marcó "Recuérdame"
 */
function restaurarEmailGuardado() {
    const emailGuardado = localStorage.getItem('email_guardado');
    const emailInput = document.getElementById('email');
    
    if (emailGuardado && emailInput) {
        emailInput.value = emailGuardado;
    }
}

// =============================================================================
// INICIALIZACIÓN DE LA PÁGINA
// =============================================================================

/**
 * Se ejecuta cuando el DOM está completamente cargado
 */
document.addEventListener('DOMContentLoaded', function() {
    // ======= SEMILLA DE USUARIO DE PRUEBA =======
    // Llama a seedTestUser para crear el usuario admin de prueba si no existe.
    // Busca el bloque marcado "TEST_USER_SEED" para localizar y eliminar fácilmente.
    if (typeof UsuarioManager !== 'undefined' && typeof UsuarioManager.seedTestUser === 'function') {
        UsuarioManager.seedTestUser();
    }
    // Detectar si estamos en la página de login o crear cuenta
    const formulario = document.querySelector('.login-form');
    
    if (!formulario) {
        console.log('No se encontró formulario en la página');
        return;
    }
    
    // Obtener el valor del atributo action o nombre de la página para detectar cuál es
    const paginaActual = window.location.pathname;
    
    // Si estamos en login.html
    if (paginaActual.includes('login.html') || paginaActual.includes('login')) {
        formulario.addEventListener('submit', manejarLogin);
        // Restaurar email si fue guardado
        restaurarEmailGuardado();
    }
    
    // Si estamos en create-account.html
    if (paginaActual.includes('create-account.html') || paginaActual.includes('create-account')) {
        formulario.addEventListener('submit', manejarCrearCuenta);
    }
    
    // Verificar si hay usuario logueado (para páginas protegidas)
    const usuarioActual = UsuarioManager.obtenerUsuarioActual();
    if (usuarioActual) {
        console.log('Usuario logueado:', usuarioActual.username);
    }
});

// =============================================================================
// FUNCIÓN PARA CERRAR SESIÓN (Útil para agregar en menús)
// =============================================================================

/**
 * Cierra la sesión del usuario y redirige a login
 */
function cerrarSesion() {
    UsuarioManager.cerrarSesion();
    window.location.href = 'login.html';
}

// =============================================================================
// FUNCIONES AUXILIARES ADICIONALES
// =============================================================================

/**
 * Verifica si un usuario está logueado
 * @returns {Boolean} true si hay usuario logueado
 */
function usuarioEstaLogueado() {
    return UsuarioManager.obtenerUsuarioActual() !== null;
}

/**
 * Obtiene el username del usuario actual
 * @returns {String|null} Username del usuario o null
 */
function obtenerUsernameActual() {
    const usuario = UsuarioManager.obtenerUsuarioActual();
    return usuario ? usuario.username : null;
}
