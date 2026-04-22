import { supabase } from './supabase.js';

let currentGeneralId = null;

export function getCurrentGeneralId() {
  return currentGeneralId;
}

export function clearCurrentGeneralId() {
  currentGeneralId = null;
}

class AnalyticsService {
  constructor() {
    this.buffer = [];
    this.STORAGE_KEY = 'pepper_analytics';
  }

  count(category, item, state) {
    this.buffer.push({
      timestamp: new Date().toISOString(),
      session: state?.session?.id ?? null,
      type: 'counter',
      category,
      item,
      language: state?.language ?? 'es'
    });

    if (!supabase) return;

    supabase.rpc('increment_counter', { p_category: category, p_item: item }).then((result) => {
      if (result.error) {
        console.warn('Supabase counter error:', result.error.message);
      }
    });
  }

  log(eventType, data = {}, state) {
    if (eventType === 'book_service' && data.action) {
      this.count('books', data.action, state);
    } else if (eventType === 'destination_request' && data.destination) {
      this.count('navigation', data.destination, state);
    } else if (eventType === 'shelf_selected' && data.shelf) {
      this.count('shelves', `shelf_${data.shelf}`, state);
    } else if (eventType === 'info_tab' && data.tab) {
      this.count('info', `tab_${data.tab}`, state);
    } else if (eventType === 'faq_opened' && data.index !== undefined) {
      this.count('info_faq', `faq_${data.index}`, state);
    } else if (eventType === 'feedback' && data.rating) {
      this.count('feedback', data.rating, state);
    } else if (eventType === 'trivia_completed' && data.activity) {
      this.count('events', 'trivia_completed', state);
    }

    this.buffer.push({
      timestamp: new Date().toISOString(),
      session: state?.session?.id ?? null,
      type: eventType,
      data,
      language: state?.language ?? 'es'
    });
  }

  insertFeedback(rating, state, lastAction) {
    if (!supabase) return;

    supabase
      .from('session_feedback')
      .insert({
        session_id: state?.session?.id ?? null,
        rating,
        action_label: lastAction?.label ?? null,
        action_item: lastAction?.item ?? null,
        action_cat: lastAction?.category ?? null,
        language: state?.language ?? 'es'
      })
      .then((result) => {
        if (result.error) {
          console.warn('Supabase feedback insert error:', result.error.message);
        }
      });
  }

  insertGeneralInteraction(categoria, callback) {
    if (!supabase) {
      callback?.(null);
      return;
    }

    supabase
      .from('interacciones_generales')
      .insert({ categoria })
      .select('id')
      .single()
      .then((result) => {
        if (result.error) {
          console.warn('Supabase interacciones_generales error:', result.error.message);
          callback?.(null);
          return;
        }

        currentGeneralId = result.data.id;
        callback?.(result.data.id);
      });
  }

  insertNavegacion(destino, especificacion, eleccion) {
    if (!supabase) return;

    supabase
      .from('navegacion')
      .insert({
        id_general: currentGeneralId ?? null,
        destino,
        especificacion,
        eleccion
      })
      .then((result) => {
        if (result.error) {
          console.warn('Supabase navegacion error:', result.error.message);
        }
      });
  }

  insertBuscarLibro(numeroEstanteria, tema, eleccion) {
    if (!supabase) return;

    supabase
      .from('buscar_libro')
      .insert({
        id_general: currentGeneralId ?? null,
        numero_estanteria: numeroEstanteria ? parseInt(numeroEstanteria, 10) : null,
        tema: tema || null,
        eleccion
      })
      .then((result) => {
        if (result.error) {
          console.warn('Supabase buscar_libro error:', result.error.message);
        }
      });
  }

  insertServiciosLibros(tipo, eleccion) {
    if (!supabase) return;

    supabase
      .from('servicios_libros')
      .insert({
        id_general: currentGeneralId ?? null,
        tipo,
        eleccion
      })
      .then((result) => {
        if (result.error) {
          console.warn('Supabase servicios_libros error:', result.error.message);
        }
      });
  }

  insertInformacion(servicio) {
    if (!supabase) return;

    supabase
      .from('informacion')
      .insert({
        id_general: currentGeneralId ?? null,
        servicio
      })
      .then((result) => {
        if (result.error) {
          console.warn('Supabase informacion error:', result.error.message);
        }
      });
  }

  insertEventos(actividad) {
    if (!supabase) return;

    supabase
      .from('eventos')
      .insert({
        id_general: currentGeneralId ?? null,
        actividad
      })
      .then((result) => {
        if (result.error) {
          console.warn('Supabase eventos error:', result.error.message);
        }
      });
  }

  insertCalidadServicio(puntuacion, comentarios) {
    if (!supabase) return;

    supabase
      .from('calidad_servicio')
      .insert({
        puntuacion,
        comentarios: comentarios || null,
        id_caso: currentGeneralId ?? null
      })
      .then((result) => {
        if (result.error) {
          console.warn('Supabase calidad_servicio error:', result.error.message);
        }
      });
  }

  flush() {
    if (this.buffer.length === 0) return;

    try {
      const existing = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
      const combined = existing.concat(this.buffer);
      const trimmed = combined.length > 500 ? combined.slice(combined.length - 500) : combined;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmed));
    } catch (error) {
      console.warn('Analytics flush failed:', error);
    }

    this.buffer = [];
  }
}

export const Analytics = new AnalyticsService();
