/*
 * brand/cy-asistente.js — Widget de atención por voz «Habla con Cili» (la mascota de CilindroYa) para cilindroya.com.
 *
 * - Modo voz primero: escenario superior con Cili grande (~120 px en círculo con video cili_habla cuando habla y
 *   cara fija cuando no), subtítulo accesible (aria-live="polite"), botón grande «Toca y habla» con ondas/anillo
 *   que laten con el volumen del micrófono (AnalyserNode), 3 botones grandes de opciones y caja de texto secundaria
 *   («o escribe aquí»).
 * - Al abrir por primera vez (gesto del usuario): Cili saluda con voz y muestra 3 opciones grandes.
 * - Escuchar: SpeechRecognition / webkitSpeechRecognition (lang="es-EC", resultados interinos en el subtítulo) o
 *   respaldo automático con MediaRecorder (hasta 20 s o al tocar de nuevo) → POST /api/gas/asistente/escuchar.
 * - Hablar: POST /api/gas/asistente/voz (audio/wav), activa cy-cili--habla mientras suena y se apaga en 'ended'.
 *   Botón de silencio (🔊/🔇) recordado en sessionStorage. Si /voz falla, queda en texto sin error visible.
 * - Privacidad y accesibilidad: el micrófono solo se pide al tocar «Toca y habla», nota de privacidad visible,
 *   navegación completa por teclado, foco atrapado y respeto a prefers-reduced-motion. Sin librerías externas.
 */
