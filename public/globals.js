// ══ ESTADO GLOBAL COMPARTIDO ═════════════════════════════════════════════════
// Script clásico (no módulo ES) a propósito: docenas de funciones todavía no
// migradas (en src/legacy-tests.js) leen y reasignan estas variables por nombre
// (ej. "PACIENTES = data;"). Si esto fuera un módulo ES con "export let", esas
// reasignaciones no actualizarían el binding que ven los módulos del núcleo, y
// quedarían desincronizados. Mientras el resto de la app siga con ese patrón,
// esto tiene que seguir siendo globals reales de window.
var SESSION = null;
var PACIENTES = [];
var RESULTADOS = [];

// ── Sin restauración automática: siempre arrancar en el login ──────────────────
var pacienteSelModal = null;
var sectorActual = '';
var PAC_ACTIVO = null;

// ══ AVISO DE CAMBIOS SIN GUARDAR ═════════════════════════════════════════════
// Se marca "sucio" cualquier formulario de test dentro de la vista activa; se
// limpia al guardar con éxito (cargarResultados) o al confirmar la salida.
// Cubre tanto la navegación interna (irTest/irVista/irSector) como el cierre
// o recarga de la pestaña (beforeunload).
var FORM_DIRTY = false;
document.addEventListener('input', function(e){
  if (e.target.closest && e.target.closest('.vista.active [id$="-form"]')) FORM_DIRTY = true;
});
document.addEventListener('change', function(e){
  if (e.target.closest && e.target.closest('.vista.active [id$="-form"]')) FORM_DIRTY = true;
});
window.addEventListener('beforeunload', function(e){
  if (!FORM_DIRTY) return;
  e.preventDefault();
  e.returnValue = '';
  return '';
});
function confirmarSalidaSinGuardar() {
  if (!FORM_DIRTY) return true;
  var salir = confirm('Hay datos cargados en este test que no guardaste. ¿Salir igual?');
  if (salir) FORM_DIRTY = false;
  return salir;
}
