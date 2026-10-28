import { SUPA_URL, SUPA_KEY } from './core/supabase-config.js';
import { serializeForm, applyDraftToForm } from './core/form-draft.js';

// ══ ASRS-V1.1 · WURS-25 · DEX ═══════════════════════════════════════════════
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

// ══ AQ · AQ-10 · EQ (autoadministrados) ══════════════════════════════════════
// Copiados de public/legacy-tests.js por la misma razón que ASRS/WURS/DEX más
// arriba: no es un módulo ES, así que no se puede importar. EA y SCQ quedan
// afuera a propósito — son cuestionarios de informante (los completa un
// familiar sobre el paciente), no autoadministrados, así que no van en este
// link que llena el propio paciente.
var ND_LIKERT4_AQ = ['Totalmente de acuerdo','Bastante de acuerdo','Un poco de acuerdo','Nada de acuerdo'];
var ND_LIKERT4_EQ = ['Acuerdo absoluto','Acuerdo leve','Desacuerdo leve','Desacuerdo absoluto'];
var LABELS_AQ10 = ['Definitivamente en desacuerdo','Un poco en desacuerdo','Un poco de acuerdo','Definitivamente de acuerdo'];

var AQ_AGREE = [1,2,4,5,6,7,9,12,13,16,18,19,20,21,22,23,26,33,35,39,41,42,43,45,46];
var AQ_DISAGREE = [3,8,10,11,14,15,17,24,25,27,28,29,30,31,32,34,36,37,38,40,44,47,48,49,50];
var AQ10_AGREE = [1,7,8,10];
var AQ10_DISAGREE = [2,3,4,5,6,9];
var EQ_AGREE = [1,6,19,22,25,26,35,36,37,38,41,42,43,44,52,54,55,57,58,59,60];
var EQ_DISAGREE = [4,8,10,11,12,14,15,18,21,27,28,29,32,34,39,46,48,49,50];

var AQ_ITEMS = [
  {n:1,txt:'Prefiero hacer las cosas con otras personas en lugar de hacerlas sólo'},
  {n:2,txt:'Prefiero hacer las cosas siempre de la misma manera'},
  {n:3,txt:'Cuando trato de imaginarme algo, me resulta fácil crear la imagen en mi mente'},
  {n:4,txt:'Frecuentemente me concentro tanto en una cosa que no presto atención a otras'},
  {n:5,txt:'A menudo escucho ciertos sonidos que las otras personas no oyen'},
  {n:6,txt:'Normalmente presto atención a las matrículas de los coches u otras informaciones similares'},
  {n:7,txt:'Las otras personas frecuentemente me dicen que lo que digo es maleducado aunque yo no creo que sea así'},
  {n:8,txt:'Cuando estoy leyendo un libro me resulta fácil imaginarme cómo son los personajes'},
  {n:9,txt:'Me interesan mucho las fechas'},
  {n:10,txt:'Cuando estoy en una reunión me resulta fácil seguir varias conversaciones a la vez'},
  {n:11,txt:'Las situaciones sociales me resultan fáciles'},
  {n:12,txt:'Suelo prestar atención a detalles que otras personas no ven'},
  {n:13,txt:'Prefiero ir a una biblioteca en lugar de ir a una fiesta'},
  {n:14,txt:'Me resulta fácil inventar historias'},
  {n:15,txt:'Me siento más atraído por las personas que por las cosas'},
  {n:16,txt:'Suelo tener un fuerte interés por ciertas cosas y me molesta si no puedo realizarlas'},
  {n:17,txt:'Me gusta charlar'},
  {n:18,txt:'Cuando yo hablo apenas dejo hablar a los demás'},
  {n:19,txt:'Me interesan mucho los números'},
  {n:20,txt:'Cuando leo un cuento me resulta muy difícil interpretar las intenciones de los personajes'},
  {n:21,txt:'No disfruto especialmente con los libros de ciencia ficción'},
  {n:22,txt:'Me resulta difícil hacer nuevos amigos'},
  {n:23,txt:'Siempre descubro patrones en las cosas'},
  {n:24,txt:'Prefiero ir al teatro que a un museo'},
  {n:25,txt:'No me molesta si mi rutina diaria se modifica'},
  {n:26,txt:'Frecuentemente noto que me cuesta mantener una conversación con otra persona'},
  {n:27,txt:'Me resulta fácil "leer entre líneas" cuando alguien me está hablando'},
  {n:28,txt:'Normalmente me concentro más en el todo que en los detalles'},
  {n:29,txt:'No soy bueno para recordar números de teléfono'},
  {n:30,txt:'Normalmente no noto pequeños cambios en una situación o en el aspecto de una persona'},
  {n:31,txt:'Me doy cuenta cuando una persona con la que estoy hablando se aburre'},
  {n:32,txt:'Me resulta fácil hacer más de una cosa a la vez'},
  {n:33,txt:'Cuando hablo por teléfono me cuesta darme cuenta de cuándo es mi turno para hablar'},
  {n:34,txt:'Me gusta hacer las cosas espontáneamente (sin planificar)'},
  {n:35,txt:'A menudo soy el último en entender una broma'},
  {n:36,txt:'Me resulta fácil imaginarme lo que una persona puede estar pensando o sintiendo sólo con mirarla'},
  {n:37,txt:'Puedo retomar lo que estaba haciendo después de una interrupción'},
  {n:38,txt:'Soy bueno charlando'},
  {n:39,txt:'La gente me dice que suelo hablar siempre de un mismo tema'},
  {n:40,txt:'Cuando era más pequeño me gustaba jugar con los demás a juegos de imaginación'},
  {n:41,txt:'Me gusta recabar información sobre clases de cosas (coches, pájaros, trenes, plantas, etc.)'},
  {n:42,txt:'Me resulta difícil imaginarme cómo sería ser otra persona'},
  {n:43,txt:'Me gusta planificar cuidadosamente las actividades en las que participo'},
  {n:44,txt:'Disfruto de las reuniones sociales'},
  {n:45,txt:'Me resulta difícil identificar las intenciones de las otras personas'},
  {n:46,txt:'Las situaciones nuevas me ponen ansioso'},
  {n:47,txt:'Me gusta conocer gente nueva'},
  {n:48,txt:'Soy bastante diplomático'},
  {n:49,txt:'No soy muy bueno para recordar fechas de cumpleaños'},
  {n:50,txt:'Me resulta fácil jugar a juegos de imaginación con niños'}
];

