// ══ TOKEN TEST ═══════════════════════════════════════════════════════════════
// Versión abreviada De Renzi & Faglioni (1978) — 36 ítems — Puntaje máximo: 36
// BAREMO 18–49: Aranciva et al. (2012) NEURONORMA jóvenes España n=179
// BAREMO 50–94: Peña-Casanova et al. (2009) NEURONORMA España n=348
// Fallback <18 o >94: punto de corte clásico De Renzi & Faglioni (1978)

// ── Aranciva 2012: Tabla 1 bruto → PE ──
var TOKEN_A_BRUTO_PE = [
  {max:32,pe:2},{max:32.5,pe:3},{max:33,pe:4},{max:33.5,pe:5},
  {max:34,pe:7},{max:34.5,pe:8},{max:35,pe:9},{max:35.5,pe:10},{max:36,pe:18}
];

// ── Aranciva 2012: Tabla 3 ajuste PE por escolaridad ──
function tokenA_AjusteEscol(e) {
  if (e<=8) return 2; if (e===9) return 1; if (e===10) return 1;
  if (e<=15) return 0; if (e<=17) return -1; if (e<=19) return -2; return -3;
}

function tokenA_BrutoPE(pb) {
  for (var i=0;i<TOKEN_A_BRUTO_PE.length;i++) { if (pb<=TOKEN_A_BRUTO_PE[i].max) return TOKEN_A_BRUTO_PE[i].pe; }
  return 18;
}

