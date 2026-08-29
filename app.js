const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const revealElements = document.querySelectorAll('.reveal')
if ('IntersectionObserver' in window && !reducedMotion) {
  const revealObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (!entry.isIntersecting) return
    entry.target.classList.add('is-visible')
    revealObserver.unobserve(entry.target)
  }), { threshold: 0.12, rootMargin: '0px 0px -4% 0px' })
  revealElements.forEach((element) => revealObserver.observe(element))
} else revealElements.forEach((element) => element.classList.add('is-visible'))

const bubbleField = document.querySelector('.bubble-field')
for (let index = 0; index < 28; index += 1) {
  const bubble = document.createElement('i')
  bubble.style.left = `${(index * 37 + 9) % 97}%`
  bubble.style.setProperty('--duration', `${6 + (index % 6) * 1.1}s`)
  bubble.style.setProperty('--delay', `${-(index % 9) * 1.15}s`)
  bubbleField.append(bubble)
}

const hud = document.querySelector('.game-hud')
const depthValue = document.querySelector('#depth-value')
const oxygenFill = document.querySelector('#oxygen-fill')
const musicHint = document.querySelector('#music-hint')
let ticking = false
function updateHud() {
  const progress = Math.min(1, window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight))
  hud.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.55)
  depthValue.textContent = String(Math.round(progress * 420))
  oxygenFill.style.transform = `scaleX(${1 - progress * 0.22})`
  if (window.scrollY > 20) musicHint.classList.add('is-hidden')
  ticking = false
}
window.addEventListener('scroll', () => { if (!ticking) requestAnimationFrame(updateHud); ticking = true }, { passive: true })

const missionCard = document.querySelector('.mission-card')
const acceptButton = document.querySelector('#accept-quest')
const questStatus = document.querySelector('#quest-status')
const missionComplete = document.querySelector('#mission-complete')
let holdTimer
function startHold() {
  if (missionCard.classList.contains('is-accepted')) return
  missionCard.classList.add('is-holding')
  holdTimer = window.setTimeout(() => {
    missionCard.classList.remove('is-holding')
    missionCard.classList.add('is-accepted')
    questStatus.textContent = 'ACCEPTED'
    acceptButton.textContent = '委托已接受 ✓'
    missionComplete.classList.remove('show')
    requestAnimationFrame(() => missionComplete.classList.add('show'))
    navigator.vibrate?.([45, 30, 80])
  }, 1000)
}
function cancelHold() { window.clearTimeout(holdTimer); missionCard.classList.remove('is-holding') }
acceptButton.addEventListener('pointerdown', startHold)
acceptButton.addEventListener('pointerup', cancelHold)
acceptButton.addEventListener('pointerleave', cancelHold)
acceptButton.addEventListener('pointercancel', cancelHold)
acceptButton.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') startHold() })
acceptButton.addEventListener('keyup', cancelHold)

const sonarField = document.querySelector('.sonar-field')
document.querySelector('#sonar-button').addEventListener('click', () => {
  const ring = document.createElement('i')
  sonarField.append(ring)
  window.setTimeout(() => ring.remove(), 1100)
  document.querySelectorAll('.pixel-fish:not(.caught)').forEach((fish) => fish.animate([{ filter: 'brightness(1)' }, { filter: 'brightness(2.4) drop-shadow(0 0 8px #fff)' }, { filter: 'brightness(1)' }], { duration: 700 }))
  navigator.vibrate?.(35)
})

const fishField = document.querySelector('#fish-field')
const fishCount = document.querySelector('#fish-count')
const fishColors = ['#ffbd45', '#ff6474', '#82e7de', '#b0ef4d', '#f88ed8']
const fishBlessings = ['晨昏线，你骂我的样子最可爱', '宝宝随你，肯定全服最好看', '生孩子你最大，我全听你的', '以后娃哭了算我的，你负责睡', '宝宝出生后，老公请你吃大餐']
let caught = 0
function showFishBlessing(fish) {
  if (Math.random() > 0.72) return
  const blessing = document.createElement('p')
  const fishRect = fish.getBoundingClientRect()
  const fieldRect = fishField.getBoundingClientRect()
  blessing.className = 'fish-blessing'
  blessing.textContent = fishBlessings[Math.floor(Math.random() * fishBlessings.length)]
  blessing.style.left = `${Math.max(4, Math.min(fieldRect.width - 164, fishRect.left - fieldRect.left - 48))}px`
  blessing.style.top = `${Math.max(4, fishRect.top - fieldRect.top - 42)}px`
  fishField.appendChild(blessing)
  window.setTimeout(() => blessing.remove(), 2400)
}
for (let index = 0; index < 9; index += 1) {
  const fish = document.createElement('button')
  fish.type = 'button'; fish.className = 'pixel-fish'; fish.setAttribute('aria-label', `捕捉第 ${index + 1} 条鱼`)
  fish.style.top = `${12 + (index * 37) % 135}px`
  fish.style.setProperty('--swim', `${6.5 + (index % 4) * 1.2}s`)
  fish.style.setProperty('--fish', fishColors[index % fishColors.length])
  fish.style.animationDelay = `${-(index * 1.3)}s`
  fish.addEventListener('click', () => {
    if (fish.classList.contains('caught')) return
    fish.classList.add('caught'); caught = Math.min(5, caught + 1); fishCount.textContent = String(caught); navigator.vibrate?.(25); showFishBlessing(fish)
    if (caught === 5) {
      const message = document.createElement('p'); message.className = 'fish-unlock'; message.textContent = '祝福收集完毕：晨昏线幸福值 +1000'; fishField.append(message)
    }
  })
  fishField.append(fish)
}

