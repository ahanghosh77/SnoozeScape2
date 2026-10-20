/**
 * Barnaby the Bedtime Sloth - Interactive Animated Mascot
 * Honors International Sloth Day with slow, rhythmic breathing and floating Zzzs.
 */

export function renderSlothMascot(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="sloth-stage">
      <div class="moon-halo"></div>
      
      <!-- Crescent Moon & Sloth SVG -->
      <svg class="sloth-svg" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="moonGrad" x1="20" y1="20" x2="220" y2="220" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#fef08a" stop-opacity="0.95"/>
            <stop offset="70%" stop-color="#f59e0b" stop-opacity="0.8"/>
            <stop offset="100%" stop-color="#d97706" stop-opacity="0.5"/>
          </linearGradient>

          <linearGradient id="slothBodyGrad" x1="60" y1="60" x2="180" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.9"/>
            <stop offset="100%" stop-color="#6d28d9" stop-opacity="0.95"/>
          </linearGradient>

          <linearGradient id="slothFurGrad" x1="80" y1="80" x2="160" y2="160" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#c4b5fd"/>
            <stop offset="100%" stop-color="#a78bfa"/>
          </linearGradient>

          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
        </defs>

        <!-- Ambient Glow Backing -->
        <circle cx="120" cy="120" r="85" fill="#fef3c7" opacity="0.08" filter="url(#softGlow)"/>

        <!-- Golden Crescent Moon -->
        <path d="M155 35 C80 35 30 95 35 170 C40 210 75 235 110 235 C75 210 65 150 95 100 C118 60 160 45 190 50 C178 40 168 35 155 35 Z"
              fill="url(#moonGrad)" filter="url(#softGlow)"/>

        <!-- Little hanging star on moon tip -->
        <line x1="190" y1="50" x2="190" y2="72" stroke="#fcd34d" stroke-width="1.2" stroke-dasharray="2 2" opacity="0.7"/>
        <polygon points="190,69 193,75 199,75 194,79 196,85 190,81 184,85 186,79 181,75 187,75" fill="#fef08a" opacity="0.9"/>

        <!-- Sloth Body (Breathing group) -->
        <g class="sloth-breathing">
          <!-- Main Torso curled on the crescent -->
          <ellipse cx="115" cy="125" rx="38" ry="28" transform="rotate(-15 115 125)" fill="url(#slothBodyGrad)"/>
          
          <!-- Fluffy belly patch -->
          <ellipse cx="115" cy="125" rx="26" ry="18" transform="rotate(-15 115 125)" fill="url(#slothFurGrad)" opacity="0.85"/>

          <!-- Sloth Head tucked down -->
          <circle cx="82" cy="115" r="21" fill="url(#slothBodyGrad)"/>
          
          <!-- Face mask -->
          <ellipse cx="80" cy="116" rx="14" ry="11" fill="#ede9fe"/>
          
          <!-- Eye stripes (characteristic sloth eye mask) -->
          <path d="M71 113 Q76 110 82 113" stroke="#4c1d95" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M86 113 Q90 110 93 113" stroke="#4c1d95" stroke-width="2.2" stroke-linecap="round"/>
          
          <!-- Sleeping peaceful curved eyes -->
          <path d="M72 117 Q76 120 80 117" stroke="#312e81" stroke-width="2" stroke-linecap="round" fill="none"/>
          <path d="M85 117 Q88 120 91 117" stroke="#312e81" stroke-width="2" stroke-linecap="round" fill="none"/>

          <!-- Sweet little snout and smile -->
          <ellipse cx="79" cy="122" rx="4" ry="2.5" fill="#581c87"/>
          <path d="M77 124 Q79 126 81 124" stroke="#581c87" stroke-width="1.2" stroke-linecap="round" fill="none"/>

          <!-- Curved Front Arms wrapped around the moon -->
          <path d="M96 130 C90 145 105 165 125 162 C135 160 135 152 130 148" 
                stroke="url(#slothBodyGrad)" stroke-width="12" stroke-linecap="round" fill="none"/>
          
          <!-- Claws gently resting -->
          <path d="M125 164 L128 168 M128 163 L131 167 M131 161 L134 165" stroke="#fcd34d" stroke-width="1.8" stroke-linecap="round"/>

          <!-- Cute Back Leg tucked behind -->
          <path d="M142 122 C155 130 155 150 140 158" 
                stroke="url(#slothBodyGrad)" stroke-width="11" stroke-linecap="round" fill="none"/>
          <path d="M138 158 L136 162 M141 158 L140 162" stroke="#fcd34d" stroke-width="1.8" stroke-linecap="round"/>
        </g>
      </svg>

      <!-- Floating Zzz animation -->
      <div class="zzz-stream">
        <span class="zzz z1">z</span>
        <span class="zzz z2">z</span>
        <span class="zzz z3">Z</span>
      </div>

      <div class="mascot-caption">
        <span class="sloth-name">Barnaby</span>
        <span class="sloth-badge">Conserving Energy Since 2026</span>
      </div>
    </div>
  `;
}
