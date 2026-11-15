/**
 * brand/cy-paginas.js — Animaciones e interacción compartida de cilindroya.com
 * - Aparición suave al scroll con IntersectionObserver (opacidad + 12px)
 * - Respeta estrictamente prefers-reduced-motion
 * - Soporte resiliente si JS no carga (el contenido se ve por defecto)
 */
(function () {
  'use strict';

  // Marcamos html como js solo si se ejecuta este script
  document.documentElement.classList.add('js');

  var motionOk = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Aparición suave al hacer scroll
  if (motionOk && 'IntersectionObserver' in window) {
    var elementos = document.querySelectorAll('.cy-reveal, .sube');
    if (elementos.length > 0) {
      var observador = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible', 'visto');
            obs.unobserve(entry.target);
          }
        });
      }, {
        root: null,
        rootMargin: '0px 0px -8% 0px',
        threshold: 0.1
      });

      elementos.forEach(function (el) {
        observador.observe(el);
      });
    }
  } else {
    // Si no hay soporte o reduce-motion, asegurarse de que todo sea visible
    var elementosFallback = document.querySelectorAll('.cy-reveal, .sube');
    elementosFallback.forEach(function (el) {
      el.classList.add('is-visible', 'visto');
    });
  }

  // 2. Acordeones accesibles: cerrar otros si se desea o mejorar foco
  var detailsList = document.querySelectorAll('details.cy-faq, .bloque-faq details, .preguntas details');
  detailsList.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) {
        d.classList.add('cy-open');
      } else {
        d.classList.remove('cy-open');
      }
    });
  });

})();
