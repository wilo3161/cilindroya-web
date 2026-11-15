/*
 * brand/cy-zonas.js — Elegir la zona de entrega en Imbabura (03/11/2026).
 *
 * Datos en brand/cy-imbabura.js (window.CY_IMBABURA). Este archivo solo dibuja y responde:
 * - Portada (/hogar/): el buscador «Llegamos a ___» y el selector cantón → parroquia → barrio
 *   (#barrioInput, #respuestaBarrio, #cyZonas). Al elegir, el botón lleva a /cliente/?zona=...
 * - App de pedido (/cliente/): si llega ?zona=..., la escribe en la dirección (#custAddressInput) para que
 *   el cliente solo agregue su calle.
 */
(function () {
  'use strict';
  var DATOS = window.CY_IMBABURA || [];
  var normal = function (t) { return (t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim(); };
  var esc = function (t) { var x = document.createElement('i'); x.textContent = t; return x.innerHTML; };

  var MAX_VISIBLES = 12;  // barrios que se ven antes de «Ver los N barrios»

  // Barrios de una parroquia: su propia lista o, en una parroquia urbana, los de la ciudad (Otavalo)
  function barriosDe(c, parroquia) {
    if (!parroquia) return [];
    var propios = (c.barrios || {})[parroquia];
    if (propios && propios.length) return propios;
    return c.urbanas.indexOf(parroquia) >= 0 ? (c.barriosCiudad || []) : [];
  }

  // Índice de búsqueda: cantones, parroquias y barrios, cada uno con su cantón y su cobertura
  var lugares = [];
  DATOS.forEach(function (c) {
    lugares.push({ nombre: c.canton, canton: c, parroquia: null, barrio: null });
    c.urbanas.concat(c.rurales).forEach(function (p) { lugares.push({ nombre: p, canton: c, parroquia: p, barrio: null }); });
    Object.keys(c.barrios || {}).forEach(function (p) {
      c.barrios[p].forEach(function (b) { lugares.push({ nombre: b, canton: c, parroquia: p, barrio: b }); });
    });
    // Barrios de ciudad sin parroquia conocida: no se adivina la parroquia
    (c.barriosCiudad || []).forEach(function (b) { lugares.push({ nombre: b, canton: c, parroquia: null, barrio: b }); });
  });

  function buscar(texto) {
    var t = normal(texto);
    if (t.length < 3) return null;
    var exacto = null, inicio = null, dentro = null;
    lugares.forEach(function (l) {
      var completo = normal(l.nombre);
      var palabras = completo.replace(/[()]/g, ' ').split(/\s+/);
      if (!exacto && completo === t) exacto = l;
      if (!inicio && (completo.indexOf(t) === 0 || palabras.some(function (p) { return p.length > 3 && p.indexOf(t) === 0; }))) inicio = l;
      // «Peguche» está dentro de «Dr. Miguel Egas Cabezas (Peguche)»
      if (!dentro && t.length >= 4 && completo.indexOf(t) >= 0) dentro = l;
    });
    return exacto || inicio || dentro;
  }

  // ── Portada ────────────────────────────────────────────────────────────────
  function iniciarPortada() {
    var caja = document.getElementById('cyZonas');
    var input = document.getElementById('barrioInput');
    var resp = document.getElementById('respuestaBarrio');
    if (!caja || !input || !resp) return;
    var sel = { canton: null, parroquia: null, barrio: null };

    function textoZona() {
      if (!sel.canton) return '';
      var partes = [];
      if (sel.barrio) partes.push(sel.barrio);
      if (sel.parroquia && sel.parroquia !== sel.barrio) partes.push(sel.parroquia);
      partes.push(sel.canton.canton);
      return partes.filter(function (p, i, a) { return a.indexOf(p) === i; }).join(', ');
    }

    // El título «Llegamos a ___» es enorme: con nombres largos se achica para que se lean completos
    function ajustarLetra() {
      var n = input.value.length;
      input.style.fontSize = n > 22 ? '.5em' : n > 14 ? '.68em' : n > 10 ? '.85em' : '';
    }

    function responder(nombreEscrito) {
      ajustarLetra();
      var c = sel.canton;
      if (!c) {
        resp.className = 'respuesta' + (nombreEscrito ? ' no' : '');
        resp.innerHTML = nombreEscrito
          ? '<b>No lo tenemos en la lista</b><span>Elige tu cantón abajo o escríbenos por WhatsApp al 099 305 2744 y revisamos si llegamos a ' + esc(nombreEscrito) + '.</span>'
          : '<b>Elige tu cantón</b><span>Te decimos al momento si llegamos.</span>';
        return;
      }
      var zona = textoZona();
      var enlace = '/cliente/?zona=' + encodeURIComponent(zona);
      if (c.cobertura === 'si') {
        resp.className = 'respuesta si';
        resp.innerHTML = '<b>Sí, llegamos a ' + esc(zona) + '</b><span>' + esc(c.canton) +
          ' es zona piloto: pides de 06:30 a 19:30 y pagas al recibir.</span>' +
          '<a class="boton zonas-pedir" href="' + enlace + '">Pedir gas aquí</a>';
      } else {
        resp.className = 'respuesta no';
        resp.innerHTML = '<b>Muy pronto en ' + esc(zona) + '</b><span>' + esc(c.canton) +
          ' entra después de la zona piloto. Deja tu pedido y te avisamos por WhatsApp apenas llegue un distribuidor.</span>' +
          '<a class="boton zonas-pedir" href="' + enlace + '">Anotarme en la lista</a>';
      }
    }

    function grupo(titulo, opciones, elegida, alElegir, limitar) {
      var todas = opciones;
      // Listas largas (Ibarra tiene hasta 49 barrios por parroquia): primero los 12 principales
      if (limitar && !sel.verTodos && opciones.length > MAX_VISIBLES) {
        opciones = opciones.slice(0, MAX_VISIBLES);
        if (elegida && opciones.indexOf(elegida) < 0) opciones = opciones.concat([elegida]);
      }
      var g = document.createElement('div');
      g.className = 'zonas-paso';
      var h = document.createElement('p');
      h.className = 'zonas-titulo';
      h.textContent = titulo;
      var fila = document.createElement('div');
      fila.className = 'ejemplos';
      fila.setAttribute('role', 'group');
      fila.setAttribute('aria-label', titulo);
      opciones.forEach(function (o) {
        var b = document.createElement('button');
        b.type = 'button';
        b.textContent = o;
        b.setAttribute('aria-pressed', o === elegida ? 'true' : 'false');
        b.addEventListener('click', function () { alElegir(o); });
        fila.appendChild(b);
      });
      if (opciones.length < todas.length) {
        var mas = document.createElement('button');
        mas.type = 'button';
        mas.className = 'zonas-mas';
        mas.textContent = 'Ver los ' + todas.length + ' barrios';
        mas.addEventListener('click', function () { sel.verTodos = true; dibujar(); });
        fila.appendChild(mas);
      }
      g.appendChild(h);
      g.appendChild(fila);
      return g;
    }

    function dibujar() {
      caja.innerHTML = '';
      caja.appendChild(grupo('1. Tu cantón', DATOS.map(function (c) { return c.canton; }), sel.canton && sel.canton.canton, function (n) {
        sel = { canton: DATOS.filter(function (c) { return c.canton === n; })[0], parroquia: null, barrio: null };
        input.value = n; dibujar(); responder();
      }));
      if (!sel.canton) return;
      var c = sel.canton;
      var elegirParroquia = function (p) { sel.parroquia = p; sel.barrio = null; sel.verTodos = false; input.value = p; dibujar(); responder(); };
      caja.appendChild(grupo('2. Tu parroquia · ciudad', c.urbanas, sel.parroquia, elegirParroquia));
      caja.appendChild(grupo('2. Tu parroquia · campo', c.rurales, sel.parroquia, elegirParroquia));
      if (sel.parroquia) {
        var lista = barriosDe(c, sel.parroquia);
        if (lista.length) {
          caja.appendChild(grupo('3. Tu barrio', lista, sel.barrio, function (b) {
            sel.barrio = b; input.value = b; dibujar(); responder();
          }, true));
        }
        caja.appendChild(otroBarrio(lista.length ? '¿Tu barrio no está? Escríbelo' : '3. Tu barrio o comunidad (opcional)'));
      }
    }

    // Barrio o comunidad que no está en la lista, dentro de la parroquia ya elegida
    function otroBarrio(titulo) {
      var g = document.createElement('div');
      g.className = 'zonas-paso';
      var l = document.createElement('label');
      l.className = 'zonas-titulo';
      l.setAttribute('for', 'cyOtroBarrio');
      l.textContent = titulo;
      var campo = document.createElement('input');
      campo.id = 'cyOtroBarrio';
      campo.className = 'zonas-otro';
      campo.type = 'text';
      campo.maxLength = 60;
      campo.autocomplete = 'off';
      var c = sel.canton;
      campo.value = sel.barrio && barriosDe(c, sel.parroquia).indexOf(sel.barrio) < 0 ? sel.barrio : '';
      campo.addEventListener('input', function () {
        sel.barrio = campo.value.trim() || null;
        responder();
      });
      g.appendChild(l);
      g.appendChild(campo);
      return g;
    }

    input.addEventListener('input', function () {
      var l = buscar(input.value);
      sel = l ? { canton: l.canton, parroquia: l.parroquia, barrio: l.barrio } : { canton: null, parroquia: null, barrio: null };
      dibujar();
      responder(input.value.trim());
    });

    var inicial = buscar(input.value);
    if (inicial) sel = { canton: inicial.canton, parroquia: inicial.parroquia, barrio: inicial.barrio };
    dibujar();
    responder();
  }

  // ── App de pedido: la zona elegida en la portada llega escrita ─────────────
  function iniciarPedido() {
    var dir = document.getElementById('custAddressInput');
    if (!dir) return;
    var zona = new URLSearchParams(location.search).get('zona');
    if (!zona || dir.value.trim()) return;
    zona = zona.slice(0, 120);
    dir.placeholder = 'Calle y número (ej. Bolívar 4-56)';
    var aviso = document.createElement('p');
    aviso.className = 'cyx-zona-elegida';
    aviso.textContent = 'Zona: ' + zona + '. Escribe solo tu calle y número.';
    dir.insertAdjacentElement('afterend', aviso);
    // Al terminar de escribir la calle se agrega la zona (una sola vez)
    var completar = function () {
      var v = dir.value.trim();
      if (v && normal(v).indexOf(normal(zona)) < 0) {
        dir.value = v + ', ' + zona;
        dir.dispatchEvent(new Event('input', { bubbles: true }));
      }
    };
    dir.addEventListener('change', completar);
    dir.addEventListener('blur', completar);
  }

  document.addEventListener('DOMContentLoaded', function () {
    iniciarPortada();
    iniciarPedido();
  });
})();
