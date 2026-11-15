/*
 * brand/cy-embudo.js - Medición del embudo y disponibilidad real (diagnóstico 29/10/2026).
 *
 * - cyEmbudo(evento, orderId): envía un evento anónimo (sin datos personales) a /api/gas/eventos.
 *   Eventos: visita, elige_cilindro, pone_direccion, confirma, pedido_creado.
 * - Si la página tiene un elemento #cyDisponibilidad, muestra si hay atención real ahora
 *   (GET /api/gas/disponibilidad). Nunca inventa camiones.
 */
(function () {
  'use strict';

  function sesion() {
    try {
      var s = localStorage.getItem('cy_sesion_embudo');
      if (!s) {
        s = 'cy' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
        localStorage.setItem('cy_sesion_embudo', s);
      }
      return s;
    } catch (e) {
      return 'cy' + Date.now().toString(36) + 'sinls';
    }
  }

  var enviados = {};

  window.cyEmbudo = function (evento, orderId) {
    var clave = evento + (orderId || '');
    if (enviados[clave]) return;   // un evento por paso y por visita
    enviados[clave] = true;
    var cuerpo = JSON.stringify({
      sesion: sesion(),
      evento: evento,
      pagina: location.pathname,
      order_id: orderId || ''
    });
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/gas/eventos', new Blob([cuerpo], { type: 'application/json' }));
      } else {
        fetch('/api/gas/eventos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: cuerpo, keepalive: true });
      }
    } catch (e) { /* la medición nunca debe romper la página */ }
  };

  function pintarDisponibilidad(d) {
    var el = document.getElementById('cyDisponibilidad');
    if (!el) return;
    var ok = !!d.disponible;
    el.className = 'cy-disponibilidad ' + (ok ? 'cy-disp-ok' : 'cy-disp-no');
    el.innerHTML = '';
    var punto = document.createElement('span');
    punto.className = 'cy-disp-punto';
    var texto = document.createElement('span');
    texto.textContent = d.mensaje || (ok ? 'Hay atención ahora.' : 'Ahora no hay repartidores conectados.');
    el.appendChild(punto);
    el.appendChild(texto);
    el.style.minHeight = '44px';
    window.cyDisponibilidadActual = d;
    ajustarBotonesPedido(d);
  }

  // En lista de espera el pedido no se cobra ni se despacha: los botones lo dicen (antes decían «Pedir gas $3,60»)
  function ajustarBotonesPedido(d) {
    var espera = !!d.lista_espera;
    document.body.classList.toggle('cy-en-espera', espera);
    [['cyxBarraBtn', 'Anotarme en la lista'], ['submitOrderBtn', 'Anotarme en la lista de espera']].forEach(function (par) {
      var b = document.getElementById(par[0]);
      if (!b) return;
      var destino = b.querySelector('span:last-child') || b;
      if (!b.dataset.textoOriginal) b.dataset.textoOriginal = destino.textContent;
      destino.textContent = espera ? par[1] : b.dataset.textoOriginal;
    });
    var etiqueta = document.querySelector('#cyxBarra .cyx-total small');
    if (etiqueta) etiqueta.textContent = espera ? 'No se cobra ahora' : 'Total';
  }

  function cargarDisponibilidad() {
    var el = document.getElementById('cyDisponibilidad');
    if (!el) return;
    el.className = 'cy-disponibilidad cy-disp-cargando';
    el.textContent = 'Comprobando si hay repartidores ahora…';
    fetch('/api/gas/disponibilidad', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (d) { pintarDisponibilidad(d); return; }
        throw new Error('sin datos');
      })
      .catch(function () {
        // Sin conexión con el servidor: se dice, sin inventar disponibilidad
        el.className = 'cy-disponibilidad cy-disp-no';
        el.textContent = 'No pudimos comprobar la atención ahora. Puedes dejar tu pedido y te confirmamos por WhatsApp.';
      });
  }

  // Estilos mínimos del aviso (no dependen de Tailwind)
  var css = document.createElement('style');
  css.textContent =
    '.cy-disponibilidad{display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:14px;font:600 13px/1.35 inherit;margin:10px 0}' +
    '.cy-disp-ok{background:#E9F8EF;color:#0B5A2E;border:1px solid #A7E1BE}' +
    '.cy-disp-no{background:#FFF6E5;color:#7A4A00;border:1px solid #F5D08A}' +
    '.cy-disp-cargando{background:#F1F5F9;color:#475569;border:1px solid #E2E8F0}' +
    '.cy-disp-punto{width:10px;height:10px;border-radius:50%;flex:0 0 10px;background:currentColor}';
  document.head.appendChild(css);

  document.addEventListener('DOMContentLoaded', function () {
    window.cyEmbudo('visita');
    cargarDisponibilidad();
    // Elegir cilindro (tarjetas de producto) y poner dirección (campo de dirección o botón GPS)
    document.addEventListener('click', function (ev) {
      var t = ev.target.closest ? ev.target.closest('[onclick]') : null;
      var oc = t ? (t.getAttribute('onclick') || '') : '';
      if (oc.indexOf('selectProduct') === 0) window.cyEmbudo('elige_cilindro');
    }, true);
    var dir = document.getElementById('custAddressInput');
    if (dir) {
      dir.addEventListener('change', function () { if (dir.value.trim().length >= 5) window.cyEmbudo('pone_direccion'); });
    }
  });
})();
