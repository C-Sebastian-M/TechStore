import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { SLOTS, checkCompatibility, calcBuildScore } from '../data/configurator'
import * as productService from '../services/productService.js'
import { FORMAT_CURRENCY } from '../constants'

// ─── Modal: ¿Seguir armando o ir al carrito? ──────────────────────────────
function AddedToCartModal({ addedSlots, total, onKeepBuilding, onGoToCart }) {
  const items = Object.keys(addedSlots).length
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onKeepBuilding}
      />

      {/* Modal */}
      <div className="relative bg-surface-dark border border-border-dark rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in">

        {/* Cabecera con check animado */}
        <div className="bg-gradient-to-br from-green-500/20 to-primary/10 border-b border-border-dark px-6 py-5 flex items-center gap-4">
          <div className="size-12 rounded-full bg-green-500/20 border-2 border-green-500/50 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-green-400 text-[26px]">check_circle</span>
          </div>
          <div>
            <h3 className="text-white font-black text-lg leading-tight">
              ¡{items} componente{items !== 1 ? 's' : ''} agregado{items !== 1 ? 's' : ''}!
            </h3>
            <p className="text-slate-400 text-sm mt-0.5">
              Total en carrito: <span className="text-primary font-black">${FORMAT_CURRENCY(total)}</span>
            </p>
          </div>
        </div>

        {/* Lista rápida de lo agregado */}
        <div className="px-6 py-4">
          <p className="text-slate-500 text-xs uppercase tracking-wider font-bold mb-3">Tu build fue agregado</p>

          {/* Solo los slots que tienen componente seleccionado */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {Object.entries(addedSlots).map(([slot, comp]) => {
              const SLOT_ICONS = {
                cpu: 'memory', motherboard: 'developer_board', ram: 'storage',
                gpu: 'videocam', storage: 'hard_drive', psu: 'bolt',
                case: 'computer', cooling: 'air'
              }
              return (
                <div
                  key={slot}
                  className="size-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center"
                  title={comp.name}
                >
                  <span className="material-symbols-outlined text-primary text-[15px]">{SLOT_ICONS[slot]}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Acciones */}
        <div className="px-6 pb-6 flex flex-col gap-3">
          {/* Ir al carrito — acción principal */}
          <button
            onClick={onGoToCart}
            className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-primary text-white font-black text-sm hover:bg-blue-600 transition-all active:scale-[0.98] shadow-lg shadow-primary/25"
          >
            <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
            Ir al carrito y finalizar compra
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>

          {/* Seguir armando */}
          <button
            onClick={onKeepBuilding}
            className="flex items-center justify-center gap-2 w-full h-11 rounded-xl border border-border-dark bg-background-dark/50 text-slate-300 font-bold text-sm hover:border-primary/40 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">build</span>
            Seguir armando mi PC
          </button>

          <p className="text-center text-slate-600 text-xs">
            Los componentes ya están guardados en tu carrito
          </p>
        </div>
      </div>
    </div>
  )
}

// Nombres de los productos del configurador por categoría (coinciden con seed.js)
const CONFIGURATOR_NAMES = {
  cpu:         ['Intel Core i9-14900K', 'AMD Ryzen 9 7950X3D', 'Intel Core i5-14600K', 'AMD Ryzen 5 7600X'],
  motherboard: ['ASUS ROG Maximus Z790 Hero', 'MSI MEG X670E ACE', 'Gigabyte B760M DS3H'],
  ram:         ['Corsair Dominator Platinum 64GB DDR5', 'G.Skill Trident Z5 32GB DDR5', 'Kingston Fury Beast 16GB DDR4'],
  gpu:         ['ASUS ROG Strix RTX 4090 24GB', 'MSI Gaming RTX 4080 Super 16GB', 'Sapphire Pulse RX 7800 XT 16GB', 'Gigabyte RTX 4070 Ti Super 16GB'],
  storage:     ['Samsung 990 Pro 2TB NVMe', 'WD Black SN850X 1TB', 'Seagate Barracuda 4TB HDD'],
  psu:         ['Corsair RM1000x 1000W 80+ Gold', 'EVGA SuperNOVA 850W 80+ Platinum', 'Seasonic Focus GX 650W 80+ Gold'],
  case:        ['Lian Li PC-O11 Dynamic EVO', 'Fractal Design Meshify 2', 'NZXT H9 Flow'],
  cooling:     ['Corsair iCUE H150i Elite 360mm AIO', 'Noctua NH-D15 Chromax', 'DeepCool AK620 Dual Tower'],
}

// Metadatos extra que no están en la BD pero sí en el configurador
const EXTRA_META = {
  'Intel Core i9-14900K':              { socket: 'LGA1700', tdp: 125, cores: 24, score: { gaming: 95, workstation: 92, streaming: 90 }, badge: 'TOP'  },
  'AMD Ryzen 9 7950X3D':               { socket: 'AM5',     tdp: 120, cores: 16, score: { gaming: 98, workstation: 97, streaming: 95 }, badge: 'BEST' },
  'Intel Core i5-14600K':              { socket: 'LGA1700', tdp: 125, cores: 14, score: { gaming: 82, workstation: 75, streaming: 78 } },
  'AMD Ryzen 5 7600X':                 { socket: 'AM5',     tdp: 105, cores: 6,  score: { gaming: 78, workstation: 65, streaming: 70 } },
  'ASUS ROG Maximus Z790 Hero':        { socket: 'LGA1700', formFactor: 'ATX',  score: { gaming: 95, workstation: 93, streaming: 90 }, badge: 'TOP' },
  'MSI MEG X670E ACE':                 { socket: 'AM5',     formFactor: 'ATX',  score: { gaming: 93, workstation: 94, streaming: 91 } },
  'Gigabyte B760M DS3H':               { socket: 'LGA1700', formFactor: 'mATX', score: { gaming: 70, workstation: 65, streaming: 68 } },
  'Corsair Dominator Platinum 64GB DDR5': { capacity: '64GB', type: 'DDR5', speed: 6000, score: { gaming: 90, workstation: 95, streaming: 88 }, badge: 'TOP' },
  'G.Skill Trident Z5 32GB DDR5':      { capacity: '32GB', type: 'DDR5', speed: 6400, score: { gaming: 88, workstation: 85, streaming: 86 } },
  'Kingston Fury Beast 16GB DDR4':     { capacity: '16GB', type: 'DDR4', speed: 3200, score: { gaming: 68, workstation: 60, streaming: 65 } },
  'ASUS ROG Strix RTX 4090 24GB':      { vram: '24GB', tdp: 450, score: { gaming: 100, workstation: 98, streaming: 97 }, badge: 'BEST' },
  'MSI Gaming RTX 4080 Super 16GB':    { vram: '16GB', tdp: 320, score: { gaming: 93, workstation: 90, streaming: 91 } },
  'Sapphire Pulse RX 7800 XT 16GB':    { vram: '16GB', tdp: 263, score: { gaming: 80, workstation: 75, streaming: 78 } },
  'Gigabyte RTX 4070 Ti Super 16GB':   { vram: '16GB', tdp: 285, score: { gaming: 87, workstation: 83, streaming: 85 } },
  'Samsung 990 Pro 2TB NVMe':          { score: { gaming: 92, workstation: 94, streaming: 90 }, badge: 'TOP' },
  'WD Black SN850X 1TB':               { score: { gaming: 88, workstation: 86, streaming: 85 } },
  'Seagate Barracuda 4TB HDD':         { score: { gaming: 50, workstation: 65, streaming: 55 } },
  'Corsair RM1000x 1000W 80+ Gold':    { wattage: 1000, efficiency: '80+ Gold',     score: { gaming: 95, workstation: 95, streaming: 95 } },
  'EVGA SuperNOVA 850W 80+ Platinum':  { wattage: 850,  efficiency: '80+ Platinum', score: { gaming: 90, workstation: 88, streaming: 88 } },
  'Seasonic Focus GX 650W 80+ Gold':   { wattage: 650,  efficiency: '80+ Gold',     score: { gaming: 78, workstation: 75, streaming: 78 } },
  'Lian Li PC-O11 Dynamic EVO':        { formFactor: ['ATX','mATX','ITX'], score: { gaming: 95, workstation: 92, streaming: 90 }, badge: 'TOP' },
  'Fractal Design Meshify 2':          { formFactor: ['ATX','mATX'],       score: { gaming: 90, workstation: 88, streaming: 87 } },
  'NZXT H9 Flow':                      { formFactor: ['ATX','mATX','ITX'], score: { gaming: 88, workstation: 86, streaming: 88 } },
  'Corsair iCUE H150i Elite 360mm AIO':{ type: 'AIO Líquida',    score: { gaming: 96, workstation: 95, streaming: 94 }, badge: 'TOP' },
  'Noctua NH-D15 Chromax':             { type: 'Torre de Aire', score: { gaming: 88, workstation: 90, streaming: 87 } },
  'DeepCool AK620 Dual Tower':         { type: 'Torre de Aire', score: { gaming: 78, workstation: 80, streaming: 77 } },
}

// ─── POSICIONES DEL BLUEPRINT (% sobre el SVG 800×560) ───────────────────────
const BLUEPRINT_SLOTS = [
  { id: 'case',        x: 4,   y: 4,   w: 92,  h: 92, label: 'Gabinete',         icon: 'computer',         desc: 'Carcasa' },
  { id: 'motherboard', x: 22,  y: 12,  w: 56,  h: 42, label: 'Placa Madre',      icon: 'developer_board',  desc: 'ATX / mATX' },
  { id: 'cpu',         x: 37,  y: 18,  w: 14,  h: 14, label: 'CPU',              icon: 'memory',           desc: 'Socket' },
  { id: 'ram',         x: 55,  y: 16,  w: 7,   h: 32, label: 'RAM',              icon: 'storage',          desc: 'DDR5' },
  { id: 'gpu',         x: 22,  y: 57,  w: 56,  h: 18, label: 'GPU',              icon: 'videocam',         desc: 'PCIe x16' },
  { id: 'storage',     x: 65,  y: 20,  w: 13,  h: 15, label: 'SSD/HDD',         icon: 'hard_drive',       desc: 'M.2 / SATA' },
  { id: 'psu',         x: 22,  y: 78,  w: 30,  h: 14, label: 'PSU',              icon: 'bolt',             desc: 'Fuente' },
  { id: 'cooling',     x: 28,  y: 17,  w: 8,   h: 12, label: 'Cooling',          icon: 'air',              desc: 'CPU Cooler' },
]

function ScoreBar({ label, icon, value, color }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 text-slate-400">
          <span className="material-symbols-outlined text-[13px]">{icon}</span>
          {label}
        </span>
        <span className="font-black tabular-nums" style={{ color }}>{value}/100</span>
      </div>
      <div className="h-1.5 w-full bg-background-dark rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, background: `linear-gradient(90deg,${color}88,${color})` }}
        />
      </div>
    </div>
  )
}

function ComponentDrawer({ slotId, onClose, onSelect, currentSelected, componentsBySlot }) {
  const slot       = SLOTS.find(s => s.id === slotId)
  const components = componentsBySlot[slotId] || []
  const [search, setSearch] = useState('')

  const filtered = components.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.brand.toLowerCase().includes(search.toLowerCase())
  )

  const BADGE_COLOR = { TOP: 'bg-amber-500', BEST: 'bg-green-500', NEW: 'bg-primary' }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border-dark shrink-0">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">{slot?.icon}</span>
          <div>
            <h3 className="text-white font-bold leading-none">{slot?.label}</h3>
            <p className="text-slate-500 text-xs mt-0.5">{components.length} opciones disponibles</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="size-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      <div className="px-4 py-3 shrink-0 border-b border-border-dark">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[16px]">search</span>
          <input
            className="w-full bg-background-dark rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 border border-border-dark focus:border-primary outline-none transition-colors"
            placeholder={`Buscar ${slot?.label}...`}
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {filtered.map(comp => {
          const isSelected = currentSelected?.id === comp.id
          return (
            <button
              key={comp.id}
              onClick={() => { onSelect(slotId, comp); onClose() }}
              className={`w-full flex gap-3 p-3 rounded-xl border text-left transition-all group ${
                isSelected
                  ? 'border-primary bg-primary/10'
                  : 'border-border-dark bg-surface-dark hover:border-primary/50 hover:bg-primary/5'
              }`}
            >
              <div className="size-16 rounded-lg bg-background-dark border border-border-dark shrink-0 flex items-center justify-center overflow-hidden">
                <img src={comp.image} alt={comp.name} className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    {comp.badge && (
                      <span className={`inline-block text-[9px] font-black text-white px-1.5 py-0.5 rounded mb-1 ${BADGE_COLOR[comp.badge] || 'bg-slate-600'}`}>
                        {comp.badge}
                      </span>
                    )}
                    <p className="text-white text-sm font-bold leading-snug line-clamp-1">{comp.name}</p>
                    <p className="text-slate-500 text-xs">{comp.brand}</p>
                  </div>
                  <span className="text-primary font-black text-sm shrink-0">${FORMAT_CURRENCY(comp.price)}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {comp.specs.slice(0, 3).map(s => (
                    <span key={s} className="text-[10px] text-slate-500 bg-background-dark px-1.5 py-0.5 rounded">{s}</span>
                  ))}
                </div>
              </div>
              {isSelected && (
                <div className="flex items-center shrink-0">
                  <div className="size-5 bg-primary rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-[12px]">check</span>
                  </div>
                </div>
              )}
            </button>
          )
        })}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-slate-600">
            <span className="material-symbols-outlined text-[36px] mb-2">search_off</span>
            <p className="text-sm">Sin resultados para "{search}"</p>
          </div>
        )}
      </div>
    </div>
  )
}

