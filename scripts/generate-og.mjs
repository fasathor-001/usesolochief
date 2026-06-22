// OG / social preview image generator using the existing SoloChief brand assets.
// Uses sharp (bundled with Next.js) — no extra dependencies.
// Run: node scripts/generate-og.mjs

import sharp from 'sharp'
import { readFileSync, mkdirSync, copyFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const iconsDir = join(root, 'public', 'icons')
const ogDir = join(root, 'public', 'og')
mkdirSync(ogDir, { recursive: true })

const MIDNIGHT = { r: 15, g: 27, b: 45, alpha: 1 }  // #0F1B2D
const TEAL     = '#00C2A8'
const TEXT     = '#F9FAFB'

// ── Helper: SVG text + accent layer ───────────────────────────────────
function textLayer(width, height, opts) {
  const { titleX, titleY, subX, sub1Y, sub2Y, footerX, footerY,
          titleSize, subSize, footerSize, centerText = false } = opts
  const anchor = centerText ? 'middle' : 'start'
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <!-- Top teal accent bar -->
  <rect x="0" y="0" width="${width}" height="5" fill="${TEAL}"/>
  <!-- Title -->
  <text
    x="${titleX}" y="${titleY}"
    font-family="sans-serif" font-size="${titleSize}" font-weight="bold"
    fill="${TEXT}" letter-spacing="-1" text-anchor="${anchor}">SoloChief AI</text>
  <!-- Subtitle line 1 -->
  <text
    x="${subX}" y="${sub1Y}"
    font-family="sans-serif" font-size="${subSize}"
    fill="rgba(249,250,251,0.60)" text-anchor="${anchor}">Your personal Chief of Staff for</text>
  <!-- Subtitle line 2 -->
  <text
    x="${subX}" y="${sub2Y}"
    font-family="sans-serif" font-size="${subSize}"
    fill="rgba(249,250,251,0.60)" text-anchor="${anchor}">commitments, focus, and follow-ups.</text>
  <!-- Footer -->
  <text
    x="${footerX}" y="${footerY}"
    font-family="sans-serif" font-size="${footerSize}"
    fill="rgba(249,250,251,0.28)" text-anchor="${anchor}">Built by Astor Stack</text>
  <!-- Bottom teal hairline -->
  <rect x="0" y="${height - 4}" width="${width}" height="4" fill="${TEAL}" opacity="0.25"/>
</svg>`)
}

// ── Create one OG image ────────────────────────────────────────────────
async function createImage(outPath, width, height, logoSize, logoX, logoY, textOpts) {
  // 1 — midnight background
  const bg = await sharp({
    create: { width, height, channels: 4, background: MIDNIGHT }
  }).png().toBuffer()

  // 2 — brand logo resized
  const logo = await sharp(join(iconsDir, 'logo.png'))
    .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()

  // 3 — composite: background → logo → text layer
  await sharp(bg)
    .composite([
      { input: logo, left: logoX, top: logoY },
      { input: textLayer(width, height, textOpts), top: 0, left: 0 },
    ])
    .png({ quality: 95, compressionLevel: 8 })
    .toFile(outPath)
}

// ── OG (1200 × 630) — landscape, logo left ────────────────────────────
await createImage(
  join(ogDir, 'solochief-og.png'), 1200, 630,
  140,   // logo size
  80,    // logo X
  245,   // logo Y  (centre vertically in 630 — 140 = 490 ÷ 2 = 245)
  {
    titleX: 260, titleY: 280,
    subX:   260, sub1Y: 336, sub2Y: 370,
    footerX: 80, footerY: 590,
    titleSize: 64, subSize: 26, footerSize: 18,
  },
)
console.log('✓ public/og/solochief-og.png  (1200×630)')

// ── Twitter (1200 × 630) — identical to OG ────────────────────────────
const ogBuf = readFileSync(join(ogDir, 'solochief-og.png'))
await sharp(ogBuf).png().toFile(join(ogDir, 'solochief-twitter.png'))
console.log('✓ public/og/solochief-twitter.png  (1200×630, copy of OG)')

// ── Square (1200 × 1200) — centred ───────────────────────────────────
await createImage(
  join(ogDir, 'solochief-square.png'), 1200, 1200,
  200,   // logo size
  500,   // logo X  (1200 ÷ 2 − 100)
  280,   // logo Y
  {
    titleX: 600, titleY: 590,
    subX:   600, sub1Y: 660, sub2Y: 700,
    footerX: 600, footerY: 900,
    titleSize: 76, subSize: 30, footerSize: 22,
    centerText: true,
  },
)
console.log('✓ public/og/solochief-square.png  (1200×1200)')

// ── Fix public/apple-touch-icon.png — use real brand icon ─────────────
copyFileSync(
  join(iconsDir, 'apple-touch-icon.png'),
  join(root, 'public', 'apple-touch-icon.png'),
)
console.log('✓ public/apple-touch-icon.png  (replaced with brand asset, 180×180)')

// ── Copy favicon.ico to public root ──────────────────────────────────
copyFileSync(
  join(iconsDir, 'favicon.ico'),
  join(root, 'public', 'favicon.ico'),
)
console.log('✓ public/favicon.ico  (brand favicon)')
