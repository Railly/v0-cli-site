#!/usr/bin/env bun
/**
 * Idempotent brand-asset generator.
 *
 * Reads:
 *   - src/assets/v0-logo.svg        (brand mark)
 *   - design tokens baked into this file (mirrors src/styles/global.css)
 *
 * Writes:
 *   - public/og.png          1200x630  (Open Graph)
 *   - public/og-twitter.png  1200x600  (Twitter Card)
 *   - public/favicon.ico     16/32/48  (multi-size ICO)
 *
 * Re-run with `bun scripts/generate-assets.ts`.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { Resvg } from '@resvg/resvg-js'
import pngToIco from 'png-to-ico'
import satori, { type SatoriOptions } from 'satori'
import sharp from 'sharp'

const root = resolve(import.meta.dir, '..')
const publicDir = join(root, 'public')
const fontsCacheDir = join(root, '.cache', 'fonts')
const logoPath = join(root, 'src', 'assets', 'v0-logo.svg')

/* Design tokens (mirrors src/styles/global.css). */
const tokens = {
  canvas: '#000000',
  bubbleLight: '#ffffff',
  textOnLight: '#000000',
  textPrimary: '#ededed',
  textSecondary: '#a1a1a1',
  hairline: 'rgba(255,255,255,0.08)',
  gridLine: 'rgba(255,255,255,0.04)',
  crosshair: 'rgba(255,255,255,0.35)',
}

const fontBase =
  'https://raw.githubusercontent.com/vercel/geist-font/main/packages/next/dist/fonts/geist-sans'
const fonts: Array<{
  name: string
  url: string
  weight: 400 | 500 | 600 | 700
  style: 'normal'
  ext: string
}> = [
  { name: 'Geist', url: `${fontBase}/Geist-Regular.ttf`, weight: 400, style: 'normal', ext: 'ttf' },
  { name: 'Geist', url: `${fontBase}/Geist-Medium.ttf`, weight: 500, style: 'normal', ext: 'ttf' },
  { name: 'Geist', url: `${fontBase}/Geist-Bold.ttf`, weight: 600, style: 'normal', ext: 'ttf' },
]

