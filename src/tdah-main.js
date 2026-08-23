import { SUPA_URL, SUPA_KEY } from './core/supabase-config.js';
import { serializeForm, applyDraftToForm } from './core/form-draft.js';

// ══ ASRS-V1.1 · WURS-25 · EAVA · DEX ═══════════════════════════════════════
// Copiados tal cual de public/legacy-tests.js (no son un módulo ES, así que no
// se pueden importar) para que el `datos`/`puntaje_total`/`puntaje_z`/`categoria`
// que arma esta página pública sea idéntico al que produce la carga manual —
// es la única forma de que el Word no distinga el origen del resultado.

var ASRS_BAR = {
  '18-50': {
    I: {p1:3,p5:6,p10:8,p15:9,p20:10,p25:11,p30:12,p35:13,p50:15,p55:16,p60:17,p65:17,p70:18,p75:19,p80:20,p85:21,p90:23,p95:25,p99:29, M:15.14, DS:5.63},
    H: {p1:3,p5:5,p10:7,p15:8,p20:9,p25:10,p30:11,p35:12,p50:14,p55:15,p60:16,p65:17,p70:18,p75:19,p80:20,p85:21,p90:23,p95:26,p99:31, M:14.81, DS:6.18},
    T: {p1:8,p5:13.5,p10:17,p15:19,p20:20,p25:22,p30:24,p35:25,p50:29,p55:31,p60:33,p65:34,p70:35,p75:37,p80:39,p85:41,p90:44,p95:48,p99:56, M:30.22, DS:10.5}
  },
  '>50': {
    I: {p1:3.05,p5:7,p10:9.5,p15:11,p20:12,p25:12.25,p30:13.5,p35:14,p50:15.5,p55:16,p60:17,p65:17,p70:18.5,p75:19,p80:20,p85:21,p90:24,p95:26.75,p99:29, M:16, DS:5.35},
    H: {p1:2.15,p5:6,p10:8,p15:9,p20:11,p25:12,p30:13,p35:14,p50:16,p55:16.75,p60:18,p65:19,p70:19.5,p75:21,p80:22,p85:24,p90:27.5,p95:29,p99:32.95, M:16.6, DS:6.78},
    T: {p1:7.25,p5:14,p10:18.5,p15:22,p20:24,p25:26,p30:26.5,p35:27.75,p50:31,p55:32,p60:36,p65:37.25,p70:39,p75:39,p80:40,p85:44,p90:47.5,p95:53.75,p99:61.85, M:32.19, DS:11.05}
  }
};
function asrsBuscarPc(score, bar) {
  var pts=[{p:1,v:bar.p1},{p:5,v:bar.p5},{p:10,v:bar.p10},{p:15,v:bar.p15},{p:20,v:bar.p20},{p:25,v:bar.p25},{p:30,v:bar.p30},{p:35,v:bar.p35},{p:50,v:bar.p50},{p:55,v:bar.p55},{p:60,v:bar.p60},{p:65,v:bar.p65},{p:70,v:bar.p70},{p:75,v:bar.p75},{p:80,v:bar.p80},{p:85,v:bar.p85},{p:90,v:bar.p90},{p:95,v:bar.p95},{p:99,v:bar.p99}];
  var pc=1;
  for(var i=0;i<pts.length;i++){ if(score>=pts[i].v) pc=pts[i].p; else break; }
  return pc;
}
var ASRS_INATENCION    = [1,2,3,4,7,8,9,10,11,12];
var ASRS_HIPERACTIVIDAD= [5,6,13,14,15,16,17,18];
var ASRS_ITEMS = [
  {n:1, txt:'¿Con qué frecuencia tiene dificultad para terminar los detalles finales de un proyecto después de haber hecho las partes difíciles?', sec:'A'},
  {n:2, txt:'¿Con qué frecuencia le cuesta poner las cosas en orden cuando tiene que hacer una tarea que requiere organización?', sec:'A'},
  {n:3, txt:'¿Con qué frecuencia tiene problemas para acordarse de citas u obligaciones?', sec:'A'},
  {n:4, txt:'Cuando tiene una tarea que exige pensar mucho, ¿con qué frecuencia evita o retrasa su comienzo?', sec:'A'},
  {n:5, txt:'¿Con qué frecuencia se mueve nerviosamente o retuerce las manos o los pies cuando tiene que estar sentado por un tiempo prolongado?', sec:'A'},
  {n:6, txt:'¿Con qué frecuencia se siente demasiado activo e impulsado a hacer cosas, como si tuviera un motor adentro?', sec:'A'},
  {n:7, txt:'¿Con qué frecuencia comete errores por descuido cuando tiene que trabajar en un proyecto difícil o aburrido?', sec:'B'},
  {n:8, txt:'¿Con qué frecuencia le cuesta mantener la atención cuando está haciendo un trabajo aburrido o repetitivo?', sec:'B'},
  {n:9, txt:'¿Con qué frecuencia le cuesta concentrarse en lo que otras personas le dicen, incluso cuando le están hablando directamente a usted?', sec:'B'},
  {n:10,txt:'¿Con qué frecuencia embolata o le cuesta encontrar cosas en la casa o el trabajo?', sec:'B'},
  {n:11,txt:'¿Con qué frecuencia lo distraen las actividades o ruidos que lo rodean?', sec:'B'},
  {n:12,txt:'¿Con qué frecuencia deja su asiento en reuniones u otras situaciones en las que se espera que se mantenga sentado?', sec:'B'},
  {n:13,txt:'¿Con qué frecuencia se siente inquieto o agitado?', sec:'B'},
  {n:14,txt:'¿Con qué frecuencia le cuesta despreocuparse y relajarse cuando tiene tiempo libre?', sec:'B'},
  {n:15,txt:'¿Con qué frecuencia encuentra que habla demasiado cuando está en situaciones sociales?', sec:'B'},
  {n:16,txt:'Cuando participa en una conversación, ¿con qué frecuencia encuentra que termina las frases de las personas con las que habla antes de que ellas puedan terminarlas?', sec:'B'},
  {n:17,txt:'¿Con qué frecuencia le cuesta esperar su turno en situaciones en las que es necesario esperar turno?', sec:'B'},
  {n:18,txt:'¿Con qué frecuencia interrumpe a otras personas cuando están ocupadas?', sec:'B'}
];

