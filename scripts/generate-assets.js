import fs from 'fs';
import path from 'path';

const clothesDir = path.resolve('public/clothes');
const modelsDir = path.resolve('public/models');

if (!fs.existsSync(clothesDir)) fs.mkdirSync(clothesDir, { recursive: true });
if (!fs.existsSync(modelsDir)) fs.mkdirSync(modelsDir, { recursive: true });

// 1. Onyx Minimalist Crewneck
const onyxTee = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 900" width="100%" height="100%">
  <defs>
    <linearGradient id="onyxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e2025" />
      <stop offset="45%" stop-color="#141518" />
      <stop offset="100%" stop-color="#0a0a0c" />
    </linearGradient>
    <linearGradient id="onyxShadow" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2a2c33" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#07080a" stop-opacity="0.9"/>
    </linearGradient>
    <linearGradient id="onyxHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.04"/>
      <stop offset="50%" stop-color="#ffffff" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.2"/>
    </linearGradient>
    <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- Shadow drop -->
  <g filter="url(#softShadow)">
    <!-- Base Shirt Silhouette -->
    <!-- Left Sleeve, Torso, Right Sleeve -->
    <path d="
      M 320 120
      C 350 148, 450 148, 480 120
      C 540 135, 620 170, 710 230
      C 690 280, 670 340, 645 375
      C 600 345, 575 320, 560 305
      L 560 820
      C 560 835, 545 845, 530 845
      L 270 845
      C 255 845, 240 835, 240 820
      L 240 305
      C 225 320, 200 345, 155 375
      C 130 340, 110 280, 90 230
      C 180 170, 260 135, 320 120
      Z"
      fill="url(#onyxGrad)"
      stroke="#2c2d33"
      stroke-width="2"
    />
  </g>

  <!-- Fabric Lighting and Highlights -->
  <path d="
    M 320 120
    C 350 148, 450 148, 480 120
    C 540 135, 620 170, 710 230
    C 690 280, 670 340, 645 375
    C 600 345, 575 320, 560 305
    L 560 820
    L 240 820
    L 240 305
    C 225 320, 200 345, 155 375
    C 130 340, 110 280, 90 230
    C 180 170, 260 135, 320 120
    Z"
    fill="url(#onyxHighlight)"
  />

  <!-- Armpit and Side Folds -->
  <path d="M 240 305 C 260 360, 265 440, 255 520" stroke="#08080a" stroke-width="4" fill="none" opacity="0.6"/>
  <path d="M 560 305 C 540 360, 535 440, 545 520" stroke="#08080a" stroke-width="4" fill="none" opacity="0.6"/>
  <!-- Chest Drape Folds -->
  <path d="M 330 220 C 370 270, 430 270, 470 220" stroke="#25272e" stroke-width="2.5" fill="none" opacity="0.4"/>
  <path d="M 350 320 C 385 360, 415 360, 450 320" stroke="#08080a" stroke-width="2.5" fill="none" opacity="0.5"/>

  <!-- Left Sleeve Seam -->
  <path d="M 240 305 C 235 250, 230 190, 230 150" stroke="#0a0b0d" stroke-width="3" fill="none"/>
  <path d="M 241 305 C 236 250, 231 190, 231 150" stroke="#353740" stroke-width="1.2" fill="none" opacity="0.6"/>

  <!-- Right Sleeve Seam -->
  <path d="M 560 305 C 565 250, 570 190, 570 150" stroke="#0a0b0d" stroke-width="3" fill="none"/>
  <path d="M 559 305 C 564 250, 569 190, 569 150" stroke="#353740" stroke-width="1.2" fill="none" opacity="0.6"/>

  <!-- Sleeve Cuffs -->
  <path d="M 90 230 L 155 375" stroke="#2c2e36" stroke-width="5" stroke-dasharray="6,4" fill="none"/>
  <path d="M 710 230 L 645 375" stroke="#2c2e36" stroke-width="5" stroke-dasharray="6,4" fill="none"/>

  <!-- Ribbed Crewneck Collar -->
  <path d="M 320 120 C 350 162, 450 162, 480 120 C 460 102, 340 102, 320 120 Z" fill="#1b1c20" stroke="#383b44" stroke-width="2"/>
  <path d="M 330 126 C 360 158, 440 158, 470 126" stroke="#484b57" stroke-width="1.5" stroke-dasharray="3,3" fill="none"/>

  <!-- Inner Collar Cavity (Transparent cutout for natural neck showthrough) -->
  <path d="M 332 118 C 360 148, 440 148, 468 118 C 445 106, 355 106, 332 118 Z" fill="#08080a" opacity="0.95"/>

  <!-- Minimalist Atelier Brand Logo on Chest -->
  <g transform="translate(370, 270)">
    <rect x="-10" y="-8" width="80" height="20" rx="3" fill="#1d1e23" stroke="#3d404d" stroke-width="0.8"/>
    <text x="30" y="6" font-family="'Plus Jakarta Sans', -apple-system, sans-serif" font-size="8" font-weight="700" fill="#d1d5db" text-anchor="middle" letter-spacing="2.5">ATELIER 01</text>
  </g>

  <!-- Bottom Hem Stitching -->
  <line x1="240" y1="835" x2="560" y2="835" stroke="#2a2c33" stroke-width="2" stroke-dasharray="5,4"/>
