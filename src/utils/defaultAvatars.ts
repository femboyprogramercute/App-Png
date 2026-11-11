/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CharacterPreset } from '../types/vtuber';

function svgToDataUrl(svgString: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString.trim())}`;
}

// 1. Aki - Anime Chibi Streamer
function generateAkiSvg(eyesOpen: boolean, mouthOpen: boolean): string {
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 700" width="600" height="700">
  <defs>
    <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8b5cf6" />
      <stop offset="100%" stop-color="#4f46e5" />
    </linearGradient>
    <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fff1f2" />
      <stop offset="100%" stop-color="#fecdd3" />
    </linearGradient>
    <linearGradient id="hoodieGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1e1b4b" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#09090b" flood-opacity="0.3" />
    </filter>
  </defs>

  <g filter="url(#shadow)">
    <!-- Back Hair -->
    <path d="M180 250 C120 340 100 480 140 550 C170 510 200 450 200 400 Z" fill="#6366f1" />
    <path d="M420 250 C480 340 500 480 460 550 C430 510 400 450 400 400 Z" fill="#6366f1" />

    <!-- Body & Hoodie -->
    <path d="M190 480 C150 510 110 560 100 680 L500 680 C490 560 450 510 410 480 Q300 520 190 480 Z" fill="url(#hoodieGrad)" />
    <!-- Hoodie String & Collar -->
    <path d="M250 490 Q300 530 350 490" fill="none" stroke="#a855f7" stroke-width="8" stroke-linecap="round" />
    <path d="M280 515 L275 600" stroke="#f43f5e" stroke-width="5" stroke-linecap="round" />
    <path d="M320 515 L325 600" stroke="#f43f5e" stroke-width="5" stroke-linecap="round" />

    <!-- Neck -->
    <rect x="270" y="420" width="60" height="70" rx="10" fill="#fecdd3" />

    <!-- Head Base -->
    <ellipse cx="300" cy="330" rx="135" ry="125" fill="url(#skinGrad)" />

    <!-- Blushing cheeks -->
    <ellipse cx="215" cy="365" rx="22" ry="11" fill="#fb7185" opacity="0.45" />
    <ellipse cx="385" cy="365" rx="22" ry="11" fill="#fb7185" opacity="0.45" />

    <!-- Cat Ear Headphones Frame -->
    <path d="M160 300 C150 170 200 110 300 110 C400 110 450 170 440 300" fill="none" stroke="#09090b" stroke-width="26" stroke-linecap="round" />
    <!-- Cat Ears on Headband -->
    <path d="M210 160 L240 70 L280 145 Z" fill="#a855f7" />
    <path d="M390 160 L360 70 L320 145 Z" fill="#a855f7" />
    <path d="M225 150 L245 90 L270 140 Z" fill="#f43f5e" />
    <path d="M375 150 L355 90 L330 140 Z" fill="#f43f5e" />

    <!-- Hair (Front Bangs & Twin Highlights) -->
    <path d="M165 310 C165 190 220 160 300 160 C380 160 435 190 435 310 C410 240 370 225 340 245 C320 225 280 225 260 250 C230 225 190 245 165 310 Z" fill="url(#hairGrad)" />
    <!-- Ahoge / Cowlick strand -->
    <path d="M300 165 Q310 100 340 90 Q320 120 305 165" fill="#a855f7" />

    <!-- Headphone Earcups -->
    <rect x="140" y="270" width="45" height="85" rx="22" fill="#18181b" />
    <rect x="415" y="270" width="45" height="85" rx="22" fill="#18181b" />
    <circle cx="162" cy="312" r="14" fill="#a855f7" />
    <circle cx="438" cy="312" r="14" fill="#a855f7" />

    <!-- Eyebrows -->
    <path d="M210 280 Q240 270 265 285" fill="none" stroke="#4338ca" stroke-width="5" stroke-linecap="round" />
    <path d="M390 280 Q360 270 335 285" fill="none" stroke="#4338ca" stroke-width="5" stroke-linecap="round" />

    <!-- EYES -->
    ${eyesOpen ? `
      <!-- Open Eyes -->
      <g>
        <ellipse cx="240" cy="330" rx="22" ry="28" fill="#1e1b4b" />
        <ellipse cx="360" cy="330" rx="22" ry="28" fill="#1e1b4b" />
        <ellipse cx="240" cy="338" rx="16" ry="16" fill="#818cf8" />
        <ellipse cx="360" cy="338" rx="16" ry="16" fill="#818cf8" />
        <circle cx="233" cy="320" r="9" fill="#ffffff" />
        <circle cx="353" cy="320" r="9" fill="#ffffff" />
        <circle cx="248" cy="342" r="4.5" fill="#ffffff" />
        <circle cx="368" cy="342" r="4.5" fill="#ffffff" />
        <!-- Eyelashes -->
        <path d="M215 315 Q240 300 265 315" fill="none" stroke="#09090b" stroke-width="7" stroke-linecap="round" />
        <path d="M385 315 Q360 300 335 315" fill="none" stroke="#09090b" stroke-width="7" stroke-linecap="round" />
      </g>
    ` : `
      <!-- Closed / Blinking Eyes (Happy anime curves) -->
      <g>
        <path d="M215 330 Q240 355 265 330" fill="none" stroke="#1e1b4b" stroke-width="8" stroke-linecap="round" />
        <path d="M335 330 Q360 355 385 330" fill="none" stroke="#1e1b4b" stroke-width="8" stroke-linecap="round" />
        <path d="M260 326 L270 320" stroke="#1e1b4b" stroke-width="5" stroke-linecap="round" />
        <path d="M340 326 L330 320" stroke="#1e1b4b" stroke-width="5" stroke-linecap="round" />
      </g>
    `}

    <!-- Cute Nose dot -->
    <circle cx="300" cy="355" r="2.5" fill="#f43f5e" />

    <!-- MOUTH -->
    ${mouthOpen ? `
      <!-- Open Talking Mouth -->
      <g>
        <path d="M272 380 Q300 425 328 380 Z" fill="#be123c" stroke="#881337" stroke-width="3" />
        <!-- Tongue -->
        <path d="M282 396 Q300 405 318 396 Q300 424 282 396 Z" fill="#fda4af" />
        <!-- Cute top tooth -->
        <path d="M288 380 L300 380 L294 388 Z" fill="#ffffff" />
      </g>
    ` : `
      <!-- Closed Mouth (Cute gentle smile) -->
      <g>
        <path d="M285 385 Q300 395 315 385" fill="none" stroke="#be123c" stroke-width="4.5" stroke-linecap="round" />
      </g>
    `}

    <!-- Microphone headset boom -->
    <path d="M150 330 Q160 410 250 410" fill="none" stroke="#334155" stroke-width="8" stroke-linecap="round" />
    <rect x="245" y="398" width="26" height="22" rx="7" fill="#10b981" stroke="#047857" stroke-width="2" />
    <circle cx="258" cy="409" r="3" fill="#6ee7b7" />
  </g>
</svg>
`;
}

