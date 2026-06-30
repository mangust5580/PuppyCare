import { SELECTORS } from '../config/selectors.js'
import { CLASSES } from '../config/constants.js'

export default class Video {
  constructor(root = document) {
    this.root = root
    this.instances = []
    this.isInitialized = false
  }

  init() {
    if (this.isInitialized) return

    const cards = this.root.querySelectorAll(SELECTORS.video.root)

    cards.forEach(card => {
      const player = card.querySelector(SELECTORS.video.player)
      const playBtn = card.querySelector(SELECTORS.video.play)
      if (!player || !playBtn) return

      const onPlayClick = () => this.play(player)
      const onActive = () => card.classList.add(CLASSES.videoPlaying)
      const onIdle = () => card.classList.remove(CLASSES.videoPlaying)

      playBtn.addEventListener('click', onPlayClick)
      player.addEventListener('play', onActive)
      player.addEventListener('playing', onActive)
      player.addEventListener('pause', onIdle)
      player.addEventListener('ended', onIdle)
      this.instances.push({ player, playBtn, onPlayClick, onActive, onIdle })
    })

    this.isInitialized = true
  }

  play(player) {
    if (!player.paused && !player.ended) return

    player.controls = true
    const played = player.play()
    if (played && typeof played.catch === 'function') {
      played.catch(() => {})
    }
  }

  destroy() {
    this.instances.forEach(({ player, playBtn, onPlayClick, onActive, onIdle }) => {
      playBtn.removeEventListener('click', onPlayClick)
      player.removeEventListener('play', onActive)
      player.removeEventListener('playing', onActive)
      player.removeEventListener('pause', onIdle)
      player.removeEventListener('ended', onIdle)
    })
    this.instances = []
    this.isInitialized = false
  }
}