</svg>`;

// 2. Aura Silk Cuban Collar Resort Shirt
const auraSilk = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 900" width="100%" height="100%">
  <defs>
    <linearGradient id="silkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fdfbf7" />
      <stop offset="35%" stop-color="#f3ede3" />
      <stop offset="70%" stop-color="#e8decb" />
      <stop offset="100%" stop-color="#ded0bb" />
    </linearGradient>
    <linearGradient id="silkSheen" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.6"/>
      <stop offset="30%" stop-color="#f8f4eb" stop-opacity="0.1"/>
      <stop offset="60%" stop-color="#ffffff" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#ab997e" stop-opacity="0.3"/>
    </linearGradient>
    <filter id="silkShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#3a2f20" flood-opacity="0.25"/>
    </filter>
  </defs>

  <g filter="url(#silkShadow)">
    <!-- Base Shirt Shape -->
    <path d="
      M 310 125
      C 340 145, 460 145, 490 125
      C 555 140, 635 175, 725 240
      C 705 295, 680 350, 650 385
      C 605 350, 580 325, 565 305
      L 565 830
      C 565 845, 550 855, 535 855
      L 265 855
      C 250 855, 235 845, 235 830
      L 235 305
      C 220 325, 195 350, 150 385
      C 120 350,  95 295,  75 240
      C 165 175, 245 140, 310 125
      Z"
      fill="url(#silkGrad)"
      stroke="#c8bba8"
      stroke-width="1.8"
    />
  </g>

  <!-- Luminous Sheen Layer -->
  <path d="
    M 310 125
    C 340 145, 460 145, 490 125
    C 555 140, 635 175, 725 240
    C 705 295, 680 350, 650 385
    C 605 350, 580 325, 565 305
    L 565 830
    L 235 830
    L 235 305
    C 220 325, 195 350, 150 385
    C 120 350,  95 295,  75 240
    C 165 175, 245 140, 310 125
    Z"
    fill="url(#silkSheen)"
  />

  <!-- Center Placket Strip -->
  <path d="M 388 245 L 388 855 L 412 855 L 412 245 Z" fill="#ebe1d0" stroke="#d5c7b3" stroke-width="1"/>
  <line x1="400" y1="245" x2="400" y2="855" stroke="#bfaa92" stroke-width="1.2" stroke-dasharray="6,4"/>

  <!-- Mother of Pearl Buttons -->
  <g fill="#fffbf5" stroke="#a38f75" stroke-width="1.2">
    <circle cx="400" cy="300" r="6" />
    <circle cx="400" cy="390" r="6" />
    <circle cx="400" cy="480" r="6" />
    <circle cx="400" cy="570" r="6" />
    <circle cx="400" cy="660" r="6" />
    <circle cx="400" cy="750" r="6" />
  </g>
  <!-- Button thread dots -->
  <g fill="#8f7a60">
    <circle cx="398" cy="299" r="1"/><circle cx="402" cy="301" r="1"/>
    <circle cx="398" cy="389" r="1"/><circle cx="402" cy="391" r="1"/>
    <circle cx="398" cy="479" r="1"/><circle cx="402" cy="481" r="1"/>
    <circle cx="398" cy="569" r="1"/><circle cx="402" cy="571" r="1"/>
    <circle cx="398" cy="659" r="1"/><circle cx="402" cy="661" r="1"/>
    <circle cx="398" cy="749" r="1"/><circle cx="402" cy="751" r="1"/>
  </g>

  <!-- Fluid Draped Folds -->
  <path d="M 285 240 C 310 380, 290 560, 310 740" stroke="#bead98" stroke-width="3" fill="none" opacity="0.45"/>
  <path d="M 515 240 C 490 380, 510 560, 490 740" stroke="#bead98" stroke-width="3" fill="none" opacity="0.45"/>
  <path d="M 330 380 C 365 420, 380 460, 360 540" stroke="#d5c5b2" stroke-width="2" fill="none" opacity="0.5"/>

  <!-- Cuban Camp Collar Lapels (Left and Right Wings) -->
  <!-- Left Collar Wing -->
  <path d="M 305 125 L 360 250 L 400 245 L 350 140 Z" fill="#f8f4ec" stroke="#baaa96" stroke-width="1.8" filter="url(#silkShadow)"/>
  <!-- Right Collar Wing -->
  <path d="M 495 125 L 440 250 L 400 245 L 450 140 Z" fill="#efe6d8" stroke="#baaa96" stroke-width="1.8" filter="url(#silkShadow)"/>
  <!-- Back of Neck Band -->
  <path d="M 350 140 C 380 152, 420 152, 450 140 C 440 120, 360 120, 350 140 Z" fill="#ded2bf" stroke="#c0b09b" stroke-width="1.2"/>

  <!-- Chest Patch Pocket (Left side) -->
  <path d="M 275 320 L 335 320 L 335 390 C 335 405, 315 415, 305 415 C 295 415, 275 405, 275 390 Z" fill="#f9f5ed" stroke="#cfc1af" stroke-width="1.5" opacity="0.85"/>
  <line x1="275" y1="332" x2="335" y2="332" stroke="#c2b19d" stroke-width="1" stroke-dasharray="3,3"/>
</svg>`;

