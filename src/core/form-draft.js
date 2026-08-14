// ══ BORRADORES DE FORMULARIOS DE TEST ═══════════════════════════════════════
// Autoguarda en localStorage lo que el usuario va tipeando/marcando en el
// formulario de un test (antes de guardarlo), y lo restaura si sale de la
// vista sin guardar y vuelve. Genérico: no conoce ningún test en particular,
// funciona por convención de ids ({testid}-form / {testid}-paciente), así que
// cubre los ~50 tests existentes (migrados o no) sin tocarlos uno por uno.
var PREFIX = 'igp_test_draft_';
var DEBOUNCE_MS = 600;
var _timer = null;

function draftKey(testId, pacId) {
  return PREFIX + testId + '_' + pacId;
}

// Recorre los campos "de entrada" de un formulario (no los de resultado) y
// arma un objeto plano serializable. Los radios se agrupan por name (no por
// id, porque varios tests generan ids dinámicos tipo phq_0..phq_8 pero
// comparten name por ítem).
export function serializeForm(container) {
  var datos = {};
  container.querySelectorAll('input, select, textarea').forEach(function(el) {
    if (!el.id && !el.name) return;
    if (el.type === 'radio') {
      if (el.checked) datos['radio:' + el.name] = el.value;
    } else if (el.type === 'checkbox') {
      if (el.id) datos['chk:' + el.id] = el.checked;
    } else if (el.id) {
      datos['val:' + el.id] = el.value;
    } else if (el.name) {
      // Algunos <select> (ej. las escalas AVD del cuestionario familiar) solo
      // tienen name, no id — sin este caso quedaban afuera en silencio.
      datos['name:' + el.name] = el.value;
    }
  });
  return datos;
}

export function applyDraftToForm(container, datos) {
  Object.keys(datos).forEach(function(key) {
    if (key.indexOf('radio:') === 0) {
      var name = key.slice(6);
      var input = container.querySelector('input[type="radio"][name="' + CSS.escape(name) + '"][value="' + CSS.escape(String(datos[key])) + '"]');
      if (input) input.checked = true;
    } else if (key.indexOf('chk:') === 0) {
      var chk = document.getElementById(key.slice(4));
      if (chk) chk.checked = !!datos[key];
    } else if (key.indexOf('val:') === 0) {
      var el = document.getElementById(key.slice(4));
      if (el) el.value = datos[key];
    } else if (key.indexOf('name:') === 0) {
      var byName = container.querySelector('[name="' + CSS.escape(key.slice(5)) + '"]');
      if (byName) byName.value = datos[key];
    }
  });
}

function esVacio(datos) {
  return !datos || Object.keys(datos).length === 0;
}

// Único listener delegado en document, igual de "barato" que el que ya usa
// FORM_DIRTY (public/globals.js) — se limita a formularios de test visibles.
export function initFormDraftAutosave() {
  document.addEventListener('input', onFormEvent);
  document.addEventListener('change', onFormEvent);
}

function onFormEvent(e) {
  var form = e.target.closest && e.target.closest('.vista.active [id$="-form"]');
  if (!form) return;
  var testId = form.id.replace(/-form$/, '');

  // Si lo que cambió fue el propio selector de paciente del test, no es un
  // dato del cuestionario: recién ahí puede aparecer un borrador de OTRO
  // paciente para este mismo test.
  if (e.target.id === testId + '-paciente') {
    restoreFormDraft(testId);
    return;
  }

  var pacId = pacienteDelForm(form, testId);
  if (!pacId) return; // sin paciente seleccionado no sabemos de quién es el borrador

  clearTimeout(_timer);
  _timer = setTimeout(function() {
    var datos = serializeForm(form);
    try { localStorage.setItem(draftKey(testId, pacId), JSON.stringify(datos)); } catch (err) {}
  }, DEBOUNCE_MS);
}

function pacienteDelForm(form, testId) {
  var sel = document.getElementById(testId + '-paciente');
  return sel && sel.value ? sel.value : null;
}

// Se llama desde irTest(t) (public/legacy-tests.js) una vez que la vista del
// test está activa y su iniciarX() ya armó el DOM.
export function restoreFormDraft(testId) {
  var form = document.getElementById(testId + '-form');
  if (!form) return;
  var pacId = pacienteDelForm(form, testId);
  if (!pacId) return;
  var raw;
  try { raw = localStorage.getItem(draftKey(testId, pacId)); } catch (err) { return; }
  if (!raw) return;
  var datos;
  try { datos = JSON.parse(raw); } catch (err) { return; }
  if (esVacio(datos)) return;
  applyDraftToForm(form, datos);
  if (typeof toast === 'function') toast('Se recuperó un borrador sin guardar de este test.', 'success');
}

export function clearFormDraft(testId, pacId) {
  if (!testId || !pacId) return;
  try { localStorage.removeItem(draftKey(testId, pacId)); } catch (err) {}
}
