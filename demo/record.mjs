/**
 * Records the demo shown in the README.
 *
 *   make demo          (with `make start` already running in another terminal)
 *
 * The tape below is the whole product in one take: land on the three exemption
 * cases, pick the one that has to be re-filed every year, sign up, come back
 * through the double opt-in link, then jump to next December and answer the
 * reminder that goes out then.
 *
 * Unlike a stubbed recording this drives the real stack, because the tokens in
 * those last two steps are the point: they are minted by the API and by
 * send_reminders exactly as they would be for a real subscriber, and a fixture
 * that faked them would be filming something the product does not do. What
 * makes it repeatable instead is demo/demo_db.py, which forgets the demo
 * subscriber before each take.
 *
 * Outputs docs/media/nocanonetv-demo.{gif,mp4} and a poster frame.
 */

import { execFileSync } from 'node:child_process'
import { mkdir, rm, readdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { chromium } from 'playwright'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const MEDIA = join(ROOT, 'docs', 'media')
const WORK = join(ROOT, 'demo', '.recording')

// Where `make start` puts the client. The API is reached through its Vite
// proxy, so there is only ever one origin to point at.
const BASE = process.env.DEMO_BASE_URL ?? 'http://127.0.0.1:5173'

// 16:10, the same shape as the other demos on francescomeli.com, and wide
// enough that the three case cards stay side by side.
const VIEWPORT = { width: 1440, height: 900 }
/**
 * The gif is what a README costs you just by being opened, and it is frames
 * times area with no interframe compression to save it, so it stays at the
 * width it is displayed at. The mp4 has no such problem and stays big enough
 * to embed at 2x.
 */
const GIF_WIDTH = 720
const MP4_WIDTH = 1100
const FPS = 10

/**
 * The frame used as the poster. Not the first one: the pages later in the tape
 * are a single card on an empty background, and the opening one has nothing
 * chosen yet. This is the moment just after a case is picked, which is the
 * only frame showing all three cases, the selection and the signup form at
 * once.
 */
const POSTER_AT = '5'

const ffmpeg = (args) => execFileSync('ffmpeg', ['-y', '-v', 'error', ...args], { stdio: 'inherit' })

/** demo/demo_db.py, run through the server's own environment */
const db = (command) => execFileSync(
  'uv',
  ['run', '--project', 'server', 'python', 'demo/demo_db.py', command],
  { cwd: ROOT, encoding: 'utf8', env: { ...process.env, PYTHONPATH: ROOT } },
).trim()

/**
 * Playwright drives the page without moving a visible cursor, so a recording
 * of it is a series of things happening for no reason. This paints one and
 * walks it to whatever is about to be clicked.
 */
const CURSOR = `
  const dot = document.createElement('div')
  dot.style.cssText = [
    'position:fixed', 'z-index:2147483647', 'top:0', 'left:0',
    'width:18px', 'height:18px', 'margin:-9px 0 0 -9px', 'border-radius:50%',
    'background:rgba(30,58,122,.32)', 'border:2px solid #1e3a7a',
    'pointer-events:none', 'transition:transform .04s linear',
  ].join(';')
  const place = (event) => {
    dot.style.transform = 'translate(' + event.clientX + 'px,' + event.clientY + 'px)'
  }
  addEventListener('mousemove', place, true)
  addEventListener('mousedown', () => { dot.style.background = 'rgba(30,58,122,.65)' }, true)
  addEventListener('mouseup', () => { dot.style.background = 'rgba(30,58,122,.32)' }, true)
  const attach = () => document.body && document.body.appendChild(dot)
  document.readyState === 'loading' ? addEventListener('DOMContentLoaded', attach) : attach()
`

const reachable = async (url) => {
  try {
    const response = await fetch(url)
    return response.ok
  } catch {
    return false
  }
}

const main = async () => {
  if (!await reachable(`${BASE}/api/`)) {
    throw new Error(`nothing answering at ${BASE}/api/: run \`make start\` first`)
  }

  await rm(WORK, { recursive: true, force: true })
  await mkdir(WORK, { recursive: true })
  await mkdir(MEDIA, { recursive: true })

  db('reset')

  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    locale: 'it-IT',
    recordVideo: { dir: WORK, size: VIEWPORT },
    reducedMotion: 'no-preference',
  })

  // Recording starts the moment the page exists, so everything between here
  // and the first paint is blank frames. Timing it lets ffmpeg cut exactly
  // that much off the front instead of guessing at a fixed offset.
  const page = await context.newPage()
  const recordingStarted = Date.now()
  await page.addInitScript(CURSOR)

  // walk the pointer there first, so the click reads as a click
  const click = async (locator) => {
    const box = await locator.boundingBox()
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 18 })
    await page.waitForTimeout(180)
    await locator.click()
  }
  const type = async (locator, text) => {
    await click(locator)
    await locator.pressSequentially(text, { delay: 80 })
  }

  // 1. the three exemption cases, side by side
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.waitForSelector('text=Seleziona il tuo caso')
  const leadIn = Math.max(0, (Date.now() - recordingStarted) / 1000 - 0.3)
  await page.waitForTimeout(2400)

  // 2. the one that has to be re-filed every year. The card is a <label> around
  //    a visually hidden radio, so the strip a visitor presses is what is clicked.
  const card = page.locator('label').filter({ hasText: 'Non detieni una TV' })
  await click(card.getByText('Seleziona questo caso'))
  await page.waitForTimeout(1400)

  // 3. signing up gets you a pending subscriber and nothing else: double opt-in
  await type(page.getByLabel('Nome'), 'Giulia')
  await page.waitForTimeout(300)
  await type(page.getByLabel('Email'), 'giulia.rossi@example.com')
  await page.waitForTimeout(600)
  await click(page.getByRole('button', { name: 'Iscrivimi' }))
  await page.waitForSelector('text=Grazie')
  await page.waitForTimeout(2400)

  // 4. the link out of the confirmation email
  await page.goto(`${BASE}/conferma-iscrizione/${db('confirm-token')}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(2600)

  // 5. December of the following year, when the reminder actually goes out.
  //    The real command, so the page below is driven by a real ReminderEvent.
  execFileSync(
    'uv',
    ['run', '--project', 'server', 'python', '-m', 'server.send_reminders', '--today', '2026-12-15'],
    { cwd: ROOT, stdio: 'ignore', env: { ...process.env, PYTHONPATH: ROOT } },
  )
  await page.goto(`${BASE}/conferma/${db('reminder-token')}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(3000)

  // 6. still without a TV, so it hands over to the Agenzia delle Entrate
  await click(page.getByRole('button', { name: 'Sì, sono ancora senza TV' }))
  await page.waitForTimeout(3200)

  await context.close()
  await browser.close()

  const [recorded] = (await readdir(WORK)).filter((name) => name.endsWith('.webm'))
  const source = join(WORK, recorded)
  const trimmed = join(WORK, 'trimmed.mp4')
  const scaleTo = (width) => `scale=${width}:-2:flags=lanczos`

  // cut the blank lead-in once, at full size, so every output below comes off
  // the same clip and they cannot drift apart
  ffmpeg(['-ss', leadIn.toFixed(2), '-i', source,
    '-vf', 'format=yuv420p', '-c:v', 'libx264', '-crf', '18', '-an', trimmed])

  // one shared palette for the whole clip: a per-frame palette makes the flat
  // white panels shimmer between frames
  ffmpeg(['-i', trimmed,
    '-vf', `fps=${FPS},${scaleTo(GIF_WIDTH)},palettegen=stats_mode=diff`, join(WORK, 'palette.png')])
  ffmpeg(['-i', trimmed, '-i', join(WORK, 'palette.png'),
    '-lavfi', `fps=${FPS},${scaleTo(GIF_WIDTH)}[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3`,
    join(WORK, 'raw.gif')])
  execFileSync('gifsicle', ['-O3', '--lossy=120', '--colors', '160', '--no-warnings',
    join(WORK, 'raw.gif'), '-o', join(MEDIA, 'nocanonetv-demo.gif')], { stdio: 'inherit' })

  ffmpeg(['-i', trimmed, '-vf', scaleTo(MP4_WIDTH),
    '-c:v', 'libx264', '-crf', '26', '-preset', 'slow',
    '-movflags', '+faststart', '-an', join(MEDIA, 'nocanonetv-demo.mp4')])

  ffmpeg(['-ss', POSTER_AT, '-i', trimmed,
    '-frames:v', '1', '-vf', scaleTo(MP4_WIDTH), join(MEDIA, 'nocanonetv-demo-poster.png')])

  await rm(WORK, { recursive: true, force: true })
}

main().catch((error) => {
  console.error(error.message) // eslint-disable-line no-console -- it is a CLI
  process.exit(1)
})