// 3. Cyberpunk Graphic Neon Streetwear Tee
const cyberTee = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 900" width="100%" height="100%">
  <defs>
    <linearGradient id="cyberBase" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#121318" />
      <stop offset="50%" stop-color="#0b0c10" />
      <stop offset="100%" stop-color="#050608" />
    </linearGradient>
    <linearGradient id="neonGlow" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#00f3ff" />
      <stop offset="50%" stop-color="#ff007f" />
      <stop offset="100%" stop-color="#ffe600" />
    </linearGradient>
    <linearGradient id="metalChrome" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="25%" stop-color="#8a9ba8"/>
      <stop offset="50%" stop-color="#1b232a"/>
      <stop offset="75%" stop-color="#e0e8f0"/>
      <stop offset="100%" stop-color="#3a4b58"/>
    </linearGradient>
    <filter id="neonBlur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Shirt Outline -->
  <path d="
    M 315 115
    C 345 145, 455 145, 485 115
    C 550 135, 635 170, 725 235
    C 705 290, 680 350, 655 385
    C 610 350, 585 325, 570 305
    L 570 830
    C 570 845, 555 855, 540 855
    L 260 855
    C 245 855, 230 845, 230 830
    L 230 305
    C 215 325, 190 350, 145 385
    C 120 350,  95 290,  75 235
    C 165 170, 250 135, 315 115
    Z"
    fill="url(#cyberBase)"
    stroke="#1f242e"
    stroke-width="2"
  />

  <!-- Futuristic Tactical Seam Lines -->
  <path d="M 230 305 L 340 230 L 460 230 L 570 305" stroke="#00f3ff" stroke-width="1.5" opacity="0.4" stroke-dasharray="4,6"/>
  <line x1="280" y1="830" x2="280" y2="350" stroke="#252936" stroke-width="1.5"/>
  <line x1="520" y1="830" x2="520" y2="350" stroke="#252936" stroke-width="1.5"/>

  <!-- Neon Graphic Artwork on Chest -->
  <g transform="translate(400, 380)">
    <!-- Glowing background aura -->
    <rect x="-140" y="-100" width="280" height="200" rx="8" fill="#090a10" stroke="#1f2330" stroke-width="1.5"/>
    <rect x="-135" y="-95" width="270" height="190" rx="6" fill="none" stroke="url(#neonGlow)" stroke-width="2" filter="url(#neonBlur)" opacity="0.85"/>

    <!-- Chrome Typographic emblem -->
    <text x="0" y="-45" font-family="'Orbitron', 'Plus Jakarta Sans', monospace" font-size="24" font-weight="900" fill="url(#metalChrome)" text-anchor="middle" letter-spacing="6">NEO // MATRIX</text>
    <text x="0" y="-20" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="700" fill="#00f3ff" text-anchor="middle" letter-spacing="8">サイバーパンク 2088</text>

    <!-- Center Cyber Geometric Core -->
    <polygon points="0,-10 40,25 -40,25" fill="none" stroke="#ff007f" stroke-width="2.5" filter="url(#neonBlur)"/>
    <circle cx="0" cy="15" r="8" fill="#ffe600"/>
    <circle cx="0" cy="15" r="18" fill="none" stroke="#00f3ff" stroke-width="1.5" stroke-dasharray="4,3"/>

    <!-- Barcode & Subtext -->
    <g transform="translate(0, 55)" stroke="#00f3ff" stroke-width="2" opacity="0.8">
      <line x1="-80" y1="0" x2="-80" y2="20"/>
      <line x1="-75" y1="0" x2="-75" y2="20" stroke-width="4"/>
      <line x1="-66" y1="0" x2="-66" y2="20"/>
      <line x1="-60" y1="0" x2="-60" y2="20" stroke-width="3"/>
      <line x1="-50" y1="0" x2="-50" y2="20"/>
      <line x1="-42" y1="0" x2="-42" y2="20" stroke-width="5"/>
      <line x1="-30" y1="0" x2="-30" y2="20"/>
    </g>
    <text x="35" y="68" font-family="monospace" font-size="9" fill="#a0aec0" letter-spacing="1">VER. 4.9.0-AR</text>
  </g>

  <!-- Ribbed Collar -->
  <path d="M 315 115 C 345 155, 455 155, 485 115 C 465 98, 335 98, 315 115 Z" fill="#181a22" stroke="#00f3ff" stroke-width="1.2" opacity="0.9"/>
  <path d="M 325 115 C 350 145, 450 145, 475 115 C 455 105, 345 105, 325 115 Z" fill="#050608"/>
