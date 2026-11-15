/*
 * brand/cili3d.js — Mascota Cili 3D interactiva al estilo Sketchfab para cilindroya.com/hogar/.
 *
 * - Carga diferida con requestIdleCallback / IntersectionObserver tras pintar el póster (/assets/web/cili_404.webp).
 * - Respeta prefers-reduced-motion, navigator.connection.saveData y dispositivos sin WebGL.
 * - Modelado 100 % por código (PBR #1E5BC6 con RoomEnvironment, asa de dos arcos con ventanas, válvula de bronce,
 *   ojos expresivos con iris celeste y brillo, cejas, sonrisa, chaleco con franjas reflectivas naranjas/grises,
 *   logo CilindroYa desde /static/brand/logo-white.svg en canvas, brazos con guantes blancos).
 * - Interacción tipo Sketchfab: arrastrar para girar (OrbitControls acotado), giro suave en reposo, respiración,
 *   parpadeo cada 3–6 s, saludo con el brazo al pasar el mouse o tocar, 3 anotaciones numeradas con burbuja,
 *   y clic sobre Cili que abre el asistente «Habla con Cili» (#cyMayaBtnAbrir).
 * - Rendimiento: pixelRatio máx. 2, pausa el render cuando el héroe sale de pantalla o la pestaña se oculta.
 */