async function ensureFont(f: (typeof fonts)[number]): Promise<ArrayBuffer> {
  const cachePath = join(fontsCacheDir, `${f.name}-${f.weight}.${f.ext}`)
  try {
    const buf = await readFile(cachePath)
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer
  } catch {
    // not cached yet
  }
  await mkdir(dirname(cachePath), { recursive: true })
  const res = await fetch(f.url, { redirect: 'follow' })
  if (!res.ok) throw new Error(`font fetch failed: ${f.url} -> ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  await writeFile(cachePath, buf)
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer
}

async function loadFonts(): Promise<SatoriOptions['fonts']> {
  const loaded = await Promise.all(
    fonts.map(async (f) => ({
      name: f.name,
      data: await ensureFont(f),
      weight: f.weight,
      style: f.style,
    })),
  )
  return loaded
}

async function loadLogoMarkup(): Promise<string> {
  const raw = (await readFile(logoPath, 'utf8')).trim()
  return raw
}

interface OgNode {
  type: string
  props: {
    style?: Record<string, unknown>
    children?: OgNode | OgNode[] | string
    [k: string]: unknown
  }
}

function el(type: string, props: OgNode['props'] = {}): OgNode {
  return { type, props }
}

/** Build the OG tree. Width/height configurable so one layout serves both sizes. */
function buildOgTree(width: number, height: number, logoSvg: string): OgNode {
  const gridCell = 82
  const cols = Math.ceil(width / gridCell)
  const rows = Math.ceil(height / gridCell)

  return el('div', {
    style: {
      width: `${width}px`,
      height: `${height}px`,
      background: tokens.canvas,
      color: tokens.textPrimary,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Geist, system-ui, sans-serif',
      position: 'relative',
      padding: '64px 80px',
      boxSizing: 'border-box',
    },
    children: [
      // Grid background (thin horizontal + vertical lines)
      el('div', {
        style: {
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
        },
        children: Array.from({ length: rows }, (_, r) =>
          el('div', {
            style: {
              display: 'flex',
              flex: 1,
              borderTop: r === 0 ? 'none' : `1px solid ${tokens.gridLine}`,
            },
            children: Array.from({ length: cols }, (_, c) =>
              el('div', {
                style: {
                  flex: 1,
                  borderLeft: c === 0 ? 'none' : `1px solid ${tokens.gridLine}`,
                },
              }),
            ),
          }),
        ),
      }),
      // Crosshairs (four corners of the content area)
      ...buildCrosshairs(48),
      // Hero row (white bubble + dark context)
      el('div', {
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: '36px',
          marginTop: 'auto',
          marginBottom: 'auto',
          position: 'relative',
        },
        children: [
          // White bubble: [logo] cli.
          el('div', {
            style: {
              display: 'flex',
              alignItems: 'center',
              alignSelf: 'flex-start',
              gap: '18px',
              background: tokens.bubbleLight,
              color: tokens.textOnLight,
              borderRadius: '28px',
              padding: '28px 44px',
            },
            children: [
              // Inline logo, scaled
              el('div', {
                style: {
                  display: 'flex',
                  width: '64px',
                  height: '64px',
                  color: tokens.textOnLight,
                },
                children: logoAsDataUrlImg(logoSvg, 64),
              }),
              el('div', {
                style: {
                  fontSize: '96px',
                  fontWeight: 600,
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                  color: tokens.textOnLight,
                },
                children: 'cli.',
              }),
            ],
          }),
          // Dark bubble: positioning line. Two segments flowing as prose
          // with a proper word-gap between primary and secondary colors.
          el('div', {
            style: {
              display: 'flex',
              flexWrap: 'wrap',
              alignSelf: 'flex-start',
              maxWidth: `${width - 240}px`,
              background: '#0f0f0f',
              border: `1px solid ${tokens.hairline}`,
              borderRadius: '28px',
              padding: '24px 40px',
              fontSize: '34px',
              fontWeight: 600,
              letterSpacing: '-0.015em',
              lineHeight: 1.25,
              columnGap: '10px',
              rowGap: '4px',
            },
            children: [
              el('span', {
                style: { color: tokens.textPrimary },
                children: 'Agent-first command-line wrapper',
              }),
              el('span', {
                style: { color: tokens.textSecondary },
                children: 'for the v0 Platform API.',
              }),
            ],
          }),
        ],
      }),
      // Bottom meta row
      el('div', {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '22px',
          color: tokens.textSecondary,
          fontWeight: 500,
          letterSpacing: '-0.005em',
        },
        children: [
          el('div', {
            style: { display: 'flex', color: tokens.textPrimary },
            children: 'v0-cli.crafter.run',
          }),
          el('div', {
            style: { display: 'flex' },
            children: 'npx skills add Railly/v0-cli',
          }),
        ],
      }),
    ],
  })
}

function buildCrosshairs(margin: number): OgNode[] {
  const base = {
    position: 'absolute' as const,
    width: '14px',
    height: '14px',
    display: 'flex',
  }
  const mark = (style: Record<string, unknown>) =>
    el('div', {
      style: { ...base, ...style },
      children: [
        el('div', {
          style: {
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: '1px',
            background: tokens.crosshair,
            transform: 'translateY(-50%)',
            display: 'flex',
          },
        }),
        el('div', {
          style: {
            position: 'absolute',
            left: '50%',
            top: 0,
            bottom: 0,
            width: '1px',
            background: tokens.crosshair,
            transform: 'translateX(-50%)',
            display: 'flex',
          },
        }),
      ],
    })
  return [
    mark({ top: `${margin}px`, left: `${margin}px` }),
    mark({ top: `${margin}px`, right: `${margin}px` }),
    mark({ bottom: `${margin}px`, left: `${margin}px` }),
    mark({ bottom: `${margin}px`, right: `${margin}px` }),
  ]
}

/** Satori does not resolve raw inline SVG via fill=currentColor reliably;
 *  render the logo by inlining it as a data-URL inside an <img>. */
function logoAsDataUrlImg(logoSvg: string, size: number, fill = '#000000'): OgNode {
  // Replace currentColor so the data-URL bakes the intended fill.
  const tinted = logoSvg.replace(/currentColor/g, fill)
  const withSize = tinted
    .replace(/height="\d+"/, `height="${size}"`)
    .replace(/width="\d+"/, `width="${size}"`)
  const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(withSize)}`
  return el('img', {
    src: dataUrl,
    width: size,
    height: size,
    style: { width: `${size}px`, height: `${size}px`, display: 'flex' },
  })
}

async function renderPng(
  tree: OgNode,
  width: number,
  height: number,
  fontBuffers: SatoriOptions['fonts'],
): Promise<Buffer> {
  const svg = await satori(tree as unknown as React.ReactNode, {
    width,
    height,
    fonts: fontBuffers,
  })
  const resvg = new Resvg(svg, {
    background: tokens.canvas,
    fitTo: { mode: 'width', value: width },
  })
  return Buffer.from(resvg.render().asPng())
}

async function generateOg(fontBuffers: SatoriOptions['fonts'], logoSvg: string) {
  const ogPath = join(publicDir, 'og.png')
  const twPath = join(publicDir, 'og-twitter.png')

  const ogTree = buildOgTree(1200, 630, logoSvg)
  const twTree = buildOgTree(1200, 600, logoSvg)

  await writeFile(ogPath, await renderPng(ogTree, 1200, 630, fontBuffers))
  console.log('wrote', ogPath)
  await writeFile(twPath, await renderPng(twTree, 1200, 600, fontBuffers))
  console.log('wrote', twPath)
}

async function generateFavicon(logoSvg: string) {
  const icoPath = join(publicDir, 'favicon.ico')
  const svgPath = join(publicDir, 'favicon.svg')

  // 1. Write a dark-canvas favicon SVG alongside for modern browsers.
  const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="${tokens.canvas}"/>
  <g transform="translate(8 8)">${logoSvg
    .replace(/<\?xml[^>]+\?>\s*/, '')
    .replace(/<svg[^>]*>/, '')
    .replace(/<\/svg>/, '')
    .replace(/currentColor/g, tokens.textPrimary)}</g>
</svg>`
  await writeFile(svgPath, faviconSvg)
  console.log('wrote', svgPath)

  // 2. Rasterize to 16/32/48 via sharp, combine into .ico with png-to-ico.
  const sizes = [16, 32, 48]
  const pngBufs = await Promise.all(
    sizes.map((s) => sharp(Buffer.from(faviconSvg)).resize(s, s).png().toBuffer()),
  )
  const icoBuf = await pngToIco(pngBufs)
  await writeFile(icoPath, icoBuf)
  console.log('wrote', icoPath)
}

async function main() {
  await mkdir(publicDir, { recursive: true })
  const [fontBuffers, logoSvg] = await Promise.all([loadFonts(), loadLogoMarkup()])
  await generateOg(fontBuffers, logoSvg)
  await generateFavicon(logoSvg)
  console.log('\ndone.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