var AQ10_ITEMS = [
  {n:1,txt:'Muchas veces noto pequeños sonidos en los que otros no reparan'},
  {n:2,txt:'Por lo general me concentro más en la imagen completa que en los pequeños detalles'},
  {n:3,txt:'Me resulta fácil hacer más de una cosa a la vez'},
  {n:4,txt:'Si hay una interrupción, puedo volver a concentrarme muy rápido'},
  {n:5,txt:'Me resulta fácil "leer entre líneas" cuando alguien me está hablando'},
  {n:6,txt:'Sé cómo saber si alguien que me escucha se está aburriendo'},
  {n:7,txt:'Cuando estoy leyendo una historia, me resulta difícil descifrar las intenciones de los personajes'},
  {n:8,txt:'Me gusta recabar información sobre categorías de cosas (automóviles, aves, trenes, plantas, etc.)'},
  {n:9,txt:'Me resulta fácil saber lo que alguien piensa o siente mirando su rostro'},
  {n:10,txt:'Me resulta difícil comprender las intenciones de las personas'}
];

var EQ_ITEMS = [
  {n:1,txt:'Puedo captar con facilidad si otra persona quiere tomar parte en una conversación'},
  {n:2,txt:'Prefiero la compañía de animales a la de las personas'},
  {n:3,txt:'Intento seguir las tendencias y modas actuales'},
  {n:4,txt:'Encuentro difícil explicar a otros lo que yo entiendo con facilidad'},
  {n:5,txt:'Sueño la mayoría de las noches'},
  {n:6,txt:'Me gusta verdaderamente cuidar a otras personas'},
  {n:7,txt:'Intento resolver los problemas yo solo antes que discutirlos con los demás'},
  {n:8,txt:'Encuentro difícil saber qué hay que hacer en una situación social'},
  {n:9,txt:'A primera hora de la mañana, estoy en mi mejor momento'},
  {n:10,txt:'A menudo, en medio de una discusión, me dicen que me excedo defendiendo mi punto de vista'},
  {n:11,txt:'No me preocupa mucho llegar tarde a una cita con un amigo'},
  {n:12,txt:'Las amistades y relaciones son demasiado difíciles de mantener'},
  {n:13,txt:'Nunca quebrantaría una ley, por irrelevante que fuera'},
  {n:14,txt:'Generalmente me cuesta juzgar si alguien ha sido amable o descortés'},
  {n:15,txt:'En una conversación me concentro en mis pensamientos antes que en los del interlocutor'},
  {n:16,txt:'Prefiero gastar bromas a contar chistes'},
  {n:17,txt:'Prefiero vivir al día a pensar en el futuro'},
  {n:18,txt:'De pequeño me gustaba cortar gusanos en pedazos para ver qué pasaba'},
  {n:19,txt:'Puedo captar fácilmente si una persona dice una cosa pero quiere decir otra'},
  {n:20,txt:'Tiendo a tener fuertes convicciones morales'},
  {n:21,txt:'Me resulta difícil ver por qué algunas cosas molestan tanto a otras personas'},
  {n:22,txt:'Me resulta fácil ponerme en el lugar de otra persona'},
  {n:23,txt:'Pienso que la buena educación es lo más importante que los padres pueden enseñar'},
  {n:24,txt:'Me gusta hacer las cosas sin reflexionar demasiado'},
  {n:25,txt:'Tengo facilidad para predecir cómo se sentirá otra persona'},
  {n:26,txt:'Enseguida me doy cuenta si alguien se siente molesto en el grupo'},
  {n:27,txt:'Si alguien se siente ofendido cuando hablo, pienso que el problema es suyo'},
  {n:28,txt:'Si me preguntan si me gusta su corte de pelo respondo la verdad aunque no me guste'},
  {n:29,txt:'A veces no entiendo por qué alguien se ha sentido ofendido por una observación mía'},
  {n:30,txt:'A menudo me dicen que soy totalmente imprevisible'},
  {n:31,txt:'Me gusta ser el centro de atención en reuniones sociales'},
  {n:32,txt:'Ver llorar a la gente no me pone especialmente triste'},
  {n:33,txt:'Me gusta discutir de política'},
  {n:34,txt:'Soy muy sincero, lo que hace que algunos me consideren maleducado'},
  {n:35,txt:'No suelo encontrar confusas las relaciones sociales'},
  {n:36,txt:'Me dicen que tengo facilidad para entender cómo se sienten y qué piensan'},
  {n:37,txt:'Cuando hablo tiendo más a hablar de las experiencias del otro que de las mías'},
  {n:38,txt:'Me da pena ver sufrir a un animal'},
  {n:39,txt:'Puedo tomar decisiones sin que me influencien los sentimientos de los demás'},
  {n:40,txt:'No me relajo hasta haber hecho todo lo planeado durante el día'},
  {n:41,txt:'Captar fácilmente si a alguien le aburre o le interesa lo que digo'},
  {n:42,txt:'Me afecta ver personas sufriendo en programas informativos'},
  {n:43,txt:'Mis amigos me hablan de sus problemas porque dicen que los comprendo'},
  {n:44,txt:'Me doy cuenta de que molesto incluso si la otra persona no me lo dice'},
  {n:45,txt:'Empiezo nuevas aficiones pero enseguida me canso y busco otras'},
  {n:46,txt:'A veces me dicen que he ido demasiado lejos con mis bromas'},
  {n:47,txt:'Subirme a montañas rusas me pondría demasiado nervioso'},
  {n:48,txt:'A menudo me dicen que soy insensible aunque yo no veo por qué'},
  {n:49,txt:'Si hay alguien nuevo en un grupo, es cosa suya integrarse'},
  {n:50,txt:'Por lo general me mantengo emocionalmente indiferente cuando veo una película'},
  {n:51,txt:'Me gusta tener muy organizadas las actividades cotidianas y hacer listas'},
  {n:52,txt:'Puedo conectar y saber cómo se siente alguien de forma rápida e intuitiva'},
  {n:53,txt:'No me gusta correr riesgos'},
  {n:54,txt:'Me doy cuenta fácilmente de lo que otra persona desea hablar'},
  {n:55,txt:'Puedo darme cuenta si alguien oculta sus verdaderas emociones'},
  {n:56,txt:'Antes de tomar una decisión siempre considero pros y contras'},
  {n:57,txt:'No elaboro conscientemente las reglas de una situación social'},
  {n:58,txt:'Tengo facilidad para predecir lo que otra persona hará'},
  {n:59,txt:'Tengo tendencia a implicarme en los problemas de mis amigos'},
  {n:60,txt:'Aprecio el punto de vista de otras personas aunque no esté de acuerdo'}
];