function BlueprintDiagram({ selection, activeSlot, onSlotClick }) {
  return (
    <div className="relative w-full" style={{ paddingBottom: '70%' }}>
      <div className="absolute inset-0">
        <svg
          viewBox="0 0 100 70"
          className="w-full h-full"
          style={{ background: 'radial-gradient(ellipse at 50% 50%, #0d1f35 0%, #0a1520 100%)' }}
        >
          <defs>
            <pattern id="bp-grid" x="0" y="0" width="5" height="5" patternUnits="userSpaceOnUse">
              <circle cx="0" cy="0" r="0.15" fill="#1a4a7a" opacity="0.6" />
            </pattern>
            <pattern id="bp-grid-major" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="0" cy="0" r="0.25" fill="#1a5a9a" opacity="0.5" />
            </pattern>
            <filter id="bp-glow">
              <feGaussianBlur stdDeviation="0.4" result="blur" />
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          <rect width="100" height="70" fill="url(#bp-grid)" />
          <rect width="100" height="70" fill="url(#bp-grid-major)" />

          <rect x="4" y="4" width="92" height="62" rx="1.5"
            fill="none" stroke="#1a5a9a" strokeWidth="0.4" strokeDasharray="2 1" opacity="0.6" />

          <text x="5.5" y="7.5" fontSize="1.8" fill="#1e6bba" fontFamily="monospace" opacity="0.7">
            TECHSTORE — CONFIGURADOR PC v2
          </text>
          <text x="5.5" y="63.5" fontSize="1.4" fill="#1e4a7a" fontFamily="monospace" opacity="0.5">
            ESCALA 1:1 — COMPATIBILIDAD GARANTIZADA
          </text>

          {BLUEPRINT_SLOTS.map(slot => {
            const comp     = selection[slot.id]
            const isActive = activeSlot === slot.id
            const filled   = !!comp
            const required = SLOTS.find(s => s.id === slot.id)?.required

            const strokeColor = isActive ? '#137fec' : filled ? '#22c55e' : required ? '#1e6bba' : '#1a4a6a'
            const fillColor   = isActive ? 'rgba(19,127,236,0.12)' : filled ? 'rgba(34,197,94,0.08)' : 'rgba(15,35,60,0.4)'
            const strokeWidth = isActive ? 0.5 : 0.35
            const strokeDash  = filled ? 'none' : '1.2 0.8'

            return (
              <g key={slot.id} onClick={() => onSlotClick(slot.id)} className="cursor-pointer" style={{ transition: 'all 0.2s' }}>
                <rect x={slot.x} y={slot.y} width={slot.w} height={slot.h} rx="1"
                  fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth}
                  strokeDasharray={strokeDash} filter={isActive ? 'url(#bp-glow)' : undefined} />

                <line x1={slot.x} y1={slot.y + 3} x2={slot.x} y2={slot.y} stroke={strokeColor} strokeWidth="0.6" opacity="0.8"/>
                <line x1={slot.x} y1={slot.y} x2={slot.x + 3} y2={slot.y} stroke={strokeColor} strokeWidth="0.6" opacity="0.8"/>
                <line x1={slot.x + slot.w - 3} y1={slot.y} x2={slot.x + slot.w} y2={slot.y} stroke={strokeColor} strokeWidth="0.6" opacity="0.8"/>
                <line x1={slot.x + slot.w} y1={slot.y} x2={slot.x + slot.w} y2={slot.y + 3} stroke={strokeColor} strokeWidth="0.6" opacity="0.8"/>
                <line x1={slot.x} y1={slot.y + slot.h - 3} x2={slot.x} y2={slot.y + slot.h} stroke={strokeColor} strokeWidth="0.6" opacity="0.8"/>
                <line x1={slot.x} y1={slot.y + slot.h} x2={slot.x + 3} y2={slot.y + slot.h} stroke={strokeColor} strokeWidth="0.6" opacity="0.8"/>
                <line x1={slot.x + slot.w} y1={slot.y + slot.h - 3} x2={slot.x + slot.w} y2={slot.y + slot.h} stroke={strokeColor} strokeWidth="0.6" opacity="0.8"/>
                <line x1={slot.x + slot.w - 3} y1={slot.y + slot.h} x2={slot.x + slot.w} y2={slot.y + slot.h} stroke={strokeColor} strokeWidth="0.6" opacity="0.8"/>

                <text x={slot.x + slot.w / 2} y={slot.y + 3.5} fontSize="1.6"
                  fill={isActive ? '#60a5fa' : filled ? '#86efac' : '#4a8abf'}
                  textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                  {slot.label.toUpperCase()}
                </text>

                {filled ? (
                  <>
                    <text x={slot.x + slot.w / 2} y={slot.y + slot.h / 2 + 0.5} fontSize="1.4"
                      fill="#bbf7d0" textAnchor="middle" fontFamily="monospace">
                      {comp.brand}
                    </text>
                    <text x={slot.x + slot.w / 2} y={slot.y + slot.h / 2 + 2.5} fontSize="1.2"
                      fill="#86efac" textAnchor="middle" fontFamily="monospace" opacity="0.8">
                      {comp.name.split(' ').slice(-2).join(' ')}
                    </text>
                    <circle cx={slot.x + slot.w - 2} cy={slot.y + 2} r="1.2" fill="#22c55e" opacity="0.9" />
                    <text x={slot.x + slot.w - 2} y={slot.y + 2.5} fontSize="1.4" fill="white" textAnchor="middle" fontFamily="monospace">✓</text>
                  </>
                ) : (
                  <text x={slot.x + slot.w / 2} y={slot.y + slot.h / 2 + 1} fontSize="1.4"
                    fill={required ? '#4a8abf' : '#2a5a7a'}
                    textAnchor="middle" fontFamily="monospace" opacity="0.7">
                    {required ? '[ SELECCIONAR ]' : '[ OPCIONAL ]'}
                  </text>
                )}

                <rect x={slot.x} y={slot.y} width={slot.w} height={slot.h}
                  fill="transparent" className="hover:fill-white/5 transition-all" />
              </g>
            )
          })}

          <line x1="44" y1="32" x2="44" y2="36" stroke="#1e6bba" strokeWidth="0.3" strokeDasharray="0.5 0.5" opacity="0.5"/>
          <line x1="58.5" y1="48" x2="58.5" y2="54" stroke="#1e6bba" strokeWidth="0.3" strokeDasharray="0.5 0.5" opacity="0.5"/>
          <line x1="50" y1="55" x2="50" y2="57" stroke="#1e6bba" strokeWidth="0.3" strokeDasharray="0.5 0.5" opacity="0.5"/>
          <line x1="37" y1="54" x2="37" y2="78" stroke="#1e6bba" strokeWidth="0.3" strokeDasharray="0.5 0.5" opacity="0.5"/>
          <line x1="71" y1="35" x2="78" y2="35" stroke="#1e6bba" strokeWidth="0.3" strokeDasharray="0.5 0.5" opacity="0.5"/>
        </svg>
      </div>
    </div>
  )
}