</svg>`;

// 4. Saint-Germain Breton Striped Linen Shirt
const bretonShirt = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 900" width="100%" height="100%">
  <defs>
    <linearGradient id="linenBase" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#faf8f5" />
      <stop offset="100%" stop-color="#ede8e1" />
    </linearGradient>
    <pattern id="bretonPattern" width="100" height="42" patternUnits="userSpaceOnUse">
      <rect width="100" height="26" fill="#faf8f5"/>
      <rect y="26" width="100" height="16" fill="#162947"/>
    </pattern>
    <filter id="linenShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#111c2e" flood-opacity="0.3"/>
    </filter>
  </defs>

  <g filter="url(#linenShadow)">
    <!-- Base Shirt Shape with Pattern -->
    <path d="
      M 315 125
      C 345 150, 455 150, 485 125
      C 550 140, 630 175, 720 235
      C 700 290, 675 345, 650 380
      C 605 345, 580 320, 565 300
      L 565 830
      C 565 845, 550 855, 535 855
      L 265 855
      C 250 855, 235 845, 235 830
      L 235 300
      C 220 320, 195 345, 150 380
      C 125 345, 100 290,  80 235
      C 170 175, 250 140, 315 125
      Z"
      fill="url(#bretonPattern)"
      stroke="#162947"
      stroke-width="1.8"
    />
  </g>

  <!-- Left/Right Sleeve seams -->
  <path d="M 235 300 C 230 245, 225 185, 225 145" stroke="#101e33" stroke-width="2.5" fill="none"/>
  <path d="M 565 300 C 570 245, 575 185, 575 145" stroke="#101e33" stroke-width="2.5" fill="none"/>

  <!-- Fold & Shadow shading -->
  <path d="M 235 300 C 255 350, 260 450, 250 550" stroke="#000000" stroke-width="3" fill="none" opacity="0.2"/>
  <path d="M 565 300 C 545 350, 540 450, 550 550" stroke="#000000" stroke-width="3" fill="none" opacity="0.2"/>

  <!-- Chest Patch Pocket with contrasting rotated pattern or solid accent -->
  <g transform="translate(285, 330)">
    <path d="M 0 0 L 70 0 L 70 80 C 70 95, 45 105, 35 105 C 25 105, 0 95, 0 80 Z" fill="#faf8f5" stroke="#162947" stroke-width="2"/>
    <line x1="0" y1="35" x2="70" y2="35" stroke="#162947" stroke-width="14"/>
    <line x1="0" y1="75" x2="70" y2="75" stroke="#162947" stroke-width="14"/>
    <circle cx="35" cy="18" r="4" fill="#d97706" />
  </g>

  <!-- Spread Camp Collar -->
  <path d="M 315 125 L 365 240 L 400 235 L 355 142 Z" fill="#faf8f5" stroke="#162947" stroke-width="2"/>
  <path d="M 485 125 L 435 240 L 400 235 L 445 142 Z" fill="#eae4db" stroke="#162947" stroke-width="2"/>
  <path d="M 355 142 C 375 152, 425 152, 445 142 C 435 125, 365 125, 355 142 Z" fill="#162947"/>

  <!-- Bottom Hem -->
  <line x1="235" y1="840" x2="565" y2="840" stroke="#162947" stroke-width="3"/>
</svg>`;

