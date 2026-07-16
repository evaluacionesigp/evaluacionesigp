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

// ══ IDENTIDAD VISUAL POR SECTOR ═══════════════════════════════════════════════
// Cada sector clínico tiñe la app (var(--accent) y afines, vía CSS en main.css)
// y agrega un chip con ícono al back-btn de la vista activa, para que se sepa
// en qué sector estás incluso varias pantallas adentro (grilla → test → resultado
// comparten el mismo <div class="vista">, así que un solo chip cubre las 3).
var SECTOR_META = {
  clinica: { label: 'Psicología Clínica', icon: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 6c-3.4 0-5.6 2.7-5.6 5.8 0 1.3.4 2.3 1 3.1-1.3 1-2.1 2.5-2.1 4.3 0 2.4 1.6 4.2 3.7 4.7.3 2.5 2.5 4.4 5.1 4.4 1.7 0 3.2-.8 4.1-2"/><circle cx="20" cy="9" r="1.4" fill="currentColor" stroke="none"/><path d="M17.5 12c1.2-2 3.6-3 5.8-2.2"/></svg>' },
  neuro:   { label: 'Neuropsicología',    icon: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="16,3 27,9.5 27,22.5 16,29 5,22.5 5,9.5"/><circle cx="16" cy="16" r="2.6"/><line x1="16" y1="3" x2="16" y2="13.2"/><line x1="27" y1="9.5" x2="18.3" y2="14.6"/><line x1="27" y1="22.5" x2="18.3" y2="17.4"/><line x1="16" y1="29" x2="16" y2="18.8"/><line x1="5" y1="22.5" x2="13.7" y2="17.4"/><line x1="5" y1="9.5" x2="13.7" y2="14.6"/></svg>' },
  dolor:   { label: 'Dolor',              icon: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4c-4.5 3-7 7.4-7 12 0 5.5 3.5 10 7 12 3.5-2 7-6.5 7-12 0-4.6-2.5-9-7-12z"/><path d="M16 12l-2.6 5.4h2.2L14.2 22 19 15.6h-2.4L18.5 12"/></svg>' },
  tdah:    { label: 'Neurodesarrollo',     icon: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 26V17M14 26V10M21 26V13.5M28 26V6.5"/><path d="M24.5 3.5c1.9 0 3.5 1.5 3.5 3.4"/><circle cx="24.4" cy="4.2" r="1.3" fill="currentColor" stroke="none"/></svg>' }
};

function aplicarContextoSector() {
  var meta = SECTOR_META[sectorActual];
  if (meta) document.body.setAttribute('data-sector', sectorActual);
  else document.body.removeAttribute('data-sector');
  document.querySelectorAll('.sector-chip').forEach(function(el){ el.remove(); });
  if (!meta) return;
  var btn = document.querySelector('.vista.active .back-btn');
  if (!btn) return;
  var chip = document.createElement('span');
  chip.className = 'sector-chip';
  chip.innerHTML = meta.icon + '<b>' + meta.label + '</b>';
  btn.insertAdjacentElement('afterbegin', chip);
}
