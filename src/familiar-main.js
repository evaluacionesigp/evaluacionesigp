import { SUPA_URL, SUPA_KEY } from './core/supabase-config.js';

// ══ CUESTIONARIOS FAMILIARES (protocolo CIATEC / González Palau) ═══════════════
var FAM_NPIQ = [
  {id:'delirios',  label:'Delirios',  prompt:'Creencias falsas (robos, daño).'},
  {id:'alucin',    label:'Alucinaciones', prompt:'Visiones o voces; actúa como si las oyera/viera.'},
  {id:'agitacion', label:'Agitación o agresión', prompt:'Se niega a cooperar o no deja ayudarle.'},
  {id:'depresion', label:'Depresión o disforia', prompt:'Triste, desanimado o llora.'},
  {id:'ansiedad',  label:'Ansiedad', prompt:'Nervioso, preocupado o tenso sin motivo.'},
  {id:'euforia',   label:'Euforia o elación', prompt:'Demasiado contento sin motivo aparente.'},
  {id:'apatia',    label:'Apatía o indiferencia', prompt:'Perdió interés o motivación.'},
  {id:'desinhib',  label:'Desinhibición', prompt:'Actúa impulsivo; cosas inapropiadas.'},
  {id:'irritab',   label:'Irritabilidad o labilidad', prompt:'Se irrita fácil; cambios de ánimo.'},
  {id:'motora',    label:'Conducta motora anormal', prompt:'Deambula, abre cajones repetidamente.'},
  {id:'sueno',     label:'Cambios en el sueño', prompt:'Insomnio, deambula o se viste de noche.'},
  {id:'apetito',   label:'Cambios en el apetito', prompt:'Cambios en apetito, peso o alimentación.'}
];
var FAM_AD8 = [
  {id:'ad8_1', n:1, label:'Dificultad para emitir juicios o tomar decisiones correctas'},
  {id:'ad8_2', n:2, label:'Menor interés en hobbies y pasatiempos'},
  {id:'ad8_3', n:3, label:'Repite las preguntas, comentarios o cosas que cuenta'},
  {id:'ad8_4', n:4, label:'Dificultad para aprender a usar aparatos o dispositivos'},
  {id:'ad8_5', n:5, label:'Olvidar el mes y el año en que se encuentra'},
  {id:'ad8_6', n:6, label:'Dificultad en manejo de asuntos financieros complejos'},
  {id:'ad8_7', n:7, label:'Dificultad para recordar citas y cosas que tiene que hacer'},
  {id:'ad8_8', n:8, label:'Problemas recurrentes de memoria y razonamiento'}
];
var FAM_AVDB = [
  {id:'identif', label:'A) Identificación personal', options:[
    {v:0,t:'0 · Datos correctos siempre'},{v:1,t:'1 · Ocasional duda en algún dato'},
    {v:2,t:'2 · Solo algún dato personal'},{v:3,t:'3 · Duda datos personales'}
  ]},
  {id:'aseo', label:'B) Aseo personal', options:[
    {v:0,t:'0 · Se asea sin ayuda'},{v:1,t:'1 · Asea bien, hay que indicarle'},
    {v:2,t:'2 · Requiere indicación o ayuda parcial'},{v:3,t:'3 · Ayuda frecuente para asearse'}
  ]},
  {id:'vestirse', label:'C) Vestirse apropiadamente', options:[
    {v:0,t:'0 · Elige ropa y se viste solo'},{v:1,t:'1 · Necesita indicación de ropa'},
    {v:2,t:'2 · Ayuda para elegir o vestirse'},{v:3,t:'3 · Le eligen ropa o visten casi completo'}
  ]},
  {id:'continen', label:'F) Continencia', options:[
    {v:0,t:'0 · Control esfinteriano completo'},{v:1,t:'1 · Dificultad ocasional nocturna'},
    {v:2,t:'2 · Accidentes ocasionales diurnos'},{v:3,t:'3 · Ayuda para esfínteres'}
  ]}
];
var FAM_AVDI = [
  {id:'telefono', label:'A) Capacidad para usar el teléfono', options:[
    {v:0,t:'0 · Usa teléfono con independencia'},{v:1,t:'1 · Marca números conocidos'},
    {v:2,t:'2 · Contesta, no marca'},{v:3,t:'3 · No usa el teléfono'}
  ]},
  {id:'compras', label:'B) Ir de compras', options:[
    {v:0,t:'0 · Compras independientes'},{v:1,t:'1 · Compras pequeñas solo'},
    {v:2,t:'2 · Necesita compañía'},{v:3,t:'3 · Incapaz de comprar'}
  ]},
  {id:'comida', label:'C) Preparación de la comida', options:[
    {v:0,t:'0 · Planea y cocina solo'},{v:1,t:'1 · Cocina con ingredientes dados'},
    {v:2,t:'2 · Calienta o prepara parcialmente'},{v:3,t:'3 · Necesita que le preparen comida'}
  ]},
  {id:'transp', label:'F) Medio de transporte', options:[
    {v:0,t:'0 · Transporte público o maneja'},{v:1,t:'1 · Organiza taxi, no otros medios'},
    {v:2,t:'2 · Transporte público acompañado'},{v:3,t:'3 · Solo taxi o auto con ayuda'},{v:4,t:'4 · No viaja'}
  ]},
  {id:'medic', label:'G) Responsabilidad sobre la medicación', options:[
    {v:0,t:'0 · Medicación autónoma'},{v:1,t:'1 · Toma si está preparada'},{v:2,t:'2 · No se responsabiliza'}
  ]},
  {id:'dinero', label:'H) Capacidad de utilizar el dinero', options:[
    {v:0,t:'0 · Finanzas independientes'},{v:1,t:'1 · Gastos diarios, ayuda banco'},{v:2,t:'2 · Incapaz de manejar dinero'}
  ]}
];
var FAM_AVDE = [
  {id:'inform', label:'A) Se mantiene informado', options:[
    {v:0,t:'0 · Informado de varios temas'},{v:1,t:'1 · Solo uno o dos temas'},
    {v:2,t:'2 · Depende que le informen'},{v:3,t:'3 · No se informa'}
  ]},
  {id:'social', label:'B) Contactos socio afectivos', options:[
    {v:0,t:'0 · Vincula con satisfacción'},{v:1,t:'1 · Relaciona para no aislarse'},
    {v:2,t:'2 · Dificultad con la gente'},{v:3,t:'3 · No desea estar con gente'}
  ]},
  {id:'recreat', label:'C) Actividades recreativas', options:[
    {v:0,t:'0 · Recrea con frecuencia'},{v:1,t:'1 · Recrea si lo acompañan'},
    {v:2,t:'2 · Errático en recreación'},{v:3,t:'3 · No participa recreativamente'}
  ]},
  {id:'autono', label:'D) Autonomía e independencia', options:[
    {v:0,t:'0 · Autonomía general'},{v:1,t:'1 · Ayuda o permisos eventuales'},
    {v:2,t:'2 · Apoyo frecuente'},{v:3,t:'3 · Depende de otros'}
  ]},
  {id:'planes', label:'E) Formula planes de futuro', options:[
    {v:0,t:'0 · Planea y actúa en consecuencia'},{v:1,t:'1 · Planea, poca movilización'},
    {v:2,t:'2 · Escasos planes'},{v:3,t:'3 · Sin planes ni proyectos'}
  ]},
  {id:'responsab', label:'F) Responsabilidad y confianza', options:[
    {v:0,t:'0 · Muy responsable'},{v:1,t:'1 · Responsable si controlan'},
    {v:2,t:'2 · Poca responsabilidad'},{v:3,t:'3 · No inspira confianza'}
  ]},
  {id:'opinion', label:'G) Expresión de opiniones comprometidas', options:[
    {v:0,t:'0 · Opina y discute bien'},{v:1,t:'1 · Opina en ciertas circunstancias'},
    {v:2,t:'2 · Dificultad para opinar'},{v:3,t:'3 · No expresa opinión'}
  ]},
  {id:'aprende', label:'H) Aprende cosas nuevas', options:[
    {v:0,t:'0 · Aprende nuevas actividades'},{v:1,t:'1 · Habilidades limitadas'},
    {v:2,t:'2 · No intenta aprender'},{v:3,t:'3 · Dificultad para aprender'}
  ]}
];

