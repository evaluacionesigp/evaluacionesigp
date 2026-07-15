import { supaFetch, supaAuth, catchGuardarError, manejarSesionExpirada } from './core/supabase-client.js';
import { doLogin, doLogout, limpiarBorradoresLocalesPaciente, doForgot } from './core/auth.js';
import { PHQ_OPS, iniciarPHQ, limpiarPHQ, calcularPHQ, guardarResultadoPHQ } from './tests/phq9.js';
import { tokenLive, limpiarToken, iniciarToken, calcularToken, guardarToken } from './tests/token-test.js';

// public/legacy-tests.js (script clásico, sin migrar todavía) llama a estas
// funciones por nombre global, igual que los atributos onclick/onchange del
// HTML — por eso se exponen acá en vez de dejarlas solo como exports de módulo.
// PHQ_OPS también se expone porque el GAD-7 (todavía en legacy-tests.js)
// reutiliza esas mismas opciones de escala.
Object.assign(window, {
  supaFetch, supaAuth, catchGuardarError, manejarSesionExpirada,
  doLogin, doLogout, limpiarBorradoresLocalesPaciente, doForgot,
  PHQ_OPS, iniciarPHQ, limpiarPHQ, calcularPHQ, guardarResultadoPHQ,
  tokenLive, limpiarToken, iniciarToken, calcularToken, guardarToken,
});
