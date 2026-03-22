// ─── SLOTS del configurador ───────────────────────────────────────────────────
// Define los 8 slots disponibles en el configurador de PC.
// Los productos reales se cargan desde la API — no hay datos estáticos aquí.

export const SLOTS = [
  { id: 'cpu',         label: 'Procesador',       icon: 'memory',          required: true  },
  { id: 'motherboard', label: 'Placa Madre',       icon: 'developer_board', required: true  },
  { id: 'ram',         label: 'Memoria RAM',       icon: 'storage',         required: true  },
  { id: 'gpu',         label: 'Tarjeta de Video',  icon: 'videocam',        required: true  },
  { id: 'storage',     label: 'Almacenamiento',    icon: 'hard_drive',      required: true  },
  { id: 'psu',         label: 'Fuente de Poder',   icon: 'bolt',            required: true  },
  { id: 'case',        label: 'Gabinete',          icon: 'computer',        required: true  },
  { id: 'cooling',     label: 'Enfriamiento',      icon: 'air',             required: false },
]

// ─── NOMBRES de productos del configurador ────────────────────────────────────
// Mapa de slot → nombres exactos como están en la BD (del seed).
// El PCConfigurator carga todos los productos de la API y filtra por estos nombres.
// Si agregas productos al seed, añade sus nombres aquí también.

export const CONFIGURATOR_NAMES = {
  cpu: [
    'Intel Core i9-14900K',
    'AMD Ryzen 9 7950X3D',
    'Intel Core i5-14600K',
    'AMD Ryzen 5 7600X',
  ],
  motherboard: [
    'ASUS ROG Maximus Z790 Hero',
    'MSI MEG X670E ACE',
    'Gigabyte B760M DS3H',
  ],
  ram: [
    'Corsair Dominator Platinum 64GB DDR5',
    'G.Skill Trident Z5 32GB DDR5',
    'Kingston Fury Beast 16GB DDR4',
  ],
  gpu: [
    'ASUS ROG Strix RTX 4090 24GB',
    'MSI Gaming RTX 4080 Super 16GB',
    'Sapphire Pulse RX 7800 XT 16GB',
    'Gigabyte RTX 4070 Ti Super 16GB',
  ],
  storage: [
    'Samsung 990 Pro 2TB NVMe',
    'WD Black SN850X 1TB',
    'Seagate Barracuda 4TB HDD',
  ],
  psu: [
    'Corsair RM1000x 1000W 80+ Gold',
    'EVGA SuperNOVA 850W 80+ Platinum',
    'Seasonic Focus GX 650W 80+ Gold',
  ],
  case: [
    'Lian Li PC-O11 Dynamic EVO',
    'Fractal Design Meshify 2',
    'NZXT H9 Flow',
  ],
  cooling: [
    'Corsair iCUE H150i Elite 360mm AIO',
    'Noctua NH-D15 Chromax',
    'DeepCool AK620 Dual Tower',
  ],
}

// ─── METADATOS extra por nombre de producto ───────────────────────────────────
// Datos técnicos que no viven en la BD pero son necesarios para la lógica
// del configurador (compatibilidad de socket, TDP, wattage, etc.).