// 5. Milano Tailored Raw Indigo Denim Overshirt
const denimShirt = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 900" width="100%" height="100%">
  <defs>
    <linearGradient id="denimBase" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#304e75" />
      <stop offset="40%" stop-color="#243c5a" />
      <stop offset="100%" stop-color="#18273b" />
    </linearGradient>
    <linearGradient id="denimWash" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#557da8" stop-opacity="0.3"/>
      <stop offset="40%" stop-color="#ffffff" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#0a121c" stop-opacity="0.4"/>
    </linearGradient>
    <filter id="denimShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#0b131e" flood-opacity="0.45"/>
    </filter>
  </defs>

  <g filter="url(#denimShadow)">
    <path d="
      M 310 120
      C 340 145, 460 145, 490 120
      C 555 138, 635 172, 725 235
      C 705 290, 680 345, 650 380
      C 605 345, 580 320, 565 300
      L 565 835
      C 565 850, 550 860, 535 860
      L 265 860
      C 250 860, 235 850, 235 835
      L 235 300
      C 220 320, 195 345, 150 380
      C 120 345,  95 290,  75 235
      C 165 172, 245 138, 310 120
      Z"
      fill="url(#denimBase)"
      stroke="#172436"
      stroke-width="2"
    />
  </g>

  <!-- Faded Wash Overlay -->
  <path d="
    M 310 120
    C 340 145, 460 145, 490 120
    C 555 138, 635 172, 725 235
    C 705 290, 680 345, 650 380
    C 605 345, 580 320, 565 300
    L 565 835
    L 235 835
    L 235 300
    C 220 320, 195 345, 150 380
    C 120 345,  95 290,  75 235
    C 165 172, 245 138, 310 120
    Z"
    fill="url(#denimWash)"
  />

  <!-- Golden-Ochre Western Yoke Stitching -->
  <path d="M 235 240 C 310 270, 370 230, 400 245 C 430 230, 490 270, 565 240" stroke="#d9822b" stroke-width="2" stroke-dasharray="5,3" fill="none"/>
  <path d="M 235 244 C 310 274, 370 234, 400 249 C 430 234, 490 274, 565 244" stroke="#d9822b" stroke-width="1" stroke-dasharray="5,3" fill="none"/>

  <!-- Placket with Golden Stitching -->
  <rect x="388" y="220" width="24" height="640" fill="#20334d" stroke="#d9822b" stroke-width="1.5" stroke-dasharray="6,4"/>

  <!-- Silver Snap Buttons -->
  <g fill="#cbd5e1" stroke="#475569" stroke-width="1.5">
    <circle cx="400" cy="270" r="7"/>
    <circle cx="400" cy="370" r="7"/>
    <circle cx="400" cy="470" r="7"/>
    <circle cx="400" cy="570" r="7"/>
    <circle cx="400" cy="670" r="7"/>
    <circle cx="400" cy="770" r="7"/>
  </g>
  <!-- Button core highlights -->
  <g fill="#ffffff">
    <circle cx="398" cy="268" r="2"/>
    <circle cx="398" cy="368" r="2"/>
    <circle cx="398" cy="468" r="2"/>
    <circle cx="398" cy="568" r="2"/>
    <circle cx="398" cy="668" r="2"/>
    <circle cx="398" cy="768" r="2"/>
  </g>

  <!-- Dual Western Flap Pockets -->
  <!-- Left Pocket -->
  <g transform="translate(265, 310)">
    <path d="M 0 30 L 95 30 L 95 120 C 95 135, 60 145, 47.5 145 C 35 145, 0 135, 0 120 Z" fill="#1b2b40" stroke="#d9822b" stroke-width="1.8" stroke-dasharray="5,3"/>
    <!-- Pointed Pocket Flap -->
    <path d="M -2 0 L 97 0 L 97 30 L 47.5 45 L -2 30 Z" fill="#243954" stroke="#d9822b" stroke-width="1.8"/>
    <circle cx="47.5" cy="25" r="5" fill="#cbd5e1" stroke="#475569" stroke-width="1"/>
  </g>
  <!-- Right Pocket -->
  <g transform="translate(440, 310)">
    <path d="M 0 30 L 95 30 L 95 120 C 95 135, 60 145, 47.5 145 C 35 145, 0 135, 0 120 Z" fill="#1b2b40" stroke="#d9822b" stroke-width="1.8" stroke-dasharray="5,3"/>
    <path d="M -2 0 L 97 0 L 97 30 L 47.5 45 L -2 30 Z" fill="#243954" stroke="#d9822b" stroke-width="1.8"/>
    <circle cx="47.5" cy="25" r="5" fill="#cbd5e1" stroke="#475569" stroke-width="1"/>
  </g>

  <!-- Structured Denim Collar -->
  <path d="M 305 120 L 350 230 L 400 220 L 350 135 Z" fill="#2a4261" stroke="#d9822b" stroke-width="1.8"/>
  <path d="M 495 120 L 450 230 L 400 220 L 450 135 Z" fill="#20334d" stroke="#d9822b" stroke-width="1.8"/>
  <path d="M 350 135 C 375 145, 425 145, 450 135 C 440 115, 360 115, 350 135 Z" fill="#131e2e"/>