(function () {
  'use strict';

  var ANOTACIONES = [
    {
      num: '1',
      titulo: '$3,60 en tu puerta',
      detalle: '$1,65 cilindro oficial ARCH + $1,85 entrega + $0,10 plataforma. Sin recargos.',
      pos: [0.62, 1.34, 0.58]
    },
    {
      num: '2',
      titulo: 'Canje de cualquier color o marca',
      detalle: 'Recibimos tu cilindro vacío azul, naranja o de cualquier distribuidora en buen estado.',
      pos: [-0.88, 0.28, 0.68]
    },
    {
      num: '3',
      titulo: 'Pagas al recibir',
      detalle: 'En efectivo (el repartidor lleva cambio), QR de DeUna o transferencia en tu puerta.',
      pos: [0.86, -0.52, 0.72]
    }
  ];

  function soportaWebGL() {
    try {
      var c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
    } catch (e) {
      return false;
    }
  }

  function debeOmitir3D() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return true;
    }
    var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn && conn.saveData) {
      return true;
    }
    return !soportaWebGL();
  }

  function crearTexturaIris() {
    var cv = document.createElement('canvas');
    cv.width = 256;
    cv.height = 256;
    var ctx = cv.getContext('2d');
    var cx = 128;
    var cy = 128;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 256, 256);

    // Sombra suave exterior de la esclera blanca
    var gradEsclera = ctx.createRadialGradient(cx, cy, 74, cx, cy, 128);
    gradEsclera.addColorStop(0, 'rgba(255,255,255,0)');
    gradEsclera.addColorStop(1, 'rgba(186,208,235,0.42)');
    ctx.fillStyle = gradEsclera;
    ctx.fillRect(0, 0, 256, 256);

    // Iris celeste brillante (centrado y contenido para que se vea amplia esclera blanca alrededor)
    var rIris = 54;
    var gradIris = ctx.createRadialGradient(cx, cy, 14, cx, cy, rIris);
    gradIris.addColorStop(0, '#67E8F9');
    gradIris.addColorStop(0.55, '#1CAAD9');
    gradIris.addColorStop(0.88, '#0B5FA5');
    gradIris.addColorStop(1, '#062C54');
    ctx.beginPath();
    ctx.arc(cx, cy, rIris, 0, Math.PI * 2);
    ctx.fillStyle = gradIris;
    ctx.fill();

    // Fibras radiales del iris
    ctx.save();
    ctx.translate(cx, cy);
    ctx.strokeStyle = 'rgba(205, 248, 255, 0.34)';
    ctx.lineWidth = 1.5;
    for (var i = 0; i < 32; i++) {
      var ang = (i / 32) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(ang) * 22, Math.sin(ang) * 22);
      ctx.lineTo(Math.cos(ang) * (rIris - 4), Math.sin(ang) * (rIris - 4));
      ctx.stroke();
    }
    ctx.restore();

    // Pupila
    ctx.beginPath();
    ctx.arc(cx, cy, 25, 0, Math.PI * 2);
    ctx.fillStyle = '#071426';
    ctx.fill();

    // Brillos especulares de mascota 3D
    ctx.beginPath();
    ctx.arc(cx - 16, cy - 18, 11, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx + 14, cy + 13, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fill();

    return cv;
  }

  function crearTexturaChaleco() {
    var cv = document.createElement('canvas');
    cv.width = 1024;
    cv.height = 512;
    var ctx = cv.getContext('2d');

    // Pecho metálico azul visible en la abertura central
    var gradPecho = ctx.createLinearGradient(0, 0, 0, 512);
    gradPecho.addColorStop(0, '#1E5BC6');
    gradPecho.addColorStop(0.5, '#1950B4');
    gradPecho.addColorStop(1, '#123E91');
    ctx.fillStyle = gradPecho;
    ctx.fillRect(0, 0, 1024, 512);

    var izqFin = 424;
    var derIni = 600;

    function pintarPanelChaleco(x, w) {
      var gradTela = ctx.createLinearGradient(x, 0, x + w, 512);
      gradTela.addColorStop(0, '#0E336E');
      gradTela.addColorStop(1, '#09234D');
      ctx.fillStyle = gradTela;
      ctx.fillRect(x, 8, w, 496);

      // Franja superior reflectiva naranja + gris plata
      ctx.fillStyle = '#FF8A00';
      ctx.fillRect(x, 68, w, 44);
      ctx.fillStyle = '#CBD5E1';
      ctx.fillRect(x, 80, w, 20);

      // Primera banda reflectiva horizontal inferior (naranja con centro gris reflectivo)
      ctx.fillStyle = '#FF8A00';
      ctx.fillRect(x, 286, w, 48);
      ctx.fillStyle = '#D8E0EA';
      ctx.fillRect(x, 299, w, 22);

      // Segunda banda reflectiva horizontal baja
      ctx.fillStyle = '#FF8A00';
      ctx.fillRect(x, 408, w, 50);
      ctx.fillStyle = '#CBD5E1';
      ctx.fillRect(x, 420, w, 26);
    }

    pintarPanelChaleco(0, izqFin);
    pintarPanelChaleco(derIni, 1024 - derIni);

    // Tirantes reflectivos verticales hacia el borde superior del chaleco
    function pintarTirante(x) {
      ctx.fillStyle = '#FF8A00';
      ctx.fillRect(x, 8, 56, 68);
      ctx.fillStyle = '#CBD5E1';
      ctx.fillRect(x + 15, 8, 26, 68);
    }
    pintarTirante(335);
    pintarTirante(633);

    // Bolsillos del chaleco
    function pintarBolsillo(x, y, w, h) {
      ctx.fillStyle = '#10397A';
      ctx.strokeStyle = '#061836';
      ctx.lineWidth = 4;
      ctx.fillRect(x, y, w, h);
      ctx.strokeRect(x, y, w, h);
      ctx.fillStyle = '#154694';
      ctx.fillRect(x - 2, y - 4, w + 4, 28);
      ctx.strokeRect(x - 2, y - 4, w + 4, 28);
    }
    pintarBolsillo(298, 138, 100, 114);
    pintarBolsillo(626, 138, 100, 114);

    // Bordes negros / cierre zipper de la abertura del chaleco
    ctx.fillStyle = '#0B1320';
    ctx.fillRect(izqFin - 12, 8, 12, 496);
    ctx.fillRect(derIni, 8, 12, 496);

    ctx.fillStyle = '#64748B';
    for (var zy = 20; zy < 492; zy += 12) {
      ctx.fillRect(izqFin - 5, zy, 4, 6);
      ctx.fillRect(derIni + 1, zy, 4, 6);
    }

    pintarLogoPecho(ctx, 512, 210);
    return cv;
  }

  function pintarLogoPecho(ctx, cx, cy) {
    // Emblema circular blanco con gotas en el pecho + texto CilindroYa fiel a la foto de Cili
    ctx.save();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx - 4, cy - 34, 32, 0.25, Math.PI * 1.78);
    ctx.stroke();

    // Gotitas/chispas superiores derechas del isotipo
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(cx + 22, cy - 64, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 8, cy - 72, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 26, cy - 48, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 28px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CilindroYa', cx, cy + 32);
    ctx.restore();
  }

  function cargarLogoEnTextura(canvas, textura) {
    var img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function () {
      try {
        var ctx = canvas.getContext('2d');
        // Limpiar el área del texto de respaldo y dibujar el logotipo oficial de /static/brand/logo-white.svg
        var gradPecho = ctx.createLinearGradient(0, 210, 0, 275);
        gradPecho.addColorStop(0, '#184DAE');
        gradPecho.addColorStop(1, '#14429A');
        ctx.fillStyle = gradPecho;
        ctx.fillRect(430, 212, 164, 60);
        ctx.drawImage(img, 434, 216, 156, 44);
        textura.needsUpdate = true;
      } catch (e) { /* mantiene el respaldo */ }
    };
    img.src = '/static/brand/logo-white.svg';
  }

  function construirEscena(contenedor) {
    var lienzoWrap = contenedor.querySelector('.cili3d-lienzo');
    var poster = contenedor.querySelector('.cili3d-poster');
    if (!lienzoWrap) return;

    Promise.all([
      import('/static/brand/vendor/three.module.min.js'),
      import('/static/brand/vendor/OrbitControls.js'),
      import('/static/brand/vendor/RoomEnvironment.js')
    ]).then(function (mods) {
      var THREE = mods[0];
      var OrbitControls = mods[1].OrbitControls;
      var RoomEnvironment = mods[2].RoomEnvironment;

      var ancho = lienzoWrap.clientWidth || 560;
      var alto = lienzoWrap.clientHeight || 560;

      var renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(ancho, alto);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.08;
      if ('outputColorSpace' in renderer && THREE.SRGBColorSpace) {
        renderer.outputColorSpace = THREE.SRGBColorSpace;
      }

      var canvas = renderer.domElement;
      canvas.className = 'cili3d-canvas';
      canvas.setAttribute('role', 'img');
      canvas.setAttribute(
        'aria-label',
        'Modelo 3D interactivo de Cili, la mascota de CilindroYa. Arrastra para girarlo o tócalo para hablar con Cili.'
      );
      canvas.setAttribute('tabindex', '0');
      lienzoWrap.appendChild(canvas);

      var scene = new THREE.Scene();

      // Iluminación de estudio PBR con RoomEnvironment + luces direccionales
      var pmrem = new THREE.PMREMGenerator(renderer);
      var envScene = new RoomEnvironment();
      var envTex = pmrem.fromScene(envScene, 0.04).texture;
      scene.environment = envTex;
      envScene.dispose();
      pmrem.dispose();

      var hemi = new THREE.HemisphereLight(0xE0F4FF, 0x09294A, 0.95);
      scene.add(hemi);

      var dirPrincipal = new THREE.DirectionalLight(0xFFFFFF, 1.45);
      dirPrincipal.position.set(3.5, 5.5, 4.5);
      scene.add(dirPrincipal);

      var dirContra = new THREE.DirectionalLight(0x2EC3FB, 1.1);
      dirContra.position.set(-4.0, 2.5, -3.2);
      scene.add(dirContra);

      var dirCalida = new THREE.DirectionalLight(0xFF9E3A, 0.65);
      dirCalida.position.set(2.8, -2.0, 2.5);
      scene.add(dirCalida);

      var camera = new THREE.PerspectiveCamera(34, ancho / alto, 0.1, 50);
      camera.position.set(0, 0.25, 5.65);

      var controls = new OrbitControls(camera, canvas);
      controls.enableDamping = true;
      controls.dampingFactor = 0.06;
      controls.enablePan = false;
      controls.minDistance = 4.5;
      controls.maxDistance = 6.8;
      controls.minPolarAngle = Math.PI * 0.28;
      controls.maxPolarAngle = Math.PI * 0.66;
      controls.target.set(0, 0.12, 0);
      controls.update();

      // ── Materiales de Cili ────────────────────────────────────────────────
      var matAceroAzul = new THREE.MeshPhysicalMaterial({
        color: 0x1E5BC6,
        metalness: 0.56,
        roughness: 0.22,
        clearcoat: 0.85,
        clearcoatRoughness: 0.16,
        envMapIntensity: 1.12
      });

      var matAzulOscuro = new THREE.MeshStandardMaterial({
        color: 0x0E3A8A,
        metalness: 0.5,
        roughness: 0.32
      });

      var matBronce = new THREE.MeshStandardMaterial({
        color: 0xCFA044,
        metalness: 0.88,
        roughness: 0.22
      });

      var matBronceOscuro = new THREE.MeshStandardMaterial({
        color: 0x946A24,
        metalness: 0.84,
        roughness: 0.32
      });

      var matCeja = new THREE.MeshStandardMaterial({
        color: 0x091E3A,
        metalness: 0.2,
        roughness: 0.42
      });

      var matGuante = new THREE.MeshStandardMaterial({
        color: 0xF8FAFC,
        metalness: 0.05,
        roughness: 0.36
      });

      var matManga = new THREE.MeshStandardMaterial({
        color: 0x0B2B5E,
        metalness: 0.15,
        roughness: 0.65
      });

      var cvIris = crearTexturaIris();
      var texIris = new THREE.CanvasTexture(cvIris);
      if ('colorSpace' in texIris && THREE.SRGBColorSpace) {
        texIris.colorSpace = THREE.SRGBColorSpace;
      }
      var matOjo = new THREE.MeshStandardMaterial({
        map: texIris,
        roughness: 0.1,
        metalness: 0.04
      });

      var cvChaleco = crearTexturaChaleco();
      var texChaleco = new THREE.CanvasTexture(cvChaleco);
      if ('colorSpace' in texChaleco && THREE.SRGBColorSpace) {
        texChaleco.colorSpace = THREE.SRGBColorSpace;
      }
      cargarLogoEnTextura(cvChaleco, texChaleco);

      var matChaleco = new THREE.MeshStandardMaterial({
        map: texChaleco,
        roughness: 0.46,
        metalness: 0.14
      });

      // ── Grupo raíz de la mascota Cili ─────────────────────────────────────
      var raizCili = new THREE.Group();
      scene.add(raizCili);

      var cuerpoGrupo = new THREE.Group();
      raizCili.add(cuerpoGrupo);

      // 1. Cilindro central y domos esféricos superior e inferior
      var geoCilindro = new THREE.CylinderGeometry(0.96, 0.96, 1.48, 48, 1, false);
      var mallaCilindro = new THREE.Mesh(geoCilindro, matAceroAzul);
      mallaCilindro.position.y = 0.02;
      cuerpoGrupo.add(mallaCilindro);

      var geoDomoSup = new THREE.SphereGeometry(0.96, 48, 24, 0, Math.PI * 2, 0, Math.PI * 0.5);
      var mallaDomoSup = new THREE.Mesh(geoDomoSup, matAceroAzul);
      mallaDomoSup.position.y = 0.76;
      mallaDomoSup.scale.set(1, 0.68, 1);
      cuerpoGrupo.add(mallaDomoSup);

      var geoDomoInf = new THREE.SphereGeometry(0.96, 48, 20, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5);
      var mallaDomoInf = new THREE.Mesh(geoDomoInf, matAceroAzul);
      mallaDomoInf.position.y = -0.72;
      mallaDomoInf.scale.set(1, 0.52, 1);
      cuerpoGrupo.add(mallaDomoInf);

      // Cordón de soldadura en el cuello del pecho
      var geoCostura = new THREE.TorusGeometry(0.964, 0.022, 12, 48);
      var mallaCostura = new THREE.Mesh(geoCostura, matAceroAzul);
      mallaCostura.rotation.x = Math.PI * 0.5;
      mallaCostura.position.y = 0.17;
      cuerpoGrupo.add(mallaCostura);

      // Base / aro pedestal del cilindro
      var geoBase = new THREE.CylinderGeometry(0.76, 0.80, 0.24, 40);
      var mallaBase = new THREE.Mesh(geoBase, matAzulOscuro);
      mallaBase.position.y = -1.24;
      cuerpoGrupo.add(mallaBase);

      var geoRebordeBase = new THREE.TorusGeometry(0.79, 0.035, 12, 40);
      var mallaRebordeBase = new THREE.Mesh(geoRebordeBase, matAzulOscuro);
      mallaRebordeBase.rotation.x = Math.PI * 0.5;
      mallaRebordeBase.position.y = -1.35;
      cuerpoGrupo.add(mallaRebordeBase);

      // 2. Chaleco reflectivo con logo CilindroYa en el pecho
      var geoChaleco = new THREE.CylinderGeometry(0.985, 0.985, 1.04, 48, 1, false);
      var mallaChaleco = new THREE.Mesh(geoChaleco, matChaleco);
      mallaChaleco.position.y = -0.35;
      mallaChaleco.rotation.y = Math.PI;
      cuerpoGrupo.add(mallaChaleco);

      // 3. Asa protectora superior (dos arcos laterales con amplia ventana frontal para ver la válvula de bronce)
      var grupoAsa = new THREE.Group();
      grupoAsa.position.y = 1.38;
      cuerpoGrupo.add(grupoAsa);

      // En Three.js CylinderGeometry, theta=0 apunta a +Z (frente).
      // Colocamos el arco derecho centrado en +X (theta = +PI/2) y el izquierdo en -X (theta = -PI/2),
      // dejando libre el frente (theta ~ 0) y la espalda (theta ~ PI) para que la válvula de bronce destaque.
      var aperturaArco = Math.PI * 0.52;
      var geoArcoDer = new THREE.CylinderGeometry(
        0.54, 0.58, 0.50, 24, 1, true,
        Math.PI * 0.5 - aperturaArco * 0.5, aperturaArco
      );
      var geoArcoIzq = new THREE.CylinderGeometry(
        0.54, 0.58, 0.50, 24, 1, true,
        -Math.PI * 0.5 - aperturaArco * 0.5, aperturaArco
      );
      var matAsaDoble = matAceroAzul.clone();
      matAsaDoble.side = THREE.DoubleSide;

      grupoAsa.add(new THREE.Mesh(geoArcoDer, matAsaDoble));
      grupoAsa.add(new THREE.Mesh(geoArcoIzq, matAsaDoble));

      // Travesaño trasero superior que une ambos lados del cuello protector
      var geoPuenteTrasero = new THREE.CylinderGeometry(
        0.54, 0.55, 0.16, 20, 1, true,
        Math.PI - Math.PI * 0.32, Math.PI * 0.64
      );
      var puenteTrasero = new THREE.Mesh(geoPuenteTrasero, matAsaDoble);
      puenteTrasero.position.y = 0.12;
      grupoAsa.add(puenteTrasero);

      // Reborde superior redondeado de todo el cuello protector
      var geoCoronaAsa = new THREE.TorusGeometry(0.54, 0.042, 12, 36, Math.PI * 1.56);
      var coronaAsa = new THREE.Mesh(geoCoronaAsa, matAceroAzul);
      coronaAsa.rotation.x = Math.PI * 0.5;
      coronaAsa.rotation.z = -Math.PI * 0.28;
      coronaAsa.position.y = 0.24;
      grupoAsa.add(coronaAsa);

      // 4. Válvula de bronce en el centro del cuello (bien visible por la ventana frontal)
      var grupoValvula = new THREE.Group();
      grupoValvula.position.y = 1.36;
      cuerpoGrupo.add(grupoValvula);

      var baseValvula = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.23, 0.14, 24), matAceroAzul);
      baseValvula.position.y = 0.02;
      grupoValvula.add(baseValvula);

      var vastagoValvula = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.36, 24), matBronce);
      vastagoValvula.position.y = 0.22;
      grupoValvula.add(vastagoValvula);

      var boquillaFrontal = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.095, 0.20, 20), matBronceOscuro);
      boquillaFrontal.rotation.x = Math.PI * 0.5;
      boquillaFrontal.position.set(0, 0.23, 0.13);
      grupoValvula.add(boquillaFrontal);

      var huecoBoquilla = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.05, 16), matCeja);
      huecoBoquilla.rotation.x = Math.PI * 0.5;
      huecoBoquilla.position.set(0, 0.23, 0.21);
      grupoValvula.add(huecoBoquilla);

      var volanteValvula = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.19, 0.08, 12), matBronce);
      volanteValvula.position.y = 0.42;
      grupoValvula.add(volanteValvula);

      // 5. Rostro amable de Cili (ojos grandes con párpados, cejas, nariz suave y sonrisa)
      var grupoRostro = new THREE.Group();
      grupoRostro.position.set(0, 0.58, 0.86);
      cuerpoGrupo.add(grupoRostro);

      var parpados = [];

      function crearOjo(x) {
        var gOjo = new THREE.Group();
        gOjo.position.set(x, 0.06, 0.04);

        // Cuenca metálica azul en relieve alrededor del ojo
        var cuenca = new THREE.Mesh(new THREE.TorusGeometry(0.215, 0.032, 14, 32), matAceroAzul);
        cuenca.scale.set(1.04, 1.12, 0.65);
        cuenca.position.z = 0.015;
        gOjo.add(cuenca);

        // Globo ocular con textura de esclera blanca, iris celeste y pupila
        var globo = new THREE.Mesh(new THREE.SphereGeometry(0.208, 32, 24), matOjo);
        globo.scale.set(1.0, 1.08, 0.52);
        globo.rotation.y = -Math.PI * 0.5;
        gOjo.add(globo);

        // Párpado superior para el parpadeo cada 3–6 s
        var geoParpado = new THREE.SphereGeometry(0.22, 28, 16, 0, Math.PI * 2, 0, Math.PI * 0.52);
        var parpado = new THREE.Mesh(geoParpado, matAceroAzul);
        parpado.scale.set(1.02, 1.08, 0.56);
        parpado.rotation.x = -1.35; // abierto
        gOjo.add(parpado);
        parpados.push(parpado);

        return gOjo;
      }

      grupoRostro.add(crearOjo(-0.26));
      grupoRostro.add(crearOjo(0.26));

      // Cejas oscuras arqueadas y expresivas
      function crearCeja(lado) {
        var ceja = new THREE.Mesh(
          new THREE.TorusGeometry(0.21, 0.035, 12, 24, Math.PI * 0.60),
          matCeja
        );
        ceja.position.set(lado * 0.26, 0.23, 0.06);
        ceja.rotation.z = Math.PI * 0.20 - lado * 0.14;
        ceja.rotation.x = -0.16;
        return ceja;
      }
      var cejaIzq = crearCeja(-1);
      var cejaDer = crearCeja(1);
      grupoRostro.add(cejaIzq);
      grupoRostro.add(cejaDer);

      // Tabique / nariz suave metálica entre los ojos
      var nariz = new THREE.Mesh(new THREE.SphereGeometry(0.085, 20, 16), matAceroAzul);
      nariz.scale.set(0.8, 1.1, 0.55);
      nariz.position.set(0, -0.08, 0.07);
      grupoRostro.add(nariz);

      // Sonrisa amable y bien definida sobre el cilindro (curva 3D en relieve)
      var puntosSonrisa = [
        new THREE.Vector3(-0.28, -0.22, 0.05),
        new THREE.Vector3(-0.14, -0.29, 0.095),
        new THREE.Vector3(0.0, -0.31, 0.11),
        new THREE.Vector3(0.14, -0.29, 0.095),
        new THREE.Vector3(0.28, -0.22, 0.05)
      ];
      var curvaSonrisa = new THREE.CatmullRomCurve3(puntosSonrisa);
      var geoSonrisa = new THREE.TubeGeometry(curvaSonrisa, 28, 0.024, 12, false);
      var mallaSonrisa = new THREE.Mesh(geoSonrisa, matCeja);
      grupoRostro.add(mallaSonrisa);

      // Comisuras suaves de las mejillas en los extremos de la sonrisa
      function crearComisura(lado) {
        var m = new THREE.Mesh(new THREE.SphereGeometry(0.042, 14, 12), matCeja);
        m.position.set(lado * 0.285, -0.215, 0.055);
        return m;
      }
      grupoRostro.add(crearComisura(-1));
      grupoRostro.add(crearComisura(1));

      // 6. Brazos cortos con mangas azules y guantes blancos
      function crearBrazo(lado) {
        var pivoteHombro = new THREE.Group();
        pivoteHombro.position.set(lado * 0.96, -0.02, 0.08);

        var manga = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.14, 0.28, 20), matManga);
        manga.position.set(lado * 0.08, -0.08, 0);
        manga.rotation.z = -lado * 0.45;
        pivoteHombro.add(manga);

        var antebrazo = new THREE.Mesh(new THREE.CapsuleGeometry(0.115, 0.34, 10, 18), matAceroAzul);
        antebrazo.position.set(lado * 0.22, -0.30, 0.08);
        antebrazo.rotation.z = -lado * 0.32;
        antebrazo.rotation.x = 0.28;
        pivoteHombro.add(antebrazo);

        var grupoGuante = new THREE.Group();
        grupoGuante.position.set(lado * 0.30, -0.54, 0.18);
        pivoteHombro.add(grupoGuante);

        // Puño del guante blanco
        var puno = new THREE.Mesh(new THREE.TorusGeometry(0.125, 0.038, 12, 24), matGuante);
        puno.rotation.x = Math.PI * 0.5;
        puno.position.y = 0.12;
        grupoGuante.add(puno);

        // Mano redondeada
        var mano = new THREE.Mesh(new THREE.SphereGeometry(0.175, 22, 18), matGuante);
        mano.scale.set(0.95, 1.05, 0.82);
        grupoGuante.add(mano);

        // Pulgar del guante
        var pulgar = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.09, 8, 12), matGuante);
        pulgar.position.set(-lado * 0.13, 0.03, 0.08);
        pulgar.rotation.z = lado * 0.65;
        pulgar.rotation.x = 0.4;
        grupoGuante.add(pulgar);

        return pivoteHombro;
      }

      var brazoIzq = crearBrazo(-1);
      var brazoDer = crearBrazo(1);
      cuerpoGrupo.add(brazoIzq);
      cuerpoGrupo.add(brazoDer);

      // Sombra de piso suave bajo Cili
      var cvSombra = document.createElement('canvas');
      cvSombra.width = 128;
      cvSombra.height = 128;
      var ctxS = cvSombra.getContext('2d');
      var gradS = ctxS.createRadialGradient(64, 64, 8, 64, 64, 60);
      gradS.addColorStop(0, 'rgba(5, 20, 40, 0.46)');
      gradS.addColorStop(1, 'rgba(5, 20, 40, 0)');
      ctxS.fillStyle = gradS;
      ctxS.fillRect(0, 0, 128, 128);
      var texSombra = new THREE.CanvasTexture(cvSombra);
      var planoSombra = new THREE.Mesh(
        new THREE.PlaneGeometry(2.4, 2.4),
        new THREE.MeshBasicMaterial({ map: texSombra, transparent: true, depthWrite: false })
      );
      planoSombra.rotation.x = -Math.PI * 0.5;
      planoSombra.position.y = -1.42;
      scene.add(planoSombra);

      // ── Anotaciones numeradas estilo Sketchfab (proyectadas desde 3D) ──────
      var capaAnotaciones = contenedor.querySelector('.cili3d-anotaciones');
      var itemsAnotacion = [];
      if (capaAnotaciones) {
        capaAnotaciones.innerHTML = '';
        ANOTACIONES.forEach(function (datos, idx) {
          var nodo3D = new THREE.Object3D();
          nodo3D.position.set(datos.pos[0], datos.pos[1], datos.pos[2]);
          cuerpoGrupo.add(nodo3D);

          var activoInicial = window.innerWidth >= 960 && idx === 0;
          var wrap = document.createElement('div');
          wrap.className = 'cili3d-pin' + (activoInicial ? ' cili3d-pin--activo' : '');

          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'cili3d-pin__num';
          btn.setAttribute('aria-expanded', activoInicial ? 'true' : 'false');
          btn.setAttribute('aria-label', 'Anotación ' + datos.num + ': ' + datos.titulo);
          btn.textContent = datos.num;

          var burbuja = document.createElement('div');
          burbuja.className = 'cili3d-pin__burbuja';
          burbuja.setAttribute('role', 'status');
          var st = document.createElement('strong');
          st.textContent = datos.titulo;
          var sp = document.createElement('span');
          sp.textContent = datos.detalle;
          burbuja.appendChild(st);
          burbuja.appendChild(sp);

          btn.addEventListener('click', function (ev) {
            ev.stopPropagation();
            var estabaActivo = wrap.classList.contains('cili3d-pin--activo');
            itemsAnotacion.forEach(function (it) {
              it.el.classList.remove('cili3d-pin--activo');
              it.btn.setAttribute('aria-expanded', 'false');
            });
            if (!estabaActivo) {
              wrap.classList.add('cili3d-pin--activo');
              btn.setAttribute('aria-expanded', 'true');
            }
          });

          wrap.appendChild(btn);
          wrap.appendChild(burbuja);
          capaAnotaciones.appendChild(wrap);

          itemsAnotacion.push({
            nodo: nodo3D,
            el: wrap,
            btn: btn
          });
        });
      }

      // ── Interacciones: saludo al pasar el mouse, clic para abrir Habla con Cili ──
      var saludandoHasta = 0;
      var usuarioArrastrando = false;
      var ultimoMovimientoControl = 0;
      var downPos = { x: 0, y: 0, t: 0 };

      function activarSaludo() {
        saludandoHasta = performance.now() + 2200;
      }

      contenedor.addEventListener('pointerenter', activarSaludo);
      controls.addEventListener('start', function () {
        usuarioArrastrando = true;
        ultimoMovimientoControl = performance.now();
      });
      controls.addEventListener('end', function () {
        usuarioArrastrando = false;
        ultimoMovimientoControl = performance.now();
      });

      var raycaster = new THREE.Raycaster();
      var punteroNDC = new THREE.Vector2();

      canvas.addEventListener('pointerdown', function (ev) {
        downPos.x = ev.clientX;
        downPos.y = ev.clientY;
        downPos.t = performance.now();
      });

      canvas.addEventListener('pointerup', function (ev) {
        var dx = ev.clientX - downPos.x;
        var dy = ev.clientY - downPos.y;
        var dt = performance.now() - downPos.t;
        if (Math.hypot(dx, dy) > 7 || dt > 600) return;

        var rect = canvas.getBoundingClientRect();
        punteroNDC.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
        punteroNDC.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(punteroNDC, camera);
        var impactos = raycaster.intersectObjects(cuerpoGrupo.children, true);
        if (impactos.length > 0) {
          activarSaludo();
          var btnChat = document.getElementById('cyMayaBtnAbrir');
          if (btnChat) btnChat.click();
        }
      });

      canvas.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          activarSaludo();
          var btnChat = document.getElementById('cyMayaBtnAbrir');
          if (btnChat) btnChat.click();
        }
      });

      // ── Ciclo de animación con parpadeo, respiración, saludo y pausa inteligente ──
      var proximoParpadeo = performance.now() + 2800 + Math.random() * 2500;
      var finParpadeo = 0;
      var visibleEnPantalla = true;
      var pestanaActiva = !document.hidden;
      var rafId = null;
      var vecProy = new THREE.Vector3();
      var reloj = new THREE.Clock();

      function actualizarAnotaciones() {
        if (!itemsAnotacion.length) return;
        var w = lienzoWrap.clientWidth || ancho;
        var h = lienzoWrap.clientHeight || alto;
        for (var i = 0; i < itemsAnotacion.length; i++) {
          var item = itemsAnotacion[i];
          item.nodo.getWorldPosition(vecProy);
          vecProy.project(camera);
          var x = (vecProy.x * 0.5 + 0.5) * w;
          var y = (-vecProy.y * 0.5 + 0.5) * h;
          item.el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
          item.el.style.opacity = vecProy.z > 1 ? '0' : '1';
        }
      }

      function bucle() {
        if (!visibleEnPantalla || !pestanaActiva) {
          rafId = null;
          return;
        }
        rafId = requestAnimationFrame(bucle);

        var ahora = performance.now();
        var t = reloj.getElapsedTime();

        // Respiración suave (escala y flotación ligera)
        var respira = Math.sin(t * 2.1);
        cuerpoGrupo.position.y = respira * 0.038;
        var escY = 1 + respira * 0.012;
        var escXZ = 1 - respira * 0.006;
        cuerpoGrupo.scale.set(escXZ, escY, escXZ);

        // Giro automático suave cuando el usuario no lo está arrastrando
        if (!usuarioArrastrando && ahora - ultimoMovimientoControl > 1800) {
          raizCili.rotation.y = Math.sin(t * 0.55) * 0.34;
        }

        // Parpadeo natural cada 3 a 6 segundos
        if (ahora >= proximoParpadeo) {
          finParpadeo = ahora + 160;
          proximoParpadeo = ahora + 3200 + Math.random() * 2800;
        }
        var rotParpado = ahora < finParpadeo ? -0.05 : -1.35;
        for (var p = 0; p < parpados.length; p++) {
          parpados[p].rotation.x += (rotParpado - parpados[p].rotation.x) * 0.38;
        }

        // Saludo con el brazo derecho al pasar el mouse o tocar
        if (ahora < saludandoHasta) {
          var ondaSaludo = Math.sin(ahora * 0.018) * 0.38;
          brazoDer.rotation.z += (-1.95 + ondaSaludo - brazoDer.rotation.z) * 0.18;
          brazoDer.rotation.x += (0.35 - brazoDer.rotation.x) * 0.18;
          cejaIzq.position.y = 0.26;
          cejaDer.position.y = 0.26;
        } else {
          brazoDer.rotation.z += (0 - brazoDer.rotation.z) * 0.12;
          brazoDer.rotation.x += (0 - brazoDer.rotation.x) * 0.12;
          brazoIzq.rotation.z = Math.sin(t * 1.6) * 0.05;
          cejaIzq.position.y = 0.23;
          cejaDer.position.y = 0.23;
        }

        controls.update();
        renderer.render(scene, camera);
        actualizarAnotaciones();
      }

      function reanudarSiCorresponde() {
        if (visibleEnPantalla && pestanaActiva && !rafId) {
          reloj.getDelta();
          rafId = requestAnimationFrame(bucle);
        }
      }

      contenedor.classList.add('cili3d--listo');
      if (poster) {
        poster.setAttribute('aria-hidden', 'true');
      }
      reanudarSiCorresponde();

      if ('IntersectionObserver' in window) {
        var obsVis = new IntersectionObserver(function (entradas) {
          entradas.forEach(function (e) {
            visibleEnPantalla = e.isIntersecting;
            reanudarSiCorresponde();
          });
        }, { threshold: 0.05 });
        obsVis.observe(contenedor);
      }

      document.addEventListener('visibilitychange', function () {
        pestanaActiva = !document.hidden;
        reanudarSiCorresponde();
      });

      var ro = null;
      function ajustarTamano() {
        var nw = lienzoWrap.clientWidth || 520;
        var nh = lienzoWrap.clientHeight || 520;
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
        renderer.setSize(nw, nh);
        actualizarAnotaciones();
      }
      if ('ResizeObserver' in window) {
        ro = new ResizeObserver(ajustarTamano);
        ro.observe(lienzoWrap);
      } else {
        window.addEventListener('resize', ajustarTamano);
      }
    }).catch(function () {
      contenedor.classList.add('cili3d--solo-poster');
    });
  }

  function programarCarga() {
    var contenedor = document.getElementById('cili3dEscenario');
    if (!contenedor) return;
    if (debeOmitir3D()) {
      contenedor.classList.add('cili3d--solo-poster');
      return;
    }

    var iniciado = false;
    function lanzar() {
      if (iniciado) return;
      iniciado = true;
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(function () { construirEscena(contenedor); }, { timeout: 1500 });
      } else {
        setTimeout(function () { construirEscena(contenedor); }, 180);
      }
    }

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (e) {
          if (e.isIntersecting) {
            io.disconnect();
            lanzar();
          }
        });
      }, { rootMargin: '600px' });
      io.observe(contenedor);
    } else {
      lanzar();
    }
  }

  if (document.readyState === 'complete') {
    programarCarga();
  } else {
    window.addEventListener('load', programarCarga, { once: true });
  }
})();