export const EXTRA_META = {
  // CPUs
  'Intel Core i9-14900K':            { socket: 'LGA1700', tdp: 125, score: { gaming: 95, workstation: 92, streaming: 90 }, badge: 'TOP'  },
  'AMD Ryzen 9 7950X3D':             { socket: 'AM5',     tdp: 120, score: { gaming: 98, workstation: 97, streaming: 95 }, badge: 'BEST' },
  'Intel Core i5-14600K':            { socket: 'LGA1700', tdp: 125, score: { gaming: 82, workstation: 75, streaming: 78 }                },
  'AMD Ryzen 5 7600X':               { socket: 'AM5',     tdp: 105, score: { gaming: 78, workstation: 65, streaming: 70 }                },

  // Motherboards
  'ASUS ROG Maximus Z790 Hero':      { socket: 'LGA1700', score: { gaming: 95, workstation: 93, streaming: 90 }, badge: 'TOP' },
  'MSI MEG X670E ACE':               { socket: 'AM5',     score: { gaming: 93, workstation: 94, streaming: 91 }               },
  'Gigabyte B760M DS3H':             { socket: 'LGA1700', score: { gaming: 70, workstation: 65, streaming: 68 }               },

  // RAM
  'Corsair Dominator Platinum 64GB DDR5': { score: { gaming: 90, workstation: 95, streaming: 88 }, badge: 'TOP' },
  'G.Skill Trident Z5 32GB DDR5':        { score: { gaming: 88, workstation: 85, streaming: 86 }               },
  'Kingston Fury Beast 16GB DDR4':        { score: { gaming: 68, workstation: 60, streaming: 65 }               },

  // GPUs
  'ASUS ROG Strix RTX 4090 24GB':    { vram: '24GB', tdp: 450, score: { gaming: 100, workstation: 98, streaming: 97 }, badge: 'BEST' },
  'MSI Gaming RTX 4080 Super 16GB':  { vram: '16GB', tdp: 320, score: { gaming: 93,  workstation: 90, streaming: 91 }               },
  'Sapphire Pulse RX 7800 XT 16GB':  { vram: '16GB', tdp: 263, score: { gaming: 80,  workstation: 75, streaming: 78 }               },
  'Gigabyte RTX 4070 Ti Super 16GB': { vram: '16GB', tdp: 285, score: { gaming: 87,  workstation: 83, streaming: 85 }               },

  // Storage
  'Samsung 990 Pro 2TB NVMe':        { score: { gaming: 92, workstation: 94, streaming: 90 }, badge: 'TOP' },
  'WD Black SN850X 1TB':             { score: { gaming: 88, workstation: 86, streaming: 85 }               },
  'Seagate Barracuda 4TB HDD':       { score: { gaming: 50, workstation: 65, streaming: 55 }               },

  // PSUs
  'Corsair RM1000x 1000W 80+ Gold':  { wattage: 1000, score: { gaming: 95, workstation: 95, streaming: 95 } },
  'EVGA SuperNOVA 850W 80+ Platinum':{ wattage: 850,  score: { gaming: 90, workstation: 88, streaming: 88 } },
  'Seasonic Focus GX 650W 80+ Gold': { wattage: 650,  score: { gaming: 78, workstation: 75, streaming: 78 } },

  // Cases
  'Lian Li PC-O11 Dynamic EVO':      { score: { gaming: 95, workstation: 92, streaming: 90 }, badge: 'TOP' },
  'Fractal Design Meshify 2':         { score: { gaming: 90, workstation: 88, streaming: 87 }               },
  'NZXT H9 Flow':                    { score: { gaming: 88, workstation: 86, streaming: 88 }               },

  // Cooling
  'Corsair iCUE H150i Elite 360mm AIO': { score: { gaming: 96, workstation: 95, streaming: 94 }, badge: 'TOP' },
  'Noctua NH-D15 Chromax':              { score: { gaming: 88, workstation: 90, streaming: 87 }               },
  'DeepCool AK620 Dual Tower':          { score: { gaming: 78, workstation: 80, streaming: 77 }               },
}

// ─── COMPATIBILIDAD ───────────────────────────────────────────────────────────
// Verifica si los componentes seleccionados son compatibles entre sí.
// Devuelve { issues: string[], warnings: string[], isCompatible: bool }

export function checkCompatibility(selection) {
  const issues   = []
  const warnings = []

  const cpu = selection.cpu
  const mb  = selection.motherboard
  const psu = selection.psu
  const gpu = selection.gpu

  const cpuMeta = cpu ? EXTRA_META[cpu.name] : null
  const mbMeta  = mb  ? EXTRA_META[mb.name]  : null
  const psuMeta = psu ? EXTRA_META[psu.name] : null
  const gpuMeta = gpu ? EXTRA_META[gpu.name] : null
  const cpuTdp  = cpuMeta?.tdp || 0
  const gpuTdp  = gpuMeta?.tdp || 0

  // CPU ↔ Motherboard — socket
  if (cpuMeta?.socket && mbMeta?.socket && cpuMeta.socket !== mbMeta.socket) {
    issues.push(`❌ Socket incompatible: ${cpu.name} usa ${cpuMeta.socket}, la placa ${mb.name} requiere ${mbMeta.socket}.`)
  }

  // PSU — wattage suficiente
  if (psuMeta?.wattage && (cpuTdp || gpuTdp)) {
    const required = cpuTdp + gpuTdp + 100   // headroom
    if (psuMeta.wattage < required) {
      issues.push(`❌ Fuente insuficiente: necesitas ~${required}W, la ${psu.name} entrega ${psuMeta.wattage}W.`)
    } else if (psuMeta.wattage < required + 100) {
      warnings.push(`⚠️ La fuente tiene poco margen (${psuMeta.wattage}W para ~${required}W requeridos).`)
    }
  }

  return { issues, warnings, isCompatible: issues.length === 0 }
}

// ─── SCORE GLOBAL ─────────────────────────────────────────────────────────────
// Calcula el score ponderado de la build para gaming, workstation y streaming.

export function calcBuildScore(selection) {
  const WEIGHTS    = { cpu: 0.30, gpu: 0.40, ram: 0.15, storage: 0.08, motherboard: 0.07 }
  const CATEGORIES = ['gaming', 'workstation', 'streaming']
  const scores     = { gaming: 0, workstation: 0, streaming: 0 }
  let totalWeight  = 0

  Object.entries(WEIGHTS).forEach(([slot, weight]) => {
    const item = selection[slot]
    if (!item) return
    const meta = EXTRA_META[item.name]
    if (!meta?.score) return
    totalWeight += weight
    CATEGORIES.forEach(cat => { scores[cat] += (meta.score[cat] || 0) * weight })
  })

  if (totalWeight === 0) return { gaming: 0, workstation: 0, streaming: 0 }
  CATEGORIES.forEach(cat => { scores[cat] = Math.round(scores[cat] / totalWeight) })
  return scores
}