var WURS_ITEMS_LIST = [
  'Activo/a, no paraba nunca','Problemas de concentración, me distraía con facilidad',
  'Ansioso/a, preocupado/a','Nervioso/a, inquieto/a','Poco atento/a, en las nubes',
  'Dificultad para acabar las tareas ya empezadas','Irritable','Impulsivo/a',
  'Pensamientos que no podía controlar','Dificultad para estar quieto/a',
  'Explosivo/a, impredecible','Tenía rabietas','Me metía en peleas',
  'Desobediente con mis padres','Bajo rendimiento escolar','Dificultad para leer',
  'Dificultad con las matemáticas','Mal humor con facilidad','Deprimido/a, triste',
  'Poco imaginativo/a, sin iniciativa','Con poca autoestima',
  'Metido/a en problemas','Desobediente en la escuela','Notas bajas en conducta',
  'Poco aceptado/a por mis compañeros'
];
// Percentiles Scandar 2021 — Tabla V — WURS-25 — n=1.173, Argentina
var WURS_PCT=[{p:1,v:3},{p:5,v:6},{p:10,v:8},{p:15,v:11},{p:20,v:12},{p:25,v:14},{p:30,v:15},{p:35,v:17},{p:50,v:21},{p:55,v:22},{p:60,v:24},{p:65,v:26},{p:70,v:29},{p:75,v:31},{p:80,v:34},{p:85,v:37},{p:90,v:41},{p:95,v:49},{p:99,v:62.6}];