function aqScoreFromResponses(getVal) {
  var total = 0;
  for (var i = 1; i <= 50; i++) {
    var v = getVal(i); if (v == null) continue;
    if (AQ_AGREE.indexOf(i) >= 0 && v <= 2) total++;
    else if (AQ_DISAGREE.indexOf(i) >= 0 && v >= 3) total++;
  }
  return total;
}
function eqScoreFromResponses(getVal) {
  var total = 0;
  for (var i = 1; i <= 60; i++) {
    var v = getVal(i); if (v == null) continue;
    if (EQ_AGREE.indexOf(i) >= 0) { if (v === 1) total += 2; else if (v === 2) total += 1; }
    else if (EQ_DISAGREE.indexOf(i) >= 0) { if (v === 4) total += 2; else if (v === 3) total += 1; }
  }
  return total;
}
function aqInterp(total) {
  if (total <= 10) return { cat:'Bajo', fenotipo:'—' };
  if (total <= 22) return { cat:'Medio', fenotipo:'Población general' };
  if (total <= 28) return { cat:'Sobre la media', fenotipo:'BAP' };
  if (total <= 34) return { cat:'Sobre la media', fenotipo:'MAP' };
  return { cat:'Muy alto', fenotipo:'NAP' };
}
function eqInterp(total) {
  if (total <= 32) return { cat:'Bajo' };
  if (total <= 52) return { cat:'Medio' };
  if (total <= 63) return { cat:'Sobre la media' };
  return { cat:'Muy alto' };
}