// 2. Neko - Gamer Kitten Chibi
function generateNekoSvg(eyesOpen: boolean, mouthOpen: boolean): string {
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 700" width="600" height="700">
  <defs>
    <radialGradient id="catFur" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="85%" stop-color="#ffedd5" />
      <stop offset="100%" stop-color="#fed7aa" />
    </radialGradient>
    <filter id="shadowNeko">
      <feDropShadow dx="0" dy="6" stdDeviation="5" flood-color="#451a03" flood-opacity="0.25" />
    </filter>
  </defs>

  <g filter="url(#shadowNeko)">
    <!-- Cat Ears -->
    <path d="M170 230 L160 90 L270 170 Z" fill="#fb923c" />
    <path d="M430 230 L440 90 L330 170 Z" fill="#fb923c" />
    <!-- Inner Ears -->
    <path d="M185 200 L178 120 L245 170 Z" fill="#f472b6" />
    <path d="M415 200 L422 120 L355 170 Z" fill="#f472b6" />

    <!-- Cat Body & Sweater -->
    <ellipse cx="300" cy="560" rx="160" ry="120" fill="#38bdf8" />
    <path d="M220 480 Q300 520 380 480" fill="none" stroke="#0284c7" stroke-width="12" stroke-linecap="round" />
    <!-- Little Paws resting -->
    <ellipse cx="230" cy="540" rx="35" ry="25" fill="#ffffff" stroke="#fed7aa" stroke-width="3" />
    <ellipse cx="370" cy="540" rx="35" ry="25" fill="#ffffff" stroke="#fed7aa" stroke-width="3" />

    <!-- Cat Head -->
    <ellipse cx="300" cy="300" rx="160" ry="135" fill="url(#catFur)" />

    <!-- Ginger Patch on one side of face -->
    <path d="M360 175 Q460 210 455 310 Q400 320 360 260 Z" fill="#fb923c" opacity="0.85" />

    <!-- Headphone Gamer Arc -->
    <path d="M135 290 C125 140 180 80 300 80 C420 80 475 140 465 290" fill="none" stroke="#3b82f6" stroke-width="20" stroke-linecap="round" />
    <rect x="110" y="255" width="40" height="75" rx="20" fill="#0284c7" />
    <rect x="450" y="255" width="40" height="75" rx="20" fill="#0284c7" />

    <!-- Whiskers -->
    <line x1="160" y1="320" x2="220" y2="330" stroke="#78350f" stroke-width="4" stroke-linecap="round" />
    <line x1="150" y1="345" x2="220" y2="345" stroke="#78350f" stroke-width="4" stroke-linecap="round" />
    <line x1="440" y1="320" x2="380" y2="330" stroke="#78350f" stroke-width="4" stroke-linecap="round" />
    <line x1="450" y1="345" x2="380" y2="345" stroke="#78350f" stroke-width="4" stroke-linecap="round" />

    <!-- Cheeks Blush -->
    <ellipse cx="210" cy="350" rx="20" ry="12" fill="#fb7185" opacity="0.4" />
    <ellipse cx="390" cy="350" rx="20" ry="12" fill="#fb7185" opacity="0.4" />

    <!-- EYES -->
    ${eyesOpen ? `
      <!-- Open Big Green Emerald Eyes -->
      <g>
        <ellipse cx="235" cy="290" rx="25" ry="32" fill="#15803d" />
        <ellipse cx="365" cy="290" rx="25" ry="32" fill="#15803d" />
        <ellipse cx="235" cy="295" rx="16" ry="24" fill="#4ade80" />
        <ellipse cx="365" cy="295" rx="16" ry="24" fill="#4ade80" />
        <circle cx="227" cy="278" r="9" fill="#ffffff" />
        <circle cx="357" cy="278" r="9" fill="#ffffff" />
        <circle cx="245" cy="305" r="4" fill="#ffffff" />
        <circle cx="375" cy="305" r="4" fill="#ffffff" />
      </g>
    ` : `
      <!-- Blinking Curved Eyes (Cute >w< or ^w^) -->
      <g>
        <path d="M210 290 Q235 265 260 290" fill="none" stroke="#78350f" stroke-width="8" stroke-linecap="round" />
        <path d="M340 290 Q365 265 390 290" fill="none" stroke="#78350f" stroke-width="8" stroke-linecap="round" />
      </g>
    `}

    <!-- Little Pink Triangle Nose -->
    <path d="M293 325 L307 325 L300 334 Z" fill="#f43f5e" />

    <!-- MOUTH -->
    ${mouthOpen ? `
      <!-- Open Cat Mouth :D -->
      <g>
        <path d="M280 340 Q300 375 320 340 Z" fill="#e11d48" stroke="#be123c" stroke-width="3" />
        <ellipse cx="300" cy="360" rx="12" ry="6" fill="#fbcfe8" />
        <!-- Mini cat fang -->
        <path d="M286 340 L293 346 L290 340 Z" fill="#ffffff" />
        <path d="M314 340 L307 346 L310 340 Z" fill="#ffffff" />
      </g>
    ` : `
      <!-- Closed Cat Mouth :3 -->
      <g>
        <path d="M285 338 Q292 348 300 339 Q308 348 315 338" fill="none" stroke="#78350f" stroke-width="4.5" stroke-linecap="round" />
      </g>
    `}
  </g>
</svg>
`;
}

// 3. RoboPixel - Cyber Mascot
function generateRoboSvg(eyesOpen: boolean, mouthOpen: boolean): string {
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 700" width="600" height="700">
  <defs>
    <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#334155" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <filter id="neonGlow">
      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Antenna -->
  <line x1="300" y1="180" x2="300" y2="100" stroke="#06b6d4" stroke-width="8" stroke-linecap="round" />
  <circle cx="300" cy="90" r="18" fill="#06b6d4" filter="url(#neonGlow)" />

  <!-- Robot Body -->
  <rect x="200" y="470" width="200" height="180" rx="30" fill="url(#metalGrad)" stroke="#1e293b" stroke-width="6" />
  <!-- Chest Meter -->
  <rect x="240" y="520" width="120" height="40" rx="10" fill="#020617" />
  <line x1="255" y1="540" x2="275" y2="540" stroke="#10b981" stroke-width="6" stroke-linecap="round" filter="url(#neonGlow)" />
  <line x1="285" y1="540" x2="305" y2="540" stroke="#06b6d4" stroke-width="6" stroke-linecap="round" filter="url(#neonGlow)" />
  <line x1="315" y1="540" x2="345" y2="540" stroke="#f43f5e" stroke-width="6" stroke-linecap="round" filter="url(#neonGlow)" />

  <!-- Robot Head Case -->
  <rect x="150" y="170" width="300" height="260" rx="45" fill="url(#metalGrad)" stroke="#475569" stroke-width="8" />

  <!-- Screen Monitor Bezel & Glass -->
  <rect x="180" y="200" width="240" height="200" rx="25" fill="#020617" stroke="#0ea5e9" stroke-width="3" />
  
  <!-- CRT scanlines subtle effect -->
  <line x1="190" y1="230" x2="410" y2="230" stroke="#0369a1" stroke-width="1" opacity="0.3" />
  <line x1="190" y1="260" x2="410" y2="260" stroke="#0369a1" stroke-width="1" opacity="0.3" />
  <line x1="190" y1="290" x2="410" y2="290" stroke="#0369a1" stroke-width="1" opacity="0.3" />
  <line x1="190" y1="320" x2="410" y2="320" stroke="#0369a1" stroke-width="1" opacity="0.3" />
  <line x1="190" y1="350" x2="410" y2="350" stroke="#0369a1" stroke-width="1" opacity="0.3" />

  <!-- Head bolts -->
  <circle cx="165" cy="300" r="10" fill="#64748b" />
  <circle cx="435" cy="300" r="10" fill="#64748b" />

  <!-- EYES -->
  ${eyesOpen ? `
    <!-- Bright Cyber Matrix Eyes -->
    <g filter="url(#neonGlow)">
      <circle cx="240" cy="270" r="24" fill="#06b6d4" />
      <circle cx="360" cy="270" r="24" fill="#06b6d4" />
      <rect x="232" y="262" width="16" height="16" fill="#ffffff" rx="3" />
      <rect x="352" y="262" width="16" height="16" fill="#ffffff" rx="3" />
    </g>
  ` : `
    <!-- Blinking / Sleeping Screen Lines -->
    <g filter="url(#neonGlow)">
      <line x1="215" y1="270" x2="265" y2="270" stroke="#06b6d4" stroke-width="10" stroke-linecap="round" />
      <line x1="335" y1="270" x2="385" y2="270" stroke="#06b6d4" stroke-width="10" stroke-linecap="round" />
    </g>
  `}

  <!-- MOUTH -->
  ${mouthOpen ? `
    <!-- Speaking Audio Visualizer Waveform Mouth -->
    <g filter="url(#neonGlow)">
      <rect x="250" y="340" width="12" height="36" rx="6" fill="#10b981" />
      <rect x="270" y="330" width="12" height="56" rx="6" fill="#10b981" />
      <rect x="290" y="325" width="20" height="66" rx="6" fill="#34d399" />
      <rect x="318" y="330" width="12" height="56" rx="6" fill="#10b981" />
      <rect x="338" y="340" width="12" height="36" rx="6" fill="#10b981" />
    </g>
  ` : `
    <!-- Idle Flat LED Mouth Line -->
    <g filter="url(#neonGlow)">
      <line x1="260" y1="360" x2="340" y2="360" stroke="#10b981" stroke-width="8" stroke-linecap="round" />
    </g>
  `}
</svg>
`;
}