var EAVA_ITEMS_A = [
  {n:1,  txt:'¿Con qué frecuencia comete errores cuando tiene que trabajar en un proyecto aburrido o difícil?'},
  {n:2,  txt:'¿Con qué frecuencia tiene dificultades para mantener su atención cuando está aburrido o con un trabajo repetitivo?'},
  {n:3,  txt:'¿Con qué frecuencia tiene dificultades para concentrarse en cuestiones que otras personas le comunican, aun cuando se dirijan directamente a usted?'},
  {n:4,  txt:'¿Con qué frecuencia tiene dificultades para concretar los detalles de un proyecto una vez que las partes más difíciles se han conseguido?'},
  {n:5,  txt:'¿Con qué frecuencia tiene dificultades en ordenar las cosas en una tarea que requiere organización?'},
  {n:6,  txt:'Cuando tiene una tarea que requiere mucha reflexión, ¿con qué frecuencia la evita o demora en iniciarla?'},
  {n:7,  txt:'¿Con qué frecuencia extravía cosas o tiene dificultades para encontrarlas en su casa o en el trabajo?'},
  {n:8,  txt:'¿Con qué frecuencia se distrae por actividad o ruido a su alrededor?'},
  {n:9,  txt:'¿Con qué frecuencia tiene dificultades para recordar citas u obligaciones?'}
];
var EAVA_ITEMS_B = [
  {n:10, txt:'¿Con qué frecuencia se inquieta o mueve sus manos o pies cuando tiene que permanecer sentado durante largo tiempo?'},
  {n:11, txt:'¿Con qué frecuencia abandona su asiento en reuniones o en otras situaciones en las cuales debe permanecer sentado?'},
  {n:12, txt:'¿Con qué frecuencia tiene sensación de inquietud?'},
  {n:13, txt:'¿Con qué frecuencia tiene dificultades para relajarse durante el tiempo libre?'},
  {n:14, txt:'¿Con qué frecuencia se nota forzado en realizar actividades, como impulsado por un motor?'},
  {n:15, txt:'¿Con qué frecuencia habla demasiado en ambientes sociales?'},
  {n:16, txt:'Cuando mantiene una conversación, ¿con qué frecuencia permite que los demás terminen sus intervenciones?'},
  {n:17, txt:'¿Con qué frecuencia tiene dificultad para esperar su turno en situaciones que requieran una espera?'},
  {n:18, txt:'¿Con qué frecuencia interrumpe a los demás mientras están ocupados?'}
];
function eavaCat(score) {
  if (score >= 24) return { cat:'Muy probable TDAH adulto' };
  if (score >= 17) return { cat:'Probable TDAH adulto' };
  return                  { cat:'Baja probabilidad de TDAH' };
}

var DEX_DESORG  = [1,4,6,7,8,10,11,17,18,19];
var DEX_DESINHI = [2,3,5,9,12,13,14,15,16,20];
var DEX_BAR = {
  auto:   { total:{M:22.25,DS:10.10}, desorg:{M:8.60,DS:5.79}, desinhi:{M:9.69,DS:5.19} },
  hetero: { total:{M:20.68,DS:14.77}, desorg:{M:8.60,DS:5.79}, desinhi:{M:9.69,DS:5.19} }
};
// Enunciados transcriptos de index.html (no viven en un array JS ahí — están
// harcodeados uno por card, ver bloque "vista-dex" ~línea 4720).
var DEX_ITEMS_TXT = [
  {n:1,  txt:'Tengo problemas para entender lo que otros quieren decir, aunque digan las cosas claramente.'},
  {n:2,  txt:'Actúo sin pensar, haciendo lo primero que me pasa por la cabeza.'},
  {n:3,  txt:'A veces hablo sobre cosas que no han ocurrido en realidad, aunque yo creo que sí han pasado.'},
  {n:4,  txt:'Tengo dificultad para pensar cosas con antelación o para planificar el futuro.'},
  {n:5,  txt:'A veces me pongo demasiado exaltado con ciertas cosas y en esos momentos me paso un poco de la raya.'},
  {n:6,  txt:'Mezclo algunos episodios con otros, y me confundo al intentar ponerlos por orden.'},
  {n:7,  txt:'Tengo dificultades para ser consciente de la magnitud de mis problemas y soy poco realista respecto a mi futuro.'},
  {n:8,  txt:'Estoy como aletargado, o no me entusiasmo con las cosas.'},
  {n:9,  txt:'Hago o digo cosas vergonzosas cuando estoy con otras personas.'},
  {n:10, txt:'Tengo muchas ganas de hacer ciertas cosas en un momento dado, pero al momento ni me preocupo de ellas.'},
  {n:11, txt:'Tengo dificultad para mostrar mis emociones.'},
  {n:12, txt:'Me enfado mucho por cosas insignificantes.'},
  {n:13, txt:'No me preocupo sobre cómo tengo que comportarme en ciertas situaciones.'},
  {n:14, txt:'Me resulta difícil dejar de decir o hacer repetidamente ciertas cosas, una vez que he empezado a hacerlas.'},
  {n:15, txt:'Tiendo a ser bastante activo, y no puedo quedarme quieto por mucho tiempo.'},
  {n:16, txt:'Me resulta difícil dejar de hacer algo incluso aunque sepa que no debería hacerlo.'},
  {n:17, txt:'Digo una cosa pero después no actúo en consecuencia, no la cumplo.'},
  {n:18, txt:'Me resulta difícil centrarme en algo, y me distraigo con facilidad.'},
  {n:19, txt:'Tengo dificultades para tomar decisiones, o decidir lo que quiero hacer.'},
  {n:20, txt:'No me interesa lo que opinen otros sobre mi comportamiento.'}
];
function dexZLabel(z) {
  if (z === null || z === undefined) return '—';
  if (z >= 2.0)  return 'Muy elevado (síntomas marcados)';
  if (z >= 1.0)  return 'Elevado';
  if (z >= 0.5)  return 'Límite superior normativo';
  if (z >= -0.5) return 'Normal';
  return 'Por debajo del promedio';
}