function _renderFamiliarGrids() {
  var npiqG = document.getElementById('npiq-grid');
  npiqG.innerHTML = '';
  FAM_NPIQ.forEach(function(item) {
    var d = document.createElement('div');
    d.className = 'item-box';
    d.innerHTML = '<div class="item-label">'+item.label+'</div>'+
      (item.prompt ? '<div class="item-prompt">'+item.prompt+'</div>' : '')+
      '<div class="item-opts">'+
      '<label><input type="checkbox" id="npiq-'+item.id+'-pres" onchange="npiqChk(\''+item.id+'\')"> Sí</label>'+
      '<select id="npiq-'+item.id+'-grav" class="item-select" disabled style="width:auto;">'+
        '<option value="0">— gravedad —</option>'+
        '<option value="1">1 · Leve</option>'+
        '<option value="2">2 · Moderado</option>'+
        '<option value="3">3 · Severo</option>'+
      '</select>'+
      '<span style="font-size:0.75rem;color:var(--muted);">No = ausente</span>'+
      '</div>';
    npiqG.appendChild(d);
  });

  var ad8G = document.getElementById('ad8-grid');
  ad8G.innerHTML = '';
  FAM_AD8.forEach(function(item) {
    var d = document.createElement('div');
    d.className = 'item-box';
    d.innerHTML = '<div class="item-label">'+item.n+'. '+item.label+'</div>'+
      '<div class="item-opts">'+
      ['si','no','nose'].map(function(v,i){
        var lbl = ['Sí','No','No sabe'][i];
        return '<label><input type="radio" name="ad8-'+item.id+'" value="'+v+'"> '+lbl+'</label>';
      }).join('')+
      '</div>';
    ad8G.appendChild(d);
  });

  function renderAvd(items, containerId) {
    var g = document.getElementById(containerId);
    g.innerHTML = '';
    items.forEach(function(item) {
      var opts = (item.options || []).map(function(o) {
        return '<option value="'+o.v+'">'+o.t+'</option>';
      }).join('');
      var d = document.createElement('div');
      d.className = 'item-box';
      d.innerHTML = '<div class="item-label">'+item.label+'</div>'+
        '<select name="'+containerId+'-'+item.id+'" class="item-select">'+
        '<option value="">— Seleccionar nivel —</option>'+opts+
        '</select>';
      g.appendChild(d);
    });
  }
  renderAvd(FAM_AVDB, 'avdb-grid');
  renderAvd(FAM_AVDI, 'avdi-grid');
  renderAvd(FAM_AVDE, 'avde-grid');
}

