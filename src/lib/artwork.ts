import { MetalFinish, ProductVisualSpec } from '@/types/commerce';

function svgToDataUri(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}

function getMetalGradientColors(finish: MetalFinish) {
  switch (finish) {
    case 'Silver':
    case 'White Gold':
      return {
        light: '#FFFFFF',
        mid: '#D8DCE2',
        dark: '#9AA0A8',
        deep: '#6E747C',
        rim: '#F3F5F8',
      };
    case 'Rose Gold':
      return {
        light: '#FCE5DF',
        mid: '#E5B2A3',
        dark: '#B87B6A',
        deep: '#8E5647',
        rim: '#F7D2C8',
      };
    case 'Silver/Gold':
      return {
        light: '#FAF0D7',
        mid: '#D9C282',
        dark: '#9EA3AA',
        deep: '#78683A',
        rim: '#FFFFFF',
      };
    case 'Gold':
    case 'Yellow Gold':
    default:
      return {
        light: '#FFF6D6',
        mid: '#DFC173',
        dark: '#B38B34',
        deep: '#7D5C18',
        rim: '#F6E3AA',
      };
  }
}

export function getProductStudioSvg(
  spec: ProductVisualSpec,
  finishOverride?: MetalFinish,
  viewIndex: number = 0,
  bgHex?: string
): string {
  const finish = finishOverride || spec.primaryFinish;
  const m = getMetalGradientColors(finish);
  const enamel = spec.enamelColor || '#27B9E8';
  const gem = spec.gemColor || '#FFFFFF';
  const defaultBg =
    spec.shape.includes('flatback') || spec.shape === 'butterfly-necklace'
      ? '#FDF6F5'
      : '#F6F6F6';
  const bg = bgHex || defaultBg;
  const scale = viewIndex === 1 ? 'scale(1.07) rotate(-4 200 200)' : 'scale(1)';

  let bodyMarkup = '';

  switch (spec.shape) {
    case 'dome-huggie':
      bodyMarkup = `
        <g transform="${scale}">
          <!-- Left front dome huggie -->
          <ellipse cx="142" cy="202" rx="26" ry="44" fill="url(#metalGrad)" filter="url(#softShadow)" />
          <ellipse cx="136" cy="192" rx="11" ry="24" fill="${m.light}" opacity="0.65" />
          <ellipse cx="144" cy="212" rx="16" ry="12" fill="${m.deep}" opacity="0.35" />
          <!-- Right side profile huggie with post -->
          <line x1="228" y1="175" x2="294" y2="175" stroke="${m.dark}" stroke-width="5" stroke-linecap="round" />
          <line x1="285" y1="175" x2="292" y2="175" stroke="${m.deep}" stroke-width="6" />
          <path d="M 228 158 C 194 158, 194 246, 232 246 C 254 246, 262 230, 256 218 C 252 210, 238 222, 232 216 C 222 206, 222 182, 234 166 Z" fill="url(#metalGrad)" filter="url(#softShadow)" />
          <ellipse cx="216" cy="195" rx="9" ry="22" fill="${m.light}" opacity="0.6" />
        </g>
      `;
      break;

    case 'easy-huggie':
    case 'endless-hoop':
    case 'mini-hoop':
      bodyMarkup = `
        <g transform="${scale}">
          <!-- Thin profile left -->
          <rect x="136" y="156" width="9" height="88" rx="4.5" fill="url(#metalGrad)" filter="url(#softShadow)" />
          <rect x="138" y="164" width="3" height="40" rx="1.5" fill="${m.light}" opacity="0.8" />
          <!-- Side open ring right -->
          <circle cx="238" cy="200" r="42" fill="none" stroke="url(#metalGrad)" stroke-width="10" filter="url(#softShadow)" />
          <circle cx="238" cy="200" r="42" fill="none" stroke="${m.light}" stroke-width="2" opacity="0.6" />
        </g>
      `;
      break;

    case 'ball-huggie':
    case 'pearl-huggie': {
      const isPearl = spec.shape === 'pearl-huggie';
      const orbFill = isPearl ? 'url(#pearlGrad)' : 'url(#metalGrad)';
      bodyMarkup = `
        <g transform="${scale}">
          <!-- Left hook + ball -->
          <path d="M 145 168 L 145 224 C 145 244, 168 244, 174 228" fill="none" stroke="url(#metalGrad)" stroke-width="6" stroke-linecap="round" filter="url(#softShadow)" />
          <circle cx="145" cy="162" r="16" fill="${orbFill}" filter="url(#softShadow)" />
          <circle cx="140" cy="157" r="5" fill="#FFFFFF" opacity="0.85" />
          <!-- Right curved huggie + ball -->
          <path d="M 236 168 C 216 184, 218 238, 250 240 C 266 240, 274 226, 272 214" fill="none" stroke="url(#metalGrad)" stroke-width="6" stroke-linecap="round" filter="url(#softShadow)" />
          <circle cx="242" cy="162" r="16" fill="${orbFill}" filter="url(#softShadow)" />
          <circle cx="237" cy="157" r="5" fill="#FFFFFF" opacity="0.85" />
        </g>
      `;
      break;
    }

    case 'heart-huggie':
    case 'star-huggie':
    case 'disc-huggie':
    case 'moon-huggie':
    case 'bar-open-huggie':
    case 'opal-huggie':
    case 'bezel-huggie':
    case 'sparkle-open-huggie':
    case 'baguette-open-huggie': {
      let topperLeft = `<circle cx="145" cy="162" r="14" fill="url(#metalGrad)" />`;
      let topperRight = `<circle cx="240" cy="162" r="14" fill="url(#metalGrad)" />`;
      if (spec.shape === 'heart-huggie') {
        topperLeft = `<path d="M 145 174 C 145 174 128 162 128 152 C 128 145 136 142 145 150 C 154 142 162 145 162 152 C 162 162 145 174 145 174 Z" fill="url(#metalGrad)" />`;
        topperRight = `<path d="M 240 174 C 240 174 223 162 223 152 C 223 145 231 142 240 150 C 249 142 257 145 257 152 C 257 162 240 174 240 174 Z" fill="url(#metalGrad)" />`;
      } else if (spec.shape === 'star-huggie') {
        topperLeft = `<polygon points="145,144 149,155 161,155 151,162 155,174 145,167 135,174 139,162 129,155 141,155" fill="url(#metalGrad)" />`;
        topperRight = `<polygon points="240,144 244,155 256,155 246,162 250,174 240,167 230,174 234,162 224,155 236,155" fill="url(#metalGrad)" />`;
      } else if (spec.shape === 'bar-open-huggie' || spec.shape === 'baguette-open-huggie') {
        const fillBar = spec.shape === 'baguette-open-huggie' ? 'url(#gemGrad)' : 'url(#metalGrad)';
        topperLeft = `<rect x="127" y="154" width="36" height="10" rx="2" fill="${fillBar}" stroke="${m.mid}" stroke-width="2" />`;
        topperRight = `<rect x="222" y="154" width="36" height="10" rx="2" fill="${fillBar}" stroke="${m.mid}" stroke-width="2" />`;
      } else if (spec.shape === 'bezel-huggie' || spec.shape === 'sparkle-open-huggie' || spec.shape === 'opal-huggie') {
        const innerGem = spec.shape === 'opal-huggie' ? '#FDF2F0' : 'url(#gemGrad)';
        topperLeft = `<circle cx="145" cy="160" r="13" fill="url(#metalGrad)" /><circle cx="145" cy="160" r="9" fill="${innerGem}" />`;
        topperRight = `<circle cx="240" cy="160" r="13" fill="url(#metalGrad)" /><circle cx="240" cy="160" r="9" fill="${innerGem}" />`;
      }
      bodyMarkup = `
        <g transform="${scale}" filter="url(#softShadow)">
          <path d="M 145 165 L 145 230 C 145 246, 164 246, 170 232" fill="none" stroke="url(#metalGrad)" stroke-width="5.5" stroke-linecap="round" />
          <path d="M 240 165 C 220 182, 222 238, 252 240 C 268 240, 274 226, 272 214" fill="none" stroke="url(#metalGrad)" stroke-width="5.5" stroke-linecap="round" />
          ${topperLeft}
          ${topperRight}
        </g>
      `;
      break;
    }

    case 'pave-huggie':
    case 'conch-pave':
      bodyMarkup = `
        <g transform="${scale}" filter="url(#softShadow)">
          <ellipse cx="200" cy="200" rx="34" ry="48" fill="none" stroke="url(#metalGrad)" stroke-width="14" />
          ${[-32, -20, -8, 4, 16, 28].map((dy) => `<circle cx="168" cy="${200 + dy}" r="4.5" fill="url(#gemGrad)" stroke="${m.dark}" stroke-width="0.8" />`).join('')}
        </g>
      `;
      break;

    case 'seashore-hoop':
      bodyMarkup = `
        <g transform="${scale}" filter="url(#softShadow)">
          <!-- Left hoop with blue bead & gold starfish -->
          <ellipse cx="148" cy="182" rx="22" ry="46" fill="none" stroke="url(#metalGrad)" stroke-width="3.5" />
          <circle cx="148" cy="228" r="9" fill="#8CD7E8" />
          <polygon points="148,232 153,246 168,246 156,255 160,270 148,260 136,270 140,255 128,246 143,246" fill="url(#metalGrad)" />
          <!-- Right hoop -->
          <ellipse cx="252" cy="182" rx="22" ry="46" fill="none" stroke="url(#metalGrad)" stroke-width="3.5" />
          <circle cx="252" cy="228" r="9" fill="#8CD7E8" />
          <polygon points="252,232 257,246 272,246 260,255 264,270 252,260 240,270 244,255 232,246 247,246" fill="url(#metalGrad)" />
        </g>
      `;
      break;

    case 'pearly-petal-hoop':
    case 'round-ball-hoop':
    case 'two-tone-ball-hoop':
    case 'french-mixed-hoop': {
      const isPearly = spec.shape === 'pearly-petal-hoop';
      bodyMarkup = `
        <g transform="${scale}" filter="url(#softShadow)">
          <ellipse cx="148" cy="185" rx="18" ry="38" fill="none" stroke="url(#metalGrad)" stroke-width="5" />
          <ellipse cx="252" cy="185" rx="18" ry="38" fill="none" stroke="url(#metalGrad)" stroke-width="5" />
          ${
            isPearly
              ? `
            <circle cx="136" cy="222" r="9" fill="url(#pearlGrad)" />
            <circle cx="148" cy="228" r="10" fill="url(#pearlGrad)" />
            <circle cx="160" cy="222" r="9" fill="url(#pearlGrad)" />
            <circle cx="240" cy="222" r="9" fill="url(#pearlGrad)" />
            <circle cx="252" cy="228" r="10" fill="url(#pearlGrad)" />
            <circle cx="264" cy="222" r="9" fill="url(#pearlGrad)" />
          `
              : `
            <circle cx="148" cy="228" r="16" fill="url(#metalGrad)" />
            <circle cx="143" cy="222" r="5" fill="#FFFFFF" opacity="0.7" />
            <circle cx="252" cy="228" r="16" fill="url(#metalGrad)" />
            <circle cx="247" cy="222" r="5" fill="#FFFFFF" opacity="0.7" />
          `
          }
        </g>
      `;
      break;
    }

    case 'teardrop-flatback':
    case 'pebble-flatback':
    case 'pear-cz-flatback':
    case 'dangle-pear-flatback':
    case 'micro-bar-flatback':
    case 'pave-heart-flatback':
    case 'flower-diamond-flatback':
    case 'marquise-curve-flatback':
    case 'gradient-cz-flatback':
    case 'sparkly-dangle-flatback':
    case 'trinity-cz-flatback':
    case 'seahorse-flatback':
    case 'pearl-trinity-flatback':
    case 'pearl-cubic-flatback':
    case 'mini-cz-labret':
    case 'ball-tragus-labret': {
      let frontMotif = `<path d="M 225 174 C 242 174, 248 214, 225 224 C 208 214, 212 174, 225 174 Z" fill="url(#metalGrad)" />`;
      if (spec.shape === 'micro-bar-flatback') {
        frontMotif = `<rect x="218" y="164" width="12" height="72" rx="2" fill="url(#metalGrad)" />`;
      } else if (spec.shape === 'pave-heart-flatback') {
        frontMotif = `
          <path d="M 226 222 C 226 222 196 202 196 184 C 196 172 210 168 226 180 C 242 168 256 172 256 184 C 256 202 226 222 226 222 Z" fill="url(#metalGrad)" />
          <circle cx="214" cy="186" r="5" fill="url(#gemGrad)" />
          <circle cx="226" cy="190" r="5" fill="url(#gemGrad)" />
          <circle cx="238" cy="186" r="5" fill="url(#gemGrad)" />
          <circle cx="220" cy="199" r="4.5" fill="url(#gemGrad)" />
          <circle cx="232" cy="199" r="4.5" fill="url(#gemGrad)" />
          <circle cx="226" cy="209" r="4" fill="url(#gemGrad)" />
        `;
      } else if (spec.shape === 'flower-diamond-flatback' || spec.shape === 'trinity-cz-flatback' || spec.shape === 'pearl-trinity-flatback') {
        const gFill = spec.shape.includes('pearl') ? 'url(#pearlGrad)' : 'url(#gemGrad)';
        frontMotif = `
          <circle cx="226" cy="188" r="9" fill="${gFill}" stroke="${m.mid}" stroke-width="2" />
          <circle cx="216" cy="205" r="9" fill="${gFill}" stroke="${m.mid}" stroke-width="2" />
          <circle cx="236" cy="205" r="9" fill="${gFill}" stroke="${m.mid}" stroke-width="2" />
        `;
      } else if (spec.shape === 'pear-cz-flatback' || spec.shape === 'dangle-pear-flatback' || spec.shape === 'sparkly-dangle-flatback') {
        const hasDangle = spec.shape.includes('dangle');
        frontMotif = `
          <circle cx="224" cy="186" r="7" fill="url(#gemGrad)" stroke="${m.mid}" stroke-width="2" />
          <path d="M 224 196 L 238 224 C 242 234, 224 244, 214 234 C 208 226, 216 210, 224 196 Z" fill="url(#gemGrad)" stroke="${m.mid}" stroke-width="2.5" />
          ${hasDangle ? `<circle cx="224" cy="252" r="6" fill="url(#gemGrad)" stroke="${m.mid}" stroke-width="2" />` : ''}
        `;
      } else if (spec.shape === 'marquise-curve-flatback' || spec.shape === 'gradient-cz-flatback' || spec.shape === 'seahorse-flatback') {
        frontMotif = `
          <ellipse cx="222" cy="178" rx="5" ry="11" transform="rotate(-25 222 178)" fill="url(#gemGrad)" stroke="${m.mid}" stroke-width="1.8" />
          <ellipse cx="230" cy="194" rx="5" ry="11" transform="rotate(-10 230 194)" fill="url(#gemGrad)" stroke="${m.mid}" stroke-width="1.8" />
          <ellipse cx="228" cy="212" rx="5" ry="11" transform="rotate(15 228 212)" fill="url(#gemGrad)" stroke="${m.mid}" stroke-width="1.8" />
          <ellipse cx="218" cy="226" rx="4.5" ry="10" transform="rotate(35 218 226)" fill="url(#gemGrad)" stroke="${m.mid}" stroke-width="1.8" />
        `;
      } else if (spec.shape === 'pearl-cubic-flatback' || spec.shape === 'mini-cz-labret' || spec.shape === 'ball-tragus-labret') {
        frontMotif = `
          <circle cx="226" cy="196" r="11" fill="${spec.shape === 'ball-tragus-labret' ? 'url(#metalGrad)' : 'url(#gemGrad)'}" stroke="${m.mid}" stroke-width="2" />
        `;
      }
      bodyMarkup = `
        <g transform="${scale}" filter="url(#softShadow)">
          <!-- Flatback disc & post -->
          <ellipse cx="176" cy="194" rx="5" ry="18" fill="url(#metalGrad)" />
          <line x1="180" y1="194" x2="222" y2="196" stroke="url(#metalGrad)" stroke-width="6" stroke-linecap="round" />
          ${frontMotif}
        </g>
      `;
      break;
    }

    case 'bezel-stud':
    case 'ball-stud':
      bodyMarkup = `
        <g transform="${scale}" filter="url(#softShadow)">
          <circle cx="152" cy="204" r="14" fill="url(#metalGrad)" />
          <circle cx="152" cy="204" r="9" fill="${spec.shape === 'bezel-stud' ? 'url(#gemGrad)' : 'url(#metalGrad)'}" />
          <line x1="230" y1="198" x2="275" y2="188" stroke="url(#metalGrad)" stroke-width="4" />
          <ellipse cx="272" cy="189" rx="6" ry="12" fill="url(#metalGrad)" />
          <circle cx="226" cy="200" r="14" fill="url(#metalGrad)" />
        </g>
      `;
      break;

    case 'spike-dome-ring':
    case 'croissant-dome-ring':
    case 'woven-dome-ring':
      bodyMarkup = `
        <g transform="${scale} rotate(-26 200 200)" filter="url(#softShadow)">
          <ellipse cx="200" cy="200" rx="86" ry="52" fill="none" stroke="url(#metalGrad)" stroke-width="26" />
          <ellipse cx="200" cy="200" rx="86" ry="52" fill="none" stroke="${m.deep}" stroke-width="2" stroke-dasharray="10 8" opacity="0.45" />
          <ellipse cx="200" cy="192" rx="82" ry="46" fill="none" stroke="${m.light}" stroke-width="6" stroke-dasharray="8 10" opacity="0.7" />
        </g>
      `;
      break;

    case 'twin-dome-enamel-ring':
    case 'pave-twin-dome-ring':
    case 'twin-dome-mixed-ring': {
      const topFill =
        spec.shape === 'twin-dome-enamel-ring'
          ? enamel
          : spec.shape === 'pave-twin-dome-ring'
          ? 'url(#gemGrad)'
          : 'url(#silverMetalGrad)';
      bodyMarkup = `
        <g transform="${scale}" filter="url(#softShadow)">
          <!-- Back band -->
          <path d="M 122 212 C 118 164, 278 154, 276 206" fill="none" stroke="url(#metalGrad)" stroke-width="22" stroke-linecap="round" />
          <!-- Top enamel/pave teardrop dome -->
          <path d="M 128 188 C 142 136, 266 132, 274 186 C 276 208, 224 212, 182 194 C 150 182, 126 196, 128 188 Z" fill="${topFill}" stroke="${m.mid}" stroke-width="2" />
          <path d="M 148 162 C 176 146, 232 146, 254 168" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" opacity="0.65" />
          <!-- Bottom metallic teardrop dome -->
          <path d="M 126 218 C 134 268, 258 266, 272 210 C 274 192, 218 192, 168 206 C 138 214, 124 206, 126 218 Z" fill="url(#metalGrad)" />
          <path d="M 152 236 C 182 248, 234 242, 252 220" fill="none" stroke="${m.light}" stroke-width="6" stroke-linecap="round" opacity="0.7" />
        </g>
      `;
      break;
    }

    case 'single-enamel-dome-ring':
      bodyMarkup = `
        <g transform="${scale} rotate(-26 200 200)" filter="url(#softShadow)">
          <ellipse cx="200" cy="204" rx="84" ry="48" fill="none" stroke="url(#metalGrad)" stroke-width="18" />
          <path d="M 116 200 C 116 142, 284 142, 284 200" fill="none" stroke="${enamel}" stroke-width="28" stroke-linecap="round" />
          <path d="M 136 184 C 156 154, 244 154, 264 184" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" opacity="0.65" />
        </g>
      `;
      break;

    case 'ruby-talisman-ring':
      bodyMarkup = `
        <g transform="${scale} rotate(-24 200 200)" filter="url(#softShadow)">
          <ellipse cx="200" cy="208" rx="84" ry="44" fill="none" stroke="url(#metalGrad)" stroke-width="14" />
          <rect x="166" y="142" width="68" height="82" rx="18" fill="#FAF8F5" stroke="url(#metalGrad)" stroke-width="6" />
          <rect x="178" y="154" width="44" height="58" rx="8" fill="${gem}" stroke="url(#metalGrad)" stroke-width="4" />
          <rect x="186" y="164" width="14" height="36" rx="3" fill="#FFFFFF" opacity="0.35" />
        </g>
      `;
      break;

    case 'enamel-heart-band-ring':
    case 'open-heart-band-ring': {
      const heartFill = spec.shape === 'enamel-heart-band-ring' ? enamel : 'none';
      bodyMarkup = `
        <g transform="${scale} rotate(-22 200 200)" filter="url(#softShadow)">
          <ellipse cx="200" cy="200" rx="84" ry="46" fill="none" stroke="url(#metalGrad)" stroke-width="20" stroke-dasharray="${spec.shape === 'open-heart-band-ring' ? '18 6' : 'none'}" />
          ${[-56, -28, 0, 28, 56]
            .map(
              (dx) => `
            <circle cx="${200 + dx}" cy="${160 + Math.abs(dx) * 0.18}" r="9" fill="${heartFill}" stroke="url(#metalGrad)" stroke-width="3.5" />
          `
            )
            .join('')}
        </g>
      `;
      break;
    }

    case 'sparkle-heart-dome-ring':
      bodyMarkup = `
        <g transform="${scale} rotate(-24 200 200)" filter="url(#softShadow)">
          <ellipse cx="200" cy="206" rx="84" ry="46" fill="none" stroke="url(#metalGrad)" stroke-width="18" />
          <path d="M 200 204 C 200 204 162 176 162 154 C 162 138 182 132 200 148 C 218 132 238 138 238 154 C 238 176 200 204 200 204 Z" fill="url(#metalGrad)" />
          <path d="M 200 196 C 200 196 170 173 170 156 C 170 144 185 140 200 153 C 215 140 230 144 230 156 C 230 173 200 196 200 196 Z" fill="url(#gemGrad)" stroke="${m.dark}" stroke-width="1.5" />
        </g>
      `;
      break;

    case 'chain-ring':
    case 'chain-cz-ring':
    case 'baguette-eternity-ring':
      bodyMarkup = `
        <g transform="${scale} rotate(-20 200 200)" filter="url(#softShadow)">
          <ellipse cx="200" cy="200" rx="84" ry="44" fill="none" stroke="url(#metalGrad)" stroke-width="20" stroke-dasharray="22 5" />
          ${
            spec.shape !== 'chain-ring'
              ? `<ellipse cx="200" cy="200" rx="84" ry="44" fill="none" stroke="url(#gemGrad)" stroke-width="10" stroke-dasharray="12 8" />`
              : ''
          }
        </g>
      `;
      break;

    case 'oval-solitaire-ring':
    case 'skinny-stacking-ring':
      bodyMarkup = `
        <g transform="${scale} rotate(-22 200 200)" filter="url(#softShadow)">
          <ellipse cx="200" cy="204" rx="84" ry="42" fill="none" stroke="url(#metalGrad)" stroke-width="9" />
          ${
            spec.shape === 'oval-solitaire-ring'
              ? `<rect x="184" y="138" width="32" height="44" rx="14" fill="url(#gemGrad)" stroke="url(#metalGrad)" stroke-width="3.5" />`
              : ''
          }
        </g>
      `;
      break;

    case 'butterfly-necklace':
    case 'disc-initial-necklace':
    case 'pendant-necklace':
    case 'layered-chain-necklace':
      bodyMarkup = `
        <g transform="${scale}" filter="url(#softShadow)">
          <path d="M 75 65 Q 200 320 325 65" fill="none" stroke="url(#metalGrad)" stroke-width="3.5" stroke-dasharray="4 2" />
          ${
            spec.shape === 'butterfly-necklace'
              ? `<path d="M 200 194 C 184 178, 176 198, 194 204 C 180 210, 188 224, 200 210 C 212 224, 220 210, 206 204 C 224 198, 216 178, 200 194 Z" fill="url(#metalGrad)" stroke="${m.dark}" stroke-width="1" />`
              : spec.shape === 'disc-initial-necklace'
              ? `<circle cx="200" cy="205" r="22" fill="url(#metalGrad)" /><text x="200" y="213" text-anchor="middle" font-family="serif" font-size="22" fill="${m.deep}">J</text>`
              : `<circle cx="200" cy="205" r="14" fill="url(#gemGrad)" stroke="url(#metalGrad)" stroke-width="4" />`
          }
        </g>
      `;
      break;

    case 'pearly-bracelet':
    case 'chain-bracelet':
      bodyMarkup = `
        <g transform="${scale}" filter="url(#softShadow)">
          <ellipse cx="200" cy="200" rx="108" ry="86" fill="none" stroke="url(#metalGrad)" stroke-width="4.5" stroke-dasharray="7 3" />
          ${[0, 60, 120, 180, 240, 300]
            .map((deg) => {
              const rad = (deg * Math.PI) / 180;
              const cx = 200 + Math.cos(rad) * 116;
              const cy = 200 + Math.sin(rad) * 94;
              return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="7" fill="url(#pearlGrad)" stroke="url(#metalGrad)" stroke-width="1.5" />`;
            })
            .join('')}
        </g>
      `;
      break;

    case 'insertion-tool':
      bodyMarkup = `
        <g transform="${scale}" filter="url(#softShadow)">
          <path d="M 155 110 C 125 165, 125 235, 155 290" fill="none" stroke="url(#silverMetalGrad)" stroke-width="4" stroke-linecap="round" />
          <line x1="240" y1="110" x2="240" y2="290" stroke="url(#silverMetalGrad)" stroke-width="4" stroke-linecap="round" />
        </g>
      `;
      break;

    case 'polishing-cloth':
      bodyMarkup = `
        <g transform="${scale}" filter="url(#softShadow)">
          <rect x="110" y="120" width="140" height="110" rx="4" fill="#EFEAE4" stroke="#D8CFC4" stroke-width="2" />
          <rect x="145" y="165" width="145" height="105" rx="4" fill="#FAF6F0" stroke="#DFD6CB" stroke-width="2" />
          <text x="218" y="222" text-anchor="middle" font-family="serif" font-size="16" fill="#9E8F7C" letter-spacing="2">J&amp;CO.</text>
        </g>
      `;
      break;

    case 'ring-sizer':
    default:
      bodyMarkup = `
        <g transform="${scale}" filter="url(#softShadow)">
          <ellipse cx="200" cy="200" rx="68" ry="38" fill="none" stroke="url(#silverMetalGrad)" stroke-width="14" />
          <text x="200" y="242" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#555555" letter-spacing="2">4 · 5 · 6 · 7 · 8</text>
        </g>
      `;
      break;
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="800" height="800">
      <defs>
        <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${m.light}" />
          <stop offset="35%" stop-color="${m.mid}" />
          <stop offset="70%" stop-color="${m.dark}" />
          <stop offset="100%" stop-color="${m.rim}" />
        </linearGradient>
        <linearGradient id="silverMetalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFFFFF" />
          <stop offset="45%" stop-color="#D8DCE2" />
          <stop offset="80%" stop-color="#989EA6" />
          <stop offset="100%" stop-color="#F2F4F7" />
        </linearGradient>
        <radialGradient id="pearlGrad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#FFFFFF" />
          <stop offset="60%" stop-color="#F6F2EC" />
          <stop offset="100%" stop-color="#DDD4C8" />
        </radialGradient>
        <radialGradient id="gemGrad" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#FFFFFF" />
          <stop offset="50%" stop-color="#EBF3FA" />
          <stop offset="85%" stop-color="#C5D6E8" />
          <stop offset="100%" stop-color="#FFFFFF" />
        </radialGradient>
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#000000" flood-opacity="0.09" />
        </filter>
      </defs>
      <rect width="400" height="400" fill="${bg}" />
      ${bodyMarkup}
    </svg>
  `;

  return svgToDataUri(svg);
}

