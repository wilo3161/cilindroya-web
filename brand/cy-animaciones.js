/*
 * brand/cy-animaciones.js — Comportamiento animado compartido por todas las páginas (acompaña a cy-animaciones.css).
 *
 * 1. Aparición escalonada al desplazarse: secciones, tarjetas, pasos y preguntas.
 * 2. Botones «Pedir gas»: al pulsar, el camión sale con el cilindro y luego se abre la app de pedidos
 *    (referencia «Complete Order»). Con Ctrl, clic central o movimiento reducido, navega sin animación.
 * 3. App de pedidos: el botón «Pedir cilindro ahora» muestra el envío mientras el pedido viaja al servidor.
 * 4. Registro: sacude el campo con error.
 * No cambia textos, enlaces ni datos; si este archivo no carga, la página funciona igual.
 */
(function () {
  'use strict';
  var raiz = document.documentElement;
  raiz.classList.add('js');
  var quieto = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── 1. Aparición al desplazarse ───────────────────────────────────────────
  // Bloques .cy-reveal / .sube de la piel compartida: si su script no está en la página, se revelan aquí.
  function revelarPiel() {
    var pendientes = document.querySelectorAll('.cy-reveal:not(.is-visible), .sube:not(.visto)');
    if (!pendientes.length) return;
    if (quieto || !('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(pendientes, function (el) { el.classList.add('is-visible', 'visto'); });
      return;
    }
    var obs = new IntersectionObserver(function (ent) {
      ent.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-visible', 'visto'); obs.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -2% 0px', threshold: 0.01 });
    Array.prototype.forEach.call(pendientes, function (el) { obs.observe(el); });
  }

  function prepararAparicion() {
    if (quieto || !('IntersectionObserver' in window)) return;
    var selectores = [
      'main section > h2', 'main section > p', '.tarjeta', '.ficha', '.cy-tarjeta', '.cy-paso', '.paso-card',
      'details', '.lista li', '.preguntas details', '.migas-relacionadas a', 'main figure', '.pie > *'
    ].join(',');
    var elementos = Array.prototype.slice.call(document.querySelectorAll(selectores)).filter(function (el) {
      // Nada del héroe (ya entra al cargar) ni del registro (lo pinta su propio script) ni lo ya visible arriba.
      return !el.closest('.cy-heroe-interior, .portada-a, #contenido, .registro-lado, header, .cinta') &&
        el.getBoundingClientRect().top > window.innerHeight * 0.92;
    });
    var vistos = new IntersectionObserver(function (entradas) {
      var lote = 0;
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.style.setProperty('--cy-retraso', Math.min(lote++ * 0.07, 0.35) + 's');
        e.target.classList.add('cy-visto');
        vistos.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -2% 0px', threshold: 0.01 });
    elementos.forEach(function (el) { el.classList.add('cy-anima'); vistos.observe(el); });
  }

  // ── 2. Botones «Pedir gas»: el camión sale con el cilindro ─────────────────
  var CAMION = '<svg class="cy-camion" viewBox="0 0 40 24" aria-hidden="true">' +
    '<rect x="1" y="5" width="23" height="13" rx="2" fill="#FFFFFF"/>' +
    '<rect x="5" y="2" width="7" height="12" rx="3" fill="#2EC3FB" stroke="#09294A" stroke-width="1.2"/>' +
    '<rect x="14" y="2" width="7" height="12" rx="3" fill="#2EC3FB" stroke="#09294A" stroke-width="1.2"/>' +
    '<path d="M24 8h7l5 5v5H24z" fill="#FF9E3A"/><rect x="27" y="10" width="5" height="3.5" rx=".8" fill="#09294A"/>' +
    '<circle cx="8" cy="19.5" r="3.2" fill="#09294A"/><circle cx="31" cy="19.5" r="3.2" fill="#09294A"/></svg>';

  function esPedido(a) {
    var href = a.getAttribute('href') || '';
    return /^\/cliente\/?(\?|#|$)/.test(href) && (a.classList.contains('boton') || a.classList.contains('btn-primary'));
  }

  document.addEventListener('click', function (ev) {
    var a = ev.target.closest && ev.target.closest('a');
    if (!a || !esPedido(a) || quieto || ev.defaultPrevented || ev.button !== 0 ||
        ev.ctrlKey || ev.metaKey || ev.shiftKey || ev.altKey || a.target === '_blank' || a.classList.contains('cy-despega')) return;
    ev.preventDefault();
    var destino = a.href;
    a.style.setProperty('--cy-ancho', a.offsetWidth + 'px');
    a.style.minWidth = a.offsetWidth + 'px';
    a.style.minHeight = a.offsetHeight + 'px';
    a.classList.add('cy-despega');
    a.insertAdjacentHTML('beforeend', CAMION + '<span class="cy-via" aria-hidden="true"></span>');
    setTimeout(function () { window.location.href = destino; }, 900);
  });
  // Al volver con «Atrás», el botón queda como estaba.
  window.addEventListener('pageshow', function () {
    Array.prototype.forEach.call(document.querySelectorAll('.cy-despega'), function (a) {
      a.classList.remove('cy-despega');
      a.style.minWidth = a.style.minHeight = '';
      Array.prototype.forEach.call(a.querySelectorAll('.cy-camion, .cy-via'), function (n) { n.remove(); });
    });
  });

  // ── 3. App de pedidos: estado de envío del botón principal ────────────────
  function vigilarBotonPedido() {
    var btn = document.getElementById('submitOrderBtn');
    if (!btn || !('MutationObserver' in window)) return;
    new MutationObserver(function () {
      var enviando = btn.disabled;
      btn.classList.toggle('cy-enviando', enviando);
      btn.setAttribute('aria-busy', enviando ? 'true' : 'false');
      if (!enviando && btn.classList.contains('cy-fue')) {
        btn.classList.add('cy-listo');
        setTimeout(function () { btn.classList.remove('cy-listo'); }, 500);
      }
      btn.classList.toggle('cy-fue', enviando);
    }).observe(btn, { attributes: true, attributeFilter: ['disabled'] });
  }

  // ── 4. Registro: sacudida en el campo con error ───────────────────────────
  function vigilarErrores() {
    var cont = document.getElementById('contenido');
    if (!cont || quieto || !('MutationObserver' in window)) return;
    new MutationObserver(function (cambios) {
      cambios.forEach(function (c) {
        Array.prototype.forEach.call(c.addedNodes, function (n) {
          if (n.nodeType !== 1) return;
          var err = n.matches('.error, [role="alert"]') ? n : n.querySelector && n.querySelector('.error, [role="alert"]');
          var campo = err && (err.closest('.campo') || err);
          if (campo) {
            campo.classList.remove('cy-sacude');
            void campo.offsetWidth;
            campo.classList.add('cy-sacude');
          }
        });
      });
    }).observe(cont, { childList: true, subtree: true });
  }


  // ── 5. Cili, asistente en la página: invita a pedir o a registrarse, según la página ───────────────────────
  var PEDIDO = {
    texto: '¡Hola! Soy Cili. ¿Te llevo tu cilindro? Llega en unos 15 a 20 minutos y pagas al recibir, en efectivo o DeUna.',
    boton: ['Pedir gas ahora', '/cliente/']
  };
  var REGISTRO = {
    texto: '¿Tienes camión autorizado de Vepagas? Regístrate en 3 minutos: 30 días sin comisión y los pedidos de tu zona llegan a tu celular.',
    boton: ['Registrarme ahora', '/distribuidores/registro/']
  };
  function invitacionDeLaPagina() {
    var ruta = location.pathname;
    if (/^\/(cliente|pwa|marketing|landing)(\/|$)|^\/distribuidores\/registro|privacidad/.test(ruta)) return null;
    if (/^\/distribuidores-de-gas\//.test(ruta)) return { datos: REGISTRO, img: 'cili_camion_png', ancho: 1146, alto: 665, alt: 'Cili junto al camión de reparto de gas', ancha: true };
    if (/^\/(distribuidores|guias)\//.test(ruta)) return { datos: REGISTRO, img: 'cili_render_celular', ancho: 584, alto: 1100, alt: 'Cili muestra en el celular cómo llegan los pedidos' };
    if (/^\/gas-a-domicilio\//.test(ruta)) return { datos: PEDIDO, img: 'cili_render_saluda', ancho: 700, alto: 1096, alt: 'Cili saluda y te invita a pedir tu gas' };
    return { datos: PEDIDO, img: 'cili_entrega', ancho: 562, alto: 967, alt: 'Cili entrega un cilindro de gas en la puerta' };
  }
  function invitacionCili() {
    var cfg = invitacionDeLaPagina();
    var pie = document.querySelector('body > footer, footer.pie, footer');
    if (!cfg || !pie || document.querySelector('.cy-invita')) return;
    var hayChat = !!document.querySelector('script[src*="cy-asistente"]');
    var sec = document.createElement('section');
    sec.className = 'cy-invita' + (cfg.ancha ? ' cy-invita--ancha' : '');
    sec.setAttribute('aria-label', 'Cili te invita');
    sec.innerHTML =
      '<div class="cy-invita__caja">' +
        '<figure class="cy-invita__cili"><img src="/static/assets/web/' + cfg.img + '.webp" alt="' + cfg.alt + '" width="' + cfg.ancho +
          '" height="' + cfg.alto + '" loading="lazy" decoding="async"></figure>' +
        '<div class="cy-invita__texto">' +
          '<p class="cy-invita__globo"><span class="cy-invita__nombre">Cili · CilindroYa</span><span class="cy-invita__dice"></span></p>' +
          '<div class="cy-invita__botones">' +
            '<a class="boton boton-naranja" href="' + cfg.datos.boton[1] + '">' + cfg.datos.boton[0] + '</a>' +
            (hayChat ? '<button type="button" class="boton boton-sf-azul cy-invita__chat">Hablar con Cili</button>' : '') +
          '</div>' +
        '</div>' +
      '</div>';
    pie.parentNode.insertBefore(sec, pie);
    var dice = sec.querySelector('.cy-invita__dice');
    var chat = sec.querySelector('.cy-invita__chat');
    if (chat) chat.addEventListener('click', function () { var b = document.getElementById('cyMayaBtnAbrir'); if (b) b.click(); });
    if (quieto || !('IntersectionObserver' in window)) { dice.textContent = cfg.datos.texto; sec.classList.add('cy-entra'); return; }
    var obs = new IntersectionObserver(function (ent) {
      if (!ent[0].isIntersecting) return;
      obs.disconnect();
      sec.classList.add('cy-entra');
      // El globo se escribe letra por letra, como si Cili lo dijera
      var texto = cfg.datos.texto, i = 0, cursor = '<span class="cy-invita__cursor" aria-hidden="true"></span>';
      dice.setAttribute('aria-label', texto);
      setTimeout(function paso() {
        i = Math.min(texto.length, i + 2);
        dice.innerHTML = texto.slice(0, i).replace(/&/g, '&amp;').replace(/</g, '&lt;') + (i < texto.length ? cursor : '');
        if (i < texto.length) setTimeout(paso, 28);
      }, 650);
    }, { threshold: 0.3 });
    obs.observe(sec);
  }


  // ── 6. Título principal: cada palabra aparece enfocándose (el texto y su orden no cambian) ──
  function enfocarTitulo() {
    if (quieto) return;
    var h1 = document.querySelector('.cy-heroe-interior h1, .registro-lado h1');
    if (!h1 || h1.classList.contains('cy-enfocado')) return;
    var n = 0;
    function envolver(nodo) {
      Array.prototype.slice.call(nodo.childNodes).forEach(function (hijo) {
        if (hijo.nodeType === 3) {
          var partes = hijo.textContent.split(/(\s+)/), frag = document.createDocumentFragment();
          partes.forEach(function (t) {
            if (!t) return;
            if (/^\s+$/.test(t)) { frag.appendChild(document.createTextNode(t)); return; }
            var s = document.createElement('span');
            s.className = 'cy-palabra'; s.textContent = t; s.style.setProperty('--cy-p', (0.1 + n++ * 0.07).toFixed(2) + 's');
            frag.appendChild(s);
          });
          nodo.replaceChild(frag, hijo);
        } else if (hijo.nodeType === 1 && hijo.tagName !== 'BR') {
          // Un acento (<span>) entra completo, para conservar su estilo propio
          var caja = document.createElement('span');
          caja.className = 'cy-palabra'; caja.style.setProperty('--cy-p', (0.1 + n++ * 0.07).toFixed(2) + 's');
          nodo.replaceChild(caja, hijo); caja.appendChild(hijo);
        }
      });
    }
    envolver(h1);
    h1.classList.add('cy-enfocado');
  }

  function iniciar() { revelarPiel(); enfocarTitulo(); invitacionCili(); prepararAparicion(); vigilarBotonPedido(); vigilarErrores(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
