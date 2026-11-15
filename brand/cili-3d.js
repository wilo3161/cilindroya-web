/*
 * brand/cili-3d.js — Cili en 3D real dentro del héroe de /hogar/ (15/11/2026).
 *
 * Mejora progresiva sobre cili-real.js: la página abre con el render de Cili (imagen, instantáneo) y, cuando el
 * navegador está libre, carga el modelo 3D real (/assets/web/cili.glb, generado desde el render oficial) en el
 * visor <model-viewer> de Google servido desde nuestro sitio. Arrastrar gira a Cili 360°, como en Sketchfab.
 * No se carga si: no hay WebGL, el usuario pidió menos movimiento o ahorro de datos, o la pantalla es angosta
 * y la conexión es lenta. Si algo falla, queda la imagen.
 */
(function () {
  'use strict';
  var MODELO = '/assets/web/cili.glb?v=1';
  var VISOR = '/static/brand/vendor/model-viewer.min.js';

  function puede3D() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    var c = navigator.connection || {};
    if (c.saveData || /(^|-)2g$/.test(c.effectiveType || '')) return false;
    try {
      var lienzo = document.createElement('canvas');
      return !!(lienzo.getContext('webgl2') || lienzo.getContext('webgl'));
    } catch (e) { return false; }
  }

  function montar() {
    var visor = document.getElementById('cili3dEscenario');
    var figura = visor && visor.querySelector('.cili-real__figura');
    if (!visor || !figura || visor.dataset.cili3d) return;
    visor.dataset.cili3d = 'cargando';

    var guion = document.createElement('script');
    guion.type = 'module';
    guion.src = VISOR;
    guion.onerror = function () { visor.dataset.cili3d = 'sin-visor'; };
    document.head.appendChild(guion);

    var mv = document.createElement('model-viewer');
    mv.className = 'cili-3d__modelo';
    mv.setAttribute('src', MODELO);
    mv.setAttribute('alt', 'Modelo 3D de Cili, la mascota de CilindroYa. Arrastra para girarlo.');
    mv.setAttribute('camera-controls', '');
    mv.setAttribute('disable-zoom', '');
    mv.setAttribute('disable-pan', '');
    mv.setAttribute('auto-rotate', '');
    mv.setAttribute('auto-rotate-delay', '2500');
    mv.setAttribute('rotation-per-second', '18deg');
    mv.setAttribute('interaction-prompt', 'none');
    mv.setAttribute('camera-orbit', '-12deg 82deg auto');
    mv.setAttribute('min-camera-orbit', 'auto 60deg auto');
    mv.setAttribute('max-camera-orbit', 'auto 100deg auto');
    mv.setAttribute('shadow-intensity', '0.9');
    mv.setAttribute('shadow-softness', '0.9');
    mv.setAttribute('exposure', '1.45');
    mv.setAttribute('environment-image', 'neutral');
    mv.setAttribute('loading', 'eager');
    figura.parentNode.appendChild(mv);

    // Un toque sin arrastrar abre el chat con Cili
    var inicio = null;
    mv.addEventListener('pointerdown', function (e) { inicio = { x: e.clientX, y: e.clientY, t: Date.now() }; });
    mv.addEventListener('pointerup', function (e) {
      if (!inicio) return;
      var quieto = Math.abs(e.clientX - inicio.x) < 6 && Math.abs(e.clientY - inicio.y) < 6 && Date.now() - inicio.t < 400;
      inicio = null;
      if (quieto) { var b = document.getElementById('cyMayaBtnAbrir'); if (b) b.click(); }
    });

    mv.addEventListener('load', function () {
      visor.dataset.cili3d = 'listo';
      visor.classList.add('cili-3d--listo');
      var ayuda = visor.querySelector('.cili3d-controles-hud span');
      if (ayuda) ayuda.textContent = 'Arrastra para girar a Cili en 3D';
    });
    mv.addEventListener('error', function () {
      visor.dataset.cili3d = 'error';
      visor.classList.remove('cili-3d--listo');
      mv.remove();
    });
  }

  function iniciar() {
    if (!puede3D()) return;
    var visor = document.getElementById('cili3dEscenario');
    if (!visor) return;
    var lanzar = function () {
      if ('requestIdleCallback' in window) requestIdleCallback(montar, { timeout: 2500 });
      else setTimeout(montar, 1200);
    };
    if ('IntersectionObserver' in window) {
      var ojo = new IntersectionObserver(function (entradas) {
        if (entradas.some(function (x) { return x.isIntersecting; })) { ojo.disconnect(); lanzar(); }
      }, { rootMargin: '200px' });
      ojo.observe(visor);
    } else { lanzar(); }
  }

  if (document.readyState === 'complete') iniciar();
  else window.addEventListener('load', iniciar);
})();