export const PRESET_AVATARS: CharacterPreset[] = [
  {
    id: 'aki',
    name: 'Aki Streamer',
    description: 'Chibi Anime VTuber con auriculares y expresión carismática',
    slots: {
      idle: svgToDataUrl(generateAkiSvg(true, false)),
      talk: svgToDataUrl(generateAkiSvg(true, true)),
      blinkIdle: svgToDataUrl(generateAkiSvg(false, false)),
      blinkTalk: svgToDataUrl(generateAkiSvg(false, true)),
    },
  },
  {
    id: 'neko',
    name: 'Neko Gamer',
    description: 'Gatito gamer tierno con orejas de gato y ojos esmeralda',
    slots: {
      idle: svgToDataUrl(generateNekoSvg(true, false)),
      talk: svgToDataUrl(generateNekoSvg(true, true)),
      blinkIdle: svgToDataUrl(generateNekoSvg(false, false)),
      blinkTalk: svgToDataUrl(generateNekoSvg(false, true)),
    },
  },
  {
    id: 'robo',
    name: 'Cyber Bot 3000',
    description: 'Mascota robótica con pantalla LED y ecualizador de voz',
    slots: {
      idle: svgToDataUrl(generateRoboSvg(true, false)),
      talk: svgToDataUrl(generateRoboSvg(true, true)),
      blinkIdle: svgToDataUrl(generateRoboSvg(false, false)),
      blinkTalk: svgToDataUrl(generateRoboSvg(false, true)),
    },
  },
];
