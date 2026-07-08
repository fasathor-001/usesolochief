// OG / social preview image generator — v2
// Uses Sharp (bundled with Next.js). Run: node scripts/generate-og.mjs
// Outputs: public/og/solochief-og.png, solochief-twitter.png, solochief-square.png

import sharp from 'sharp'
import { mkdirSync, copyFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dir = dirname(fileURLToPath(import.meta.url))
const root  = join(__dir, '..')
const icons = join(root, 'public', 'icons')
const ogDir = join(root, 'public', 'og')
mkdirSync(ogDir, { recursive: true })

// ── Font paths (Windows build machine + Linux CI fallback) ─────────────
const win  = 'C:/Windows/Fonts'
const lin  = '/usr/share/fonts/truetype/liberation'
const FONT_BOLD = existsSync(`${win}/arialbd.ttf`) ? `${win}/arialbd.ttf`
               : existsSync(`${lin}/LiberationSans-Bold.ttf`) ? `${lin}/LiberationSans-Bold.ttf`
               : null
const FONT_REG  = existsSync(`${win}/arial.ttf`)   ? `${win}/arial.ttf`
               : existsSync(`${lin}/LiberationSans-Regular.ttf`) ? `${lin}/LiberationSans-Regular.ttf`
               : null
if (!FONT_BOLD || !FONT_REG) throw new Error('No suitable font found — install Liberation Sans or run on Windows')

// ── Design tokens ─────────────────────────────────────────────────────
const MIDNIGHT = { r: 15, g: 27, b: 45, alpha: 1 }   // #0F1B2D
const TEAL     = { r: 0,  g: 194, b: 168 }            // #00C2A8
const C_TITLE  = '#F9FAFB'
const C_SUB    = '#94A3B8'   // slate-400 — readable secondary
const C_FOOT   = '#64748B'   // slate-500 — very understated footer
const C_ACCENT = '#00C2A8'

// ── Helpers ────────────────────────────────────────────────────────────

// Render text via Pango into a transparent RGBA PNG buffer.
// Returns { buf, width, height }.
async function txt(markup, fontfile, fontFamily, maxWidth, dpi = 72) {
  const buf = await sharp({
    text: { text: markup, fontfile, font: fontFamily, width: maxWidth, rgba: true, dpi }
  }).png().toBuffer()
  const { width, height } = await sharp(buf).metadata()
  return { buf, width, height }
}

// Solid-colour rectangle buffer.
async function solidRect(w, h, { r, g, b }, alpha = 1) {
  return sharp({
    create: { width: w, height: h, channels: 4, background: { r, g, b, alpha } }
  }).png().toBuffer()
}

// Midnight background buffer.
async function bg(w, h) {
  return sharp({ create: { width: w, height: h, channels: 4, background: MIDNIGHT } })
    .png().toBuffer()
}

// Prepare brand icon for dark backgrounds:
//  - Strip white background (luma > 230 → transparent, smooth edge 190–230)
//  - Dark navy areas (logo letterform) → white, so they're visible on midnight
//  - Teal areas (the arrow tip, ~#00C2A8) → keep original teal
// This gives a white/teal icon on transparent bg — clean on dark surfaces.
async function brandIcon(size) {
  const { data, info } = await sharp(join(icons, 'web-app-manifest-192x192.png'))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const { width, height } = info
  const px = new Uint8Array(data.buffer)

  for (let i = 0; i < width * height; i++) {
    const r = px[i * 4]
    const g = px[i * 4 + 1]
    const b = px[i * 4 + 2]
    const luma = r * 0.299 + g * 0.587 + b * 0.114

    if (luma > 230) {
      // White background → fully transparent
      px[i * 4 + 3] = 0
    } else if (luma > 190) {
      // Anti-aliasing edge — smooth alpha ramp
      px[i * 4 + 3] = Math.round((230 - luma) / 40 * 255)
      // Tint edge pixels toward white
      px[i * 4]     = 249
      px[i * 4 + 1] = 250
      px[i * 4 + 2] = 251
    } else {
      px[i * 4 + 3] = 255
      // Teal (#00C2A8): R<60, G>140, B>120  → keep as-is
      const isTeal = r < 60 && g > 140 && b > 100
      if (!isTeal) {
        // Dark navy letterform → white, visible on midnight background
        px[i * 4]     = 249
        px[i * 4 + 1] = 250
        px[i * 4 + 2] = 251
      }
    }
  }

  return sharp(Buffer.from(px.buffer), { raw: { width, height, channels: 4 } })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png().toBuffer()
}

// ── OG / Twitter  1200 × 630 ───────────────────────────────────────────
async function makeOG(outPath) {
  const W = 1200, H = 630

  // Logo
  const LOGO = 132
  const logo = await brandIcon(LOGO)

  // Text elements
  const TEXT_X  = 80 + LOGO + 48   // 260
  const TEXT_MAX = W - TEXT_X - 80  // 860

  const title = await txt(
    `<span font_desc="Arial Bold 96" foreground="${C_TITLE}">SoloChief AI</span>`,
    FONT_BOLD, 'Arial Bold', TEXT_MAX
  )
  const sub1 = await txt(
    `<span font_desc="Arial 32" foreground="${C_SUB}">Command Centre on web. Chief of Staff in WhatsApp.</span>`,
    FONT_REG, 'Arial', TEXT_MAX
  )
  const sub2 = await txt(
    `<span font_desc="Arial 28" foreground="${C_SUB}">One brain behind both.</span>`,
    FONT_REG, 'Arial', TEXT_MAX
  )
  const foot = await txt(
    `<span font_desc="Arial 20" foreground="${C_FOOT}">Built by Astor Stack</span>`,
    FONT_REG, 'Arial', 500
  )

  // Vertical layout — centre text block
  const GAP_TITLE_SUB = 18
  const GAP_SUB       = 8
  const textH = title.height + GAP_TITLE_SUB + sub1.height + GAP_SUB + sub2.height
  const groupH = Math.max(LOGO, textH)
  const groupTop = Math.round((H - groupH) / 2)

  const logoTop  = groupTop + Math.round((groupH - LOGO) / 2)
  const titleTop = groupTop + Math.round((groupH - textH) / 2)
  const sub1Top  = titleTop + title.height + GAP_TITLE_SUB
  const sub2Top  = sub1Top  + sub1.height  + GAP_SUB
  const footTop  = H - foot.height - 36

  // Accent bars
  const tealTop = await solidRect(W, 6, TEAL)
  const tealBot = await solidRect(W, 2, TEAL, 0.2)

  await sharp(await bg(W, H))
    .composite([
      { input: tealTop,    left: 0,    top: 0 },
      { input: logo,       left: 80,   top: logoTop },
      { input: title.buf,  left: TEXT_X, top: titleTop },
      { input: sub1.buf,   left: TEXT_X, top: sub1Top },
      { input: sub2.buf,   left: TEXT_X, top: sub2Top },
      { input: foot.buf,   left: 80,   top: footTop },
      { input: tealBot,    left: 0,    top: H - 2 },
    ])
    .png({ quality: 95, compressionLevel: 8 })
    .toFile(outPath)
}

// ── Square  1200 × 1200 ────────────────────────────────────────────────
async function makeSquare(outPath) {
  const W = 1200, H = 1200

  const LOGO = 200
  const logo = await brandIcon(LOGO)

  const TEXT_MAX = W - 160  // 80px each side = 1040

  const title = await txt(
    `<span font_desc="Arial Bold 120" foreground="${C_TITLE}">SoloChief AI</span>`,
    FONT_BOLD, 'Arial Bold', TEXT_MAX
  )
  const sub1 = await txt(
    `<span font_desc="Arial 40" foreground="${C_SUB}">Command Centre on web. Chief of Staff in WhatsApp.</span>`,
    FONT_REG, 'Arial', TEXT_MAX
  )
  const sub2 = await txt(
    `<span font_desc="Arial 36" foreground="${C_SUB}">One brain behind both.</span>`,
    FONT_REG, 'Arial', TEXT_MAX
  )
  const foot = await txt(
    `<span font_desc="Arial 26" foreground="${C_FOOT}">Built by Astor Stack</span>`,
    FONT_REG, 'Arial', 600
  )

  // Accent bar (120px wide, centred) between logo and title
  const ACCENT_W = 120
  const accentBar = await solidRect(ACCENT_W, 4, TEAL)

  // Stacked layout — group: logo + accent + title + subs
  const GAP_LOGO_ACCENT  = 32
  const GAP_ACCENT_TITLE = 24
  const GAP_TITLE_SUB    = 22
  const GAP_SUB          = 10

  const blockH = LOGO + GAP_LOGO_ACCENT + 4 + GAP_ACCENT_TITLE
               + title.height + GAP_TITLE_SUB
               + sub1.height + GAP_SUB + sub2.height

  // Slight upward bias (optical centre is above geometric centre)
  const blockTop = Math.round((H - blockH) / 2) - 40

  const logoTop    = blockTop
  const accentTop  = logoTop + LOGO + GAP_LOGO_ACCENT
  const titleTop   = accentTop + 4 + GAP_ACCENT_TITLE
  const sub1Top    = titleTop + title.height + GAP_TITLE_SUB
  const sub2Top    = sub1Top  + sub1.height  + GAP_SUB
  const footTop    = H - foot.height - 90

  // Centre each element horizontally
  const cx = (el) => Math.round((W - el.width) / 2)

  const tealTop = await solidRect(W, 6, TEAL)
  const tealBot = await solidRect(W, 2, TEAL, 0.2)

  await sharp(await bg(W, H))
    .composite([
      { input: tealTop,    left: 0,              top: 0 },
      { input: logo,       left: cx({ width: LOGO }), top: logoTop },
      { input: accentBar,  left: cx({ width: ACCENT_W }), top: accentTop },
      { input: title.buf,  left: cx(title),      top: titleTop },
      { input: sub1.buf,   left: cx(sub1),        top: sub1Top },
      { input: sub2.buf,   left: cx(sub2),        top: sub2Top },
      { input: foot.buf,   left: cx(foot),        top: footTop },
      { input: tealBot,    left: 0,              top: H - 2 },
    ])
    .png({ quality: 95, compressionLevel: 8 })
    .toFile(outPath)
}

// ── Run ───────────────────────────────────────────────────────────────
await makeOG(join(ogDir, 'solochief-og.png'))
console.log('✓  public/og/solochief-og.png      (1200×630)')

await makeOG(join(ogDir, 'solochief-twitter.png'))
console.log('✓  public/og/solochief-twitter.png  (1200×630)')

await makeSquare(join(ogDir, 'solochief-square.png'))
console.log('✓  public/og/solochief-square.png   (1200×1200)')

copyFileSync(join(icons, 'apple-touch-icon.png'), join(root, 'public', 'apple-touch-icon.png'))
copyFileSync(join(icons, 'favicon.ico'),          join(root, 'public', 'favicon.ico'))
console.log('✓  public/apple-touch-icon.png + favicon.ico  (brand assets)')