// PRESETS se generan dinámicamente con los componentes cargados desde la API
function buildPresets(components) {
  const c = components
  // Si no hay ningún componente cargado aún, no mostrar presets
  const totalLoaded = Object.values(c).reduce((sum, arr) => sum + (arr?.length || 0), 0)
  if (totalLoaded === 0) return []
  return [
    {
      id: 'gaming',
      label: '🎮 Gaming Extremo',
      desc: 'RTX 4090 + Ryzen 9',
      build: {
        cpu: c.cpu?.[1], motherboard: c.motherboard?.[1], ram: c.ram?.[1],
        gpu: c.gpu?.[0], storage: c.storage?.[0], psu: c.psu?.[0],
        case: c.case?.[0], cooling: c.cooling?.[0],
      },
    },
    {
      id: 'workstation',
      label: '💼 Workstation Pro',
      desc: 'Creación de contenido',
      build: {
        cpu: c.cpu?.[1], motherboard: c.motherboard?.[1], ram: c.ram?.[0],
        gpu: c.gpu?.[1], storage: c.storage?.[0], psu: c.psu?.[0],
        case: c.case?.[2], cooling: c.cooling?.[0],
      },
    },
    {
      id: 'budget',
      label: '💰 Budget Build',
      desc: 'Lo mejor por menos',
      build: {
        cpu: c.cpu?.[2], motherboard: c.motherboard?.[2], ram: c.ram?.[2],
        gpu: c.gpu?.[2], storage: c.storage?.[1], psu: c.psu?.[2],
        case: c.case?.[1], cooling: c.cooling?.[2],
      },
    },
  ]
}

