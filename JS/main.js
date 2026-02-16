// Lógica para el panel de perfil en la cabecera
// Usa las funciones de verificacion-pass.js (UsuarioManager, usuarioEstaLogueado, obtenerUsernameActual, cerrarSesion)

document.addEventListener('DOMContentLoaded', function() {
    const perfilBtn = document.getElementById('perfilBtn');
    const perfilPanel = document.getElementById('perfilPanel');
    const perfilContent = document.getElementById('perfilContent');

    if (!perfilBtn || !perfilPanel || !perfilContent) return;

    // Rellenar panel según estado de sesión
    function renderPerfilPanel() {
        const usuario = UsuarioManager.obtenerUsuarioActual();
        perfilContent.innerHTML = '';

        if (usuario) {
            // Usuario logueado: mostrar info y botón cerrar sesión
            const nameP = document.createElement('p');
            nameP.innerHTML = `<strong>${usuario.username}</strong>`;

            const emailP = document.createElement('p');
            emailP.textContent = usuario.email;

            const actions = document.createElement('div');
            actions.className = 'perfil-actions';

            const btnCerrar = document.createElement('button');
            btnCerrar.textContent = 'Cerrar sesión';
            btnCerrar.addEventListener('click', function() {
                UsuarioManager.cerrarSesion();
                // Actualizar vista y redirigir a login
                renderPerfilPanel();
                perfilPanel.classList.remove('visible');
                window.location.href = 'Pags/login.html';
            });

            const btnCuenta = document.createElement('a');
            btnCuenta.textContent = 'Mi cuenta';
            // Redirige a la página de perfil del usuario cuando está logueado
            btnCuenta.href = 'Pags/perfil.html';

            actions.appendChild(btnCuenta);
            actions.appendChild(btnCerrar);

            perfilContent.appendChild(nameP);
            perfilContent.appendChild(emailP);
            perfilContent.appendChild(actions);
        } else {
            // No hay usuario: mostrar enlaces a login y registro
            const infoP = document.createElement('p');
            infoP.textContent = 'No has iniciado sesión.';

            const actions = document.createElement('div');
            actions.className = 'perfil-actions';

            const linkLogin = document.createElement('a');
            linkLogin.textContent = 'Iniciar sesión';
            linkLogin.href = 'Pags/login.html';

            const linkCrear = document.createElement('a');
            linkCrear.textContent = 'Crear cuenta';
            linkCrear.href = 'Pags/create-account.html';

            actions.appendChild(linkLogin);
            actions.appendChild(linkCrear);

            perfilContent.appendChild(infoP);
            perfilContent.appendChild(actions);
        }
    }

    // Toggle panel visible
    perfilBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        const isVisible = perfilPanel.classList.toggle('visible');
        perfilPanel.setAttribute('aria-hidden', !isVisible);
        perfilBtn.setAttribute('aria-expanded', isVisible);
        // Render content each time (keeps updated info)
        renderPerfilPanel();
    });

    // Click fuera para cerrar
    document.addEventListener('click', function(e) {
        if (!perfilPanel.contains(e.target) && e.target !== perfilBtn) {
            perfilPanel.classList.remove('visible');
            perfilPanel.setAttribute('aria-hidden', 'true');
            perfilBtn.setAttribute('aria-expanded', 'false');
        }
    });

    // Render una vez al cargar
    renderPerfilPanel();
});