// ══ ANAMNESIS · listas de antecedentes ══════════════════════════════════════
var ANT_SALUD = [
  {id:'prematuridad', label:'Prematuridad / bajo peso al nacer, complicaciones en el embarazo o parto de tu madre'},
  {id:'golpe',         label:'Golpe en la cabeza con pérdida de conciencia u hospitalización, epilepsia o crisis, meningitis/encefalitis, tics o Tourette'},
  {id:'tiroides',      label:'Hipertiroidismo o hipotiroidismo, anemia, diabetes'},
  {id:'insomnio',      label:'Insomnio o dificultades en el sueño'},
  {id:'internaciones', label:'Internaciones por alguna causa'},
  {id:'diag_psi',      label:'Diagnóstico psicológico o de salud mental'},
  {id:'dislexia',      label:'Dislexia u otra dificultad de lectura, escritura o cálculo'},
  {id:'lenguaje',      label:'Retraso o trastorno del lenguaje'},
  {id:'repitencia',    label:'Repitencia de años escolares o abandono escolar temprano'}
];
var TRAT_INFANCIA = [
  {id:'psicopedagogia', label:'Psicopedagogía'},
  {id:'fonoaudiologia', label:'Fonoaudiología'},
  {id:'to',              label:'Terapia Ocupacional'},
  {id:'psicologia',      label:'Psicología'},
  {id:'psicomotricidad', label:'Psicomotricidad'}
];
var ANT_FAMILIARES = [
  {id:'tdah',         label:'Déficit de Atención (TDAH)'},
  {id:'aprendizaje',  label:'Trastorno del Aprendizaje'},
  {id:'consumo',      label:'Consumo de alcohol o drogas'},
  {id:'autismo',      label:'Autismo'},
  {id:'dislexia',     label:'Dislexia u otra dificultad de lectura, escritura o cálculo'},
  {id:'lenguaje',     label:'Retraso o trastorno del lenguaje'},
  {id:'bipolaridad',  label:'Bipolaridad, Esquizofrenia'},
  {id:'depresion',    label:'Depresión o ansiedad'},
  {id:'otro_diag',    label:'Algún otro diagnóstico de salud mental'},
  {id:'neurologica',  label:'Alguna otra enfermedad neurológica (Epilepsia, Parkinson, etc.)'}
];
var HABITOS = [
  {id:'tabaco',  label:'Tabaco'},
  {id:'alcohol', label:'Alcohol'},
  {id:'drogas',  label:'Consumo de drogas'}
];

// ══ RENDER ═══════════════════════════════════════════════════════════════════
var LABELS_ASRS = ['Nunca','Rara vez','A veces','Con frecuencia','Con mucha frecuencia'];
var LABELS_WURS = ['Nada o casi nada','Un poco','Moderadamente','Bastante','Muy frecuentemente'];
var LABELS_EAVA = ['Nunca','Raramente','Algunas veces','A menudo','Muy a menudo'];
var LABELS_DEX  = ['Nunca','Ocasionalmente','Algunas veces','Con bastante frecuencia','Muy frecuentemente'];

function _renderEscala(items, containerId, namePrefix, labels) {
  var el = document.getElementById(containerId);
  el.innerHTML = items.map(function(it) {
    var opts = labels.map(function(lbl, v) {
      return '<label><input type="radio" name="'+namePrefix+it.n+'" value="'+v+'"><span>'+v+'<br>'+lbl+'</span></label>';
    }).join('');
    return '<div class="escala-item"><div class="escala-pregunta">'+it.n+'. '+it.txt+'</div><div class="escala-opts">'+opts+'</div></div>';
  }).join('');
}

function _renderChecklist(items, containerId, prefix, ningunoLabel) {
  var el = document.getElementById(containerId);
  var html = items.map(function(it) {
    return '<label class="chk-item"><input type="checkbox" id="'+prefix+'-'+it.id+'"> '+it.label+'</label>';
  }).join('');
  html += '<label class="chk-item"><input type="checkbox" id="'+prefix+'-ninguno"> '+ningunoLabel+'</label>';
  el.innerHTML = html;
}

