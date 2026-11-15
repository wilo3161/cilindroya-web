/*
 * brand/cy-rediseno.js - Comportamiento del rediseño de la app de clientes (29/10/2026).
 *
 * - Barra fija abajo con el total real (copia #summaryTotalLabel) y el botón que llama a submitGasOrder().
 * - "Pedir lo mismo de nuevo": guarda producto, cantidad y dirección del último pedido (sin cédula ni teléfono)
 *   en localStorage (cy_ultimo_pedido) y los rellena con un toque.
 * - Seguimiento en pasos (Recibido → Buscando repartidor → En camino → Entregado) con el estado REAL que
 *   devuelve /api/cliente/pedido/status/...; nunca inventa repartidores ni tiempos.
 * No cambia la lógica del pedido: solo lee lo que la página ya muestra o recibe.
 */
(function () {
  'use strict';

  var CLAVE = 'cy_ultimo_pedido';

  function $(id) { return document.getElementById(id); }
  function leer() { try { return JSON.parse(localStorage.getItem(CLAVE) || 'null'); } catch (e) { return null; } }
  function guardar(v) { try { localStorage.setItem(CLAVE, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } }
  function visible(el) { return el && !el.classList.contains('hidden'); }

  // ── Barra fija con el total ──
  function iniciarBarra() {
    var barra = $('cyxBarra');
    var total = $('summaryTotalLabel');
    var form = $('checkoutFormGrid');
    if (!barra || !total || !form) return;
    var copia = function () { $('cyxBarraTotal').textContent = total.textContent.trim(); };
    var mostrar = function () {
      var ver = visible(form);
      barra.hidden = !ver;
      document.body.classList.toggle('cyx-con-barra', ver);
    };
    copia(); mostrar();
    new MutationObserver(copia).observe(total, { childList: true, characterData: true, subtree: true });
    new MutationObserver(mostrar).observe(form, { attributes: true, attributeFilter: ['class'] });
    $('cyxBarraBtn').addEventListener('click', function () {
      if (typeof window.submitGasOrder === 'function') window.submitGasOrder();
    });
  }

  // ── Pedir lo mismo de nuevo ──
  function productoActual() {
    try { return typeof selectedProdCode !== 'undefined' ? selectedProdCode : null; } catch (e) { return null; }
  }
  function cantidadActual() {
    try { return typeof selectedQty !== 'undefined' ? selectedQty : 1; } catch (e) { return 1; }
  }

  function recordarPedido() {
    var dir = $('custAddressInput');
    var card = productoActual() ? $('card_' + productoActual()) : null;
    var nombre = card ? (card.getAttribute('onclick') || '').split("'")[3] : '';
    guardar({
      producto: productoActual(),
      nombre: nombre || 'Cilindro de gas',
      cantidad: cantidadActual(),
      direccion: dir ? dir.value.trim() : '',
      fecha: new Date().toISOString()
    });
  }

  function pintarRepetir() {
    var btn = $('cyxRepetir');
    var u = leer();
    if (!btn) return;
    if (!u || !u.producto || !u.direccion) { btn.hidden = true; return; }
    $('cyxRepetirTexto').textContent = u.cantidad + ' × ' + u.nombre + ' · ' + u.direccion;
    btn.hidden = false;
  }

  function repetir() {
    var u = leer();
    if (!u) return;
    var card = $('card_' + u.producto);
    if (card) card.click();                       // usa selectProduct(...) de la página (y el embudo)
    var falta = (u.cantidad || 1) - cantidadActual();
    if (falta && typeof window.updateQty === 'function') window.updateQty(falta);
    var dir = $('custAddressInput');
    if (dir && u.direccion) {
      dir.value = u.direccion;
      dir.dispatchEvent(new Event('change', { bubbles: true }));
    }
    var nombre = $('custNameInput');
    var destino = nombre && !nombre.value.trim() ? nombre : $('cyxBarraBtn');
    if (destino) { destino.scrollIntoView({ behavior: 'smooth', block: 'center' }); if (destino.focus) destino.focus({ preventScroll: true }); }
  }

  // Se guarda cuando la página pasa a la vista de seguimiento (el pedido se creó de verdad)
  function vigilarPedidoCreado() {
    var seg = $('activeTrackingContainer');
    if (!seg) return;
    var estaba = visible(seg);
    new MutationObserver(function () {
      var ahora = visible(seg);
      if (ahora && !estaba && window.cyxPedidoRecienCreado) recordarPedido();
      estaba = ahora;
    }).observe(seg, { attributes: true, attributeFilter: ['class'] });
  }

  // ── Seguimiento en pasos con el estado real ──
  var PASO = { pendiente: 1, buscando_repartidor: 1, asignado: 2, aceptado: 2, en_camino: 2, entregado: 3, completado: 3 };

  function pintarPasos(data) {
    var lista = $('cyxPasos');
    if (!lista || !data) return;
    var estado = String(data.status || data.order_status || '').toLowerCase();
    var asignado = Boolean(data.is_driver_assigned);
    var actual = PASO.hasOwnProperty(estado) ? PASO[estado] : 1;
    if (actual === 2 && !asignado && estado !== 'en_camino') actual = 1;   // sin repartidor real, sigue buscando
    var items = lista.querySelectorAll('li');
    lista.classList.toggle('cyx-cancelado', estado === 'cancelado');
    for (var i = 0; i < items.length; i++) {
      items[i].className = i < actual ? 'cyx-hecho' : (i === actual ? 'cyx-actual' : '');
      if (estado === 'entregado' && i === 3) items[i].className = 'cyx-hecho';
    }
    var espera = $('cyxEspera');
    if (espera) {
      espera.hidden = !data.mensaje_espera;
      espera.textContent = data.mensaje_espera || '';
    }
    var enEspera = estado === 'lista_espera';
    if (items[1]) items[1].textContent = enEspera ? 'Lista de espera' : 'Buscando repartidor';
    if (enEspera) setTimeout(textosListaEspera, 60);   // después de que la página pinte su "buscando"
  }

  // Sin distribuidores en la zona (modo lista de espera del backend): nada de "buscando camión"
  function textosListaEspera() {
    var poner = function (id, texto) { var el = $(id); if (el) el.textContent = texto; };
    poner('activeOrderStatusHeader', 'EN LISTA DE ESPERA');
    poner('orderEtaBadge', 'Te avisaremos');
    poner('activeStatusIcon', 'schedule');
    poner('mapDistanceBadge', 'En espera');
    var vista = $('searchingDriverView');
    if (vista) {
      var titulo = vista.querySelector('h4');
      if (titulo) titulo.textContent = 'Por ahora no hay distribuidores en tu zona';
      var sub = titulo && titulo.nextElementSibling;
      if (sub) sub.textContent = 'Guardamos tu pedido y te escribimos por WhatsApp apenas haya un distribuidor.';
      var reloj = $('searchTimerSubtext');
      if (reloj) reloj.hidden = true;
      var icono = vista.querySelector('.material-symbols-outlined');
      if (icono) icono.textContent = 'schedule';
      var pulso = vista.querySelector('.animate-ping');
      if (pulso) pulso.classList.remove('animate-ping');
    }
  }

  // Lee (sin cambiar) las respuestas de estado y de creación que la página ya pide
  if (window.fetch) {
    var original = window.fetch;
    window.fetch = function (url, opts) {
      var p = original.apply(this, arguments);
      var u = typeof url === 'string' ? url : (url && url.url) || '';
      if (u.indexOf('/api/cliente/pedido/status/') !== -1) {
        p.then(function (r) { if (r.ok) r.clone().json().then(pintarPasos).catch(function () {}); }).catch(function () {});
      } else if (u.indexOf('/api/gas/pedidos/crear') !== -1) {
        p.then(function (r) {
          if (!r.ok) return;
          window.cyxPedidoRecienCreado = true;
          r.clone().json().then(function (d) {
            var st = (d && ((d.order && d.order.status) || d.status)) || 'pendiente';
            pintarPasos({ status: st, mensaje_espera: d && d.mensaje_espera });
          }).catch(function () { pintarPasos({ status: 'pendiente' }); });
        }).catch(function () {});
      }
      return p;
    };
  }

  // ── Tarjetas accesibles (teclado y lector de pantalla) y vibración corta al elegir ──
  function marcarElegidas() {
    var tarjetas = document.querySelectorAll('.product-card:not(.disabled-card), .pay-option:not([aria-disabled="true"])');
    for (var i = 0; i < tarjetas.length; i++) {
      var elegida = tarjetas[i].classList.contains('border-[#0A59DA]');
      if (tarjetas[i].tagName === 'LABEL') {
        // un <label> no admite aria-pressed: se usa aria-current (atributo global)
        if (elegida) tarjetas[i].setAttribute('aria-current', 'true'); else tarjetas[i].removeAttribute('aria-current');
      } else {
        tarjetas[i].setAttribute('aria-pressed', elegida ? 'true' : 'false');
      }
    }
  }

  function iniciarTarjetas() {
    var tarjetas = document.querySelectorAll('.product-card:not(.disabled-card), .pay-option:not([aria-disabled="true"])');
    for (var i = 0; i < tarjetas.length; i++) {
      var t = tarjetas[i];
      if (t.tagName !== 'LABEL') t.setAttribute('role', 'button');   // un <label> no admite role=button
      t.setAttribute('tabindex', '0');
      t.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); this.click(); }
      });
      t.addEventListener('click', function () {
        try { if (navigator.vibrate) navigator.vibrate(8); } catch (e) { /* sin vibración */ }
        setTimeout(marcarElegidas, 0);
      });
    }
    marcarElegidas();
  }

  // ── Movimiento: onda al tocar, brillo en el botón principal y secciones que aparecen al bajar ──
  var BOTONES = '.btn-primary, #cyxBarraBtn, .cyx-cta, .cyx-repetir, .cyx-registro-card, a[href="/cliente"], a[href^="/distribuidores/registro"]';
  var quieto = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function iniciarMovimiento() {
    var botones = document.querySelectorAll(BOTONES);
    for (var i = 0; i < botones.length; i++) botones[i].classList.add('cyx-vivo');
    var principal = $('cyxBarraBtn') || $('submitOrderBtn') || document.querySelector('.cyx-cta');
    if (principal && !quieto) principal.classList.add('cyx-brillo');
    document.addEventListener('pointerdown', function (ev) {
      var b = ev.target.closest ? ev.target.closest('.cyx-vivo') : null;
      if (!b || quieto) return;
      var r = b.getBoundingClientRect(), t = Math.max(r.width, r.height), s = document.createElement('span');
      s.className = 'cyx-onda';
      s.style.width = s.style.height = t + 'px';
      s.style.left = (ev.clientX - r.left - t / 2) + 'px';
      s.style.top = (ev.clientY - r.top - t / 2) + 'px';
      b.appendChild(s);
      setTimeout(function () { if (s.parentNode) s.parentNode.removeChild(s); }, 600);
    });
    if (quieto || !('IntersectionObserver' in window)) return;
    var piezas = document.querySelectorAll('main section, .product-card, .pay-option, .cyx-como li');
    var vista = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('cyx-visible'); vista.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    for (var k = 0; k < piezas.length; k++) {
      var p = piezas[k], r = p.getBoundingClientRect();
      if (r.top < window.innerHeight) continue;          // lo que ya se ve al abrir no se anima
      p.classList.add('cyx-revelar');
      p.style.transitionDelay = ((k % 3) * 70) + 'ms';   // escalonado suave en grupos de tarjetas
      vista.observe(p);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    iniciarBarra();
    iniciarMovimiento();
    iniciarTarjetas();
    pintarRepetir();
    vigilarPedidoCreado();
    var btn = $('cyxRepetir');
    if (btn) btn.addEventListener('click', repetir);
    if (visible($('activeTrackingContainer'))) pintarPasos({ status: 'pendiente' });
  });
})();