// Renderiza el dropdown de presets con manejo de estado vacío.
// En móvil (<640px) se muestra como modal de pantalla completa (bottom sheet).
// En desktop se muestra como dropdown posicionado junto al botón.
function renderPresetsDropdown(presets, onApply, onClose) {
  const items = presets.length > 0 ? (
    presets.map(p => (
      <button
        key={p.id}
        onClick={() => onApply(p)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-primary/10 active:bg-primary/20 transition-colors border-b border-border-dark last:border-0"
      >
        <span className="text-2xl leading-none">{p.label.split(' ')[0]}</span>
        <div>
          <p className="text-white text-sm font-bold leading-snug">{p.label.slice(p.label.indexOf(' ') + 1)}</p>
          <p className="text-slate-500 text-xs mt-0.5">{p.desc}</p>
        </div>
        <span className="material-symbols-outlined text-slate-600 text-[18px] ml-auto">chevron_right</span>
      </button>
    ))
  ) : (
    <div className="px-4 py-8 text-center flex flex-col items-center gap-2">
      <span className="material-symbols-outlined text-slate-600 text-[36px]">cloud_off</span>
      <p className="text-slate-400 text-sm font-bold">Sin presets disponibles</p>
      <p className="text-slate-600 text-xs max-w-[200px]">Asegúrate de que el backend esté corriendo y el seed ejecutado.</p>
    </div>
  )

  return (
    <>
      {/* ── MÓVIL: bottom sheet con backdrop ── */}
      <div className="sm:hidden">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          onClick={onClose}
        />
        {/* Sheet */}
        <div className="fixed bottom-0 left-0 right-0 z-[60] bg-surface-dark border-t border-border-dark rounded-t-2xl shadow-2xl flex flex-col" style={{ maxHeight: '70vh' }}>
          {/* Handle visual */}
          <div className="flex justify-center pt-3 pb-1 shrink-0">
            <div className="w-10 h-1 rounded-full bg-slate-600" />
          </div>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-border-dark shrink-0">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">auto_awesome</span>
              <p className="text-white font-black text-base">Presets de build</p>
            </div>
            <button
              onClick={onClose}
              className="size-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          {/* Items con scroll */}
          <div className="overflow-y-auto flex-1 pb-6">{items}</div>
        </div>
      </div>

      {/* ── DESKTOP: dropdown posicionado ── */}
      <div className="hidden sm:block absolute left-0 top-11 w-64 bg-surface-dark border border-border-dark rounded-xl shadow-2xl overflow-hidden z-50">
        {items}
      </div>
    </>
  )
}

const SCORE_BARS = [
  { key: 'gaming',      label: 'Gaming',      icon: 'sports_esports', color: '#137fec' },
  { key: 'workstation', label: 'Workstation',  icon: 'work',           color: '#a855f7' },
  { key: 'streaming',   label: 'Streaming',    icon: 'videocam',       color: '#22d3ee' },
]

export default function PCConfigurator() {
  const { addToCart } = useCart()
  const { isAuthenticated, openLogin, user } = useAuth()
  const userId = user?.id ?? null
  const navigate = useNavigate()
  const location  = useLocation()

  // Clave de storage única por usuario (guest no persiste)
  const buildKey = userId ? `pc_build_${userId}` : null

  // Inicializar desde localStorage al montar (solo si hay userId)
  const [selection, setSelection] = useState(() => {
    if (!userId) return {}
    try {
      const saved = localStorage.getItem(`pc_build_${userId}`)
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })
  const [activeSlot,    setActiveSlot]   = useState(null)
  const [addedAll,      setAddedAll]     = useState(false)
  const [showPresets,   setShowPresets]  = useState(false)
  const [showCartModal, setShowCartModal] = useState(false)

  // Bug 1/2/15 — Cargar componentes reales desde la API (con IDs CUID válidos)
  const [components, setComponents] = useState({})
  const [loadingComponents, setLoadingComponents] = useState(true)

  useEffect(() => {
    async function loadComponents() {
      setLoadingComponents(true)
      try {
        // Traer todos los productos de una vez (limit alto) para mapear por nombre
        const data = await productService.getProducts({ limit: 100 })
        // El backend devuelve { data: [...], pagination: {...} }
        const allProducts = data?.data || data?.products || (Array.isArray(data) ? data : [])

        // Construir el mapa de componentes por slot
        const built = {}
        Object.entries(CONFIGURATOR_NAMES).forEach(([slot, names]) => {
          built[slot] = names
            .map(name => {
              const p = allProducts.find(prod =>
                prod.name.toLowerCase().trim() === name.toLowerCase().trim()
              )
              if (!p) return null
              const meta = EXTRA_META[name] || {}
              return {
                id:    p.id,        // CUID real de la BD
                name:  p.name,
                brand: p.brand,
                price: Number(p.price),
                image: p.image,
                specs: p.specs || [],
                badge: p.badge || meta.badge || null,
                // Metadatos extra para compatibilidad y scoring
                ...meta,
              }
            })
            .filter(Boolean)
        })
        // Log de diagnóstico: muestra cuántos componentes se encontraron por slot
        const found  = Object.entries(built).map(([s, arr]) => `${s}:${arr.length}`).join(' | ')
        const missed = Object.entries(CONFIGURATOR_NAMES).flatMap(([slot, names]) =>
          names.filter(name => !allProducts.find(p => p.name.toLowerCase().trim() === name.toLowerCase().trim()))
               .map(name => `[${slot}] "${name}"`)
        )
        console.log(`✅ Configurador — componentes cargados: ${found || 'ninguno'}`)
        if (missed.length) console.warn(`⚠️ Configurador — no encontrados en BD (verifica el seed):`, missed)
        setComponents(built)
      } catch (err) {
        console.error('Error cargando componentes del configurador:', err)
        // Si la API falla, dejar componentes vacíos (el configurador muestra estado de carga)
        setComponents({})
      } finally {
        setLoadingComponents(false)
      }
    }
    loadComponents()
  }, [])

  const scores       = calcBuildScore(selection)
  const compat       = checkCompatibility(selection)
  const total        = Object.values(selection).reduce((s, c) => s + (c?.price || 0), 0)
  const wattage      = (selection.gpu?.tdp || 0) + (selection.cpu?.tdp || 0) + 80
  const filledCount  = Object.values(selection).filter(Boolean).length
  const requiredDone = SLOTS.filter(s => s.required && selection[s.id]).length
  const requiredTotal = SLOTS.filter(s => s.required).length

  // Cuando cambia el usuario (login/logout) cargar el build correcto
  useEffect(() => {
    try {
      const saved = buildKey ? localStorage.getItem(buildKey) : null
      setSelection(saved ? JSON.parse(saved) : {})
    } catch {
      setSelection({})
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  // Guardar en localStorage cada vez que la selección cambie (solo si hay usuario)
  useEffect(() => {
    if (!buildKey) return
    try {
      localStorage.setItem(buildKey, JSON.stringify(selection))
    } catch { /* silencioso */ }
  }, [buildKey, selection])

  const handleSelect = (slotId, comp) => setSelection(prev => ({ ...prev, [slotId]: comp }))
  const handleRemove = (slotId) => setSelection(prev => { const n = { ...prev }; delete n[slotId]; return n })

  // Leer preselect que viene de ProductDetail ("Agregar al Configurador")
  useEffect(() => {
    const preselect = location.state?.preselect
    if (!preselect) return
    const { product, slot } = preselect
    if (!slot || !product) return
    // Inyectar el producto directamente en el slot correspondiente
    setSelection(prev => ({ ...prev, [slot]: product }))
    // Abrir el drawer del slot para que el usuario vea qué se preseleccionó
    setActiveSlot(slot)
    // Limpiar el estado de navegación para que al refrescar no repita la acción
    window.history.replaceState({}, '')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleAddAll = () => {
    if (!isAuthenticated) {
      openLogin()
      return
    }
    // Agregar todos los componentes seleccionados al carrito
    Object.values(selection).filter(Boolean).forEach(comp =>
      addToCart({ ...comp, category: 'Componentes PC' })
    )
    // Feedback visual en el botón
    setAddedAll(true)
    setTimeout(() => setAddedAll(false), 2000)
    // Mostrar el pop-up ¿Seguir armando o ir al carrito?
    setShowCartModal(true)
  }

  const applyPreset = (preset) => {
    setSelection(preset.build)
    setShowPresets(false)
    setActiveSlot(null)
  }

  return (
    <div className="flex-grow flex flex-col bg-background-dark">

      {/* ── Pop-up: ¿Seguir armando o ir al carrito? ── */}
      {showCartModal && (
        <AddedToCartModal
          addedSlots={Object.fromEntries(
            Object.entries(selection).filter(([, v]) => v != null)
          )}
          total={total}
          onKeepBuilding={() => setShowCartModal(false)}
          onGoToCart={() => { setShowCartModal(false); navigate('/carrito') }}
        />
      )}

      {/* ── CABECERA ──────────────────────────────────────────────────── */}
      <div className="border-b border-border-dark bg-surface-dark/60 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">build</span>
              Configurador de PC
            </h1>
            <p className="text-slate-500 text-xs mt-0.5 flex items-center gap-2">
              <span>{requiredDone}/{requiredTotal} componentes esenciales</span>
              <span className="text-slate-700">·</span>
              {compat.isCompatible
                ? <span className="text-green-400 flex items-center gap-1"><span className="material-symbols-outlined text-[13px]">check_circle</span>Compatible</span>
                : <span className="text-red-400 flex items-center gap-1"><span className="material-symbols-outlined text-[13px]">error</span>Incompatibilidad detectada</span>
              }
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
              onClick={() => setShowPresets(!showPresets)}
              disabled={loadingComponents}
                className="flex items-center gap-1.5 h-9 px-4 rounded-lg border border-border-dark bg-surface-dark text-white text-sm font-bold hover:border-primary/50 transition-colors disabled:opacity-50"
              >
              {loadingComponents
                  ? <span className="animate-spin material-symbols-outlined text-[16px] text-primary">progress_activity</span>
                : <span className="material-symbols-outlined text-[16px] text-primary">auto_awesome</span>
              }
              {loadingComponents ? 'Cargando...' : 'Presets'}
            </button>
{showPresets && renderPresetsDropdown(buildPresets(components), applyPreset, () => setShowPresets(false))}
            </div>
            <button
              onClick={() => { setSelection({}); setActiveSlot(null); if (buildKey) { try { localStorage.removeItem(buildKey) } catch {} } }}
              className="flex items-center gap-1.5 h-9 px-4 rounded-lg border border-border-dark bg-surface-dark text-slate-400 text-sm font-bold hover:text-white hover:border-red-500/50 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* ── LAYOUT ────────────────────────────────────────────────────── */}
      <div className="flex-1 max-w-[1400px] mx-auto w-full px-4 py-5 grid grid-cols-1 xl:grid-cols-[280px_1fr_300px] gap-5">

        {/* ── COL IZQUIERDA: Lista de slots ─────────────────────── */}
        <div className="flex flex-col gap-1.5">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1 mb-1">
            Componentes — {filledCount}/{SLOTS.length}
          </p>
          {SLOTS.map(slot => {
            const comp     = selection[slot.id]
            const isActive = activeSlot === slot.id

            return (
              <button
                key={slot.id}
                onClick={() => setActiveSlot(isActive ? null : slot.id)}
                className={`relative flex items-center gap-3 p-3 rounded-xl border text-left transition-all group ${
                  isActive
                    ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10'
                    : comp
                    ? 'border-green-500/30 bg-surface-dark hover:border-green-500/50'
                    : 'border-dashed border-border-dark bg-surface-dark/50 hover:border-primary/30'
                }`}
              >
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary rounded-full" />}

                <div className={`size-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  isActive ? 'bg-primary text-white' : comp ? 'bg-green-500/20 text-green-400' : 'bg-slate-800 text-slate-600'
                }`}>
                  <span className="material-symbols-outlined text-[18px]">{slot.icon}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none mb-0.5">
                    {slot.label}
                    {!slot.required && <span className="ml-1 font-normal normal-case text-slate-700">opt.</span>}
                  </p>
                  {comp ? (
                    <>
                      <p className="text-white text-xs font-bold leading-snug truncate">{comp.name}</p>
                      <p className="text-green-400 text-[11px] font-bold">${FORMAT_CURRENCY(comp.price)}</p>
                    </>
                  ) : (
                    <p className="text-slate-600 text-xs">Clic para seleccionar</p>
                  )}
                </div>

                {comp ? (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemove(slot.id) }}
                    className="size-6 flex items-center justify-center rounded text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition-colors shrink-0"
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                ) : (
                  <span className="material-symbols-outlined text-slate-700 text-[16px] group-hover:text-primary transition-colors shrink-0">add_circle</span>
                )}
              </button>
            )
          })}
        </div>

        {/* ── COL CENTRO: Blueprint + Drawer ────────────────────── */}
        <div className="flex flex-col gap-4">

          <div className="rounded-2xl border border-border-dark overflow-hidden relative">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-dark bg-surface-dark/80">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-bold text-slate-400 font-mono uppercase tracking-widest">Blueprint — Vista Técnica</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-mono text-slate-600">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-px bg-green-500 inline-block"/> Instalado
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-px border-t border-dashed border-blue-500 inline-block"/> Vacío
                </span>
              </div>
            </div>

            <BlueprintDiagram
              selection={selection}
              activeSlot={activeSlot}
              onSlotClick={id => setActiveSlot(activeSlot === id ? null : id)}
            />

            {filledCount === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ top: '40px' }}>
                <div className="text-center bg-background-dark/70 backdrop-blur-sm px-6 py-3 rounded-xl border border-border-dark">
                  <p className="text-slate-400 text-sm font-mono">Selecciona un componente de la lista</p>
                  <p className="text-slate-600 text-xs mt-1 font-mono">o usa un Preset para empezar rápido →</p>
                </div>
              </div>
            )}
          </div>

          {activeSlot && (
            <div className="rounded-2xl border border-primary/30 bg-surface-dark overflow-hidden" style={{ height: 400 }}>
              <ComponentDrawer
                slotId={activeSlot}
                onClose={() => setActiveSlot(null)}
                onSelect={handleSelect}
                currentSelected={selection[activeSlot]}
                componentsBySlot={components}
              />
            </div>
          )}

          {(compat.issues.length > 0 || compat.warnings.length > 0) && (
            <div className="flex flex-col gap-2">
              {compat.issues.map((issue, i) => (
                <div key={i} className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400">
                  <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
                  {issue}
                </div>
              ))}
              {compat.warnings.map((warn, i) => (
                <div key={i} className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 text-sm text-amber-400">
                  <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">warning</span>
                  {warn}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── COL DERECHA: Scores + Resumen ─────────────────────── */}
        <div className="flex flex-col gap-4">

          <div className="rounded-2xl border border-border-dark bg-surface-dark p-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary text-[18px]">speed</span>
              Rendimiento estimado
            </h3>
            <div className="flex flex-col gap-3">
              {SCORE_BARS.map(bar => (
                <ScoreBar key={bar.key} label={bar.label} icon={bar.icon} value={scores[bar.key]} color={bar.color} />
              ))}
            </div>
            {filledCount === 0 && (
              <p className="text-center text-slate-700 text-xs mt-3 font-mono">Agrega componentes para ver el score</p>
            )}
          </div>

          <div className="rounded-2xl border border-border-dark bg-surface-dark p-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary text-[18px]">analytics</span>
              Stats del build
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Consumo est.',  value: wattage ? `${wattage}W` : '—',      icon: 'bolt',     color: 'text-amber-400' },
                { label: 'Completado',    value: `${filledCount}/${SLOTS.length}`,    icon: 'category', color: 'text-primary'   },
                { label: 'Socket CPU',    value: selection.cpu?.socket || '—',        icon: 'memory',   color: 'text-purple-400' },
                { label: 'Tipo RAM',      value: selection.ram?.type   || '—',        icon: 'storage',  color: 'text-cyan-400'  },
              ].map(stat => (
                <div key={stat.label} className="bg-background-dark rounded-xl p-3 flex flex-col gap-1">
                  <span className={`material-symbols-outlined text-[15px] ${stat.color}`}>{stat.icon}</span>
                  <span className="text-white font-black text-sm">{stat.value}</span>
                  <span className="text-slate-600 text-[10px]">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border-dark bg-surface-dark overflow-hidden">
            <div className="p-4 border-b border-border-dark">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">receipt_long</span>
                Resumen del pedido
              </h3>
            </div>
            <div className="px-4 py-3 flex flex-col gap-1.5 max-h-48 overflow-y-auto">
              {SLOTS.filter(s => selection[s.id]).map(slot => (
                <div key={slot.id} className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-slate-400 truncate flex-1">{slot.label}</span>
                  <span className="text-white font-bold shrink-0">${FORMAT_CURRENCY(selection[slot.id].price)}</span>
                </div>
              ))}
              {filledCount === 0 && (
                <p className="text-slate-700 text-xs text-center py-2 font-mono">Sin componentes seleccionados</p>
              )}
            </div>
            <div className="p-4 border-t border-border-dark bg-background-dark/40">
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-400 text-sm">Total estimado</span>
                <span className="text-primary font-black text-xl">${FORMAT_CURRENCY(total)}</span>
              </div>
              <button
                onClick={handleAddAll}
                disabled={filledCount === 0 || addedAll}
                className="w-full h-11 bg-primary hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black rounded-xl transition-all active:scale-[0.97] flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
              >
                {addedAll ? (
                  <><span className="material-symbols-outlined text-[18px]">check_circle</span>¡Agregados!</>
                ) : (
                  <><span className="material-symbols-outlined text-[18px]">shopping_cart</span>
                  {isAuthenticated ? 'Agregar todo al carrito' : 'Iniciar sesión para agregar'}</>
                )}
              </button>
              {!compat.isCompatible && filledCount > 0 && (
                <p className="text-center text-amber-400/80 text-[11px] mt-2">
                  ⚠ Revisa las incompatibilidades antes de comprar
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