// ── Peña-Casanova 2009: Tabla 4 bruto → NSSA por grupo etario ──
// Grupos: 0=50-56, 1=57-59, 2=60-62, 3=63-65, 4=66-68, 5=69-71, 6=72-74, 7=75-77, 8=78-80, 9=81+
// Valores: [min_bruto, max_bruto] → NSSA. null = no hay datos para ese rango.
// Representamos como array de {nssa, min, max} por grupo
var TOKEN_PC_TABLA = [
  // NSSA 2 (<pc1)
  { nssa:2,  g:[{min:0,max:24.9},{min:0,max:25},{min:0,max:24.4},{min:0,max:21.4},{min:0,max:21.4},{min:0,max:21.4},{min:0,max:23.4},{min:0,max:23.4},{min:-1,max:-1},{min:-1,max:-1}] },
  // NSSA 3 (pc1)
  { nssa:3,  g:[{min:25,max:28},{min:25.5,max:26},{min:25,max:25},{min:22,max:24.5},{min:22,max:24.5},{min:22,max:23.5},{min:24,max:25},{min:24,max:24},{min:-1,max:-1},{min:-1,max:-1}] },
  // NSSA 4 (pc2)
  { nssa:4,  g:[{min:28.5,max:29.5},{min:-1,max:-1},{min:25.5,max:26},{min:25,max:25},{min:-1,max:-1},{min:24,max:24.5},{min:25.5,max:26},{min:24.5,max:25},{min:23.5,max:23.5},{min:21.5,max:21.5}] },
  // NSSA 5 (pc3-5)
  { nssa:5,  g:[{min:30,max:30.5},{min:26.5,max:29},{min:26.5,max:28},{min:25.5,max:27},{min:25,max:28.5},{min:25,max:26},{min:26.5,max:27},{min:25.5,max:26},{min:24,max:25},{min:-1,max:-1}] },
  // NSSA 6 (pc6-10)
  { nssa:6,  g:[{min:31,max:31.5},{min:29.5,max:31.5},{min:28.5,max:30.5},{min:27.5,max:30},{min:29,max:29.5},{min:26.5,max:29},{min:27.5,max:28.5},{min:26.5,max:27.5},{min:25.5,max:26},{min:22,max:24}] },
  // NSSA 7 (pc11-18)
  { nssa:7,  g:[{min:-1,max:-1},{min:-1,max:-1},{min:31,max:31.5},{min:30.5,max:31},{min:30,max:30.5},{min:29.5,max:30},{min:29,max:29.5},{min:28,max:29.5},{min:26.5,max:28},{min:24.5,max:27.5}] },
  // NSSA 8 (pc19-28)
  { nssa:8,  g:[{min:32,max:33},{min:32,max:32.5},{min:32,max:32.5},{min:31.5,max:32},{min:31,max:32},{min:30.5,max:31},{min:30,max:31},{min:30,max:30.5},{min:28.5,max:30},{min:28,max:29}] },
  // NSSA 9 (pc29-40)
  { nssa:9,  g:[{min:33.5,max:33.5},{min:33,max:33.5},{min:33,max:33},{min:32.5,max:32.5},{min:32.5,max:32.5},{min:31.5,max:32.5},{min:31.5,max:31.5},{min:31,max:31.5},{min:30.5,max:31},{min:29.5,max:30.5}] },
  // NSSA 10 (pc41-59)
  { nssa:10, g:[{min:34,max:34.5},{min:34,max:34.5},{min:33.5,max:34.5},{min:33,max:33.5},{min:33,max:33.5},{min:33,max:33.5},{min:32,max:32.5},{min:32,max:32.5},{min:31.5,max:32},{min:31,max:31.5}] },
  // NSSA 11 (pc60-71)
  { nssa:11, g:[{min:-1,max:-1},{min:-1,max:-1},{min:-1,max:-1},{min:34,max:34},{min:34,max:34.5},{min:-1,max:-1},{min:33,max:33.5},{min:33,max:33.5},{min:32.5,max:32.5},{min:32,max:32}] },
  // NSSA 12 (pc72-81)
  { nssa:12, g:[{min:35,max:35.5},{min:35,max:35.5},{min:-1,max:-1},{min:-1,max:-1},{min:-1,max:-1},{min:34,max:34.5},{min:-1,max:-1},{min:-1,max:-1},{min:33,max:33},{min:32.5,max:33}] },
  // NSSA 13 (pc82-89)
  { nssa:13, g:[{min:-1,max:-1},{min:-1,max:-1},{min:35,max:35.5},{min:34.5,max:35.5},{min:35,max:35},{min:-1,max:-1},{min:34,max:34.5},{min:34,max:34.5},{min:-1,max:-1},{min:-1,max:-1}] },
  // NSSA 14 (pc90-94)
  { nssa:14, g:[{min:-1,max:-1},{min:-1,max:-1},{min:-1,max:-1},{min:35.5,max:35.5},{min:35,max:35},{min:-1,max:-1},{min:-1,max:-1},{min:33.5,max:34},{min:33.5,max:35},{min:-1,max:-1}] },
  // NSSA 15 (pc95-97)
  { nssa:15, g:[{min:-1,max:-1},{min:-1,max:-1},{min:-1,max:-1},{min:-1,max:-1},{min:-1,max:-1},{min:-1,max:-1},{min:35,max:35},{min:35,max:35.5},{min:34.5,max:35},{min:35.5,max:35.5}] },
  // NSSA 16 (pc98)
  { nssa:16, g:[{min:-1,max:-1},{min:-1,max:-1},{min:-1,max:-1},{min:-1,max:-1},{min:-1,max:-1},{min:-1,max:-1},{min:-1,max:-1},{min:-1,max:-1},{min:35.5,max:35.5},{min:-1,max:-1}] },
  // NSSA 18 (>pc99)
  { nssa:18, g:[{min:36,max:36},{min:36,max:36},{min:36,max:36},{min:36,max:36},{min:36,max:36},{min:35.5,max:36},{min:35.5,max:36},{min:36,max:36},{min:36,max:36},{min:36,max:36}] }
];

function tokenPC_GrupoEdad(edad) {
  if (edad<50) return -1;
  if (edad<=56) return 0;
  if (edad<=59) return 1;
  if (edad<=62) return 2;
  if (edad<=65) return 3;
  if (edad<=68) return 4;
  if (edad<=71) return 5;
  if (edad<=74) return 6;
  if (edad<=77) return 7;
  if (edad<=80) return 8;
  return 9; // 81+
}

function tokenPC_BrutoNSSA(pb, grupoIdx) {
  // Find highest NSSA where pb >= min (and within range if max != -1)
  var best = 2;
  for (var i=0; i<TOKEN_PC_TABLA.length; i++) {
    var row = TOKEN_PC_TABLA[i];
    var g = row.g[grupoIdx];
    if (g.min === -1) continue; // no data for this group at this NSSA
    if (pb >= g.min) best = row.nssa;
  }
  return best;
}