function _renderTodo() {
  _renderChecklist(ANT_SALUD, 'chk-salud', 'ax-salud', 'Ninguno de ellos');
  _renderChecklist(TRAT_INFANCIA, 'chk-inftto', 'ax-inftto', 'Ninguno de ellos');
  _renderChecklist(ANT_FAMILIARES, 'chk-fam', 'ax-fam', 'Ninguno de ellos');
  _renderChecklist(HABITOS, 'chk-habitos', 'ax-habitos', 'Ninguno');

  _renderEscala(ASRS_ITEMS.filter(function(i){ return i.sec==='A'; }), 'asrs-items-a', 'asrs_', LABELS_ASRS);
  _renderEscala(ASRS_ITEMS.filter(function(i){ return i.sec==='B'; }), 'asrs-items-b', 'asrs_', LABELS_ASRS);
  _renderEscala(WURS_ITEMS_LIST.map(function(txt,i){ return {n:i+1, txt:'De niño/a era/estaba: '+txt}; }), 'wurs-items', 'wurs_', LABELS_WURS);
  _renderEscala(EAVA_ITEMS_A, 'eava-items-a', 'eava_', LABELS_EAVA);
  _renderEscala(EAVA_ITEMS_B, 'eava-items-b', 'eava_', LABELS_EAVA);
  _renderEscala(DEX_ITEMS_TXT, 'dex-items', 'dex', LABELS_DEX);
}

// ══ CÁLCULO DE PUNTAJES (idéntico a calcularAsrs/calcularWurs/calcularEAVA/calcularDEX) ══
function calcularEdad(fnac) {
  var hoy = new Date(); var nac = new Date(fnac);
  var edad = hoy.getFullYear() - nac.getFullYear();
  if (hoy.getMonth() < nac.getMonth() || (hoy.getMonth() === nac.getMonth() && hoy.getDate() < nac.getDate())) edad--;
  return edad;
}

function _calcularAsrsPublico(grupo) {
  var positivos=0, scoreI=0, scoreH=0, scoreT=0;
  for (var i=1;i<=6;i++) {
    var s = document.querySelector('input[name="asrs_'+i+'"]:checked');
    if (!s) return null;
    var v = parseInt(s.value); var umbral = i<=3?2:3;
    if (v>=umbral) positivos++;
  }
  ASRS_ITEMS.forEach(function(it){
    var s = document.querySelector('input[name="asrs_'+it.n+'"]:checked');
    if (!s) return;
    var v = parseInt(s.value); scoreT += v;
    if (ASRS_INATENCION.indexOf(it.n)!==-1) scoreI += v;
    if (ASRS_HIPERACTIVIDAD.indexOf(it.n)!==-1) scoreH += v;
  });
  var bar = ASRS_BAR[grupo];
  var pcI = asrsBuscarPc(scoreI, bar.I), pcH = asrsBuscarPc(scoreH, bar.H), pcT = asrsBuscarPc(scoreT, bar.T);
  var zI = parseFloat(((scoreI-bar.I.M)/bar.I.DS).toFixed(2));
  var zH = parseFloat(((scoreH-bar.H.M)/bar.H.DS).toFixed(2));
  var zT = parseFloat(((scoreT-bar.T.M)/bar.T.DS).toFixed(2));
  return {
    test: 'ASRS-V1.1', fecha: null, puntaje_total: scoreT, puntaje_z: zT,
    categoria: positivos>=4 ? 'Positivo para TDAH' : 'Negativo para TDAH',
    datos: { parte_a_positivos:positivos, total_18:scoreT, scoreI:scoreI, scoreH:scoreH, scoreT:scoreT, pcI:pcI, pcH:pcH, pcT:pcT, zI:zI, zH:zH, zT:zT, grupo:grupo }
  };
}

function _calcularWursPublico() {
  var total = 0;
  for (var i=1;i<=25;i++) {
    var s = document.querySelector('input[name="wurs_'+i+'"]:checked');
    if (!s) return null;
    total += parseInt(s.value);
  }
  var pc=1;
  for (var j=0;j<WURS_PCT.length;j++){ if(total>=WURS_PCT[j].v) pc=WURS_PCT[j].p; else break; }
  var zW = parseFloat(((total-23.5)/13.16).toFixed(2));
  var cat = total>=46 ? 'Significativo para síntomas en la infancia' : total>=36 ? 'Probable historia síntomas infantiles' : 'Sin síntomas significativos en la infancia';
  return { test:'WURS-25', fecha: null, puntaje_total: total, puntaje_z: zW, categoria: cat, datos: { total:total, pc:pc, z:zW } };
}

