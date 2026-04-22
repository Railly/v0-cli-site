#!/usr/bin/env bun
/**
 * Idempotent brand-asset generator.
 *
 * Reads:
 *   - src/assets/v0-logo.svg        (brand mark)
 *   - design tokens baked into this file (mirrors src/styles/global.css)
 *
 * Writes (per-page):
 *   - public/og.png                          1200x630  (landing OG)
 *   - public/og-twitter.png                  1200x600  (landing Twitter)
 *   - public/og-docs.png                     1200x630  (docs hub)
 *   - public/og-docs-twitter.png             1200x600
 *   - public/og-docs-getting-started.png     1200x630
 *   - public/og-docs-getting-started-twitter.png 1200x600
 *   - public/og-docs-commands.png            1200x630
 *   - public/og-docs-commands-twitter.png    1200x600
 *   - public/og-docs-agent-mode.png          1200x630
 *   - public/og-docs-agent-mode-twitter.png  1200x600
 *   - public/og-docs-safety.png              1200x630
 *   - public/og-docs-safety-twitter.png      1200x600
 *   - public/og-docs-reference.png           1200x630
 *   - public/og-docs-reference-twitter.png   1200x600
 *   - public/favicon.ico                     16/32/48  (multi-size ICO)
 *   - public/favicon.svg                     adaptive mark
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
  textMuted: '#6b6b6b',
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

/** ───────────────────────────────────────────────────────────────────────────
 *  Landing OG (kept intact from the original design).
 *  Hero "cli." bubble + dark positioning line bubble + meta row + grid.
 *  ─────────────────────────────────────────────────────────────────────────── */
