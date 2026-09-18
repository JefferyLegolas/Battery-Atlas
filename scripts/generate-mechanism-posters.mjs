import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dir = path.join(root, 'assets', 'mechanisms');
const configs = {
  intercalation: {
    source: 'intercalation-template.svg',
    poster: 'intercalation-poster.svg',
    staticCss: `
    *{animation:none!important}
    .phase-discharge,.discharge-flow,.discharge-label{opacity:1!important}
    .phase-charge,.charge-flow,.charge-label{opacity:0!important}
    .discharge-flow{transform:translateX(150px)!important}`
  },
  alloy: {
    source: 'alloy-template.svg',
    poster: 'alloy-poster.svg',
    staticCss: `
    *{animation:none!important}
    .expanded-particle{transform:scale(1.22)!important;fill:#fff0e9!important;stroke:#ff6b35!important}
    .crack,.lithiation,.ions-in{opacity:1!important}
    .delithiation,.ions-out{opacity:0!important}
    .ions-in{transform:translateX(120px)!important}
    .gauge-fill{transform:scaleY(1)!important}`
  },
  flow: {
    source: 'flow-template.svg',
    poster: 'flow-poster.svg',
    staticCss: `
    *{animation:none!important}
    .cycle{opacity:1!important}`
  },
  'solid-lithium': {
    source: 'solid-lithium-template.svg',
    poster: 'solid-lithium-poster.svg',
    staticCss: `
    *{animation:none!important}
    .ions{opacity:1!important;transform:translateX(180px)!important}
    .dendrite,.pressure{opacity:1!important}`
  },
  'fluoride-solid': {
    source: 'fluoride-solid-template.svg',
    poster: 'fluoride-solid-poster.svg',
    staticCss: `
    *{animation:none!important}
    .phase-discharge,.ions-discharge{opacity:1!important}
    .phase-charge,.ions-charge{opacity:0!important}
    .ions-discharge{transform:translateX(155px)!important}
    .volume{transform:scale(1.08)!important}`
  },
  'molten-ceramic': {
    source: 'molten-ceramic-template.svg',
    poster: 'molten-ceramic-poster.svg',
    staticCss: `
    *{animation:none!important}
    .phase-discharge,.ions-discharge{opacity:1!important}
    .phase-charge,.ions-charge{opacity:0!important}
    .ions-discharge{transform:translateX(145px)!important}
    .heat{opacity:1!important}`
  }
};

for (const [type, config] of Object.entries(configs)) {
  const source = fs.readFileSync(path.join(dir, config.source), 'utf8');
  let poster = source.replace('viewBox="0 0 1200 760"', 'viewBox="70 122 1060 500"');
  poster = poster.replace('</style>', `${config.staticCss}\n  </style>`);
  fs.writeFileSync(path.join(dir, config.poster), poster);
  console.log(`Generated ${config.poster} from ${config.source}`);
}