</svg>`;

// 6. Monaco Emerald Fine-Gauge Ribbed Knit Polo
const emeraldPolo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 900" width="100%" height="100%">
  <defs>
    <linearGradient id="emeraldBase" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#154d3c" />
      <stop offset="45%" stop-color="#0e3a2c" />
      <stop offset="100%" stop-color="#062118" />
    </linearGradient>
    <pattern id="knitTexture" width="6" height="12" patternUnits="userSpaceOnUse">
      <line x1="1" y1="0" x2="1" y2="12" stroke="#0a2a20" stroke-width="1.2"/>
      <line x1="4" y1="0" x2="4" y2="12" stroke="#1f5d49" stroke-width="0.8" opacity="0.4"/>
    </pattern>
    <filter id="emeraldShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="10" stdDeviation="15" flood-color="#03140e" flood-opacity="0.5"/>
    </filter>
  </defs>

  <g filter="url(#emeraldShadow)">
    <path d="
      M 315 120
      C 345 145, 455 145, 485 120
      C 550 138, 630 172, 720 235
      C 700 285, 675 340, 650 375
      C 605 345, 580 320, 565 300
      L 565 830
      C 565 845, 550 855, 535 855
      L 265 855
      C 250 855, 235 845, 235 830
      L 235 300
      C 220 320, 195 345, 150 375
      C 125 340, 100 285,  80 235
      C 170 172, 250 138, 315 120
      Z"
      fill="url(#emeraldBase)"
      stroke="#1c5744"
      stroke-width="1.8"
    />
  </g>

  <!-- Knit pattern texture overlay -->
  <path d="
    M 315 120
    C 345 145, 455 145, 485 120
    C 550 138, 630 172, 720 235
    C 700 285, 675 340, 650 375
    C 605 345, 580 320, 565 300
    L 565 830
    L 265 855
    L 235 830
    L 235 300
    C 220 320, 195 345, 150 375
    C 125 340, 100 285,  80 235
    C 170 172, 250 138, 315 120
    Z"
    fill="url(#knitTexture)"
    opacity="0.35"
  />

  <!-- Three-button polo placket -->
  <rect x="384" y="145" width="32" height="200" rx="3" fill="#0d3326" stroke="#1f5d49" stroke-width="1.5"/>
  <!-- Gold tipping line along placket edge -->
  <line x1="384" y1="145" x2="384" y2="345" stroke="#d4af37" stroke-width="1.5" opacity="0.8"/>

  <!-- Tortoiseshell buttons -->
  <g fill="#7c4a18" stroke="#d4af37" stroke-width="1">
    <circle cx="400" cy="190" r="5.5"/>
    <circle cx="400" cy="245" r="5.5"/>
    <circle cx="400" cy="300" r="5.5"/>
  </g>
  <g fill="#f8fafc">
    <circle cx="399" cy="189" r="1"/>
    <circle cx="399" cy="244" r="1"/>
    <circle cx="399" cy="299" r="1"/>
  </g>

  <!-- Knit Polo Collar with Gold Micro-Tipping -->
  <path d="M 310 120 L 360 215 L 400 210 L 355 135 Z" fill="#114232" stroke="#1c5744" stroke-width="1.5"/>
  <path d="M 490 120 L 440 215 L 400 210 L 445 135 Z" fill="#0a2c20" stroke="#1c5744" stroke-width="1.5"/>
  <!-- Gold tip on collar edge -->
  <path d="M 310 120 L 360 215" stroke="#d4af37" stroke-width="2"/>
  <path d="M 490 120 L 440 215" stroke="#d4af37" stroke-width="2"/>

  <!-- Ribbed Sleeve Bands -->
  <path d="M 80 235 L 150 375" stroke="#1c5744" stroke-width="8" stroke-dasharray="4,2"/>
  <path d="M 720 235 L 650 375" stroke="#1c5744" stroke-width="8" stroke-dasharray="4,2"/>
  <path d="M 78 235 L 148 375" stroke="#d4af37" stroke-width="1.5" opacity="0.6"/>
  <path d="M 722 235 L 652 375" stroke="#d4af37" stroke-width="1.5" opacity="0.6"/>
</svg>`;

// Write the clothes SVG files
fs.writeFileSync(path.join(clothesDir, 'onyx-tee.svg'), onyxTee);
fs.writeFileSync(path.join(clothesDir, 'aura-silk.svg'), auraSilk);
fs.writeFileSync(path.join(clothesDir, 'cyber-tee.svg'), cyberTee);
fs.writeFileSync(path.join(clothesDir, 'breton-stripes.svg'), bretonShirt);
fs.writeFileSync(path.join(clothesDir, 'denim-overshirt.svg'), denimShirt);
fs.writeFileSync(path.join(clothesDir, 'emerald-polo.svg'), emeraldPolo);

console.log('Successfully generated 6 high-fashion garments!');