// ══ ANAMNESIS · listas de antecedentes ══════════════════════════════════════
// Cada opción nombra UNA sola cosa: si una casilla mezcla dos diagnósticos
// no hay forma de saber cuál marcó el paciente (ver commit de separación).
// `grupo` agrupa las casillas bajo un subtítulo en el formulario; el texto que
// llega al informe sigue siendo la lista plana de labels marcados.
var ANT_SALUD = [
  {grupo:'Embarazo, nacimiento y desarrollo', id:'prematuridad', label:'Prematuridad'},
  {grupo:'Embarazo, nacimiento y desarrollo', id:'bajo_peso',      label:'Bajo peso al nacer'},
  {grupo:'Embarazo, nacimiento y desarrollo', id:'compl_embarazo', label:'Complicaciones en el embarazo de tu madre'},
  {grupo:'Embarazo, nacimiento y desarrollo', id:'compl_parto',    label:'Complicaciones en el parto'},
  {grupo:'Neurológicos', id:'golpe_cabeza',   label:'Golpe en la cabeza con pérdida de conciencia'},
  {grupo:'Neurológicos', id:'golpe_hospital', label:'Golpe en la cabeza con hospitalización'},
  {grupo:'Neurológicos', id:'epilepsia',      label:'Epilepsia'},
  {grupo:'Neurológicos', id:'crisis',         label:'Crisis convulsivas'},
  {grupo:'Neurológicos', id:'meningitis',     label:'Meningitis'},
  {grupo:'Neurológicos', id:'encefalitis',    label:'Encefalitis'},
  {grupo:'Neurológicos', id:'acv',            label:'ACV (accidente cerebrovascular)'},
  {grupo:'Neurológicos', id:'ait',            label:'AIT (accidente isquémico transitorio)'},
  {grupo:'Neurológicos', id:'migrana',        label:'Migraña'},
  {grupo:'Neurológicos', id:'cefaleas',       label:'Cefaleas frecuentes'},
  {grupo:'Neurológicos', id:'tics',           label:'Tics'},
  {grupo:'Neurológicos', id:'tourette',       label:'Síndrome de Tourette'},
  {grupo:'Neurológicos', id:'desmayos',       label:'Desmayos (pérdida de conciencia sin golpe)'},
  {grupo:'Neurológicos', id:'vertigo',        label:'Mareos o vértigo frecuentes'},
  {grupo:'Neurológicos', id:'parkinson',      label:'Enfermedad de Parkinson'},
  {grupo:'Neurológicos', id:'esclerosis_multiple', label:'Esclerosis múltiple'},
  {grupo:'Neurológicos', id:'tumor_cerebral', label:'Tumor cerebral o cirugía cerebral'},
  {grupo:'Neurológicos', id:'deterioro_cognitivo', label:'Diagnóstico previo de deterioro cognitivo o demencia'},
  {grupo:'Clínicos', id:'hta',            label:'Hipertensión arterial (HTA)'},
  {grupo:'Clínicos', id:'diabetes',       label:'Diabetes (DBT)'},
  {grupo:'Clínicos', id:'hipotiroidismo', label:'Hipotiroidismo'},
  {grupo:'Clínicos', id:'hipertiroidismo', label:'Hipertiroidismo'},
  {grupo:'Clínicos', id:'arritmia',       label:'Arritmia cardíaca'},
  {grupo:'Clínicos', id:'infarto',        label:'Infarto'},
  {grupo:'Clínicos', id:'insuf_cardiaca', label:'Insuficiencia cardíaca'},
  {grupo:'Clínicos', id:'oncologico',     label:'Cáncer / tratamiento oncológico'},
  {grupo:'Clínicos', id:'hipoacusia',     label:'Dificultades de audición'},
  {grupo:'Clínicos', id:'vision',         label:'Dificultades de visión (no corregidas con anteojos)'},
  {grupo:'Clínicos', id:'dislipemia',     label:'Colesterol alto (dislipemia)'},
  {grupo:'Clínicos', id:'obesidad',       label:'Obesidad'},
  {grupo:'Clínicos', id:'anemia',         label:'Anemia'},
  {grupo:'Clínicos', id:'deficit_b12',    label:'Déficit de vitamina B12'},
  {grupo:'Clínicos', id:'asma_epoc',      label:'Asma o EPOC'},
  {grupo:'Clínicos', id:'renal',          label:'Enfermedad renal crónica'},
  {grupo:'Clínicos', id:'hepatica',       label:'Enfermedad hepática'},
  {grupo:'Clínicos', id:'covid_secuelas', label:'COVID con secuelas (cansancio, «niebla mental»)'},
  {grupo:'Clínicos', id:'dolor_cronico',  label:'Dolor crónico o fibromialgia'},
  {grupo:'Clínicos', id:'autoinmune',     label:'Enfermedad autoinmune (lupus, artritis reumatoidea, celiaquía, etc.)'},
  {grupo:'Clínicos', id:'menopausia',     label:'Menopausia con síntomas (sofocos, insomnio, quejas de memoria)'},
  {grupo:'Sueño', id:'insomnio',        label:'Insomnio (dificultad para dormirte o mantener el sueño)'},
  {grupo:'Sueño', id:'somnolencia',     label:'Somnolencia excesiva durante el día'},
  {grupo:'Sueño', id:'apneas',          label:'Ronquidos fuertes o apneas (pausas en la respiración al dormir)'},
  {grupo:'Sueño', id:'sonambulismo',    label:'Sonambulismo (caminar o levantarte dormido/a)'},
  {grupo:'Sueño', id:'habla_sueno',     label:'Hablar o gritar dormido/a'},
  {grupo:'Sueño', id:'conducta_sueno',  label:'Moverte bruscamente o golpear dormido/a (por ej., «actuar» los sueños)'},
  {grupo:'Sueño', id:'piernas_inquietas', label:'Piernas inquietas (necesidad de mover las piernas al acostarte)'},
  {grupo:'Sueño', id:'pesadillas',      label:'Pesadillas frecuentes'},
  {grupo:'Sueño', id:'otras_sueno',     label:'Otras dificultades en el sueño'},
  {grupo:'Internaciones', id:'intern_clinica',  label:'Internación por razones médicas/clínicas'},
  {grupo:'Internaciones', id:'intern_uti',      label:'Internación en terapia intensiva (UTI)'},
  {grupo:'Internaciones', id:'intern_cirugia',  label:'Internación por cirugía'},
  {grupo:'Internaciones', id:'intern_accidente', label:'Internación por accidente o traumatismo'},
  {grupo:'Internaciones', id:'intern_salud_mental', label:'Internación por razones de salud mental'},
  {grupo:'Internaciones', id:'intern_consumo',  label:'Internación por consumo de alcohol o drogas'},
  {grupo:'Salud mental', id:'diag_psi',       label:'Diagnóstico psicológico o de salud mental'},
  {grupo:'Aprendizaje y escolaridad', id:'dislexia',       label:'Dislexia (dificultad de lectura)'},
  {grupo:'Aprendizaje y escolaridad', id:'disgrafia',      label:'Dificultad de escritura (disgrafía)'},
  {grupo:'Aprendizaje y escolaridad', id:'discalculia',    label:'Dificultad de cálculo (discalculia)'},
  {grupo:'Aprendizaje y escolaridad', id:'retraso_lenguaje',   label:'Retraso del lenguaje'},
  {grupo:'Aprendizaje y escolaridad', id:'trastorno_lenguaje', label:'Trastorno del lenguaje'},
  {grupo:'Aprendizaje y escolaridad', id:'repitencia',     label:'Repitencia de años escolares'},
  {grupo:'Aprendizaje y escolaridad', id:'abandono',       label:'Abandono escolar temprano'}
];
var TRAT_INFANCIA = [
  {id:'psicopedagogia', label:'Psicopedagogía'},
  {id:'fonoaudiologia', label:'Fonoaudiología'},
  {id:'to',              label:'Terapia Ocupacional'},
  {id:'psicologia',      label:'Psicología'},
  {id:'psicomotricidad', label:'Psicomotricidad'}
];
var ANT_FAMILIARES = [
  {id:'tdah',           label:'Déficit de Atención (TDAH)'},
  {id:'aprendizaje',    label:'Trastorno del Aprendizaje'},
  {id:'consumo_alcohol', label:'Consumo de alcohol'},
  {id:'consumo_drogas', label:'Consumo de drogas'},
  {id:'autismo',        label:'Autismo'},
  {id:'dislexia',       label:'Dislexia (dificultad de lectura)'},
  {id:'disgrafia',      label:'Dificultad de escritura (disgrafía)'},
  {id:'discalculia',    label:'Dificultad de cálculo (discalculia)'},
  {id:'retraso_lenguaje',   label:'Retraso del lenguaje'},
  {id:'trastorno_lenguaje', label:'Trastorno del lenguaje'},
  {id:'bipolaridad',    label:'Bipolaridad'},
  {id:'esquizofrenia',  label:'Esquizofrenia'},
  {id:'depresion',      label:'Depresión'},
  {id:'ansiedad',       label:'Ansiedad'},
  {id:'otro_diag',      label:'Algún otro diagnóstico de salud mental'},
  {id:'alzheimer',      label:'Enfermedad de Alzheimer'},
  {id:'demencia',       label:'Demencia (otra que no sea Alzheimer)'},
  {id:'parkinson',      label:'Enfermedad de Parkinson'},
  {id:'deterioro_cognitivo', label:'Deterioro cognitivo'},
  {id:'epilepsia',      label:'Epilepsia'},
  {id:'neurologica',    label:'Alguna otra enfermedad neurológica'},
  {id:'hta',            label:'Hipertensión arterial (HTA)'},
  {id:'diabetes',       label:'Diabetes (DBT)'},
  {id:'infarto',        label:'Infarto'},
  {id:'acv',            label:'ACV (accidente cerebrovascular)'}
];
var HABITOS = [
  {id:'tabaco',  label:'Tabaco'},
  {id:'alcohol', label:'Alcohol'},
  {id:'drogas',  label:'Consumo de drogas'}
];