// ── Peña-Casanova 2009: Tabla 6 NSSA → NSSA&E por educación ──
// Formula: NSSA&E = NSSA - (0.29451 * (educ - 12)), truncado al entero inferior
function tokenPC_AjusteEscol(nssa, escol) {
  var raw = nssa - (0.29451 * (escol - 12));
  var adj = Math.floor(raw);
  return Math.max(2, Math.min(18, adj));
}

// ── Etiquetas comunes ──
function tokenPELabel(pe) {
  if (pe>=16) return 'Superior';
  if (pe>=13) return 'Normal alto';
  if (pe>=8)  return 'Normal';
  if (pe>=6)  return 'Límite inferior normativo';
  if (pe>=4)  return 'Dificultad leve';
  if (pe>=2)  return 'Dificultad moderada';
  return 'Dificultad severa';
}

function tokenPEColor(pe) {
  if (pe>=13) return '#639922';
  if (pe>=8)  return '#444';
  if (pe>=6)  return '#888780';
  if (pe>=4)  return '#BA7517';
  if (pe>=2)  return '#D85A30';
  return '#E24B4A';
}

function tokenCategoriaBruto(pb) {
  if (pb>=29) return 'Normal';
  if (pb>=25) return 'Alteración leve';
  if (pb>=17) return 'Alteración moderada';
  if (pb>=9)  return 'Alteración severa';
  return 'Alteración muy severa';
}

export function tokenLive() {
  var pb=parseFloat(document.getElementById('token-pb').value);
  var edad=parseInt(document.getElementById('token-edad').value);
  var el=document.getElementById('token-live');
  if (!el) return;
  if (isNaN(pb)) { el.innerHTML=''; return; }
  var cat=tokenCategoriaBruto(pb);
  var baremo = (!isNaN(edad) && edad>=18 && edad<=49) ? 'Aranciva et al. (2012) · 18–49 años' :
               (!isNaN(edad) && edad>=50 && edad<=94) ? 'Peña-Casanova et al. (2009) · 50–94 años' :
               'Punto de corte De Renzi & Faglioni (1978)';
  el.innerHTML='Categoría: <strong>'+cat+'</strong> &nbsp;·&nbsp; Baremo: <em>'+baremo+'</em>';
}

export function limpiarToken() {
  ['token-pb','token-escol','token-edad'].forEach(function(id){var e=document.getElementById(id);if(e)e.value='';});
  var lv=document.getElementById('token-live');if(lv)lv.innerHTML='';
}

export function iniciarToken() {
  document.getElementById('token-fecha').value=new Date().toISOString().split('T')[0];
  document.getElementById('token-form').style.display='block';
  document.getElementById('token-resultado').style.display='none';
}

