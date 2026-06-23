// Pure Node.js PNG icon generator — no external dependencies.
// Run: node scripts/generate-icons.mjs
// Outputs 5 PNG files to public/icons/

import { writeFileSync, mkdirSync, copyFileSync } from 'node:fs'
import { deflateSync } from 'node:zlib'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const iconsDir = join(__dirname, '..', 'public', 'icons')

// ── CRC-32 ────────────────────────────────────────────────────────────
function crc32(data) {
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1
    table[i] = c
  }
  let crc = 0xFFFFFFFF
  for (const b of data) crc = table[(crc ^ b) & 0xFF] ^ (crc >>> 8)
  return (crc ^ 0xFFFFFFFF) >>> 0
}

function pngChunk(type, data) {
  const tb = Buffer.from(type, 'ascii')
  const lb = Buffer.alloc(4); lb.writeUInt32BE(data.length)
  const cb = Buffer.alloc(4); cb.writeUInt32BE(crc32(Buffer.concat([tb, data])))
  return Buffer.concat([lb, tb, data, cb])
}

// ── Pixel-art "S" (7 rows × 5 cols) ──────────────────────────────────
const PIXEL_S = [
  [0, 1, 1, 1, 0],
  [1, 0, 0, 0, 0],
  [1, 0, 0, 0, 0],
  [0, 1, 1, 1, 0],
  [0, 0, 0, 0, 1],
  [0, 0, 0, 0, 1],
  [0, 1, 1, 1, 0],
]

// ── Icon renderer ─────────────────────────────────────────────────────
function createIconPNG(size, maskablePadding = false) {
  const BG  = [0x0F, 0x1B, 0x2D, 0xFF]  // midnight
  const TEA = [0x00, 0xC2, 0xA8, 0xFF]  // teal

  // Scale letter to ~70% of icon height within safe-zone padding
  const padFactor = maskablePadding ? 0.20 : 0.08
  const pad = Math.round(size * padFactor)
  const artH = size - pad * 2
  const pixSz = Math.floor(artH / PIXEL_S.length)
  const artW = pixSz * PIXEL_S[0].length
  const offX = Math.round((size - artW) / 2)
  const offY = Math.round((size - pixSz * PIXEL_S.length) / 2)

  const rows = []
  for (let y = 0; y < size; y++) {
    const row = [0]  // PNG filter byte = 0 (None)
    for (let x = 0; x < size; x++) {
      const ax = x - offX
      const ay = y - offY
      const col = Math.floor(ax / pixSz)
      const rowIdx = Math.floor(ay / pixSz)
      const isTeal =
        ax >= 0 && ay >= 0 &&
        rowIdx < PIXEL_S.length &&
        col >= 0 && col < PIXEL_S[0].length &&
        PIXEL_S[rowIdx][col] === 1
      row.push(...(isTeal ? TEA : BG))
    }
    rows.push(Buffer.from(row))
  }

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8; ihdr[9] = 6  // 8-bit RGBA

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const raw = Buffer.concat(rows)
  const idat = deflateSync(raw)

  return Buffer.concat([
    sig,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idat),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
}

// ── Generate files ────────────────────────────────────────────────────
mkdirSync(iconsDir, { recursive: true })

const icons = [
  { name: 'icon-192.png',         size: 192, maskable: false },
  { name: 'icon-512.png',         size: 512, maskable: false },
  { name: 'maskable-192.png',     size: 192, maskable: true  },
  { name: 'maskable-512.png',     size: 512, maskable: true  },
  { name: 'apple-touch-icon.png', size: 180, maskable: false },
]

for (const { name, size, maskable } of icons) {
  const buf = createIconPNG(size, maskable)
  writeFileSync(join(iconsDir, name), buf)
  console.log(`✓ public/icons/${name}  (${size}×${size}, ${buf.length} bytes)`)
}

// Copy apple-touch-icon to public root (required for iOS home screen)
copyFileSync(
  join(iconsDir, 'apple-touch-icon.png'),
  join(iconsDir, '..', 'apple-touch-icon.png'),
)
console.log('✓ public/apple-touch-icon.png  (copied from icons/)')