// ══ RENDER ═══════════════════════════════════════════════════════════════════
var LABELS_ASRS = ['Nunca','Rara vez','A veces','Con frecuencia','Con mucha frecuencia'];
var LABELS_WURS = ['Nada o casi nada','Un poco','Moderadamente','Bastante','Muy frecuentemente'];
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

// Igual que _renderEscala pero con valores 1..4 (en vez de 0..4) y grilla de 4
// columnas — así queda compatible con la puntuación de AQ_AGREE/AQ_DISAGREE
// (copiada de legacy-tests.js, que usa valores 1-based).
function _renderLikert4(items, containerId, namePrefix, labels) {
  var el = document.getElementById(containerId);
  el.innerHTML = items.map(function(it) {
    var opts = labels.map(function(lbl, j) {
      return '<label><input type="radio" name="'+namePrefix+'_'+it.n+'" value="'+(j+1)+'"><span>'+(j+1)+'<br>'+lbl+'</span></label>';
    }).join('');
    return '<div class="escala-item"><div class="escala-pregunta">'+it.n+'. '+it.txt+'</div><div class="escala-opts escala-opts-4">'+opts+'</div></div>';
  }).join('');
}

function _renderChecklist(items, containerId, prefix, ningunoLabel) {
  var el = document.getElementById(containerId);
  function casilla(id, label) {
    return '<label class="chk-item"><input type="checkbox" id="'+prefix+'-'+id+'"> '+label+'</label>';
  }
  var ninguno = casilla('ninguno', ningunoLabel);
  if (!items.some(function(it){ return it.grupo; })) {
    el.innerHTML = items.map(function(it){ return casilla(it.id, it.label); }).join('') + ninguno;
    return;
  }
  // Con grupos: un subtítulo por grupo y cada grupo en sus propias columnas.
  var grupos = [];
  items.forEach(function(it) {
    var g = grupos[grupos.length - 1];
    if (!g || g.nombre !== it.grupo) grupos.push(g = {nombre: it.grupo, items: []});
    g.items.push(it);
  });
  el.classList.add('chk-agrupado');
  el.innerHTML = grupos.map(function(g) {
    return '<div class="chk-grupo"><div class="chk-grupo-titulo">'+g.nombre+'</div><div class="chk-list">' +
      g.items.map(function(it){ return casilla(it.id, it.label); }).join('') + '</div></div>';
  }).join('') + '<div class="chk-grupo chk-grupo-ninguno">' + ninguno + '</div>';
}