function buildLandingOgTree(width: number, height: number, logoSvg: string): OgNode {
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
      ...buildCrosshairs(48),
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

/** ───────────────────────────────────────────────────────────────────────────
 *  Docs / sub-page OG template.
 *  Top-left: [logo] v0-cli badge + section kicker.
 *  Middle: bold headline, then one-line subtitle.
 *  Bottom-right crosshair accent. Footer: site · tagline.
 *  ─────────────────────────────────────────────────────────────────────────── */
function buildDocsOgTree(
  width: number,
  height: number,
  logoSvg: string,
  opts: { title: string; subtitle: string; kicker?: string },
): OgNode {
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
      padding: '72px 80px',
      boxSizing: 'border-box',
      // Hairline top border — matches the site's section dividers.
      borderTop: `2px solid ${tokens.hairline}`,
    },
    children: [
      // Grid background.
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
      ...buildCrosshairs(48),
      // Top row: brand + kicker
      el('div', {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          position: 'relative',
        },
        children: [
          el('div', {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            },
            children: [
              el('div', {
                style: {
                  display: 'flex',
                  width: '34px',
                  height: '34px',
                  color: tokens.textPrimary,
                },
                children: logoAsDataUrlImg(logoSvg, 34, tokens.textPrimary),
              }),
              el('div', {
                style: {
                  display: 'flex',
                  fontSize: '26px',
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                  color: tokens.textPrimary,
                  fontFamily: 'Geist, system-ui, sans-serif',
                },
                children: '-cli',
              }),
            ],
          }),
          ...(opts.kicker
            ? [
                el('div', {
                  style: {
                    display: 'flex',
                    marginLeft: '20px',
                    paddingLeft: '20px',
                    borderLeft: `1px solid ${tokens.hairline}`,
                    fontSize: '16px',
                    fontWeight: 500,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: tokens.textMuted,
                    fontFamily: 'Geist, system-ui, sans-serif',
                  },
                  children: opts.kicker,
                }),
              ]
            : []),
        ],
      }),
      // Middle block: headline + subtitle
      el('div', {
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: '28px',
          marginTop: 'auto',
          marginBottom: 'auto',
          position: 'relative',
          maxWidth: `${width - 160}px`,
        },
        children: [
          el('div', {
            style: {
              display: 'flex',
              fontSize: '96px',
              fontWeight: 600,
              letterSpacing: '-0.03em',
              lineHeight: 1.02,
              color: tokens.textPrimary,
            },
            children: opts.title,
          }),
          el('div', {
            style: {
              display: 'flex',
              fontSize: '30px',
              fontWeight: 500,
              letterSpacing: '-0.01em',
              lineHeight: 1.3,
              color: tokens.textSecondary,
            },
            children: opts.subtitle,
          }),
        ],
      }),
      // Footer meta row
      el('div', {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '22px',
          color: tokens.textSecondary,
          fontWeight: 500,
          letterSpacing: '-0.005em',
          position: 'relative',
        },
        children: [
          el('div', {
            style: { display: 'flex', color: tokens.textPrimary },
            children: 'v0-cli.crafter.run',
          }),
          el('div', {
            style: { display: 'flex' },
            children: 'Agent-first CLI · v0 Platform API',
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

/** ───────────────────────────────────────────────────────────────────────────
 *  Page registry: single source of truth.
 *  ─────────────────────────────────────────────────────────────────────────── */
interface PageOg {
  slug: string
  /** Basename without extension. og-{name}.png + og-{name}-twitter.png. */
  fileBase: string
  /** "landing" uses the bubble hero; "docs" uses the title/subtitle template. */
  variant: 'landing' | 'docs'
  title: string
  subtitle: string
  kicker?: string
}

const pages: PageOg[] = [
  {
    slug: 'home',
    fileBase: 'og',
    variant: 'landing',
    title: 'v0-cli',
    subtitle: 'Agent-first command-line wrapper for the v0 Platform API.',
  },
  {
    slug: 'docs',
    fileBase: 'og-docs',
    variant: 'docs',
    title: 'Docs.',
    subtitle: 'Install, authenticate, iterate, and ship v0 chats from the terminal.',
    kicker: 'Docs',
  },
  {
    slug: 'getting-started',
    fileBase: 'og-docs-getting-started',
    variant: 'docs',
    title: 'Getting started.',
    subtitle: 'Install the binary, save a profile, run doctor, ship your first chat.',
    kicker: 'Docs · Getting started',
  },
  {
    slug: 'commands',
    fileBase: 'og-docs-commands',
    variant: 'docs',
    title: 'Commands.',
    subtitle: '55 operations across chats, versions, deployments, env vars, hooks, MCP.',
    kicker: 'Docs · Commands',
  },
  {
    slug: 'agent-mode',
    fileBase: 'og-docs-agent-mode',
    variant: 'docs',
    title: 'Agent mode.',
    subtitle: 'JSON contract, streaming render, parallel chats, params vs sugar.',
    kicker: 'Docs · Agent mode',
  },
  {
    slug: 'safety',
    fileBase: 'og-docs-safety',
    variant: 'docs',
    title: 'Safety.',
    subtitle: 'Trust ladder, intent tokens, killswitch, two-phase audit trail.',
    kicker: 'Docs · Safety',
  },
  {
    slug: 'reference',
    fileBase: 'og-docs-reference',
    variant: 'docs',
    title: 'Reference.',
    subtitle: 'Config file, environment variables, exit codes, stable envelope shapes.',
    kicker: 'Docs · Reference',
  },
]

async function generateOgPages(fontBuffers: SatoriOptions['fonts'], logoSvg: string) {
  for (const page of pages) {
    const ogWidth = 1200
    const ogHeight = 630
    const twWidth = 1200
    const twHeight = 600

    const buildTree = (w: number, h: number) =>
      page.variant === 'landing'
        ? buildLandingOgTree(w, h, logoSvg)
        : buildDocsOgTree(w, h, logoSvg, {
            title: page.title,
            subtitle: page.subtitle,
            kicker: page.kicker,
          })

    const ogPath = join(publicDir, `${page.fileBase}.png`)
    const twPath = join(publicDir, `${page.fileBase}-twitter.png`)

    await writeFile(ogPath, await renderPng(buildTree(ogWidth, ogHeight), ogWidth, ogHeight, fontBuffers))
    console.log('wrote', ogPath)
    await writeFile(twPath, await renderPng(buildTree(twWidth, twHeight), twWidth, twHeight, fontBuffers))
    console.log('wrote', twPath)
  }
}

async function generateFavicon(logoSvg: string) {
  const icoPath = join(publicDir, 'favicon.ico')
  const svgPath = join(publicDir, 'favicon.svg')

  const pathMatch = logoSvg.match(/<path\s[^>]*\/?>/)
  const rawPathTag = pathMatch ? pathMatch[0] : ''
  const pathTag = rawPathTag.replace(/\s*fill="[^"]*"/, '')
  const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
  <style>
    path { fill: #000; }
    @media (prefers-color-scheme: dark) { path { fill: #fff; } }
  </style>
  ${pathTag}
</svg>`
  await writeFile(svgPath, faviconSvg)
  console.log('wrote', svgPath)

  const icoSourceSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
  ${pathTag.replace(/\/?>$/, ' fill="#ffffff"/>')}
</svg>`
  const sizes = [16, 32, 48]
  const pngBufs = await Promise.all(
    sizes.map((s) => sharp(Buffer.from(icoSourceSvg)).resize(s, s).png().toBuffer()),
  )
  const icoBuf = await pngToIco(pngBufs)
  await writeFile(icoPath, icoBuf)
  console.log('wrote', icoPath)
}

async function main() {
  await mkdir(publicDir, { recursive: true })
  const [fontBuffers, logoSvg] = await Promise.all([loadFonts(), loadLogoMarkup()])
  await generateOgPages(fontBuffers, logoSvg)
  await generateFavicon(logoSvg)
  console.log('\ndone.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