// Now let's generate 2 studio model SVG graphics for instant 1-click try-on testing!
// Model 1: Alex (Male Model Studio Portrait)
const modelMale = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1100" width="100%" height="100%">
  <defs>
    <linearGradient id="bgStudioM" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2a2e39"/>
      <stop offset="60%" stop-color="#181a20"/>
      <stop offset="100%" stop-color="#0f1014"/>
    </linearGradient>
    <radialGradient id="spotlightM" cx="50%" cy="30%" r="50%">
      <stop offset="0%" stop-color="#4a5568" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="skinToneM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e8be99"/>
      <stop offset="50%" stop-color="#deb087"/>
      <stop offset="100%" stop-color="#c9956d"/>
    </linearGradient>
    <linearGradient id="hairM" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2b1d16"/>
      <stop offset="100%" stop-color="#120c08"/>
    </linearGradient>
    <linearGradient id="underShirtM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#555866"/>
      <stop offset="50%" stop-color="#3d404d"/>
      <stop offset="100%" stop-color="#252730"/>
    </linearGradient>
  </defs>

  <!-- Studio Backdrop -->
  <rect width="800" height="1100" fill="url(#bgStudioM)"/>
  <rect width="800" height="1100" fill="url(#spotlightM)"/>

  <!-- Male Model Silhouette & Features -->
  <!-- Neck -->
  <path d="M 360 290 L 360 410 C 375 425, 425 425, 440 410 L 440 290 Z" fill="url(#skinToneM)"/>

  <!-- Shoulders & Arms -->
  <!-- Left Shoulder to Arm -->
  <path d="M 360 380 C 300 395, 230 425, 175 470 C 160 520, 150 630, 145 740 L 210 750 C 220 650, 230 550, 255 490 L 255 920 L 545 920 L 545 490 C 570 550, 580 650, 590 750 L 655 740 C 650 630, 640 520, 625 470 C 570 425, 500 395, 440 380 Z" fill="url(#skinToneM)"/>

  <!-- Fitted Neutral Base Undershirt -->
  <path d="
    M 365 405
    C 385 435, 415 435, 435 405
    C 485 418, 540 435, 580 475
    L 555 530
    L 535 500
    L 535 910
    L 265 910
    L 265 500
    L 245 530
    L 220 475
    C 260 435, 315 418, 365 405
    Z"
    fill="url(#underShirtM)"
    stroke="#22242c"
    stroke-width="1.5"
  />

  <!-- Neutral Dark Trousers -->
  <path d="M 265 910 L 535 910 L 540 1100 L 260 1100 Z" fill="#13151a"/>

  <!-- Head & Face -->
  <ellipse cx="400" cy="245" rx="72" ry="92" fill="url(#skinToneM)"/>
  <!-- Hair -->
  <path d="M 325 230 C 320 150, 480 150, 475 230 C 460 180, 340 180, 325 230 Z" fill="url(#hairM)"/>
  <path d="M 325 220 C 330 140, 470 140, 475 220 C 450 145, 350 145, 325 220 Z" fill="#443024"/>

  <!-- Ears -->
  <ellipse cx="328" cy="248" rx="8" ry="16" fill="url(#skinToneM)"/>
  <ellipse cx="472" cy="248" rx="8" ry="16" fill="url(#skinToneM)"/>

  <!-- Facial Features (Minimalist Fashion Silhouette) -->
  <!-- Eyebrows -->
  <path d="M 355 225 Q 375 220 388 226" stroke="#2b1d16" stroke-width="3" stroke-linecap="round" fill="none"/>
  <path d="M 445 225 Q 425 220 412 226" stroke="#2b1d16" stroke-width="3" stroke-linecap="round" fill="none"/>
  <!-- Eyes -->
  <ellipse cx="372" cy="236" rx="6" ry="3.5" fill="#1f1813"/>
  <ellipse cx="428" cy="236" rx="6" ry="3.5" fill="#1f1813"/>
  <!-- Nose -->
  <path d="M 400 230 L 396 260 L 404 260" stroke="#b8835d" stroke-width="2" stroke-linecap="round" fill="none"/>
  <!-- Lips -->
  <path d="M 388 280 Q 400 286 412 280" stroke="#a7684b" stroke-width="2.5" stroke-linecap="round" fill="none"/>

  <!-- Studio lighting accent -->
  <text x="400" y="1060" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="600" fill="#64748b" text-anchor="middle" letter-spacing="3">STUDIO PRESET: ALEX (MALE 182CM)</text>