function _renderTodo() {
  _renderChecklist(ANT_SALUD, 'chk-salud', 'ax-salud', 'Ninguno de ellos');
  _renderChecklist(TRAT_INFANCIA, 'chk-inftto', 'ax-inftto', 'Ninguno de ellos');
  _renderChecklist(ANT_FAMILIARES, 'chk-fam', 'ax-fam', 'Ninguno de ellos');
  _renderChecklist(HABITOS, 'chk-habitos', 'ax-habitos', 'Ninguno');

  _renderEscala(ASRS_ITEMS.filter(function(i){ return i.sec==='A'; }), 'asrs-items-a', 'asrs_', LABELS_ASRS);
  _renderEscala(ASRS_ITEMS.filter(function(i){ return i.sec==='B'; }), 'asrs-items-b', 'asrs_', LABELS_ASRS);
  _renderEscala(WURS_ITEMS_LIST.map(function(txt,i){ return {n:i+1, txt:'De niño/a era/estaba: '+txt}; }), 'wurs-items', 'wurs_', LABELS_WURS);
  _renderEscala(DEX_ITEMS_TXT, 'dex-items', 'dex', LABELS_DEX);

  _renderLikert4(AQ_ITEMS, 'aq-items', 'aq', ND_LIKERT4_AQ);
  _renderLikert4(AQ10_ITEMS, 'aq10-items', 'aq10', LABELS_AQ10);
  _renderLikert4(EQ_ITEMS, 'eq-items', 'eq', ND_LIKERT4_EQ);
}

// TDAH y autismo son motivos independientes (un paciente puede venir por los
// dos, mostrando ambos bloques), pero «Ninguno de los anteriores» es
// excluyente con los dos — tildar un diagnóstico destilda "Ninguno" y
// viceversa. Cada bloque de cuestionarios solo se pide si su motivo está marcado.
function motivoCambio(cual) {
  var tdah = document.getElementById('ax-motivo-tdah');
  var autismo = document.getElementById('ax-motivo-autismo');
  var ninguno = document.getElementById('ax-motivo-ninguno');
  if (cual === 'ninguno' && ninguno.checked) {
    tdah.checked = false; autismo.checked = false;
  } else if ((cual === 'tdah' || cual === 'autismo') && (tdah.checked || autismo.checked)) {
    ninguno.checked = false;
  }
  _syncBloquesMotivo();
}

function _syncBloquesMotivo() {
  document.getElementById('bloque-tdah').style.display = document.getElementById('ax-motivo-tdah').checked ? 'block' : 'none';
  document.getElementById('bloque-autismo').style.display = document.getElementById('ax-motivo-autismo').checked ? 'block' : 'none';
}

// ══ CÁLCULO DE PUNTAJES (idéntico a calcularAsrs/calcularWurs/calcularDEX) ══
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