function _calcularEavaPublico() {
  var ptA=0, ptB=0;
  for (var i=0;i<EAVA_ITEMS_A.length;i++) {
    var s = document.querySelector('input[name="eava_'+EAVA_ITEMS_A[i].n+'"]:checked');
    if (!s) return null;
    ptA += parseInt(s.value);
  }
  for (var j=0;j<EAVA_ITEMS_B.length;j++) {
    var sb = document.querySelector('input[name="eava_'+EAVA_ITEMS_B[j].n+'"]:checked');
    if (!sb) return null;
    ptB += parseInt(sb.value);
  }
  var rA = eavaCat(ptA), rB = eavaCat(ptB);
  var catGlobal = (ptA>=24||ptB>=24) ? 'Muy probable TDAH adulto' : (ptA>=17||ptB>=17) ? 'Probable TDAH adulto' : 'Baja probabilidad';
  return { test:'EAVA', fecha: null, puntaje_total: ptA+ptB, puntaje_z: null, categoria: catGlobal, datos: { parte_a:ptA, parte_b:ptB, cat_a:rA.cat, cat_b:rB.cat } };
}

function _calcularDexPublico() {
  var scores = [];
  for (var i=1;i<=20;i++) {
    var sel = document.querySelector('input[name="dex'+i+'"]:checked');
    if (!sel) return null;
    scores.push(parseInt(sel.value));
  }
  var bar = DEX_BAR.auto;
  var total   = scores.reduce(function(a,b){ return a+b; }, 0);
  var desorg  = DEX_DESORG.reduce(function(a,i){ return a + scores[i-1]; }, 0);
  var desinhi = DEX_DESINHI.reduce(function(a,i){ return a + scores[i-1]; }, 0);
  function calcZ(val, b) { return parseFloat(((val - b.M) / b.DS).toFixed(2)); }
  var zTotal   = calcZ(total,   bar.total);
  var zDesorg  = calcZ(desorg,  bar.desorg);
  var zDesinhi = calcZ(desinhi, bar.desinhi);
  return {
    test:'DEX', fecha: null, puntaje_total: total, puntaje_z: zTotal, categoria: dexZLabel(zTotal),
    datos: { version:'auto', total:total, desorg:desorg, desinhi:desinhi, zTotal:zTotal, zDesorg:zDesorg, zDesinhi:zDesinhi, scores:scores }
  };
}

// ══ ANAMNESIS → texto para los campos del informe ═══════════════════════════
function _algunoMarcado(items, prefix, ningunoId) {
  var ninguno = document.getElementById(ningunoId);
  if (ninguno && ninguno.checked) return true;
  return items.some(function(it){
    var chk = document.getElementById(prefix + '-' + it.id);
    return chk && chk.checked;
  });
}

function _formatearChecklist(items, prefix, ningunoId, otrosId, ningunoTexto) {
  var otros = document.getElementById(otrosId);
  var otrosVal = otros ? otros.value.trim() : '';
  var ninguno = document.getElementById(ningunoId);
  if (ninguno && ninguno.checked && !otrosVal) return ningunoTexto;
  var marcados = items.filter(function(it) {
    var chk = document.getElementById(prefix + '-' + it.id);
    return chk && chk.checked;
  }).map(function(it){ return '• ' + it.label; });
  if (otrosVal) marcados.push('• Otros: ' + otrosVal);
  return marcados.length ? marcados.join('\n') : null;
}