export function getLifestyleModelSvg(variantIndex: number = 0, label: string = 'J&CO.'): string {
  const palettes = [
    { bg: '#C6B3A2', skin1: '#E8CBB8', skin2: '#CFA993', hair: '#DFC39D' },
    { bg: '#BFA999', skin1: '#DFBFA8', skin2: '#C59E84', hair: '#8D6649' },
    { bg: '#D2C0B0', skin1: '#ECD1BF', skin2: '#D4B098', hair: '#B8926A' },
    { bg: '#E8DDD5', skin1: '#E3C3AE', skin2: '#C8A087', hair: '#5C3E28' },
  ];
  const p = palettes[variantIndex % palettes.length];

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="800" height="800">
      <defs>
        <linearGradient id="skin" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${p.skin1}" />
          <stop offset="100%" stop-color="${p.skin2}" />
        </linearGradient>
        <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFF5D6" />
          <stop offset="50%" stop-color="#DFC173" />
          <stop offset="100%" stop-color="#9E7622" />
        </linearGradient>
      </defs>
      <rect width="600" height="600" fill="${p.bg}" />
      <!-- Editorial ear & jawline silhouette -->
      <path d="M 120 0 L 480 0 L 460 600 L 140 600 Z" fill="url(#skin)" opacity="0.92" />
      <path d="M 380 0 C 440 160, 480 340, 520 600 L 600 600 L 600 0 Z" fill="${p.hair}" opacity="0.85" />
      <!-- Sculpted ear lobe -->
      <path d="M 290 190 C 350 180, 385 245, 360 325 C 345 370, 295 390, 275 355 C 265 338, 275 310, 290 290" fill="url(#skin)" stroke="#B78E74" stroke-width="3" />
      <!-- Gold dome huggie on earlobe -->
      <ellipse cx="292" cy="364" rx="14" ry="24" fill="url(#gold)" />
      <ellipse cx="289" cy="358" rx="5" ry="11" fill="#FFFFFF" opacity="0.65" />
      <!-- Subtle upper cartilage stud -->
      <circle cx="342" cy="238" r="6" fill="url(#gold)" />
      <circle cx="342" cy="238" r="3.5" fill="#FFFFFF" />
    </svg>
  `;
  return svgToDataUri(svg);
}

export function getEditorialBannerSvg(
  type:
    | 'hero-flatbacks'
    | 'gifting-candy'
    | 'gifting-card'
    | 'personalized-hands'
    | 'gift-boxes'
    | 'auth-heart-hands'
    | 'statement-rings-hero'
    | 'shop-all-hero'
    | 'demi-fine'
    | 'luxury-14k'
): string {
  if (type === 'gift-boxes') {
    return svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 520" width="1440" height="520">
        <defs>
          <linearGradient id="pinkBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FCE4E6" />
            <stop offset="100%" stop-color="#F5CDD2" />
          </linearGradient>
          <filter id="boxShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="-12" dy="18" stdDeviation="14" flood-color="#9A5B64" flood-opacity="0.22" />
          </filter>
        </defs>
        <rect width="1440" height="520" fill="url(#pinkBg)" />
        <!-- Luxury pink embossed J&CO boxes -->
        <g transform="translate(520, 80) rotate(-18)" filter="url(#boxShadow)">
          <rect x="0" y="0" width="230" height="230" rx="6" fill="#FADCE0" stroke="#EABEC4" stroke-width="2" />
          <text x="115" y="125" text-anchor="middle" font-family="serif" font-size="28" fill="#C48B71" letter-spacing="3">J&amp;CO.</text>
        </g>
        <g transform="translate(820, 40) rotate(-14)" filter="url(#boxShadow)">
          <rect x="0" y="0" width="240" height="240" rx="6" fill="#FCE4E7" stroke="#EABEC4" stroke-width="2" />
          <text x="120" y="130" text-anchor="middle" font-family="serif" font-size="28" fill="#C48B71" letter-spacing="3">J&amp;CO.</text>
        </g>
        <g transform="translate(650, 220) rotate(-12)" filter="url(#boxShadow)">
          <rect x="0" y="0" width="250" height="250" rx="6" fill="#FBE0E4" stroke="#EABEC4" stroke-width="2" />
          <text x="125" y="135" text-anchor="middle" font-family="serif" font-size="30" fill="#C48B71" letter-spacing="3">J&amp;CO.</text>
        </g>
        <g transform="translate(980, 190) rotate(-16)" filter="url(#boxShadow)">
          <rect x="0" y="0" width="250" height="250" rx="6" fill="#FADCE0" stroke="#EABEC4" stroke-width="2" />
          <text x="125" y="135" text-anchor="middle" font-family="serif" font-size="30" fill="#C48B71" letter-spacing="3">J&amp;CO.</text>
        </g>
      </svg>
    `);
  }

  if (type === 'auth-heart-hands') {
    return svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
        <defs>
          <linearGradient id="warmStudio" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#EFE4DC" />
            <stop offset="100%" stop-color="#E5D5C8" />
          </linearGradient>
          <linearGradient id="skinTone" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ECC6AC" />
            <stop offset="100%" stop-color="#D5A485" />
          </linearGradient>
          <linearGradient id="goldBand" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#FFF2C2" />
            <stop offset="50%" stop-color="#D4AF37" />
            <stop offset="100%" stop-color="#9A741C" />
          </linearGradient>
        </defs>
        <rect width="800" height="800" fill="url(#warmStudio)" />
        <!-- Two hands forming a heart silhouette with delicate gold rings -->
        <path d="M 80 420 C 160 260, 310 190, 395 285 C 330 220, 235 280, 235 375 C 235 465, 330 535, 398 595 L 365 625 C 260 545, 160 475, 80 420 Z" fill="url(#skinTone)" />
        <path d="M 720 420 C 640 260, 490 190, 405 285 C 470 220, 565 280, 565 375 C 565 465, 470 535, 402 595 L 435 625 C 540 545, 640 475, 720 420 Z" fill="url(#skinTone)" />
        <!-- Delicate gold stacking rings on fingers -->
        <rect x="270" y="232" width="8" height="44" rx="4" transform="rotate(18 274 254)" fill="url(#goldBand)" />
        <rect x="520" y="232" width="8" height="44" rx="4" transform="rotate(-18 524 254)" fill="url(#goldBand)" />
        <rect x="210" y="365" width="44" height="7" rx="3.5" transform="rotate(-24 232 368)" fill="url(#goldBand)" />
        <rect x="545" y="365" width="44" height="7" rx="3.5" transform="rotate(24 567 368)" fill="url(#goldBand)" />
        <circle cx="566" cy="368" r="5" fill="#FFFFFF" stroke="url(#goldBand)" stroke-width="2" />
      </svg>
    `);
  }

  if (type === 'personalized-hands') {
    return svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 500" width="1440" height="500">
        <defs>
          <linearGradient id="warmHandsBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#B88767" />
            <stop offset="50%" stop-color="#D8AF93" />
            <stop offset="100%" stop-color="#E7CFC0" />
          </linearGradient>
          <linearGradient id="goldDisc" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFF3C4" />
            <stop offset="50%" stop-color="#DFBC68" />
            <stop offset="100%" stop-color="#A67E26" />
          </linearGradient>
          <linearGradient id="silverDisc" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFFFFF" />
            <stop offset="60%" stop-color="#E1E4E8" />
            <stop offset="100%" stop-color="#A5ABB3" />
          </linearGradient>
        </defs>
        <rect width="1440" height="500" fill="url(#warmHandsBg)" />
        <!-- Chains & Engraved Disc Charms R K S R N -->
        <line x1="480" y1="0" x2="540" y2="350" stroke="url(#goldDisc)" stroke-width="5" stroke-dasharray="6 3" />
        <line x1="570" y1="0" x2="625" y2="340" stroke="url(#goldDisc)" stroke-width="5" stroke-dasharray="6 3" />
        <line x1="660" y1="0" x2="710" y2="305" stroke="url(#goldDisc)" stroke-width="5" stroke-dasharray="6 3" />
        <line x1="750" y1="0" x2="820" y2="325" stroke="url(#silverDisc)" stroke-width="5" stroke-dasharray="6 3" />
        <line x1="840" y1="0" x2="915" y2="295" stroke="url(#silverDisc)" stroke-width="5" stroke-dasharray="6 3" />
        <circle cx="540" cy="370" r="46" fill="url(#goldDisc)" />
        <text x="540" y="384" text-anchor="middle" font-family="serif" font-size="40" fill="#7D5A14">R</text>
        <circle cx="630" cy="360" r="46" fill="url(#goldDisc)" />
        <text x="630" y="374" text-anchor="middle" font-family="serif" font-size="40" fill="#7D5A14">K</text>
        <circle cx="715" cy="322" r="46" fill="url(#goldDisc)" />
        <text x="715" y="336" text-anchor="middle" font-family="serif" font-size="40" fill="#7D5A14">S</text>
        <circle cx="825" cy="345" r="46" fill="url(#silverDisc)" />
        <text x="825" y="359" text-anchor="middle" font-family="serif" font-size="40" fill="#686E76">R</text>
        <circle cx="920" cy="312" r="46" fill="url(#silverDisc)" />
        <text x="920" y="326" text-anchor="middle" font-family="serif" font-size="40" fill="#686E76">N</text>
      </svg>
    `);
  }

  if (type === 'statement-rings-hero') {
    return svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 520" width="1440" height="520">
        <defs>
          <linearGradient id="sunlitSkin" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#B98A68" />
            <stop offset="55%" stop-color="#8B5E3C" />
            <stop offset="100%" stop-color="#583822" />
          </linearGradient>
          <linearGradient id="goldSignet" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFF5CC" />
            <stop offset="45%" stop-color="#E2BA5B" />
            <stop offset="100%" stop-color="#8D6314" />
          </linearGradient>
        </defs>
        <rect width="1440" height="520" fill="url(#sunlitSkin)" />
        <!-- Macro Heart Diamond Gold Signet Ring -->
        <g transform="translate(720, 255) rotate(28)">
          <ellipse cx="0" cy="0" rx="115" ry="62" fill="none" stroke="url(#goldSignet)" stroke-width="34" />
          <path d="M 0 38 C 0 38 -52 -4 -52 -32 C -52 -54 -25 -62 0 -40 C 25 -62 52 -54 52 -32 C 52 -4 0 38 0 38 Z" fill="url(#goldSignet)" />
          <path d="M 0 26 C 0 26 -38 -6 -38 -27 C -38 -43 -18 -49 0 -32 C 18 -49 38 -43 38 -27 C 38 -6 0 26 0 26 Z" fill="#F5F9FC" stroke="#FFFFFF" stroke-width="3" />
        </g>
      </svg>
    `);
  }

  // Default shop-all / hero-flatbacks curated ear party
  return svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 520" width="1440" height="520">
      <defs>
        <linearGradient id="earHero" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#D7B59D" />
          <stop offset="50%" stop-color="#B98E72" />
          <stop offset="100%" stop-color="#80583F" />
        </linearGradient>
        <linearGradient id="goldG" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFF6D6" />
          <stop offset="50%" stop-color="#DFC173" />
          <stop offset="100%" stop-color="#9A7220" />
        </linearGradient>
      </defs>
      <rect width="1440" height="520" fill="url(#earHero)" />
      <!-- Curated ear stack details -->
      <path d="M 320 40 C 480 40, 560 190, 490 360 C 445 450, 340 460, 310 385" fill="#CFA68B" stroke="#A67A5E" stroke-width="6" />
      <!-- Pave huggie hoop -->
      <ellipse cx="360" cy="400" rx="18" ry="38" fill="none" stroke="url(#goldG)" stroke-width="12" />
      <!-- Heart stud -->
      <circle cx="420" cy="340" r="14" fill="url(#goldG)" />
      <!-- Mini ball stud -->
      <circle cx="465" cy="300" r="8" fill="url(#goldG)" />
      <!-- Daith ring -->
      <circle cx="445" cy="175" r="28" fill="none" stroke="url(#goldG)" stroke-width="6" />
    </svg>
  `);
}