function _calcularAQPublico() {
  var sin = 0;
  var total = aqScoreFromResponses(function(n){ var s=document.querySelector('input[name="aq_'+n+'"]:checked'); if(!s){sin++;return null;} return parseInt(s.value,10); });
  if (sin) return null;
  var r = aqInterp(total);
  return { test:'AQ', fecha: null, puntaje_total: total, puntaje_z: null, categoria: r.cat + (r.fenotipo!=='—' ? ' · '+r.fenotipo : ''), datos: { total:total, cat:r.cat, fenotipo:r.fenotipo } };
}

function _calcularAQ10Publico() {
  var total = 0, sin = 0;
  for (var i = 1; i <= 10; i++) {
    var s = document.querySelector('input[name="aq10_'+i+'"]:checked');
    if (!s) { sin++; continue; }
    var v = parseInt(s.value, 10);
    if (AQ10_AGREE.indexOf(i) >= 0 && v >= 3) total++;
    else if (AQ10_DISAGREE.indexOf(i) >= 0 && v <= 2) total++;
  }
  if (sin) return null;
  var pos = total >= 6;
  return { test:'AQ-10', fecha: null, puntaje_total: total, puntaje_z: null, categoria: pos ? 'Positivo cribado' : 'Negativo cribado', datos: { total:total, positivo:pos } };
}

function _calcularEQPublico() {
  var sin = 0;
  var total = eqScoreFromResponses(function(n){ var s=document.querySelector('input[name="eq_'+n+'"]:checked'); if(!s){sin++;return null;} return parseInt(s.value,10); });
  if (sin) return null;
  var r = eqInterp(total);
  return { test:'EQ', fecha: null, puntaje_total: total, puntaje_z: null, categoria: r.cat, datos: { total:total, cat:r.cat } };
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

function _formatearChecklist(items, prefix, ningunoId, otrosId, ningunoTexto, otrosPrefijo) {
  var otros = document.getElementById(otrosId);
  var otrosVal = otros ? otros.value.trim() : '';
  var ninguno = document.getElementById(ningunoId);
  if (ninguno && ninguno.checked && !otrosVal) return ningunoTexto;
  var marcados = items.filter(function(it) {
    var chk = document.getElementById(prefix + '-' + it.id);
    return chk && chk.checked;
  }).map(function(it){ return it.label; });
  if (otrosVal && otrosPrefijo) {
    var aclaracion = otrosPrefijo + otrosVal.replace(/\.+$/, '') + '.';
    return marcados.length ? marcados.join(', ') + '. ' + aclaracion : aclaracion;
  }
  if (otrosVal) marcados.push(otrosVal);
  return marcados.length ? marcados.join(', ') + '.' : null;
}

function _construirIntake() {
  var tel = document.getElementById('ax-tel').value.trim();
  var correo = document.getElementById('ax-correo').value.trim();
  var contactoPartes = [];
  if (tel) contactoPartes.push('Tel: ' + tel);
  if (correo) contactoPartes.push('Email: ' + correo);

  var saludTxt  = _formatearChecklist(ANT_SALUD, 'ax-salud', 'ax-salud-ninguno', 'ax-salud-otros', 'Ninguno reportado.', 'Aclaraciones: ');
  var infttoTxt = _formatearChecklist(TRAT_INFANCIA, 'ax-inftto', 'ax-inftto-ninguno', 'ax-inftto-otros', 'Ninguno reportado.');
  var antClinicosPartes = [];
  if (saludTxt) antClinicosPartes.push('Antecedentes de salud: ' + saludTxt);
  // Si no hizo ningún tratamiento en la infancia no aporta nada al informe —
  // se omite la línea entera en vez de escribir "...: Ninguno reportado." en el Word.
  if (infttoTxt && infttoTxt !== 'Ninguno reportado.') antClinicosPartes.push('Tratamientos realizados durante la infancia: ' + infttoTxt);

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
    ant_clinicos: antClinicosPartes.length ? antClinicosPartes.join(' ') : null,
    ant_psiquiatricos: document.getElementById('ax-psiq').value.trim() || null,
    ant_familiares: _formatearChecklist(ANT_FAMILIARES, 'ax-fam', 'ax-fam-ninguno', 'ax-fam-otros', 'Ninguno reportado.'),
    habitos_toxicos: _formatearChecklist(HABITOS, 'ax-habitos', 'ax-habitos-ninguno', 'ax-habitos-otros', 'Ninguno reportado.'),
    medicacion: _medicacionTexto()
  };
}

// Medicación: o escribe qué toma, o marca «No tomo medicación». Así un campo en
// blanco ya no queda ambiguo (¿no toma nada o no se acordó?). Ambas opciones se
// excluyen: escribir destilda el check y tildarlo borra el texto.
function _medicacionTexto() {
  var txt = document.getElementById('ax-medicacion').value.trim();
  if (txt) return txt;
  return document.getElementById('ax-medicacion-ninguna').checked ? 'No toma medicación actualmente.' : null;
}

function medicacionNinguna() {
  if (document.getElementById('ax-medicacion-ninguna').checked) {
    document.getElementById('ax-medicacion').value = '';
  }
}