</svg>`;

// Model 2: Maya (Female Model Studio Portrait)
const modelFemale = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1100" width="100%" height="100%">
  <defs>
    <linearGradient id="bgStudioF" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#312a38"/>
      <stop offset="60%" stop-color="#1d1724"/>
      <stop offset="100%" stop-color="#0f0c13"/>
    </linearGradient>
    <radialGradient id="spotlightF" cx="50%" cy="30%" r="50%">
      <stop offset="0%" stop-color="#70587d" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="skinToneF" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f5d3be"/>
      <stop offset="50%" stop-color="#ecc0a6"/>
      <stop offset="100%" stop-color="#d9a789"/>
    </linearGradient>
    <linearGradient id="hairF" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1c141d"/>
      <stop offset="100%" stop-color="#0a070b"/>
    </linearGradient>
    <linearGradient id="underShirtF" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4f4757"/>
      <stop offset="50%" stop-color="#352f3d"/>
      <stop offset="100%" stop-color="#1e1a24"/>
    </linearGradient>
  </defs>

  <!-- Studio Backdrop -->
  <rect width="800" height="1100" fill="url(#bgStudioF)"/>
  <rect width="800" height="1100" fill="url(#spotlightF)"/>

  <!-- Female Model Silhouette -->
  <!-- Long Flowing Hair (Back layer) -->
  <path d="M 300 230 C 270 380, 260 520, 275 620 L 525 620 C 540 520, 530 380, 500 230 Z" fill="url(#hairF)"/>

  <!-- Neck -->
  <path d="M 370 295 L 370 410 C 385 422, 415 422, 430 410 L 430 295 Z" fill="url(#skinToneF)"/>

  <!-- Shoulders & Arms -->
  <path d="M 370 385 C 315 400, 255 428, 205 470 C 190 520, 185 620, 180 730 L 240 738 C 248 645, 255 550, 275 490 L 275 920 L 525 920 L 525 490 C 545 550, 552 645, 560 738 L 620 730 C 615 620, 610 520, 595 470 C 545 428, 485 400, 430 385 Z" fill="url(#skinToneF)"/>

  <!-- Fitted Tank Top -->
  <path d="
    M 365 410
    C 385 440, 415 440, 435 410
    C 470 422, 510 440, 545 475
    L 520 530
    L 510 500
    L 510 910
    L 290 910
    L 290 500
    L 280 530
    L 255 475
    C 290 440, 330 422, 365 410
    Z"
    fill="url(#underShirtF)"
    stroke="#221e29"
    stroke-width="1.5"
  />

  <!-- Neutral Dark Trousers -->
  <path d="M 290 910 L 510 910 L 515 1100 L 285 1100 Z" fill="#131018"/>

  <!-- Head & Face -->
  <ellipse cx="400" cy="245" rx="66" ry="86" fill="url(#skinToneF)"/>

  <!-- Hair (Front framing layer) -->
  <path d="M 334 210 C 330 140, 470 140, 466 210 C 450 155, 350 155, 334 210 Z" fill="url(#hairF)"/>
  <path d="M 334 210 C 315 280, 310 370, 320 460 C 335 460, 345 360, 350 250 Z" fill="url(#hairF)"/>
  <path d="M 466 210 C 485 280, 490 370, 480 460 C 465 460, 455 360, 450 250 Z" fill="url(#hairF)"/>

  <!-- Ears & Delicate Pearl Earrings -->
  <ellipse cx="334" cy="250" rx="6" ry="13" fill="url(#skinToneF)"/>
  <ellipse cx="466" cy="250" rx="6" ry="13" fill="url(#skinToneF)"/>
  <circle cx="334" cy="265" r="3.5" fill="#f8fafc"/>
  <circle cx="466" cy="265" r="3.5" fill="#f8fafc"/>

  <!-- Facial Features -->
  <!-- Eyebrows -->
  <path d="M 358 228 Q 374 221 386 227" stroke="#1c141d" stroke-width="2.2" stroke-linecap="round" fill="none"/>
  <path d="M 442 228 Q 426 221 414 227" stroke="#1c141d" stroke-width="2.2" stroke-linecap="round" fill="none"/>
  <!-- Eyes -->
  <ellipse cx="374" cy="237" rx="5.5" ry="3" fill="#1d161a"/>
  <ellipse cx="426" cy="237" rx="5.5" ry="3" fill="#1d161a"/>
  <!-- Nose -->
  <path d="M 400 232 L 398 258 L 403 258" stroke="#be8d72" stroke-width="1.8" stroke-linecap="round" fill="none"/>
  <!-- Lips -->
  <path d="M 390 278 Q 400 284 410 278" stroke="#c06c64" stroke-width="2.8" stroke-linecap="round" fill="none"/>

  <text x="400" y="1060" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="600" fill="#a89cb5" text-anchor="middle" letter-spacing="3">STUDIO PRESET: MAYA (FEMALE 176CM)</text>
</svg>`;

fs.writeFileSync(path.join(modelsDir, 'model-male.svg'), modelMale);
fs.writeFileSync(path.join(modelsDir, 'model-female.svg'), modelFemale);

console.log('Successfully generated 2 studio models!');
