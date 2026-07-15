import { SUPA_URL, SUPA_KEY } from './supabase-config.js';

// ══ SUPABASE HELPER ══════════════════════════════════════════════════════════
export function supaFetch(path, method, body, token, extraHeaders) {
  if (method === 'POST' && path === '/rest/v1/psico_resultados' && window.RESULTADO_EDIT && window.RESULTADO_EDIT.id) {
    var editId = window.RESULTADO_EDIT.id;
    return supaFetch('/rest/v1/psico_resultados?id=eq.' + editId, 'PATCH', body, token, extraHeaders)
      .then(function(res) {
        if (res.ok) {
          window.RESULTADO_EDIT = null;
          ocultarBannerEdicionResultado();
        }
        return res;
      });
  }
  var headers = { 'Content-Type': 'application/json', 'apikey': SUPA_KEY };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  if (method !== 'GET' && method !== 'DELETE') headers['Prefer'] = 'return=representation';
  if (extraHeaders) Object.keys(extraHeaders).forEach(function(k){ headers[k]=extraHeaders[k]; });
  return fetch(SUPA_URL + path, { method: method, headers: headers, body: body ? JSON.stringify(body) : undefined })
    .then(function(res) {
      if (res.status === 401) {
        manejarSesionExpirada();
        var sesErr = new Error('SESION_EXPIRADA');
        sesErr.userNotified = true;
        throw sesErr;
      }
      if (!res.ok) {
        return res.text().then(function(t) {
          var msg = t || ('Error HTTP ' + res.status);
          try { var j = JSON.parse(t); msg = j.message || j.error_description || j.error || j.hint || msg; } catch (e) {}
          toast('✗ ' + msg.substring(0, 160), 'error');
          var httpErr = new Error(msg);
          httpErr.userNotified = true;
          throw httpErr;
        });
      }
      return res;
    });
}
// Handler genérico de error para guardarX(): si supaFetch ya avisó al usuario
// (toast de error HTTP o redirección por sesión vencida) no repite el aviso;
// si la promesa se rechazó antes de eso (sin conexión, etc.) sí avisa, porque
// si no el residente no se entera de que el guardado falló.
export function catchGuardarError(err) {
  if (err && err.userNotified) return;
  var msg = (err && err.message) || '';
  toast('✗ No se pudo guardar' + (msg ? ': ' + msg.substring(0, 140) : '. Verificá tu conexión a internet.'), 'error');
}
export function supaAuth(action, body) {
  return fetch(SUPA_URL + '/auth/v1/' + action, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': SUPA_KEY },
    body: JSON.stringify(body)
  }).then(function(r){ return r.json(); });
}
// Se dispara cuando Supabase devuelve 401 (token vencido o inválido) en cualquier
// llamada autenticada: corta la sesión y vuelve al login con un aviso claro,
// en vez de dejar la pantalla mostrando listas vacías silenciosamente.
export function manejarSesionExpirada() {
  if (!SESSION) return;
  doLogout('Tu sesión expiró. Iniciá sesión nuevamente.');
}