const crewSlides = [...document.querySelectorAll('.crew-slide')]
const crewName = document.querySelector('#crew-name')
let crewIndex = 0
function showCrew(nextIndex) {
  crewIndex = (nextIndex + crewSlides.length) % crewSlides.length
  crewSlides.forEach((slide, index) => slide.classList.toggle('is-active', index === crewIndex))
  crewName.textContent = `${crewSlides[crewIndex].dataset.name} · ${crewIndex + 1}/${crewSlides.length}`
}
document.querySelector('[data-crew="prev"]').addEventListener('click', () => showCrew(crewIndex - 1))
document.querySelector('[data-crew="next"]').addEventListener('click', () => showCrew(crewIndex + 1))

const musicToggle = document.querySelector('#music-toggle')
const officialBgm = document.querySelector('#official-bgm')
let musicPlaying = false
function setMusicState(playing) {
  musicPlaying = playing; musicToggle.classList.toggle('playing', playing); musicToggle.setAttribute('aria-pressed', String(playing)); musicToggle.setAttribute('aria-label', playing ? '暂停官方背景音乐' : '播放官方背景音乐')
}
async function playMusic() {
  musicHint.classList.add('is-hidden')
  try {
    officialBgm.volume = 0.58
    await officialBgm.play()
    setMusicState(true)
  } catch {
    setMusicState(false)
  }
}
function pauseMusic() { officialBgm.pause(); setMusicState(false) }
musicToggle.addEventListener('click', () => musicPlaying ? pauseMusic() : playMusic())
document.querySelector('#start-mission').addEventListener('click', () => { playMusic(); document.querySelector('#briefing').scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' }) })

const rsvpForm = document.querySelector('#rsvp-form')
const messageField = rsvpForm.elements.babyMessage
const messageCount = document.querySelector('#message-count')
const rsvpError = document.querySelector('#rsvp-error')
const rsvpSuccess = document.querySelector('#rsvp-success')
const rsvpSuccessTitle = document.querySelector('#rsvp-success-title')
const rsvpSuccessSummary = document.querySelector('#rsvp-success-summary')
const rsvpSubmit = rsvpForm.querySelector('[type="submit"]')
const storageKey = 'chenhunxian-baby-oracle'
let savedRsvp
try { savedRsvp = JSON.parse(localStorage.getItem(storageKey)) } catch { savedRsvp = undefined }
function fillRsvp(data) {
  if (!data) return
  rsvpForm.elements.birthGuess.value = data.birthGuess || ''
  rsvpForm.elements.weightGuess.value = data.weightGuess || ''
  if (data.looksLike) rsvpForm.elements.looksLike.value = data.looksLike
  rsvpForm.elements.babyMessage.value = data.babyMessage || ''
  messageCount.value = String(rsvpForm.elements.babyMessage.value.length)
}
function showRsvpError(message) { rsvpError.textContent = message; rsvpError.hidden = false }
function collectRsvp() {
  const formData = new FormData(rsvpForm)
  const birthGuess = String(formData.get('birthGuess') || '').trim()
  const weightGuess = String(formData.get('weightGuess') || '').trim()
  const looksLike = String(formData.get('looksLike') || '')
  const babyMessage = String(formData.get('babyMessage') || '').trim()
  return { id: savedRsvp?.id, birthGuess, weightGuess, looksLike, babyMessage }
}
messageField.addEventListener('input', () => { messageCount.value = String(messageField.value.length) })
rsvpForm.addEventListener('submit', async (event) => {
  event.preventDefault(); rsvpError.hidden = true
  let submission
  try { submission = collectRsvp() } catch (error) { showRsvpError(error.message); return }
  rsvpSubmit.disabled = true; rsvpSubmit.querySelector('span').textContent = '正在封存预言……'
  try {
    savedRsvp = { ...submission, id: 'local-only' }
    localStorage.setItem(storageKey, JSON.stringify(savedRsvp))
    rsvpForm.hidden = true; rsvpSuccess.hidden = false
    const bits = []
    if (submission.birthGuess) bits.push(`报到时间：${submission.birthGuess.replace('T', ' ')}`)
    if (submission.weightGuess) bits.push(`体重：${submission.weightGuess} 斤`)
    if (submission.looksLike) bits.push(`长相：${submission.looksLike === 'mama' ? '像妈妈（废话）' : submission.looksLike === 'baba' ? '像爸爸（他最好看）' : '雨露均沾'}`)
    rsvpSuccessTitle.textContent = '预言已封存'
    rsvpSuccessSummary.textContent = `${bits.length ? bits.join(' · ') + '。' : ''}等宝宝出生验证！猜中者（就是你）将获得老公大餐一顿。这份预言只存在这台手机里。`
    rsvpSuccess.focus({ preventScroll: true })
  } catch (error) { showRsvpError(error.message || '网络开小差了，请稍后再试。') }
  finally { rsvpSubmit.disabled = false; rsvpSubmit.querySelector('span').textContent = '保存预言' }
})
document.querySelector('#rsvp-edit').addEventListener('click', () => { fillRsvp(savedRsvp); rsvpForm.hidden = false; rsvpSuccess.hidden = true })
fillRsvp(savedRsvp)