function npiqChk(id) {
  var pres = document.getElementById('npiq-'+id+'-pres');
  var grav = document.getElementById('npiq-'+id+'-grav');
  grav.disabled = !pres.checked;
  if (!pres.checked) grav.value = '0';
}

function _getFamData() {
  var npiq = {};
  FAM_NPIQ.forEach(function(item){
    var pres = document.getElementById('npiq-'+item.id+'-pres');
    var grav = document.getElementById('npiq-'+item.id+'-grav');
    npiq[item.id] = (pres && pres.checked) ? parseInt(grav.value)||1 : 0;
  });
  var npiqTotal = Object.values(npiq).reduce(function(a,b){return a+(b>0?1:0);},0);
  var hayNpiq = npiqTotal > 0;

  var ad8 = {};
  var ad8Total = 0;
  FAM_AD8.forEach(function(item){
    var sel = document.querySelector('input[name="ad8-'+item.id+'"]:checked');
    ad8[item.id] = sel ? sel.value : null;
    if (sel && sel.value === 'si') ad8Total++;
  });
  var hayAD8 = FAM_AD8.some(function(item){ return ad8[item.id] !== null; });

  function getAvd(items, prefix) {
    var avd = {}, total = 0, hay = false;
    items.forEach(function(item){
      var el = document.querySelector('select[name="'+prefix+'-'+item.id+'"]');
      avd[item.id] = el && el.value !== '' ? parseInt(el.value, 10) : null;
      if (el && el.value !== '') { hay = true; total += parseInt(el.value, 10); }
    });
    return {data: avd, total: total, hay: hay};
  }
  var avdb = getAvd(FAM_AVDB, 'avdb-grid');
  var avdi = getAvd(FAM_AVDI, 'avdi-grid');
  var avde = getAvd(FAM_AVDE, 'avde-grid');

  return {
    informante: document.getElementById('familiar-informante').value || null,
    npiq: hayNpiq ? npiq : null,
    npiqTotal: npiqTotal,
    ad8: hayAD8 ? ad8 : null,
    ad8Total: ad8Total,
    avdb: avdb.hay ? avdb.data : null,
    avdbTotal: avdb.total,
    avdi: avdi.hay ? avdi.data : null,
    avdiTotal: avdi.total,
    avde: avde.hay ? avde.data : null,
    avdeTotal: avde.total
  };
}

