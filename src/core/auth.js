import { supaAuth } from './supabase-client.js';

// ══ AUTH ═════════════════════════════════════════════════════════════════════
export function toggleLoginPass() {
  var input = document.getElementById('login-pass');
  var icon = document.getElementById('login-pass-toggle');
  var mostrar = input.type === 'password';
  input.type = mostrar ? 'text' : 'password';
  icon.textContent = mostrar ? '🙈' : '👁';
}

export function doLogin() {
  var email = document.getElementById('login-email').value.trim();
  var pass  = document.getElementById('login-pass').value;
  var errEl = document.getElementById('login-error');
  errEl.style.display = 'none';
  if (!email || !pass) { errEl.textContent = 'Completá email y contraseña.'; errEl.style.display = 'block'; return; }
  supaAuth('token?grant_type=password', { email: email, password: pass }).then(function(data) {
    if (data.error || !data.access_token) {
      errEl.textContent = 'Email o contraseña incorrectos.'; errEl.style.display = 'block'; return;
    }
    SESSION = data;
    try { localStorage.setItem('psico_session', JSON.stringify(data)); } catch(e) {}
    document.getElementById('topbar-email').textContent = email;
    // Ocultar pantalla de login y mostrar solo app
    ['screen-login'].forEach(function(id){
      var el = document.getElementById(id);
      el.classList.remove('active');
      el.style.display = 'none';
    });
    var app = document.getElementById('screen-app');
    app.style.display = 'flex';
    app.classList.add('active');
    actualizarSaludo();
    cargarPacientes();
    cargarResultados();
  });
}
export function doLogout(mensaje) {
  SESSION = null; PACIENTES = []; RESULTADOS = [];
  PAC_ACTIVO = null;
  try {
    localStorage.removeItem('psico_session'); sessionStorage.removeItem('pac_activo_id');
    limpiarBorradoresLocalesPaciente();
  } catch(e) {}
  var app = document.getElementById('screen-app');
  app.classList.remove('active');
  app.style.display = 'none';
  var login = document.getElementById('screen-login');
  login.style.display = 'flex';
  login.classList.add('active');
  document.getElementById('login-pass').value = '';
  var errEl = document.getElementById('login-error');
  if (errEl) {
    if (mensaje) { errEl.textContent = mensaje; errEl.style.display = 'block'; }
    else { errEl.style.display = 'none'; }
  }
}
// Borra del navegador los borradores de informe (motivo de consulta, antecedentes
// clínicos/psiquiátricos/familiares, hábitos tóxicos, conclusiones) que quedaban
// guardados en localStorage indefinidamente, incluso después de cerrar sesión.
export function limpiarBorradoresLocalesPaciente() {
  try {
    var prefix = (typeof INF_DRAFT_LS_PREFIX !== 'undefined') ? INF_DRAFT_LS_PREFIX : 'igp_inf_draft_';
    Object.keys(localStorage).filter(function(k){ return k.indexOf(prefix) === 0; })
      .forEach(function(k){ localStorage.removeItem(k); });
  } catch (e) {}
}
export function doForgot() {
  var email = document.getElementById('login-email').value.trim();
  if (!email) { alert('Escribí tu email primero.'); return; }
  supaAuth('recover', { email: email }).then(function() {
    alert('Si el email existe, recibirás un enlace para restablecer tu contraseña.');
  });
}