(function () {
  'use strict';

  if (window.__cyCiliIniciado) return;
  window.__cyCiliIniciado = true;

  var CLAVE_SESION = 'cy_cili_sesion_v1';
  var CLAVE_HISTORIAL = 'cy_cili_historial_v1';
  var CLAVE_SILENCIO = 'cy_cili_silencio_v1';
  var CLAVE_SALUDO_VOZ = 'cy_cili_saludo_voz_v1';
  var WA_RESPALDO = 'https://wa.me/593993052744?text=' + encodeURIComponent('Hola CilindroYa, necesito ayuda con mi consulta');

  var SALUDO_INICIAL_VOZ =
    '¡Hola, vecino! Soy Cili, de CilindroYa. ¿Te ayudo a pedir tu gas, quieres unirte como distribuidor autorizado o te cuento precios y zonas?';

  var OPCIONES_INICIALES = [
    'Pedir gas ahora',
    'Soy distribuidor',
    'Precios y zonas'
  ];

  function obtenerSesion() {
    try {
      var s = sessionStorage.getItem(CLAVE_SESION);
      if (!s || !/^[A-Za-z0-9_-]{8,64}$/.test(s)) {
        if (window.crypto && window.crypto.randomUUID) {
          s = window.crypto.randomUUID();
        } else {
          s = 'cili-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
        }
        sessionStorage.setItem(CLAVE_SESION, s);
      }
      return s;
    } catch (e) {
      return 'cili-' + Date.now().toString(36) + '-mem';
    }
  }

  function leerHistorial() {
    try {
      var raw = sessionStorage.getItem(CLAVE_HISTORIAL);
      if (!raw) return [];
      var arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr.slice(-8) : [];
    } catch (e) {
      return [];
    }
  }

  function guardarHistorial(hist) {
    try {
      sessionStorage.setItem(CLAVE_HISTORIAL, JSON.stringify((hist || []).slice(-8)));
    } catch (e) { /* sessionStorage bloqueado */ }
  }

  function leerSilencio() {
    try {
      return sessionStorage.getItem(CLAVE_SILENCIO) === '1';
    } catch (e) {
      return false;
    }
  }

  function guardarSilencio(valor) {
    try {
      sessionStorage.setItem(CLAVE_SILENCIO, valor ? '1' : '0');
    } catch (e) { /* sessionStorage bloqueado */ }
  }

  function esUrlSegura(url) {
    if (!url || typeof url !== 'string') return false;
    var u = url.trim();
    if (/^\/(hogar|cliente|distribuidores|guias|gas-a-domicilio|privacidad\.html)/.test(u)) return true;
    if (/^https:\/\/(www\.)?cilindroya\.com(\/|$)/.test(u)) return true;
    if (/^https:\/\/wa\.me\/593993052744(\?|$)/.test(u)) return true;
    return false;
  }

  function crearAvatarHTML(claseExtra, tamano) {
    var px = tamano || 96;
    var cls = 'cy-cili-avatar' + (claseExtra ? ' ' + claseExtra : '');
    return (
      '<span class="' + cls + '" aria-hidden="true">' +
        '<img src="/assets/web/cili_avatar.webp" alt="" width="' + px + '" height="' + px + '" decoding="async">' +
        '<video class="cy-cili-habla" muted playsinline loop preload="metadata" poster="/assets/web/cili_cara.webp">' +
          '<source src="/assets/web/cili_habla.webm" type="video/webm"><source src="/assets/web/cili_habla.mp4" type="video/mp4">' +
        '</video>' +
        '<span class="cy-cili-estado-punto"></span>' +
      '</span>'
    );
  }

  function montarWidget() {
    // El registro de distribuidores ya es una conversación guiada con Cili: ahí no se muestra el botón flotante,
    // que taparía los botones del asistente en el celular.
    if (/^\/distribuidores\/registro(\/|$)/.test(location.pathname)) return;
    if (document.getElementById('cyCiliRaiz')) return;

    var raiz = document.createElement('div');
    raiz.id = 'cyCiliRaiz';
    raiz.className = 'cy-cili-raiz';
    if (document.getElementById('cyxBarra') || document.querySelector('.acciones[style*="sticky"], .wa-float, .whatsapp-float')) {
      raiz.classList.add('cy-cili-raiz--con-barra');
    }

    var silenciado = leerSilencio();

    raiz.innerHTML =
      '<div class="cy-cili-asoma" id="cyCiliAsoma" hidden>' +
        '<button type="button" class="cy-cili-asoma__cerrar" id="cyCiliAsomaCerrar" aria-label="Ocultar saludo de Cili">×</button>' +
        '<button type="button" class="cy-cili-asoma__globo" id="cyCiliAsomaGlobo">¡Hola! Soy Cili 👋 ¿Hablamos por voz?</button>' +
        '<video class="cy-cili-asoma__img" muted playsinline loop autoplay preload="metadata" poster="/assets/web/cili_asoma.webp" width="210" height="280">' +
          '<source src="/assets/web/cili_explica.webm" type="video/webm"><source src="/assets/web/cili_explica.mp4" type="video/mp4">' +
        '</video>' +
      '</div>' +
      '<button type="button" class="cy-cili-burbuja" id="cyCiliBtnAbrir" aria-haspopup="dialog" aria-expanded="false" aria-controls="cyCiliPanel">' +
        crearAvatarHTML('', 96) +
        '<span>Habla con Cili</span>' +
      '</button>' +
      '<section class="cy-cili-panel" id="cyCiliPanel" role="dialog" aria-modal="false" aria-labelledby="cyCiliTitulo" hidden>' +
        '<header class="cy-cili-cabecera">' +
          '<div class="cy-cili-cabecera__info">' +
            crearAvatarHTML('', 96) +
            '<div>' +
              '<h2 class="cy-cili-cabecera__titulo" id="cyCiliTitulo">Cili · CilindroYa</h2>' +
              '<p class="cy-cili-cabecera__sub">Asistente por voz · Imbabura</p>' +
            '</div>' +
          '</div>' +
          '<div class="cy-cili-cabecera__acciones">' +
            '<button type="button" class="cy-cili-silencio" id="cyCiliBtnSilencio" aria-pressed="' + (silenciado ? 'true' : 'false') + '" aria-label="' + (silenciado ? 'Activar voz de Cili' : 'Silenciar voz de Cili') + '" title="' + (silenciado ? 'Activar voz' : 'Silenciar voz') + '">' +
              (silenciado ? '🔇' : '🔊') +
            '</button>' +
            '<button type="button" class="cy-cili-cerrar" id="cyCiliBtnCerrar" aria-label="Cerrar chat con Cili">×</button>' +
          '</div>' +
        '</header>' +
        '<div class="cy-cili-escenario" id="cyCiliEscenario">' +
          '<div class="cy-cili-escenario__avatar-wrap" id="cyCiliAvatarGrandeWrap">' +
            '<span class="cy-cili-anillo-voz" id="cyCiliAnilloVoz" aria-hidden="true"></span>' +
            crearAvatarHTML('cy-cili-avatar--grande', 120) +
          '</div>' +
          '<div class="cy-cili-subtitulo" id="cyCiliSubtitulo" aria-live="polite" aria-atomic="true">' +
            SALUDO_INICIAL_VOZ +
          '</div>' +
          '<div class="cy-cili-acciones cy-cili-acciones--escenario" id="cyCiliAccionesEscenario" hidden></div>' +
          '<div class="cy-cili-mic-zona">' +
            '<button type="button" class="cy-cili-mic-btn" id="cyCiliBtnMic" aria-pressed="false">' +
              '<span class="cy-cili-mic-btn__icono" aria-hidden="true">🎙️</span>' +
              '<span class="cy-cili-mic-btn__texto" id="cyCiliMicTexto">Toca y habla</span>' +
              '<span class="cy-cili-ondas" id="cyCiliOndas" aria-hidden="true">' +
                '<span></span><span></span><span></span><span></span>' +
              '</span>' +
            '</button>' +
          '</div>' +
          '<div class="cy-cili-opciones" id="cyCiliOpciones" role="group" aria-label="Opciones rápidas para responder a Cili"></div>' +
          '<p class="cy-cili-privacidad">Tu voz se usa solo para entender tu pregunta; no la guardamos.</p>' +
        '</div>' +
        '<div class="cy-cili-mensajes" id="cyCiliMensajes" aria-live="polite" aria-atomic="false">' +
          '<div class="cy-cili-escribiendo" id="cyCiliEscribiendo" hidden aria-label="Cili está pensando">' +
            '<span class="cy-cili-punto"></span><span class="cy-cili-punto"></span><span class="cy-cili-punto"></span>' +
            '<span>Cili está pensando…</span>' +
          '</div>' +
          '<form class="cy-cili-form-contacto" id="cyCiliFormContacto" hidden novalidate>' +
            '<p class="cy-cili-form-contacto__titulo" id="cyCiliFormTitulo">Déjanos tus datos para contactarte por WhatsApp</p>' +
            '<input type="hidden" id="cyCiliContactoTipo" value="familia">' +
            '<label>Nombre completo' +
              '<input type="text" id="cyCiliContactoNombre" required maxlength="100" placeholder="Ej. María Tobar" autocomplete="name">' +
            '</label>' +
            '<label>Celular WhatsApp (Ecuador)' +
              '<input type="tel" id="cyCiliContactoTelefono" required maxlength="10" placeholder="0991234567" inputmode="numeric" autocomplete="tel">' +
            '</label>' +
            '<label>Cantón en Imbabura' +
              '<select id="cyCiliContactoCanton">' +
                '<option value="Ibarra">Ibarra</option>' +
                '<option value="Otavalo">Otavalo</option>' +
                '<option value="Antonio Ante">Antonio Ante (Atuntaqui)</option>' +
                '<option value="Cotacachi">Cotacachi</option>' +
                '<option value="Pimampiro">Pimampiro</option>' +
                '<option value="San Miguel de Urcuquí">San Miguel de Urcuquí</option>' +
              '</select>' +
            '</label>' +
            '<label id="cyCiliCampoCamiones" hidden>Número de camiones autorizados' +
              '<input type="number" id="cyCiliContactoCamiones" min="1" max="50" value="1">' +
            '</label>' +
            '<label class="cy-cili-consent">' +
              '<input type="checkbox" id="cyCiliContactoConsentimiento" required>' +
              '<span>Acepto que CilindroYa me contacte por WhatsApp conforme a la <a href="/privacidad.html" target="_blank" rel="noopener">política de privacidad</a>.</span>' +
            '</label>' +
            '<button type="submit" class="cy-cili-form-contacto__btn" id="cyCiliContactoEnviar">Enviar mis datos</button>' +
            '<p class="cy-cili-form-contacto__estado" id="cyCiliContactoEstado" aria-live="polite"></p>' +
          '</form>' +
        '</div>' +
        '<form class="cy-cili-pie" id="cyCiliFormChat" novalidate>' +
          '<label for="cyCiliInput" class="oculto" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">o escribe aquí tu pregunta a Cili</label>' +
          '<input type="text" class="cy-cili-input" id="cyCiliInput" maxlength="500" placeholder="o escribe aquí…" autocomplete="off">' +
          '<button type="submit" class="cy-cili-enviar" id="cyCiliBtnEnviar">Enviar</button>' +
        '</form>' +
      '</section>';

    document.body.appendChild(raiz);

    var btnAbrir = document.getElementById('cyCiliBtnAbrir');
    var btnCerrar = document.getElementById('cyCiliBtnCerrar');
    var btnSilencio = document.getElementById('cyCiliBtnSilencio');
    var btnMic = document.getElementById('cyCiliBtnMic');
    var micTexto = document.getElementById('cyCiliMicTexto');
    var anilloVoz = document.getElementById('cyCiliAnilloVoz');
    var ondasEl = document.getElementById('cyCiliOndas');
    var subtituloEl = document.getElementById('cyCiliSubtitulo');
    var accionesEscenarioEl = document.getElementById('cyCiliAccionesEscenario');
    var cajaOpciones = document.getElementById('cyCiliOpciones');
    var panel = document.getElementById('cyCiliPanel');
    var cajaMensajes = document.getElementById('cyCiliMensajes');
    var indEscribiendo = document.getElementById('cyCiliEscribiendo');
    var formChat = document.getElementById('cyCiliFormChat');
    var inputChat = document.getElementById('cyCiliInput');
    var btnEnviar = document.getElementById('cyCiliBtnEnviar');
    var formContacto = document.getElementById('cyCiliFormContacto');
    var asoma = document.getElementById('cyCiliAsoma');

    var sinMovimiento = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var temporizadorHabla = null;
    var audioActual = null;
    var urlAudioActual = null;

    function ocultarAsoma() {
      asoma.hidden = true;
      try { sessionStorage.setItem('cyCiliSaludo', '1'); } catch (e) { /* sin almacenamiento */ }
    }
    var yaSaludoAsoma = false;
    try { yaSaludoAsoma = sessionStorage.getItem('cyCiliSaludo') === '1'; } catch (e) { /* sin almacenamiento */ }
    if (!yaSaludoAsoma) {
      setTimeout(function () {
        if (panel.hidden) asoma.hidden = false;
        setTimeout(function () { if (!asoma.hidden) ocultarAsoma(); }, 14000);
      }, 4000);
    }
    document.getElementById('cyCiliAsomaCerrar').addEventListener('click', ocultarAsoma);
    document.getElementById('cyCiliAsomaGlobo').addEventListener('click', function () {
      ocultarAsoma();
      btnAbrir.click();
    });
    btnAbrir.addEventListener('click', ocultarAsoma);

    function desplazarseAlFinal() {
      cajaMensajes.scrollTop = cajaMensajes.scrollHeight;
    }

    function activarBoca(activo) {
      var videos = raiz.querySelectorAll('.cy-cili-habla');
      clearTimeout(temporizadorHabla);
      if (activo && !sinMovimiento) {
        raiz.classList.add('cy-cili--habla');
        videos.forEach(function (v) {
          try {
            var p = v.play();
            if (p && p.catch) p.catch(function () {});
          } catch (e) {}
        });
      } else {
        raiz.classList.remove('cy-cili--habla');
        videos.forEach(function (v) {
          try { v.pause(); } catch (e) {}
        });
      }
    }

    function detenerAudioActual() {
      clearTimeout(temporizadorHabla);
      if (audioActual) {
        try {
          audioActual.pause();
          audioActual.currentTime = 0;
        } catch (e) {}
        audioActual = null;
      }
      if (urlAudioActual) {
        try { URL.revokeObjectURL(urlAudioActual); } catch (e) {}
        urlAudioActual = null;
      }
      activarBoca(false);
    }

    function animarBocaPorDuracionEstimada(texto) {
      if (sinMovimiento) return;
      var palabras = String(texto || '').split(/\s+/).length;
      var ms = Math.min(8500, 1200 + palabras * 250);
      activarBoca(true);
      temporizadorHabla = setTimeout(function () {
        activarBoca(false);
      }, ms);
    }

    function hablarConVoz(texto) {
      var limpio = String(texto || '').trim();
      if (!limpio) return;
      detenerAudioActual();
      if (silenciado) return;

      fetch('/api/gas/asistente/voz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'audio/mpeg, audio/wav;q=0.8' },
        body: JSON.stringify({
          texto: limpio.slice(0, 600),
          sesion: obtenerSesion()
        })
      })
        .then(function (r) {
          if (!r.ok) throw new Error('sin_voz');
          return r.blob();
        })
        .then(function (blob) {
          if (silenciado || panel.hidden) return;
          urlAudioActual = URL.createObjectURL(blob);
          var audio = new Audio(urlAudioActual);
          audioActual = audio;
          audio.addEventListener('play', function () {
            activarBoca(true);
          });
          audio.addEventListener('ended', function () {
            detenerAudioActual();
          });
          audio.addEventListener('error', function () {
            detenerAudioActual();
          });
          var prom = audio.play();
          if (prom && prom.catch) {
            prom.catch(function () {
              detenerAudioActual();
              animarBocaPorDuracionEstimada(limpio);
            });
          }
        })
        .catch(function () {
          // Si /voz falla, queda en texto sin error visible y anima brevemente si aplica
          animarBocaPorDuracionEstimada(limpio);
        });
    }

    btnSilencio.addEventListener('click', function () {
      silenciado = !silenciado;
      guardarSilencio(silenciado);
      btnSilencio.setAttribute('aria-pressed', silenciado ? 'true' : 'false');
      btnSilencio.setAttribute('aria-label', silenciado ? 'Activar voz de Cili' : 'Silenciar voz de Cili');
      btnSilencio.title = silenciado ? 'Activar voz' : 'Silenciar voz';
      btnSilencio.textContent = silenciado ? '🔇' : '🔊';
      if (silenciado) {
        detenerAudioActual();
      }
    });

    function pintarOpciones(listaOpciones) {
      cajaOpciones.innerHTML = '';
      var arr = Array.isArray(listaOpciones) && listaOpciones.length ? listaOpciones : OPCIONES_INICIALES;
      arr.slice(0, 4).forEach(function (textoOpc) {
        var limpio = String(textoOpc || '').trim();
        if (!limpio) return;
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'cy-cili-opcion-btn';
        btn.textContent = limpio;
        btn.addEventListener('click', function () {
          enviarMensaje(limpio);
        });
        cajaOpciones.appendChild(btn);
      });
    }

    function pintarAccionesEscenario(acciones) {
      accionesEscenarioEl.innerHTML = '';
      if (!Array.isArray(acciones) || !acciones.length) {
        accionesEscenarioEl.hidden = true;
        return;
      }
      acciones.forEach(function (acc) {
        if (!acc || !esUrlSegura(acc.url)) return;
        var a = document.createElement('a');
        a.className = 'cy-cili-accion-enlace';
        a.href = acc.url;
        a.textContent = acc.texto || 'Abrir enlace';
        if (acc.url.indexOf('wa.me') !== -1) {
          a.target = '_blank';
          a.rel = 'noopener';
        }
        accionesEscenarioEl.appendChild(a);
      });
      accionesEscenarioEl.hidden = accionesEscenarioEl.children.length === 0;
    }

    function agregarBurbuja(rol, texto, acciones, reproducirVoz) {
      var div = document.createElement('div');
      div.className = 'cy-cili-msg cy-cili-msg--' + (rol === 'usuario' ? 'usuario' : 'cili');
      var p = document.createElement('div');
      p.textContent = texto;
      div.appendChild(p);

      if (Array.isArray(acciones) && acciones.length) {
        var contAcc = document.createElement('div');
        contAcc.className = 'cy-cili-acciones';
        acciones.forEach(function (acc) {
          if (!acc || !esUrlSegura(acc.url)) return;
          var a = document.createElement('a');
          a.className = 'cy-cili-accion-enlace';
          a.href = acc.url;
          a.textContent = acc.texto || 'Abrir enlace';
          if (acc.url.indexOf('wa.me') !== -1) {
            a.target = '_blank';
            a.rel = 'noopener';
          }
          contAcc.appendChild(a);
        });
        if (contAcc.children.length) {
          div.appendChild(contAcc);
        }
      }

      cajaMensajes.insertBefore(div, indEscribiendo);
      desplazarseAlFinal();

      if (rol !== 'usuario') {
        subtituloEl.textContent = texto;
        pintarAccionesEscenario(acciones);
        if (reproducirVoz) {
          hablarConVoz(texto);
        }
      }
    }

    function mostrarFormularioContacto(tipo) {
      if (tipo !== 'familia' && tipo !== 'distribuidor') {
        formContacto.hidden = true;
        return;
      }
      document.getElementById('cyCiliContactoTipo').value = tipo;
      var titulo = document.getElementById('cyCiliFormTitulo');
      var campoCamiones = document.getElementById('cyCiliCampoCamiones');
      if (tipo === 'distribuidor') {
        titulo.textContent = '¿Eres distribuidor autorizado Vepagas? Déjanos tus datos:';
        campoCamiones.hidden = false;
      } else {
        titulo.textContent = 'Déjanos tu contacto para avisarte por WhatsApp:';
        campoCamiones.hidden = true;
      }
      formContacto.hidden = false;
      desplazarseAlFinal();
    }

    // Pintar las 3 opciones grandes iniciales
    pintarOpciones(OPCIONES_INICIALES);

    // Restaurar historial de sessionStorage si existe en esta pestaña
    var historialGuardado = leerHistorial();
    if (historialGuardado.length) {
      historialGuardado.forEach(function (t) {
        if (t && (t.rol === 'usuario' || t.rol === 'cili') && t.texto) {
          agregarBurbuja(t.rol, t.texto, [], false);
        }
      });
    }

    // ── Captura de micrófono (SpeechRecognition + MediaRecorder + AnalyserNode) ──
    var escuchando = false;
    var reconocimiento = null;
    var grabadora = null;
    var fragmentosAudio = [];
    var temporizadorMaxGrabacion = null;
    var streamMic = null;
    var audioCtxMic = null;
    var analyserMic = null;
    var rafVolumen = null;

    function iniciarMedidorVolumen(stream) {
      if (sinMovimiento) return;
      var AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx || !stream) return;
      try {
        audioCtxMic = new AudioCtx();
        var fuente = audioCtxMic.createMediaStreamSource(stream);
        analyserMic = audioCtxMic.createAnalyser();
        analyserMic.fftSize = 128;
        fuente.connect(analyserMic);
        var datos = new Uint8Array(analyserMic.frequencyBinCount);
        var barras = ondasEl.querySelectorAll('span');

        function bucleNivel() {
          if (!escuchando || !analyserMic) return;
          analyserMic.getByteFrequencyData(datos);
          var suma = 0;
          for (var i = 0; i < datos.length; i++) suma += datos[i];
          var prom = suma / datos.length;
          var nivel = Math.min(1, prom / 95);
          var escala = (1 + nivel * 0.28).toFixed(3);
          anilloVoz.style.transform = 'scale(' + escala + ')';
          anilloVoz.style.opacity = (0.35 + nivel * 0.65).toFixed(2);
          for (var b = 0; b < barras.length; b++) {
            var valBarra = datos[(b * 4) % datos.length] / 255;
            var alt = Math.max(6, Math.round(6 + valBarra * 18));
            barras[b].style.height = alt + 'px';
          }
          rafVolumen = requestAnimationFrame(bucleNivel);
        }
        rafVolumen = requestAnimationFrame(bucleNivel);
      } catch (e) { /* Si falla WebAudio el botón igual muestra estado activo por CSS */ }
    }

    function limpiarStreamMedidor() {
      if (rafVolumen) {
        cancelAnimationFrame(rafVolumen);
        rafVolumen = null;
      }
      anilloVoz.style.transform = '';
      anilloVoz.style.opacity = '';
      var barras = ondasEl.querySelectorAll('span');
      for (var i = 0; i < barras.length; i++) barras[i].style.height = '';
      if (audioCtxMic) {
        try { audioCtxMic.close(); } catch (e) {}
        audioCtxMic = null;
        analyserMic = null;
      }
      if (streamMic) {
        try {
          streamMic.getTracks().forEach(function (t) { t.stop(); });
        } catch (e) {}
        streamMic = null;
      }
    }

    function marcarEstadoEscucha(activo) {
      escuchando = activo;
      raiz.classList.toggle('cy-cili--escuchando', activo);
      btnMic.setAttribute('aria-pressed', activo ? 'true' : 'false');
      micTexto.textContent = activo ? 'Escuchando… toca para enviar' : 'Toca y habla';
      if (!activo) {
        clearTimeout(temporizadorMaxGrabacion);
        limpiarStreamMedidor();
      }
    }

    function detenerEscucha() {
      clearTimeout(temporizadorMaxGrabacion);
      if (reconocimiento) {
        try { reconocimiento.stop(); } catch (e) {}
        reconocimiento = null;
      }
      if (grabadora && grabadora.state === 'recording') {
        try { grabadora.stop(); } catch (e) {}
        return;
      }
      marcarEstadoEscucha(false);
    }

    function enviarAudioAlServidor(blob, mime) {
      subtituloEl.textContent = 'Escuchando tu consulta…';
      indEscribiendo.hidden = false;
      var ext = 'webm';
      if (mime.indexOf('mp4') !== -1 || mime.indexOf('m4a') !== -1) ext = 'mp4';
      else if (mime.indexOf('ogg') !== -1) ext = 'ogg';
      else if (mime.indexOf('wav') !== -1) ext = 'wav';

      var fd = new FormData();
      fd.append('audio', blob, 'consulta.' + ext);

      fetch('/api/gas/asistente/escuchar', {
        method: 'POST',
        body: fd
      })
        .then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.json();
        })
        .then(function (res) {
          indEscribiendo.hidden = true;
          var texto = (res && res.texto) ? String(res.texto).trim() : '';
          if (texto) {
            subtituloEl.textContent = '«' + texto + '»';
            enviarMensaje(texto);
          } else {
            subtituloEl.textContent = 'No alcancé a escucharte bien, vecino. Toca «Toca y habla» o elige una opción.';
          }
        })
        .catch(function () {
          indEscribiendo.hidden = true;
          subtituloEl.textContent = 'No pude escuchar el audio ahora. Toca una opción o escríbele a Cili abajo.';
        });
    }

    function iniciarRespaldoMediaRecorder() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || typeof window.MediaRecorder === 'undefined') {
        subtituloEl.textContent = 'Tu navegador no tiene micrófono habilitado aquí. Toca un botón de opción o escribe abajo.';
        return;
      }
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(function (stream) {
          streamMic = stream;
          marcarEstadoEscucha(true);
          subtituloEl.textContent = 'Te escucho, vecino… habla ahora';
          iniciarMedidorVolumen(stream);

          var candidatos = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
          var mimeElegido = '';
          if (typeof MediaRecorder.isTypeSupported === 'function') {
            for (var i = 0; i < candidatos.length; i++) {
              if (MediaRecorder.isTypeSupported(candidatos[i])) {
                mimeElegido = candidatos[i];
                break;
              }
            }
          }
          fragmentosAudio = [];
          grabadora = mimeElegido ? new MediaRecorder(stream, { mimeType: mimeElegido }) : new MediaRecorder(stream);
          var mimeFinal = grabadora.mimeType || mimeElegido || 'audio/webm';

          grabadora.addEventListener('dataavailable', function (ev) {
            if (ev.data && ev.data.size > 0) fragmentosAudio.push(ev.data);
          });
          grabadora.addEventListener('stop', function () {
            marcarEstadoEscucha(false);
            var blob = new Blob(fragmentosAudio, { type: mimeFinal });
            fragmentosAudio = [];
            grabadora = null;
            if (blob.size > 100 && blob.size <= 1500000) {
              enviarAudioAlServidor(blob, mimeFinal);
            } else if (blob.size > 1500000) {
              subtituloEl.textContent = 'El audio fue muy largo. Intenta con una frase más corta.';
            }
          });

          grabadora.start();
          temporizadorMaxGrabacion = setTimeout(function () {
            if (escuchando) detenerEscucha();
          }, 20000);
        })
        .catch(function () {
          marcarEstadoEscucha(false);
          subtituloEl.textContent = 'Permite el micrófono para hablar con Cili, o toca una de las opciones de abajo.';
        });
    }

    function iniciarEscucha() {
      detenerAudioActual();
      if (escuchando) {
        detenerEscucha();
        return;
      }

      var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SR) {
        try {
          var rec = new SR();
          reconocimiento = rec;
          rec.lang = 'es-EC';
          rec.continuous = false;
          rec.interimResults = true;
          rec.maxAlternatives = 1;

          var textoCapturado = '';
          marcarEstadoEscucha(true);
          subtituloEl.textContent = 'Te escucho, vecino…';

          if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia && !sinMovimiento) {
            navigator.mediaDevices.getUserMedia({ audio: true })
              .then(function (stream) {
                if (!escuchando) {
                  stream.getTracks().forEach(function (t) { t.stop(); });
                  return;
                }
                streamMic = stream;
                iniciarMedidorVolumen(stream);
              })
              .catch(function () {});
          }

          rec.onresult = function (ev) {
            var interino = '';
            var finalTxt = '';
            for (var i = ev.resultIndex; i < ev.results.length; i++) {
              var trans = ev.results[i][0].transcript;
              if (ev.results[i].isFinal) {
                finalTxt += trans;
              } else {
                interino += trans;
              }
            }
            textoCapturado = (finalTxt || interino || '').trim();
            if (textoCapturado) {
              subtituloEl.textContent = '«' + textoCapturado + '»';
            }
          };

          rec.onerror = function (ev) {
            reconocimiento = null;
            marcarEstadoEscucha(false);
            if (ev && (ev.error === 'not-allowed' || ev.error === 'service-not-allowed')) {
              subtituloEl.textContent = 'Permite el micrófono en tu navegador o elige una opción rápida.';
            } else {
              iniciarRespaldoMediaRecorder();
            }
          };

          rec.onend = function () {
            reconocimiento = null;
            marcarEstadoEscucha(false);
            if (textoCapturado) {
              enviarMensaje(textoCapturado);
            }
          };

          rec.start();
          temporizadorMaxGrabacion = setTimeout(function () {
            if (escuchando) detenerEscucha();
          }, 20000);
          return;
        } catch (e) {
          reconocimiento = null;
          marcarEstadoEscucha(false);
        }
      }

      iniciarRespaldoMediaRecorder();
    }

    btnMic.addEventListener('click', iniciarEscucha);

    function abrirPanel() {
      panel.hidden = false;
      btnAbrir.setAttribute('aria-expanded', 'true');
      var yaSaludoVoz = false;
      try { yaSaludoVoz = sessionStorage.getItem(CLAVE_SALUDO_VOZ) === '1'; } catch (e) {}
      if (!yaSaludoVoz) {
        try { sessionStorage.setItem(CLAVE_SALUDO_VOZ, '1'); } catch (e) {}
        subtituloEl.textContent = SALUDO_INICIAL_VOZ;
        pintarOpciones(OPCIONES_INICIALES);
        hablarConVoz(SALUDO_INICIAL_VOZ);
      }
      setTimeout(function () { btnMic.focus(); desplazarseAlFinal(); }, 20);
    }

    function cerrarPanel() {
      detenerEscucha();
      detenerAudioActual();
      panel.hidden = true;
      btnAbrir.setAttribute('aria-expanded', 'false');
      btnAbrir.focus();
    }

    btnAbrir.addEventListener('click', function () {
      if (panel.hidden) abrirPanel(); else cerrarPanel();
    });

    btnCerrar.addEventListener('click', cerrarPanel);

    // Tecla Escape cierra y foco atrapado dentro del panel cuando está abierto
    panel.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') {
        ev.preventDefault();
        cerrarPanel();
        return;
      }
      if (ev.key === 'Tab') {
        var enfocables = Array.prototype.slice.call(
          panel.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]):not([type="hidden"]), select:not([disabled])')
        ).filter(function (el) {
          return !el.closest('[hidden]') && el.offsetParent !== null;
        });
        if (!enfocables.length) return;
        var primero = enfocables[0];
        var ultimo = enfocables[enfocables.length - 1];
        if (ev.shiftKey && document.activeElement === primero) {
          ev.preventDefault();
          ultimo.focus();
        } else if (!ev.shiftKey && document.activeElement === ultimo) {
          ev.preventDefault();
          primero.focus();
        }
      }
    });

    function enviarMensaje(textoUsuario) {
      var limpio = (textoUsuario || '').trim();
      if (!limpio) return;
      if (limpio.length > 500) limpio = limpio.slice(0, 500);

      detenerEscucha();
      detenerAudioActual();

      var historialActual = leerHistorial();
      agregarBurbuja('usuario', limpio, [], false);
      inputChat.value = '';
      btnEnviar.disabled = true;
      indEscribiendo.hidden = false;
      subtituloEl.textContent = 'Cili está pensando…';
      desplazarseAlFinal();

      fetch('/api/gas/asistente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mensaje: limpio,
          historial: historialActual.slice(-8),
          sesion: obtenerSesion(),
          pagina: location.pathname || '/hogar/'
        })
      })
        .then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.json();
        })
        .then(function (data) {
          indEscribiendo.hidden = true;
          btnEnviar.disabled = false;
          var respTexto = (data && data.respuesta) ? data.respuesta : 'Puedo ayudarte por WhatsApp al 099 305 2744.';
          var acciones = (data && Array.isArray(data.acciones)) ? data.acciones : [];
          var opciones = (data && Array.isArray(data.opciones) && data.opciones.length) ? data.opciones : OPCIONES_INICIALES;
          pintarOpciones(opciones);
          agregarBurbuja('cili', respTexto, acciones, true);
          mostrarFormularioContacto(data ? data.pedir_contacto : null);

          var nuevoHist = historialActual.concat([
            { rol: 'usuario', texto: limpio },
            { rol: 'cili', texto: respTexto.slice(0, 500) }
          ]).slice(-8);
          guardarHistorial(nuevoHist);
        })
        .catch(function () {
          indEscribiendo.hidden = true;
          btnEnviar.disabled = false;
          pintarOpciones(OPCIONES_INICIALES);
          agregarBurbuja(
            'cili',
            'En este momento mi conexión está ocupada, pero te atendemos enseguida por WhatsApp al 099 305 2744.',
            [{ tipo: 'enlace', texto: 'Escribir por WhatsApp · 099 305 2744', url: WA_RESPALDO }],
            false
          );
        });
    }

    formChat.addEventListener('submit', function (ev) {
      ev.preventDefault();
      enviarMensaje(inputChat.value);
    });

    formContacto.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var estadoEl = document.getElementById('cyCiliContactoEstado');
      var btnContacto = document.getElementById('cyCiliContactoEnviar');
      var tipo = document.getElementById('cyCiliContactoTipo').value;
      var nombre = (document.getElementById('cyCiliContactoNombre').value || '').trim();
      var telefono = (document.getElementById('cyCiliContactoTelefono').value || '').replace(/\D/g, '');
      var canton = document.getElementById('cyCiliContactoCanton').value;
      var camionesVal = parseInt(document.getElementById('cyCiliContactoCamiones').value || '1', 10);
      var consentimiento = !!document.getElementById('cyCiliContactoConsentimiento').checked;

      if (nombre.length < 2) {
        estadoEl.style.color = '#B42318';
        estadoEl.textContent = 'Escribe tu nombre completo.';
        return;
      }
      if (!/^09\d{8}$/.test(telefono)) {
        estadoEl.style.color = '#B42318';
        estadoEl.textContent = 'Escribe un celular válido de 10 dígitos (09xxxxxxxx).';
        return;
      }
      if (!consentimiento) {
        estadoEl.style.color = '#B42318';
        estadoEl.textContent = 'Marca la casilla de consentimiento para continuar.';
        return;
      }

      btnContacto.disabled = true;
      estadoEl.style.color = '#3D5573';
      estadoEl.textContent = 'Guardando tus datos…';

      var payload = {
        tipo: tipo,
        nombre: nombre,
        telefono: telefono,
        canton: canton,
        consentimiento: true,
        sesion: obtenerSesion()
      };
      if (tipo === 'distribuidor') {
        payload.camiones = isNaN(camionesVal) ? 1 : Math.max(1, Math.min(50, camionesVal));
      }

      fetch('/api/gas/asistente/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (r) {
          if (!r.ok) throw new Error('Error al guardar');
          return r.json();
        })
        .then(function (res) {
          btnContacto.disabled = false;
          estadoEl.style.color = '#0B7A43';
          estadoEl.textContent = (res && res.mensaje) ? res.mensaje : '¡Listo! Guardamos tus datos.';
          setTimeout(function () { formContacto.hidden = true; }, 2200);
        })
        .catch(function () {
          btnContacto.disabled = false;
          estadoEl.style.color = '#B42318';
          estadoEl.textContent = 'No pudimos guardar ahora. Escríbenos directo al WhatsApp 099 305 2744.';
        });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', montarWidget);
  } else {
    montarWidget();
  }
})();
