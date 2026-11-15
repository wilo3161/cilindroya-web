/*
 * brand/cili-real.js — Cili de cuerpo completo en el héroe de /hogar/.
 *
 *  - Tres puntos numerados con burbuja que explican precio, canje y forma de pago.
 *  - Tocar a Cili abre el asistente «Habla con Cili» (#cyCiliBtnAbrir).
 *  - La imagen queda fija (cili-real.css anula la inclinación); con prefers-reduced-motion no hay animaciones.
 */
(function () {
  'use strict';

  var ANOTACIONES = [
    { x: 56, y: 6, titulo: '$3,60 en tu puerta', texto: '$1,65 cilindro oficial ARCH + $1,85 entrega + $0,10 plataforma. Sin recargos.' },
    { x: 42, y: 44, titulo: 'Canje de cualquier color', texto: 'Entregas tu cilindro vacío de 15 kg, azul, amarillo o tomate, de cualquier marca.' },
    { x: 90, y: 62, titulo: 'Pagas al recibir', texto: 'En efectivo o DeUna, directo al distribuidor autorizado cuando el cilindro está en tu puerta.' }
  ];

  function iniciar() {
    var visor = document.getElementById('cili3dEscenario');
    if (!visor || visor.dataset.ciliReal) return;
    visor.dataset.ciliReal = '1';
    visor.classList.add('cili-real');

    var lienzo = visor.querySelector('.cili3d-lienzo');
    var poster = visor.querySelector('.cili3d-poster');
    if (!lienzo || !poster) return;

    var figura = document.createElement('div');
    figura.className = 'cili-real__figura';
    poster.parentNode.insertBefore(figura, poster);
    figura.appendChild(poster);
    var sombra = document.createElement('span');
    sombra.className = 'cili-real__sombra';
    sombra.setAttribute('aria-hidden', 'true');
    lienzo.appendChild(sombra);

    // Anotaciones numeradas
    var capa = visor.querySelector('.cili3d-anotaciones');
    if (capa) {
      figura.appendChild(capa);  // los puntos se ubican sobre el cuerpo de Cili y se inclinan con él
      capa.innerHTML = '';
      ANOTACIONES.forEach(function (a, i) {
        var punto = document.createElement('button');
        punto.type = 'button';
        punto.className = 'cili-real__punto';
        punto.style.left = a.x + '%';
        punto.style.top = a.y + '%';
        punto.textContent = String(i + 1);
        punto.setAttribute('aria-label', a.titulo + ': ' + a.texto);
        punto.setAttribute('aria-expanded', 'false');
        var burbuja = document.createElement('span');
        burbuja.className = 'cili-real__burbuja';
        burbuja.innerHTML = '<b></b><span></span>';
        burbuja.querySelector('b').textContent = a.titulo;
        burbuja.querySelector('span').textContent = a.texto;
        punto.appendChild(burbuja);
        punto.addEventListener('click', function (e) {
          e.stopPropagation();
          var abierta = punto.classList.toggle('activa');
          punto.setAttribute('aria-expanded', abierta ? 'true' : 'false');
          capa.querySelectorAll('.cili-real__punto').forEach(function (otro) {
            if (otro !== punto) { otro.classList.remove('activa'); otro.setAttribute('aria-expanded', 'false'); }
          });
        });
        capa.appendChild(punto);
      });
    }

    // Texto de ayuda del visor
    var ayuda = visor.querySelector('.cili3d-controles-hud span');
    if (ayuda) ayuda.textContent = 'Mueve el mouse o toca a Cili';

    // Tocar a Cili abre el chat
    figura.setAttribute('role', 'button');
    figura.setAttribute('tabindex', '0');
    figura.setAttribute('aria-label', 'Habla con Cili, la mascota de CilindroYa');
    function abrirChat() {
      figura.classList.remove('saluda'); void figura.offsetWidth; figura.classList.add('saluda');
      var b = document.getElementById('cyCiliBtnAbrir');
      if (b) b.click();
    }
    figura.addEventListener('click', abrirChat);
    figura.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrirChat(); }
    });

    var sinMovimiento = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (sinMovimiento) return;

    // Inclinación 3D que sigue al puntero, con suavizado
    var objetivoX = 0, objetivoY = 0, actualX = 0, actualY = 0, animando = false;
    function pintar() {
      actualX += (objetivoX - actualX) * 0.12;
      actualY += (objetivoY - actualY) * 0.12;
      figura.style.setProperty('--rx', (actualY * -10).toFixed(2) + 'deg');
      figura.style.setProperty('--ry', (actualX * 14).toFixed(2) + 'deg');
      sombra.style.setProperty('--sx', (actualX * 18).toFixed(1) + 'px');
      if (Math.abs(objetivoX - actualX) > 0.002 || Math.abs(objetivoY - actualY) > 0.002) {
        requestAnimationFrame(pintar);
      } else {
        animando = false;
      }
    }
    function mover(cx, cy) {
      var r = visor.getBoundingClientRect();
      objetivoX = Math.max(-1, Math.min(1, ((cx - r.left) / r.width - 0.5) * 2));
      objetivoY = Math.max(-1, Math.min(1, ((cy - r.top) / r.height - 0.5) * 2));
      if (!animando) { animando = true; requestAnimationFrame(pintar); }
    }
    visor.addEventListener('pointermove', function (e) { mover(e.clientX, e.clientY); });
    visor.addEventListener('pointerleave', function () {
      objetivoX = 0; objetivoY = 0;
      if (!animando) { animando = true; requestAnimationFrame(pintar); }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