function _construirIntake() {
  var tel = document.getElementById('ax-tel').value.trim();
  var correo = document.getElementById('ax-correo').value.trim();
  var contactoPartes = [];
  if (tel) contactoPartes.push('Tel: ' + tel);
  if (correo) contactoPartes.push('Email: ' + correo);

  var saludTxt  = _formatearChecklist(ANT_SALUD, 'ax-salud', 'ax-salud-ninguno', 'ax-salud-otros', 'Ninguno reportado.');
  var infttoTxt = _formatearChecklist(TRAT_INFANCIA, 'ax-inftto', 'ax-inftto-ninguno', 'ax-inftto-otros', 'Ninguno reportado.');
  var antClinicosPartes = [];
  if (saludTxt)  antClinicosPartes.push('Antecedentes de salud (cuestionario previo a la consulta):\n' + saludTxt);
  if (infttoTxt) antClinicosPartes.push('Tratamientos realizados durante la infancia:\n' + infttoTxt);

  return {
    nombre: document.getElementById('ax-nombre').value.trim() || null,
    fecha_nacimiento: document.getElementById('ax-fnac').value || null,
    escolaridad: document.getElementById('ax-escolaridad').value.trim() || null,
    dni: document.getElementById('ax-dni').value.trim() || null,
    ocupacion: document.getElementById('ax-ocupacion').value.trim() || null,
    procedencia: document.getElementById('ax-ciudad').value.trim() || null,
    derivado_por: document.getElementById('ax-derivado').value.trim() || null,
    contacto: contactoPartes.length ? contactoPartes.join(' · ') : null,
    dominancia: document.getElementById('ax-dominancia').value || null,
    ant_clinicos: antClinicosPartes.length ? antClinicosPartes.join('\n\n') : null,
    ant_psiquiatricos: document.getElementById('ax-psiq').value.trim() || null,
    ant_familiares: _formatearChecklist(ANT_FAMILIARES, 'ax-fam', 'ax-fam-ninguno', 'ax-fam-otros', 'Ninguno reportado.'),
    habitos_toxicos: _formatearChecklist(HABITOS, 'ax-habitos', 'ax-habitos-ninguno', 'ax-habitos-otros', 'Ninguno reportado.'),
    medicacion: document.getElementById('ax-medicacion').value.trim() || null
  };
}

// ══ VALIDACIÓN — bloquea el envío hasta que esté todo completo ══════════════
function _faltantesTdah() {
  var faltantes = [];
  function reqTxt(id, label) {
    var el = document.getElementById(id);
    if (!el || !el.value.trim()) faltantes.push(label);
  }
  reqTxt('ax-nombre', 'tu nombre'); reqTxt('ax-fnac', 'tu fecha de nacimiento');
  reqTxt('ax-escolaridad', 'tu nivel de educación'); reqTxt('ax-dni', 'tu DNI');
  reqTxt('ax-ocupacion', 'tu ocupación'); reqTxt('ax-ciudad', 'tu ciudad');
  reqTxt('ax-derivado', 'quién te derivó'); reqTxt('ax-tel', 'tu teléfono de contacto');
  reqTxt('ax-correo', 'tu correo de contacto'); reqTxt('ax-dominancia', 'tu dominancia');
  reqTxt('ax-psiq', 'tratamiento psicológico/psiquiátrico');

  if (!_algunoMarcado(ANT_SALUD, 'ax-salud', 'ax-salud-ninguno')) faltantes.push('antecedentes de salud');
  if (!_algunoMarcado(TRAT_INFANCIA, 'ax-inftto', 'ax-inftto-ninguno')) faltantes.push('tratamientos en la infancia');
  if (!_algunoMarcado(ANT_FAMILIARES, 'ax-fam', 'ax-fam-ninguno')) faltantes.push('antecedentes familiares');
  if (!_algunoMarcado(HABITOS, 'ax-habitos', 'ax-habitos-ninguno')) faltantes.push('hábitos tóxicos');

  var asrsSinResp = ASRS_ITEMS.filter(function(it){ return !document.querySelector('input[name="asrs_'+it.n+'"]:checked'); }).length;
  if (asrsSinResp) faltantes.push(asrsSinResp + ' ítem(s) del ASRS-V1.1');

  var wursSinResp = 0;
  for (var i=1;i<=25;i++) { if (!document.querySelector('input[name="wurs_'+i+'"]:checked')) wursSinResp++; }
  if (wursSinResp) faltantes.push(wursSinResp + ' ítem(s) del WURS-25');

  var eavaSinResp = EAVA_ITEMS_A.concat(EAVA_ITEMS_B).filter(function(it){ return !document.querySelector('input[name="eava_'+it.n+'"]:checked'); }).length;
  if (eavaSinResp) faltantes.push(eavaSinResp + ' ítem(s) del EAVA');

  var dexSinResp = 0;
  for (var j=1;j<=20;j++) { if (!document.querySelector('input[name="dex'+j+'"]:checked')) dexSinResp++; }
  if (dexSinResp) faltantes.push(dexSinResp + ' ítem(s) del DEX');

  return faltantes;
}

