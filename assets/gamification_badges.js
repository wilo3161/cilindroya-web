// static/assets/gamification_badges.js
// Insignias SVG con texturas metálicas y Modal de Celebración de Rango Oficial

window.GAMIFICATION_BADGES = {
  "Principiante": `
    <svg viewBox="0 0 64 64" width="48" height="48" class="inline-block drop-shadow-md">
      <defs>
        <!-- Textura de carboncillo / líneas diagonales -->
        <pattern id="charcoalPattern" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="#81C784" stroke-width="1.5" />
        </pattern>
        <radialGradient id="greenBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#C8E6C9" />
          <stop offset="100%" stop-color="#A5D6A7" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="28" fill="url(#greenBg)" stroke="#2E7D32" stroke-width="3"/>
      <circle cx="32" cy="32" r="26" fill="url(#charcoalPattern)" opacity="0.45"/>
      <!-- Llama verde oscura -->
      <path d="M 32 14 C 32 14, 44 26, 44 38 C 44 45, 38.5 50, 32 50 C 25.5 50, 20 45, 20 38 C 20 26, 32 14, 32 14 Z" fill="#2E7D32"/>
      <path d="M 32 24 C 32 24, 38 32, 38 40 C 38 43, 35.5 46, 32 46 C 28.5 46, 26 43, 26 40 C 26 32, 32 24, 32 24 Z" fill="#E8F5E9"/>
    </svg>
  `,
  
  "Confiable": `
    <svg viewBox="0 0 64 64" width="48" height="48" class="inline-block drop-shadow-lg">
      <defs>
        <!-- Gradiente Metálico Plateado -->
        <linearGradient id="silverPlateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFFFFF" />
          <stop offset="25%" stop-color="#E0E0E0" />
          <stop offset="50%" stop-color="#9E9E9E" />
          <stop offset="75%" stop-color="#E0E0E0" />
          <stop offset="100%" stop-color="#757575" />
        </linearGradient>
        <linearGradient id="silverBorder" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#BDBDBD" />
          <stop offset="100%" stop-color="#424242" />
        </linearGradient>
      </defs>
      <!-- Escudo con textura metálica plateada -->
      <path d="M 32 6 L 54 15 C 54 38, 45 52, 32 60 C 19 52, 10 38, 10 15 Z" fill="url(#silverPlateGrad)" stroke="url(#silverBorder)" stroke-width="3"/>
      <!-- Estrella central dorada/ámbar -->
      <polygon points="32,18 36,27 46,28 38.5,35 41,45 32,39.5 23,45 25.5,35 18,28 28,27" fill="#FFC107" stroke="#FF8F00" stroke-width="1.5"/>
    </svg>
  `,

  "Experto": `
    <svg viewBox="0 0 64 64" width="48" height="48" class="inline-block drop-shadow-xl">
      <defs>
        <!-- Gradiente Textura Bronce -->
        <linearGradient id="bronzeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#E6A15C" />
          <stop offset="35%" stop-color="#CD7F32" />
          <stop offset="70%" stop-color="#8B4513" />
          <stop offset="100%" stop-color="#CD7F32" />
        </linearGradient>
        <linearGradient id="goldBoltGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#FFF9C4" />
          <stop offset="50%" stop-color="#FFD700" />
          <stop offset="100%" stop-color="#FF8F00" />
        </linearGradient>
      </defs>
      <!-- Hexágono de Bronce -->
      <polygon points="32,4 56,17 56,47 32,60 8,47 8,17" fill="url(#bronzeGrad)" stroke="#5D2E0C" stroke-width="3" stroke-linejoin="round"/>
      <!-- Rayo Dorado Brillante -->
      <polygon points="35,12 21,34 32,34 29,52 45,28 34,28" fill="url(#goldBoltGrad)" stroke="#E65100" stroke-width="1.5" stroke-linejoin="round"/>
    </svg>
  `,

  "Leyenda": `
    <svg viewBox="0 0 64 64" width="48" height="48" class="inline-block drop-shadow-2xl animate-pulse">
      <defs>
        <!-- Textura Dorada Brillante -->
        <linearGradient id="goldShineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFFDE7" />
          <stop offset="25%" stop-color="#FFD700" />
          <stop offset="50%" stop-color="#FFA000" />
          <stop offset="75%" stop-color="#FFD700" />
          <stop offset="100%" stop-color="#FF8F00" />
        </linearGradient>
        <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <!-- Alas estilizadas doradas -->
      <path d="M 4 36 C 14 24, 24 28, 32 40 C 40 28, 50 24, 60 36 C 48 48, 32 58, 32 58 C 32 58, 16 48, 4 36 Z" fill="url(#goldShineGrad)" stroke="#BF360C" stroke-width="2" filter="url(#goldGlow)"/>
      <!-- Corona Suprema -->
      <path d="M 16 38 L 12 18 L 24 26 L 32 10 L 40 26 L 52 18 L 48 38 Z" fill="url(#goldShineGrad)" stroke="#E65100" stroke-width="2.5" stroke-linejoin="round"/>
      <!-- Gemas -->
      <circle cx="32" cy="11" r="3" fill="#D50000" stroke="#FFF" stroke-width="0.8"/>
      <circle cx="13" cy="19" r="2.5" fill="#00E5FF" stroke="#FFF" stroke-width="0.6"/>
      <circle cx="51" cy="19" r="2.5" fill="#00E5FF" stroke="#FFF" stroke-width="0.6"/>
    </svg>
  `
};

function getBadgeHtml(badgeName) {
  for (let key of Object.keys(window.GAMIFICATION_BADGES)) {
    if (badgeName && badgeName.toLowerCase().includes(key.toLowerCase())) {
      return window.GAMIFICATION_BADGES[key];
    }
  }
  return window.GAMIFICATION_BADGES["Principiante"];
}

// ── Modal de Celebración de Subida de Rango con Confetti ───────────────────
function triggerRankUpCelebration(badgeName, newLevel, points) {
  let modal = document.getElementById('rankUpModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'rankUpModal';
    modal.className = 'fixed inset-0 bg-black/85 backdrop-blur-lg z-50 flex items-center justify-center p-4';
    modal.innerHTML = `
      <div class="bg-[#1A2028] border-2 border-amber-400/80 w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl space-y-5 animate-in zoom-in-50 duration-500">
        <span class="text-xs font-black uppercase tracking-widest text-amber-400">¡NIVEL DESBLOQUEADO!</span>
        <div id="rankUpBadgeContainer" class="flex justify-center scale-150 py-4"></div>
        <h2 id="rankUpTitleText" class="rank-up-title leading-tight">¡Has subido a ${badgeName}!</h2>
        <p class="text-xs text-slate-300 font-medium">Acumulas <strong id="rankUpPointsVal" class="text-emerald-400 font-black">${points} Pts</strong> • Tu posición en el ranking de Ibarra ha mejorado.</p>
        <button onclick="document.getElementById('rankUpModal').remove()" class="w-full h-14 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-base rounded-2xl shadow-xl shadow-amber-500/30 transition active:scale-95">
          CONTINUAR REPARTO ➔
        </button>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const container = document.getElementById('rankUpBadgeContainer');
  if (container) container.innerHTML = getBadgeHtml(badgeName);

  // Confetti cyan, verde, blanco y dorado
  if (window.confetti) {
    const end = Date.now() + 2000;
    const colors = ['#00a6f4', '#00e676', '#ffffff', '#ffd700'];
    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  }
}