function medicacionEscrita() {
  if (document.getElementById('ax-medicacion').value.trim()) {
    document.getElementById('ax-medicacion-ninguna').checked = false;
  }
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
  if (!_medicacionTexto()) faltantes.push('tu medicación (o marcá «No tomo medicación»)');

  if (!_algunoMarcado(ANT_SALUD, 'ax-salud', 'ax-salud-ninguno')) faltantes.push('antecedentes de salud');
  if (!_algunoMarcado(TRAT_INFANCIA, 'ax-inftto', 'ax-inftto-ninguno')) faltantes.push('tratamientos en la infancia');
  if (!_algunoMarcado(ANT_FAMILIARES, 'ax-fam', 'ax-fam-ninguno')) faltantes.push('antecedentes familiares');
  if (!_algunoMarcado(HABITOS, 'ax-habitos', 'ax-habitos-ninguno')) faltantes.push('hábitos tóxicos');

  var mTdah = document.getElementById('ax-motivo-tdah').checked;
  var mAutismo = document.getElementById('ax-motivo-autismo').checked;
  var mNinguno = document.getElementById('ax-motivo-ninguno').checked;
  if (!mTdah && !mAutismo && !mNinguno) { faltantes.push('tu motivo de consulta'); return faltantes; }

  // Los cuestionarios de cada bloque solo son obligatorios si ese motivo está marcado.
  if (mTdah) {
    var asrsSinResp = ASRS_ITEMS.filter(function(it){ return !document.querySelector('input[name="asrs_'+it.n+'"]:checked'); }).length;
    if (asrsSinResp) faltantes.push(asrsSinResp + ' ítem(s) del ASRS-V1.1');

    var wursSinResp = 0;
    for (var i=1;i<=25;i++) { if (!document.querySelector('input[name="wurs_'+i+'"]:checked')) wursSinResp++; }
    if (wursSinResp) faltantes.push(wursSinResp + ' ítem(s) del WURS-25');

    var dexSinResp = 0;
    for (var j=1;j<=20;j++) { if (!document.querySelector('input[name="dex'+j+'"]:checked')) dexSinResp++; }
    if (dexSinResp) faltantes.push(dexSinResp + ' ítem(s) del DEX');
  }

  if (mAutismo) {
    var aqSinResp = AQ_ITEMS.filter(function(it){ return !document.querySelector('input[name="aq_'+it.n+'"]:checked'); }).length;
    if (aqSinResp) faltantes.push(aqSinResp + ' ítem(s) del AQ');

    var aq10SinResp = 0;
    for (var k=1;k<=10;k++) { if (!document.querySelector('input[name="aq10_'+k+'"]:checked')) aq10SinResp++; }
    if (aq10SinResp) faltantes.push(aq10SinResp + ' ítem(s) del AQ-10');

    var eqSinResp = EQ_ITEMS.filter(function(it){ return !document.querySelector('input[name="eq_'+it.n+'"]:checked'); }).length;
    if (eqSinResp) faltantes.push(eqSinResp + ' ítem(s) del EQ');
  }

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

  var hoy = new Date().toISOString().split('T')[0];
  var resultados = [];

  if (document.getElementById('ax-motivo-tdah').checked) {
    var edad = calcularEdad(document.getElementById('ax-fnac').value);
    var grupo = edad <= 50 ? '18-50' : '>50';
    var asrs = _calcularAsrsPublico(grupo);
    var wurs = _calcularWursPublico();
    var dex  = _calcularDexPublico();
    if (!asrs || !wurs || !dex) {
      msgEl.style.color = '#c0392b';
      msgEl.textContent = 'Faltan respuestas en alguno de los cuestionarios de TDAH. Revisá que estén todos completos.';
      return;
    }
    resultados = resultados.concat([asrs, wurs, dex]);
  }

  if (document.getElementById('ax-motivo-autismo').checked) {
    var aq = _calcularAQPublico();
    var aq10 = _calcularAQ10Publico();
    var eq = _calcularEQPublico();
    if (!aq || !aq10 || !eq) {
      msgEl.style.color = '#c0392b';
      msgEl.textContent = 'Faltan respuestas en alguno de los cuestionarios de autismo. Revisá que estén todos completos.';
      return;
    }
    resultados = resultados.concat([aq, aq10, eq]);
  }

  resultados.forEach(function(r) { r.fecha = hoy; });

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
    body: JSON.stringify({ p_paciente_id: pacId, p_intake: intake, p_resultados: resultados })
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
window.motivoCambio = motivoCambio;
window.medicacionNinguna = medicacionNinguna;
window.medicacionEscrita = medicacionEscrita;

window.addEventListener('DOMContentLoaded', function() {
  var pacId = getPacienteIdUrl();
  if (!pacId) {
    document.getElementById('pantalla-error').style.display = 'block';
    return;
  }
  document.getElementById('pantalla-form').style.display = 'block';
  _renderTodo();
  tdahRestoreDraft(pacId);
  _syncBloquesMotivo(); // por si el borrador restaurado ya traía una respuesta
  tdahBindDraftAutosave(pacId);
});
