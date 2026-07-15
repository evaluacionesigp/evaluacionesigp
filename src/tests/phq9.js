// ══ PHQ-9 ════════════════════════════════════════════════════════════════════
var PHQ_ITEMS = [
  'Poco interés o alegría al hacer las cosas',
  'Sentirse desanimado/a, deprimido/a o sin esperanza',
  'Problemas para dormir o quedarse dormido/a, o dormir demasiado',
  'Sentirse cansado/a o tener poca energía',
  'Falta de apetito o comer demasiado',
  'Sentirse mal consigo mismo/a, o sentir que es un fracaso o que ha defraudado a su familia o a sí mismo/a',
  'Dificultad para concentrarse en cosas como leer el periódico o ver la televisión',
  'Moverse o hablar tan despacio que otras personas pueden haberlo notado, o lo contrario, estar tan inquieto/a que se ha estado moviendo mucho más de lo habitual',
  'Pensamientos de que estaría mejor muerto/a, o pensamientos de hacerse algún daño'
];
// Reutilizado también por GAD-7 (src/legacy-tests.js), por eso se exporta.
export var PHQ_OPS = ['Para nada (0)', 'Varios días (1)', 'Más de la mitad de los días (2)', 'Casi todos los días (3)'];

export function iniciarPHQ() {
  var c = document.getElementById('phq-items-container');
  c.innerHTML = PHQ_ITEMS.map(function(item, i) {
    return '<div class="bdi-item"><div class="bdi-pregunta">' + (i+1) + '. ' + item + '</div>' +
      '<div class="bdi-opciones">' +
      PHQ_OPS.map(function(op, j) {
        return '<label class="bdi-opcion"><input type="radio" name="phq_' + i + '" value="' + j + '"><span class="bdi-opcion-texto">' + op + '</span></label>';
      }).join('') + '</div></div>';
  }).join('');
  document.getElementById('phq-fecha').value = new Date().toISOString().split('T')[0];
  document.getElementById('phq-form').style.display = 'block';
  document.getElementById('phq-resultado').style.display = 'none';
}
export function limpiarPHQ() { if (!confirm('¿Limpiar?')) return; document.querySelectorAll('[name^="phq_"]').forEach(function(r){ r.checked=false; }); }
export function calcularPHQ() {
  var total=0; var sinR=0;
  for (var i=0;i<9;i++) { var s=document.querySelector('[name="phq_'+i+'"]:checked'); if(s) total+=parseInt(s.value); else sinR++; }
  if (sinR>0 && !confirm('Hay '+sinR+' ítem(s) sin respuesta. ¿Continuar?')) return;
  var cat,rango,badge,interp;
  if (total<=4)       { cat='Mínima';              rango='0–4';   badge='bg-minima'; }
  else if (total<=9)  { cat='Leve';                rango='5–9';   badge='bg-leve'; }
  else if (total<=14) { cat='Moderada';            rango='10–14'; badge='bg-moderada'; }
  else if (total<=19) { cat='Moderadamente grave'; rango='15–19'; badge='bg-moderada'; }
  else                { cat='Grave';               rango='20–27'; badge='bg-grave'; }
  var screening = total>=10 ? '⚠️ Puntaje ≥10: positivo para screening de depresión mayor. Se recomienda evaluación clínica completa.' : 'Puntaje <10: por debajo del punto de corte para depresión mayor (≥10).';
  if (total<=4) interp='<p>El puntaje ('+total+') indica síntomas depresivos <strong>mínimos</strong>, sin indicadores clínicamente significativos.</p>';
  else if (total<=9) interp='<p>El puntaje ('+total+') sugiere <strong>depresión leve</strong>. Se recomienda monitoreo y evaluación de la evolución.</p>';
  else if (total<=14) interp='<p>El puntaje ('+total+') indica <strong>depresión moderada</strong> con impacto funcional. Se sugiere intervención terapéutica.</p>';
  else if (total<=19) interp='<p>El puntaje ('+total+') indica <strong>depresión moderadamente grave</strong>. Se recomienda tratamiento y evaluación psiquiátrica.</p>';
  else interp='<p>El puntaje ('+total+') indica <strong>depresión grave</strong>. Requiere atención clínica inmediata y evaluación de riesgo.</p>';
  interp += '<p>'+screening+'</p><p><em>Validación argentina: Matrángolo, Azzolini & Simkin (2022), UBA. Interpretación orientativa.</em></p>';
  document.getElementById('phq-pts').textContent=total;
  document.getElementById('phq-cat').textContent='Depresión '+cat;
  document.getElementById('phq-rango').textContent='Rango: '+rango+' puntos';
  document.getElementById('phq-badge').textContent=cat;
  document.getElementById('phq-badge').className='badge-grande '+badge;
  document.getElementById('phq-interp').innerHTML=interp;
  document.getElementById('phq-form').style.display='none';
  document.getElementById('phq-resultado').style.display='block';
}
export function guardarResultadoPHQ() {
  if (!SESSION) return;
  var pacId=document.getElementById('phq-paciente').value;
  var pts=parseInt(document.getElementById('phq-pts').textContent);
  var cat=document.getElementById('phq-cat').textContent;
  var fecha=document.getElementById('phq-fecha').value;
  if (!pacId) { toast('Seleccioná un paciente primero'); return; }
  supaFetch('/rest/v1/psico_resultados','POST',{
    user_id:SESSION.user.id, paciente_id:pacId, test:'PHQ-9', fecha:fecha,
    puntaje_total:pts, categoria:cat,
    datos:{ total:pts }
  },SESSION.access_token).then(function(){
    cargarResultados();
    toast('✓ Resultado guardado', 'success');
    // Animar el botón que estaba activo
    var btnAll = document.querySelectorAll('.vista.active .btn-primary');
    var btn = btnAll.length ? btnAll[btnAll.length-1] : null;
    if(btn){ btn.classList.add('btn-saved'); setTimeout(function(){ btn.classList.remove('btn-saved'); },1500); }
  }).catch(catchGuardarError);
}