function getPacienteIdUrl() {
  var params = new URLSearchParams(window.location.search);
  var id = params.get('paciente');
  var uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return (id && uuidRe.test(id)) ? id : null;
}

function enviarFamiliar() {
  var pacId = getPacienteIdUrl();
  if (!pacId) return;
  var d = _getFamData();
  if (!d.npiq && !d.ad8 && !d.avdb && !d.avdi && !d.avde) {
    document.getElementById('msg-envio').textContent = 'Completá al menos un cuestionario antes de enviar.';
    return;
  }
  var resumen = [];
  if (d.npiq)  resumen.push('NPI-Q: '+ d.npiqTotal +' síntomas');
  if (d.ad8)   resumen.push('AD8: '+ d.ad8Total +'/8');
  if (d.avdb)  resumen.push('AVD Básicas: '+ d.avdbTotal);
  if (d.avdi)  resumen.push('AVD Instr.: '+ d.avdiTotal);
  if (d.avde)  resumen.push('AVD Expan.: '+ d.avdeTotal);

  var btn = document.getElementById('btn-enviar');
  btn.disabled = true;
  btn.textContent = 'Enviando…';
  document.getElementById('msg-envio').textContent = '';

  var fecha = document.getElementById('familiar-fecha').value || new Date().toISOString().split('T')[0];

  fetch(SUPA_URL + '/rest/v1/rpc/insertar_resultado_familiar', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPA_KEY,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({
      p_paciente_id: pacId,
      p_test: 'Cuestionarios Familiares',
      p_fecha: fecha,
      p_puntaje_total: d.ad8Total,
      p_categoria: resumen.join(' · '),
      p_datos: d
    })
  }).then(function(res) {
    if (!res.ok) {
      return res.text().then(function(body) {
        throw new Error('HTTP ' + res.status + ' — ' + body);
      });
    }
    document.getElementById('pantalla-form').style.display = 'none';
    document.getElementById('pantalla-exito').style.display = 'block';
  }).catch(function(err) {
    console.error('Error al enviar cuestionarios familiares:', err);
    btn.disabled = false;
    btn.textContent = 'Enviar respuestas';
    document.getElementById('msg-envio').textContent = 'Hubo un error al enviar. Por favor avisá al profesional.';
  });
}

// El HTML llama a estas por nombre (onclick="enviarFamiliar()", onchange="npiqChk(...)").
window.enviarFamiliar = enviarFamiliar;
window.npiqChk = npiqChk;

window.addEventListener('DOMContentLoaded', function() {
  var pacId = getPacienteIdUrl();
  if (!pacId) {
    document.getElementById('pantalla-error').style.display = 'block';
    return;
  }
  document.getElementById('familiar-fecha').value = new Date().toISOString().split('T')[0];
  document.getElementById('pantalla-form').style.display = 'block';
  _renderFamiliarGrids();
});
