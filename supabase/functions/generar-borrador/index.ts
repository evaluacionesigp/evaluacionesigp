// ══ GENERAR BORRADOR CON IA — Supabase Edge Function ═══════════════════════════
//
// Esta función corre en el servidor de Supabase, no en el navegador. Recibe el
// system prompt + los datos del paciente ya armados por el frontend, llama a la
// API de Anthropic con la key (guardada como secret de Supabase, nunca en el
// código ni en git) y devuelve la respuesta al redactor.
//
// Cómo cargar/actualizar la key (ver comandos exactos en el chat con Erwin):
//   npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//
// Se deploya con --no-verify-jwt (ver comando en el chat) porque la verificación
// automática de JWT de Supabase se hace ANTES de que corra esta función, incluso
// para el preflight OPTIONS del navegador — y el preflight nunca manda el token
// (no lo manda ningún navegador, es parte del estándar CORS), así que Supabase lo
// rechazaba y el fetch fallaba con "Failed to fetch" sin llegar a intentar el
// pedido real. Por eso el chequeo de sesión se hace acá adentro, a mano, contra
// /auth/v1/user con el token que mandó el frontend.

const ANTHROPIC_MODEL = 'claude-sonnet-4-6'; // cambiar acá para usar otro modelo
const ANTHROPIC_MAX_TOKENS = 4096;
// Inyectadas automáticamente por Supabase en toda Edge Function, no son secrets
// que haya que cargar a mano.
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  // "prefer" hace falta porque supaFetch() del frontend lo manda en todo POST
  // (es una convención de PostgREST que reutiliza igual acá); si el navegador
  // ve un header que el preflight no permitió explícitamente, corta el pedido
  // entero con un "Failed to fetch" genérico antes de mandarlo.
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, prefer',
};

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'content-type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return jsonResponse(405, { error: 'Método no permitido.' });
  }

  // Chequeo manual de sesión (ver nota arriba sobre por qué no se usa la
  // verificación automática de Supabase). Un 401 acá es correcto: es exactamente
  // el caso que supaFetch() del frontend interpreta como "sesión vencida".
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token) {
    return jsonResponse(401, { error: 'Falta el token de sesión.' });
  }
  const userRes = await fetch(SUPABASE_URL + '/auth/v1/user', {
    headers: { authorization: 'Bearer ' + token, apikey: SUPABASE_ANON_KEY },
  });
  if (!userRes.ok) {
    return jsonResponse(401, { error: 'Sesión inválida o vencida.' });
  }

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    return jsonResponse(500, { error: 'ANTHROPIC_API_KEY no está configurada como secret en Supabase.' });
  }

  let payload: { system?: string; messages?: unknown };
  try {
    payload = await req.json();
  } catch {
    return jsonResponse(400, { error: 'Body inválido: se esperaba JSON.' });
  }
  if (!payload.system || !Array.isArray(payload.messages)) {
    return jsonResponse(400, { error: 'Body inválido: se esperaba { system, messages }.' });
  }

  let anthropicRes: Response;
  try {
    anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: ANTHROPIC_MAX_TOKENS,
        system: payload.system,
        messages: payload.messages,
      }),
    });
  } catch (err) {
    return jsonResponse(502, { error: 'No se pudo contactar a Anthropic: ' + (err instanceof Error ? err.message : String(err)) });
  }

  const anthropicBody = await anthropicRes.text();
  if (!anthropicRes.ok) {
    // Nunca reenviamos el status code crudo de Anthropic (p.ej. un 401 de key
    // inválida): supaFetch() del frontend interpreta un 401 como "sesión de
    // Supabase vencida" y desloguearía al residente por error. Todo error de
    // Anthropic se traduce acá a un 502 con el detalle adentro.
    let msg = anthropicBody;
    try {
      const j = JSON.parse(anthropicBody);
      msg = (j.error && j.error.message) || msg;
    } catch {
      // el body no era JSON, se deja el texto crudo
    }
    return jsonResponse(502, { error: 'Anthropic devolvió ' + anthropicRes.status + ': ' + msg });
  }

  return new Response(anthropicBody, {
    status: 200,
    headers: { ...corsHeaders, 'content-type': 'application/json' },
  });
});