export function calcularToken() {
  var pb=parseFloat(document.getElementById('token-pb').value);
  var escol=parseInt(document.getElementById('token-escol').value);
  var edad=parseInt(document.getElementById('token-edad').value);
  if (isNaN(pb)||pb<0||pb>36){toast('Ingresá un puntaje válido (0–36).','error');return;}
  if (isNaN(escol)||escol<0){toast('Ingresá los años de escolaridad.','error');return;}
  if (isNaN(edad)||edad<0){toast('Ingresá la edad del paciente.','error');return;}

  var catBruto=tokenCategoriaBruto(pb);
  var z, peAdj, label, color, baremoNombre, detalleHtml;
  var trS='border-bottom:1px solid var(--border);';
  var tdL='padding:8px 10px;';
  var tdC='text-align:center;padding:8px 10px;font-weight:700;';
  var tdR='padding:8px 10px;color:var(--muted);font-size:0.85rem;';

  if (edad>=18 && edad<=49) {
    // ── Aranciva 2012 ──
    baremoNombre = 'Aranciva et al. (2012) · NEURONORMA jóvenes · España · 18–49 años · n=179';
    var pe=tokenA_BrutoPE(pb);
    var ajuste=tokenA_AjusteEscol(escol);
    peAdj=Math.max(2,Math.min(18,pe+ajuste));
    label=tokenPELabel(peAdj); color=tokenPEColor(peAdj);
    z=parseFloat(((peAdj-10)/3).toFixed(2));
    detalleHtml=
      '<tr style="'+trS+'"><td style="'+tdL+'font-weight:500;">Puntaje bruto</td><td style="'+tdC+'">'+pb+'/36</td><td style="'+tdR+'">Máximo = 36</td></tr>'+
      '<tr style="background:#f5fbf3;'+trS+'"><td style="'+tdL+'font-weight:500;">Categoría (punto de corte)</td><td style="'+tdC+'color:'+(pb>=29?'#639922':'#D85A30')+';">'+catBruto+'</td><td style="'+tdR+'">De Renzi &amp; Faglioni (1978)</td></tr>'+
      '<tr style="'+trS+'"><td style="'+tdL+'font-weight:500;">PE sin ajuste</td><td style="'+tdC+'">'+pe+'</td><td style="'+tdR+'">Tabla 1 · Aranciva et al. (2012)</td></tr>'+
      '<tr style="background:#f5fbf3;'+trS+'"><td style="'+tdL+'font-weight:500;">Ajuste escolaridad ('+escol+' años)</td><td style="'+tdC+'">'+(ajuste>=0?'+':'')+ajuste+'</td><td style="'+tdR+'">Tabla 3 · Aranciva et al. (2012)</td></tr>'+
      '<tr style="'+trS+'"><td style="'+tdL+'font-weight:700;">PE ajustada</td><td style="'+tdC+'color:'+color+';">'+peAdj+'</td><td style="'+tdL+'font-weight:600;color:'+color+';">'+label+'</td></tr>'+
      '<tr style="background:#f5fbf3;"><td style="'+tdL+'font-weight:700;">Z aproximado</td><td style="'+tdC+'color:'+color+';">'+(z>=0?'+':'')+z+'</td><td style="'+tdR+'">Z = (PE − 10) / 3</td></tr>';

  } else if (edad>=50 && edad<=94) {
    // ── Peña-Casanova 2009 ──
    baremoNombre = 'Peña-Casanova et al. (2009) · NEURONORMA España · 50–94 años · n=348';
    var gi=tokenPC_GrupoEdad(edad);
    var grupNombre=['50–56','57–59','60–62','63–65','66–68','69–71','72–74','75–77','78–80','81+'][gi];
    var nssa=tokenPC_BrutoNSSA(pb,gi);
    var nssae=tokenPC_AjusteEscol(nssa,escol);
    peAdj=nssae; label=tokenPELabel(nssae); color=tokenPEColor(nssae);
    z=parseFloat(((nssae-10)/3).toFixed(2));
    detalleHtml=
      '<tr style="'+trS+'"><td style="'+tdL+'font-weight:500;">Puntaje bruto</td><td style="'+tdC+'">'+pb+'/36</td><td style="'+tdR+'">Máximo = 36</td></tr>'+
      '<tr style="background:#f5fbf3;'+trS+'"><td style="'+tdL+'font-weight:500;">Categoría (punto de corte)</td><td style="'+tdC+'color:'+(pb>=29?'#639922':'#D85A30')+';">'+catBruto+'</td><td style="'+tdR+'">De Renzi &amp; Faglioni (1978)</td></tr>'+
      '<tr style="'+trS+'"><td style="'+tdL+'font-weight:500;">Grupo etario</td><td style="'+tdC+'">'+grupNombre+' años</td><td style="'+tdR+'">Tabla 4 · Peña-Casanova et al. (2009)</td></tr>'+
      '<tr style="background:#f5fbf3;'+trS+'"><td style="'+tdL+'font-weight:500;">NSSA (ajustado por edad)</td><td style="'+tdC+'">'+nssa+'</td><td style="'+tdR+'">Media=10 · DS=3</td></tr>'+
      '<tr style="'+trS+'"><td style="'+tdL+'font-weight:500;">Ajuste escolaridad ('+escol+' años)</td><td style="'+tdC+'">'+(nssae-nssa>=0?'+':'')+(nssae-nssa)+'</td><td style="'+tdR+'">Tabla 6 · b=0.29451</td></tr>'+
      '<tr style="background:#f5fbf3;'+trS+'"><td style="'+tdL+'font-weight:700;">NSSA&amp;E (ajustado edad+escol.)</td><td style="'+tdC+'color:'+color+';">'+nssae+'</td><td style="'+tdL+'font-weight:600;color:'+color+';">'+label+'</td></tr>'+
      '<tr style="'+trS+'"><td style="'+tdL+'font-weight:700;">Z aproximado</td><td style="'+tdC+'color:'+color+';">'+(z>=0?'+':'')+z+'</td><td style="'+tdR+'">Z = (NSSA&amp;E − 10) / 3</td></tr>';

  } else {
    // ── Fallback: solo punto de corte ──
    baremoNombre = 'De Renzi &amp; Faglioni (1978) · Punto de corte ≥29';
    peAdj=null; label=catBruto; color=(pb>=29?'#639922':'#D85A30'); z=null;
    detalleHtml=
      '<tr style="'+trS+'"><td style="'+tdL+'font-weight:500;">Puntaje bruto</td><td style="'+tdC+'">'+pb+'/36</td><td style="'+tdR+'">Máximo = 36</td></tr>'+
      '<tr style="background:#f5fbf3;"><td style="'+tdL+'font-weight:700;">Categoría</td><td style="'+tdC+'color:'+color+';">'+catBruto+'</td><td style="'+tdR+'">Punto de corte ≥29 · De Renzi &amp; Faglioni (1978)</td></tr>';
  }

  var html='<table style="width:100%;border-collapse:collapse;font-size:0.84rem;margin-bottom:12px;"><thead><tr>'+
    '<th style="text-align:left;padding:7px 10px;border-bottom:2px solid var(--border);color:var(--muted);font-size:0.72rem;text-transform:uppercase;">Variable</th>'+
    '<th style="text-align:center;padding:7px 10px;border-bottom:2px solid var(--border);color:var(--muted);font-size:0.72rem;text-transform:uppercase;">Valor</th>'+
    '<th style="text-align:left;padding:7px 10px;border-bottom:2px solid var(--border);color:var(--muted);font-size:0.72rem;text-transform:uppercase;">Referencia</th>'+
    '</tr></thead><tbody>'+detalleHtml+'</tbody></table>';
  html+='<p style="font-size:0.75rem;color:var(--muted);">'+baremoNombre+'</p>';
  if (edad<18||edad>94) html+='<p style="font-size:0.75rem;color:#D85A30;">⚠ Edad fuera del rango normativo — se aplica solo el punto de corte clásico.</p>';

  // Narrative
  var interp='En el Token Test (versión abreviada, De Renzi & Faglioni 1978), el puntaje bruto de '+pb+'/36 ';
  if (pb>=29) interp+='se encuentra dentro del rango normal según el punto de corte original. ';
  else if (pb>=25) interp+='indica una alteración leve de la comprensión auditiva verbal. ';
  else if (pb>=17) interp+='es compatible con una alteración moderada de la comprensión auditiva verbal. ';
  else interp+='indica una alteración severa de la comprensión auditiva verbal. ';
  if (edad>=18&&edad<=49) interp+='La Puntuación Escalar ajustada por escolaridad es '+peAdj+'/18 ('+label+') según los baremos de Aranciva et al. (2012) para población adulta joven española. ';
  else if (edad>=50&&edad<=94) interp+='El puntaje escalar ajustado por edad y escolaridad (NSSA&E) es '+peAdj+'/18 ('+label+') según los baremos de Peña-Casanova et al. (2009) para población española adulta mayor. ';
  interp+='Aplicar con precaución en población argentina dado el origen español de los baremos.';

  document.getElementById('token-detalle').innerHTML=html;
  document.getElementById('token-interp').textContent=interp;
  document.getElementById('token-form').style.display='none';
  document.getElementById('token-resultado').style.display='block';
  window._tokenData={pb:pb,escol:escol,edad:edad,peAdj:peAdj,z:z,label:label,catBruto:catBruto,baremo:edad>=50&&edad<=94?'PC2009':'A2012'};
}

export function guardarToken() {
  if (!SESSION) return;
  var pacId=document.getElementById('token-paciente').value;
  var fecha=document.getElementById('token-fecha').value;
  if (!pacId){toast('Seleccioná un paciente.','error');return;}
  if (!window._tokenData){toast('Calculá el resultado antes de guardar.','error');return;}
  var d=window._tokenData;
  supaFetch('/rest/v1/psico_resultados','POST',{
    user_id:SESSION.user.id,paciente_id:pacId,
    test:'Token Test',fecha:fecha,
    puntaje_total:d.pb,puntaje_z:d.z,
    categoria:d.label,datos:d
  },SESSION.access_token).then(function(){
    window._tokenData=null;
    cargarResultados();toast('✓ Resultado guardado','success');
  }).catch(catchGuardarError);
}
