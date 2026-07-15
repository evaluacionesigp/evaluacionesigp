import { supaFetch, supaAuth, catchGuardarError, manejarSesionExpirada } from './core/supabase-client.js';
import { doLogin, doLogout, limpiarBorradoresLocalesPaciente, doForgot } from './core/auth.js';

// src/legacy-tests.js (script clásico, sin migrar todavía) llama a estas
// funciones por nombre global, igual que los atributos onclick/onchange del
// HTML — por eso se exponen acá en vez de dejarlas solo como exports de módulo.
Object.assign(window, {
  supaFetch, supaAuth, catchGuardarError, manejarSesionExpirada,
  doLogin, doLogout, limpiarBorradoresLocalesPaciente, doForgot,
});