// ══ BORRADOR LOCAL (mismo mecanismo que familiar-main.js) ══════════════════
var TDAH_DRAFT_TIMER = null;
function tdahDraftKey(pacId) { return 'igp_tdah_draft_' + pacId; }

function tdahBindDraftAutosave(pacId) {
  var onChange = function() {
    clearTimeout(TDAH_DRAFT_TIMER);
    TDAH_DRAFT_TIMER = setTimeout(function() {
      var datos = serializeForm(document.getElementById('pantalla-form'));
      try { localStorage.setItem(tdahDraftKey(pacId), JSON.stringify(datos)); } catch (e) {}
    }, 600);
  };
  document.getElementById('pantalla-form').addEventListener('input', onChange);
  document.getElementById('pantalla-form').addEventListener('change', onChange);
}

function tdahRestoreDraft(pacId) {
  var raw;
  try { raw = localStorage.getItem(tdahDraftKey(pacId)); } catch (e) { return; }
  if (!raw) return;
  var datos;
  try { datos = JSON.parse(raw); } catch (e) { return; }
  if (!datos || !Object.keys(datos).length) return;
  applyDraftToForm(document.getElementById('pantalla-form'), datos);
}

function tdahClearDraft(pacId) {
  try { localStorage.removeItem(tdahDraftKey(pacId)); } catch (e) {}
}

function getPacienteIdUrl() {
  var params = new URLSearchParams(window.location.search);
  var id = params.get('paciente');
  var uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return (id && uuidRe.test(id)) ? id : null;
}

// ══ ENVÍO ═════════════════════════════════════════════════════════════════
function enviarTdah() {
  var pacId = getPacienteIdUrl();
  if (!pacId) return;

  var faltantes = _faltantesTdah();
  var msgEl = document.getElementById('msg-envio');
  if (faltantes.length) {
    msgEl.style.color = '#c0392b';
    msgEl.textContent = 'Faltan completar: ' + faltantes.join(', ') + '.';
    return;
  }

  var edad = calcularEdad(document.getElementById('ax-fnac').value);
  var grupo = edad <= 50 ? '18-50' : '>50';
  var hoy = new Date().toISOString().split('T')[0];

  var asrs = _calcularAsrsPublico(grupo);
  var wurs = _calcularWursPublico();
  var eava = _calcularEavaPublico();
  var dex  = _calcularDexPublico();
  if (!asrs || !wurs || !eava || !dex) {
    msgEl.style.color = '#c0392b';
    msgEl.textContent = 'Faltan respuestas en alguno de los cuestionarios. Revisá que estén todos completos.';
    return;
  }
  [asrs, wurs, eava, dex].forEach(function(r) { r.fecha = hoy; });

  var intake = _construirIntake();

  var btn = document.getElementById('btn-enviar');
  btn.disabled = true;
  btn.textContent = 'Enviando…';
  msgEl.style.color = '';
  msgEl.textContent = '';

  fetch(SUPA_URL + '/rest/v1/rpc/enviar_cuestionarios_tdah', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPA_KEY,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({ p_paciente_id: pacId, p_intake: intake, p_resultados: [asrs, wurs, eava, dex] })
  }).then(function(res) {
    if (!res.ok) {
      return res.text().then(function(body) {
        throw new Error('HTTP ' + res.status + ' — ' + body);
      });
    }
    tdahClearDraft(pacId);
    document.getElementById('pantalla-form').style.display = 'none';
    document.getElementById('pantalla-exito').style.display = 'block';
  }).catch(function(err) {
    console.error('Error al enviar cuestionarios TDAH:', err);
    btn.disabled = false;
    btn.textContent = 'Enviar respuestas';
    var vencido = err && err.message && err.message.indexOf('LINK_VENCIDO') !== -1;
    msgEl.style.color = '#c0392b';
    msgEl.textContent = vencido
      ? 'Este link ya venció o ya fue usado. Pedile al profesional que te mande uno nuevo.'
      : 'Hubo un error al enviar. Por favor avisá al profesional.';
  });
}

window.enviarTdah = enviarTdah;

window.addEventListener('DOMContentLoaded', function() {
  var pacId = getPacienteIdUrl();
  if (!pacId) {
    document.getElementById('pantalla-error').style.display = 'block';
    return;
  }
  document.getElementById('pantalla-form').style.display = 'block';
  _renderTodo();
  tdahRestoreDraft(pacId);
  tdahBindDraftAutosave(pacId);
});
